import streamlit as st
import os
import base64
import aiohttp
import asyncio
import json
import re
import pandas as pd
from unstructured.partition.auto import partition
from unstructured.documents.elements import Table
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# ===============================
# PII Guardrail
# ===============================
class PIIGuardrail:
    def __init__(self):
        self.patterns = {
            'EMAIL': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            'PHONE': r'(\+?\d{1,3})?[-.\s]?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}',
            'NAME': r'\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)\b',
            'IP_ADDRESS': r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b'
        }

    def scan_and_mask(self, text):
        masked_text = text
        for pii_type, pattern in self.patterns.items():
            redaction_tag = f"<{pii_type.lower()}>"
            masked_text = re.sub(pattern, redaction_tag, masked_text)
        return masked_text

# ===============================
# Gemini API Helper
# ===============================
MODEL_NAME = "gemini-1.5-flash-latest"

async def get_ai_response(api_key, prompt, image_path=None):
    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL_NAME}:generateContent?key={api_key}"
    
    parts = [{"text": prompt}]
    
    if image_path:
        try:
            with open(image_path, "rb") as image_file:
                image_data = base64.b64encode(image_file.read()).decode('utf-8')
            mime_type = "image/png" if image_path.lower().endswith(".png") else "image/jpeg"
            parts.append({"inline_data": {"mime_type": mime_type, "data": image_data}})
        except FileNotFoundError:
            return "[Error: Image file not found]"
            
    payload = {"contents": [{"parts": parts}]}
    
    max_retries = 3
    delay = 1.0
    for attempt in range(max_retries):
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(api_url, json=payload) as response:
                    if response.status == 200:
                        result = await response.json()
                        return result.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '[No response from AI]')
                    elif response.status == 503:
                        if attempt < max_retries - 1:
                            await asyncio.sleep(delay)
                            delay *= 2
                            continue
                        else:
                            error_text = await response.text()
                            return f"[API Error {response.status} after {max_retries} attempts]: {error_text}"
                    else:
                        error_text = await response.text()
                        return f"[API Error {response.status}]: {error_text}"
        except Exception as e:
            return f"[Exception: {str(e)}]"
            
    return f"[API Error]: Failed after {max_retries} retries."


# ===============================
# Document Analyzer (WITH CONCISE PROMPTS)
# ===============================
async def analyze_document(file_path, api_key):
    guardrail = PIIGuardrail()
    all_texts = []
    is_image_file = file_path.lower().endswith(('.png', '.jpeg', '.jpg'))

    elements = partition(filename=file_path, strategy="hi_res", infer_table_structure=True, languages=['eng'])
    for element in elements:
        text = element.text or ""
        if isinstance(element, Table):
            text = element.metadata.text_as_html or text
        masked_text = guardrail.scan_and_mask(text)
        all_texts.append(masked_text)
    
    masked_data = " | ".join(all_texts)
    if not masked_data.strip():
        masked_data = "[No text found in file]"

    description = ""
    insights = ""
    
    if is_image_file:
        # Description prompt remains detailed for clarity
        desc_prompt = """
As a meticulous analyst, provide a highly detailed and objective visual description of this image.
- Describe the key objects, actions, and any visible text.
- The description should be a clear, 2-3 sentence paragraph.
- Do NOT include any PII or make assumptions beyond what is visually present.
"""
        description = await get_ai_response(api_key, desc_prompt, image_path=file_path)
        
        # --- NEW CONCISE INSIGHT PROMPT FOR IMAGES ---
        insight_prompt = f"""
You are an expert risk analyst. Based on the image's description and text, provide a concise, bulleted list of the top 3-5 most critical insights.
- Focus on the system's primary function, key strengths, and main risks or vulnerabilities.
- Keep each point brief and direct.
- Do NOT include any PII.

**Context:**
- **Visual Description:** {description}
- **Extracted Text:** {masked_data}
"""
        insights = await get_ai_response(api_key, insight_prompt)
    
    else: # For text-based files
        # --- NEW CONCISE PROMPT FOR TEXT ---
        combined_prompt = f"""
You are an expert document analyst. Analyze the following content and provide two separate sections.

**Content to Analyze:**
---
{masked_data}
---

**Instructions:**
Format your output EXACTLY as follows:

---Description---
[Provide a clear 2-3 sentence summary of the document's content and purpose. Do NOT include any PII.]

---Insight---
[Provide a concise, bulleted list of the top 3-5 most important insights. Focus on the document's operational purpose, data integrity risks, and potential process gaps. Keep each point brief. Do NOT include any PII.]
"""
        combined_response = await get_ai_response(api_key, combined_prompt)

        if "---Insight---" in combined_response:
            parts = combined_response.split("---Insight---", 1)
            description = parts[0].replace("---Description---", "").strip()
            insights = parts[1].strip()
        else:
            description = combined_response.replace("---Description---", "").strip()
            insights = "[Insight not generated]"

    _, file_ext = os.path.splitext(file_path)

    return {
        "file name": os.path.basename(file_path),
        "file type": file_ext,
        "masked data": masked_data,
        "files description": description,
        "file insight": insights
    }


