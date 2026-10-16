const tones = {
  primary: "bg-[#D6FF3F] text-black hover:bg-white",
  quiet: "bg-[#272727] text-white hover:bg-[#313131]",
  danger: "bg-[#272727] text-[#FFB4B4] hover:bg-[#313131]",
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
  return `w-full rounded-lg border bg-[#272727] px-3 py-2 text-base text-white transition-all duration-700 ease-fluid placeholder:text-[#9B9B9B] ring-focus ${invalid ? "border-[#FFB4B4]" : "border-[#313131]"}`;
}
