const tones = {
  primary: "bg-[#FFD60A] text-black hover:bg-[#FFF3B0]",
  quiet: "bg-soft text-ink hover:bg-line",
  danger: "bg-soft text-danger hover:bg-line",
};

const sizes = {
  base: "text-base",
  small: "text-sm",
};

export function buttonClass({ tone = "primary", size = "base" } = {}) {
  return `cursor-pointer items-center justify-center rounded-full px-3 py-2 font-semibold transition-all duration-700 ease-fluid active:scale-[0.98] ring-focus disabled:cursor-not-allowed disabled:opacity-40 ${tones[tone]} ${sizes[size]}`;
}

export function Button({ tone = "primary", size = "base", className = "", ...props }) {
  return <button className={`inline-flex ${buttonClass({ tone, size })} ${className}`} {...props} />;
}

export function fieldClass(invalid = false) {
  return `w-full rounded-lg border bg-soft px-3 py-2 text-base text-ink transition-all duration-700 ease-fluid placeholder:text-muted ring-focus ${invalid ? "border-danger" : "border-line"}`;
}
