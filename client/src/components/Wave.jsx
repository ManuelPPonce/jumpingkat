export function Wave({ className = "text-canvas", variant = "wave" }) {
  const path =
    variant === "curve"
      ? "M0,56 C320,8 640,72 960,28 C1200,0 1340,36 1440,24 L1440,80 L0,80 Z"
      : "M0,36 C220,72 460,4 720,28 C980,52 1220,4 1440,36 L1440,80 L0,80 Z";

  return (
    <div className={`pointer-events-none absolute inset-x-0 bottom-0 leading-none ${className}`} aria-hidden="true">
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="block h-16 w-full">
        <path fill="currentColor" d={path} />
      </svg>
    </div>
  );
}
