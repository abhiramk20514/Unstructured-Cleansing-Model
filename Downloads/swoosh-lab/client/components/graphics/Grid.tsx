export default function Grid() {
  return (
    <svg className="pointer-events-none absolute inset-0 -z-20 h-full w-full opacity-20 [mask-image:radial-gradient(closest-side,white,transparent)]" aria-hidden>
      <defs>
        <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="currentColor" className="text-slate-900" />
      <rect width="100%" height="100%" fill="url(#grid)" className="text-white/10" />
    </svg>
  );
}
