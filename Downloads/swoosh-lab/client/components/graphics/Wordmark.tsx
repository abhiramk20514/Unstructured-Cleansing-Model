import { cn } from "@/lib/utils";

export default function Wordmark({ className }: { className?: string }) {
  return (
    <div className={cn("relative flex select-none items-center gap-1 leading-none", className)} aria-label="AnalytiX Hub" role="img">
      <span className="bg-gradient-to-r from-sky-300 via-cyan-200 to-indigo-300 bg-clip-text text-lg font-extrabold tracking-tight text-transparent">
        Analyti
      </span>
      <span className="relative inline-block text-lg font-extrabold tracking-tight">
        <span aria-hidden className="pointer-events-none absolute -inset-0.5 -z-10 rotate-45 rounded-sm bg-gradient-to-br from-cyan-500/35 to-indigo-500/35 blur-[1px]" />
        <span className="bg-gradient-to-br from-cyan-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_1px_6px_rgba(56,189,248,0.25)]">
          X
        </span>
      </span>
      <span className="ml-1 text-base font-semibold text-white/70">Hub</span>
    </div>
  );
}
