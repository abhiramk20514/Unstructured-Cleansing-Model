import { cn } from "@/lib/utils";

export default function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative grid place-items-center rounded-md bg-gradient-to-br from-sky-500 to-indigo-500 text-white shadow-sm",
        className,
      )}
      aria-label="AnalytiX Hub logo"
      role="img"
    >
      <span className="select-none text-[0.9rem] font-extrabold leading-none tracking-tight">AX</span>
      <div className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-white/25" />
      <div className="pointer-events-none absolute -inset-0.5 rounded-md bg-gradient-to-br from-white/5 to-transparent blur-sm" />
    </div>
  );
}
