export default function Aurora() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 -left-32 h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle_at_center,theme(colors.violet.600/.35),transparent_60%)] blur-3xl animate-blob" />
      <div className="absolute -bottom-40 -right-32 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle_at_center,theme(colors.cyan.500/.35),transparent_60%)] blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute top-1/3 -right-20 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle_at_center,theme(colors.fuchsia.500/.25),transparent_60%)] blur-3xl animate-blob animation-delay-4000" />
    </div>
  );
}
