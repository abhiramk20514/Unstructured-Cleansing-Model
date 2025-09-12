import { ShieldCheck } from "lucide-react";

export default function LockBadge() {
  return (
    <div aria-hidden className="pointer-events-none absolute bottom-6 right-6 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-foreground/80 backdrop-blur">
      <ShieldCheck className="h-4 w-4 text-emerald-400" />
      <span>Enterprise-grade security & confidentiality</span>
    </div>
  );
}
