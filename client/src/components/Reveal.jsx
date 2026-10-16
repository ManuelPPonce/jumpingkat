import { useEffect, useState } from "react";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Reveal({ as: Tag = "div", className = "", children, ...props }) {
  const [node, setNode] = useState(null);
  const [shown, setShown] = useState(prefersReducedMotion);

  useEffect(() => {
    if (!node || shown) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [node, shown]);

  return (
    <Tag
      ref={setNode}
      {...props}
      className={`transition-all duration-[800ms] ease-fluid ${shown ? "translate-y-0 opacity-100 blur-none" : "translate-y-16 opacity-0 blur-md"} ${className}`}
    >
      {children}
    </Tag>
  );
}
