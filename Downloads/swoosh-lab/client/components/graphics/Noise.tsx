export default function Noise() {
  return (
    <svg className="pointer-events-none absolute inset-0 -z-30 h-full w-full opacity-[0.04]" aria-hidden>
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch"/>
        <feColorMatrix type="saturate" values="0"/>
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
  );
}
