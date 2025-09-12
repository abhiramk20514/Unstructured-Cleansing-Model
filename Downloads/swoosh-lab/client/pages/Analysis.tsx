import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

interface Row { id: number; name: string; type: string; description: string; insights: string }

const ALLOWED = [".pdf", ".doc", ".docx", ".txt", ".csv", ".json", ".png", ".jpg", ".jpeg"];

import Grid from "@/components/graphics/Grid";
import Aurora from "@/components/graphics/Aurora";
import Rays from "@/components/graphics/Rays";
import Noise from "@/components/graphics/Noise";
import LockBadge from "@/components/graphics/LockBadge";

export default function Analysis() {
  const { slug } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "running" | "analyzing" | "done">("idle");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const name = useMemo(() => (state?.name as string) || (slug || "Analysis"), [state?.name, slug]);

  const exportPDF = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    const date = new Date().toLocaleString();
    const rowsHtml = (rows.length
      ? rows
          .map(
            (r) =>
              `<tr><td>${r.id}</td><td>${escapeHtml(r.name)}</td><td>${escapeHtml(r.type)}</td><td>${escapeHtml(r.description)}</td><td>${escapeHtml(r.insights)}</td></tr>`
          )
          .join("")
      : `<tr><td colspan="5" style="text-align:center;color:#64748b">No output yet.</td></tr>`);

    const doc = `<!doctype html><html><head><meta charset="utf-8"/>
      <title>AnalytiX Hub - Analysis Export</title>
      <style>
        *{box-sizing:border-box}
        body{font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; margin:24px; color:#0f172a}
        h1{font-size:20px;margin:0 0 4px}
        .sub{color:#475569;margin:0 0 16px}
        table{width:100%;border-collapse:collapse;font-size:12px}
        th,td{border:1px solid #e2e8f0;padding:8px;text-align:left;vertical-align:top}
        thead th{background:#f1f5f9}
        tfoot td{border:none;color:#64748b;font-size:11px}
        @page{margin:20mm}
      </style>
    </head><body>
      <h1>AnalytiX Hub — ${escapeHtml(name)}</h1>
      <div class="sub">Exported on ${date}</div>
      <table>
        <thead>
          <tr>
            <th>S.No</th>
            <th>File name</th>
            <th>File type</th>
            <th>File description</th>
            <th>Key findings / insights</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
        <tfoot><tr><td colspan="5">© Optiv Security</td></tr></tfoot>
      </table>
    </body></html>`;

    win.document.open();
    win.document.write(doc);
    win.document.close();
    win.focus();
    win.print();
  };

  function escapeHtml(s: string) {
    const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return s.replace(/[&<>"']/g, (c) => map[c] || c);
  }


  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
  };

  const start = async () => {
    if (!file) return;
    setStatus("uploading");
    setLog(["File uploading..."]);
    setProgress(10);

    await wait(600);
    setStatus("running");
    setLog((l) => [...l, "Successfully uploaded", "Paddle running..."]);
    setProgress(35);

    await wait(900);
    setStatus("analyzing");
    setLog((l) => [...l, "Analyzing..."]);
    animateTo(98, 1200);

    await wait(1400);
    setStatus("done");
    setProgress(100);
    setLog((l) => [...l, "Successfully analysed", "Generating output..."]);

    const ext = file.name.split(".").pop() || "";
    const row: Row = {
      id: rows.length + 1,
      name: file.name,
      type: ext.toUpperCase(),
      description: `Uploaded ${Math.ceil(file.size / 1024)} KB ${ext.toUpperCase()} file`,
      insights: `Auto-detected structure. No critical issues. ${ext.toUpperCase()} parsed.`,
    };
    setRows((r) => [row, ...r]);
  };

  const animateTo = (target: number, duration: number) => {
    const startVal = progress;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const ratio = Math.min(1, elapsed / duration);
      const next = Math.round(startVal + (target - startVal) * ratio);
      setProgress(next);
      if (ratio < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const clear = () => {
    setRows([]);
    setFile(null);
    setLog([]);
    setProgress(0);
    setStatus("idle");
    inputRef.current?.value && (inputRef.current.value = "");
  };

  return (
    <div className="relative min-h-screen bg-[radial-gradient(ellipse_at_top_right,theme(colors.slate.950),theme(colors.slate.900))]">
      <Grid />
      <Aurora />
      <Rays />
      <Noise />
      <LockBadge />
      <Navbar />
      <main className="container pb-24 pt-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
            <p className="text-sm text-muted-foreground">Upload files, view results, and track progress in real-time.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/landing")}>Back</Button>
            <Button variant="ghost" onClick={clear}>Reset</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* 1. Input */}
          <Card className="lg:col-span-4 border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle>Input</CardTitle>
              <CardDescription>Upload a file</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-dashed p-4">
                <input ref={inputRef} type="file" accept={ALLOWED.join(",")} onChange={onSelect} className="w-full" />
                <p className="mt-2 text-xs text-muted-foreground">Allowed: {ALLOWED.join(", ")}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <Button disabled={!file || status === "uploading"} onClick={start} variant="gradient">Upload & Analyze</Button>
                <Button variant="outline" onClick={() => inputRef.current?.click()}>Choose File</Button>
              </div>
            </CardContent>
          </Card>

          {/* 2. Output Table */}
          <Card className="lg:col-span-8 border-white/10 bg-white/5 backdrop-blur">
            <CardHeader className="flex flex-col space-y-1.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-left">
                <CardTitle>Output</CardTitle>
                <CardDescription>Processed files and key findings</CardDescription>
              </div>
              <div className="mt-3 sm:mt-0">
                <Button variant="gradient" size="sm" onClick={exportPDF}>Export PDF</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>S.No</TableHead>
                      <TableHead>File name</TableHead>
                      <TableHead>File type</TableHead>
                      <TableHead>File description</TableHead>
                      <TableHead>Key findings / insights</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">No output yet. Upload a file to begin.</TableCell>
                      </TableRow>
                    ) : (
                      rows.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell>{r.id}</TableCell>
                          <TableCell className="font-medium">{r.name}</TableCell>
                          <TableCell>{r.type}</TableCell>
                          <TableCell>{r.description}</TableCell>
                          <TableCell>
                            <Textarea defaultValue={r.insights} className="min-h-[3rem]" />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* 3. Verbose */}
          <Card className="lg:col-span-8 border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle>Verbose</CardTitle>
              <CardDescription>Detailed pipeline activity</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {log.length === 0 ? (
                  <li className="text-muted-foreground">Waiting for input...</li>
                ) : (
                  log.map((l, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span>{l}</span>
                    </li>
                  ))
                )}
              </ul>
            </CardContent>
          </Card>

          {/* 4. Output Bar */}
          <Card className="lg:col-span-4 border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle>Output bar</CardTitle>
              <CardDescription>Overall progress</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={progress} />
              <p className="mt-2 text-sm font-medium">{progress}%</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <Badge label="Uploading" active={status !== "idle"} done={status !== "idle"} />
                <Badge label="Uploaded" active={status !== "idle"} done={["running","analyzing","done"].includes(status)} />
                <Badge label="Paddle running" active={["running","analyzing","done"].includes(status)} done={["analyzing","done"].includes(status)} />
                <Badge label="Analyzing" active={["analyzing","done"].includes(status)} done={["done"].includes(status)} />
                <Badge label="Completed" active={status === "done"} done={status === "done"} />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function wait(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

function Badge({ label, active, done }: { label: string; active?: boolean; done?: boolean }) {
  return (
    <div className={"flex items-center gap-2 rounded border px-2 py-1 " + (done ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300" : active ? "bg-amber-500/15 border-amber-500/30 text-amber-300" : "text-muted-foreground") }>
      <span className={"h-2 w-2 rounded-full " + (done ? "bg-emerald-500" : active ? "bg-amber-500" : "bg-muted-foreground")}></span>
      <span>{label}</span>
    </div>
  );
}
