export default function Rays() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
      <div className="absolute inset-[-50%] opacity-20 [background:repeating-linear-gradient(75deg,theme(colors.white/8%),theme(colors.white/8%)_2px,transparent_2px,transparent_24px)] [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)] animate-pan-slow" />
    </div>
  );
}