# ===============================
# Save to PDF
# ===============================
def save_to_pdf(results, output_path="analysis_output.pdf"):
    styles = getSampleStyleSheet()
    doc = SimpleDocTemplate(output_path)
    flow = []
    for r in results:
        flow.append(Paragraph(f"<b>{r['file name']}</b>", styles["Heading3"]))
        flow.append(Paragraph("<b>File Type:</b> " + r["file type"], styles["Normal"]))
        flow.append(Paragraph("<b>Masked Data:</b>", styles["Normal"]))
        flow.append(Paragraph(r["masked data"], styles["Code"])) 
        flow.append(Paragraph("<b>Description:</b> " + r["files description"], styles["Normal"]))
        flow.append(Paragraph("<b>Insights:</b> " + r["file insight"], styles["Normal"]))
        flow.append(Spacer(1, 12))
    doc.build(flow)
    return output_path

# ===============================
# Streamlit UI
# ===============================
st.set_page_config(page_title="Universal Document Analyzer", layout="wide")
st.title("📄 Universal Document Analyzer with PII Guardrails")

api_key = os.getenv("GEMINI_API_KEY")

if "analyzed_files" not in st.session_state:
    st.session_state.analyzed_files = []

if not api_key:
    st.error("🚨 GEMINI_API_KEY not found! Please create a .env file with your API key.")
else:
    with st.sidebar:
        st.header("Controls")
        uploaded_file = st.file_uploader(
            "Upload a document", 
            type=["pdf","docx","pptx","xlsx","png","jpg","jpeg"]
        )

        if st.session_state.analyzed_files:
            st.markdown("---")
            st.subheader("Download Results")
            
            df_for_download = pd.DataFrame(st.session_state.analyzed_files)
            json_data = df_for_download.to_json(orient='records', indent=2)
            st.download_button(
                label="⬇️ Download as JSON",
                data=json_data,
                file_name="analysis_output.json",
                mime="application/json",
            )
            
            pdf_path = save_to_pdf(st.session_state.analyzed_files)
            with open(pdf_path, "rb") as pdf_file:
                st.download_button(
                    label="⬇️ Download as PDF",
                    data=pdf_file,
                    file_name="analysis_output.pdf",
                    mime="application/pdf",
                )

            if st.button("Clear All Results 💣"):
                st.session_state.analyzed_files = []
                st.rerun()

    if uploaded_file:
        temp_dir = "temp_uploads"
        if not os.path.exists(temp_dir):
            os.makedirs(temp_dir)
        temp_path = os.path.join(temp_dir, uploaded_file.name)
        with open(temp_path, "wb") as f:
            f.write(uploaded_file.getbuffer())

        with st.spinner("Processing document with expert analysis... Please wait ⏳"):
            result = asyncio.run(analyze_document(temp_path, api_key))
            st.session_state.analyzed_files.insert(0, result)
        os.remove(temp_path)

if st.session_state.analyzed_files:
    st.header("Analysis Results")
    
    col_weights = [0.5, 2, 1, 2.5, 3.5, 3.5] 
    headers = ['S.No.', 'File Name', 'File Type', 'Masked Data', 'Description', 'Insight']
    header_cols = st.columns(col_weights)
    for col, header in zip(header_cols, headers):
        col.markdown(f"**{header}**")
    
    st.divider()

    for i, result in enumerate(st.session_state.analyzed_files):
        row_cols = st.columns(col_weights)
        
        row_cols[0].write(f"{i + 1}")
        row_cols[1].write(result["file name"])
        row_cols[2].write(result["file type"])

        with row_cols[3]:
            with st.popover(".......... 👁️", use_container_width=False):
                st.markdown(f"<div style='max-height: 300px; overflow-y: auto; white-space: pre-wrap; word-wrap: break-word;'>{result['masked data']}</div>", unsafe_allow_html=True)
        
        row_cols[4].write(result["files description"])
        row_cols[5].write(result["file insight"])
else:
    st.info("Upload a document using the sidebar to begin analysis.")