export function Mark({ className = "h-6 w-6" }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="16" fill="#D6FF3F" />
      <path d="M8 20c2.5-6 13.5-6 16 0" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="11" r="2.2" fill="#000" />
    </svg>
  );
}
