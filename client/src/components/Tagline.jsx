import { useEffect, useState } from "react";

const LINES = [
  ["Aquí", "no", "se", "trata", "de", "saltar", "más", "alto."],
  ["Se", "trata", "de", "moverte", "mejor", "y", "progresar", "a", "tu", "ritmo."],
];

const WORDS = LINES.flat();

export function Tagline() {
  const [node, setNode] = useState(null);
  const [active, setActive] = useState(() => (window.matchMedia("(prefers-reduced-motion: reduce)").matches ? WORDS.length : 0));

  useEffect(() => {
    if (!node) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActive(WORDS.length);
      return undefined;
    }

    let frame = 0;
    const update = () => {
      const rect = node.getBoundingClientRect();
      const start = window.innerHeight * 0.82;
      const end = window.innerHeight * 0.34;
      const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
      setActive(Math.floor(progress * WORDS.length));
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        update();
        frame = 0;
      });
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [node]);

  let index = 0;

  return (
    <section ref={setNode} className="flex min-h-[70vh] items-center px-6 py-24" aria-label="Idea central">
      <h2 className="mx-auto max-w-[680px] text-4xl font-semibold md:text-5xl">
        {LINES.map((line) => (
          <span key={line.join(" ")} className="mb-3 block">
            {line.map((word) => {
              const wordIndex = index;
              index += 1;
              const on = wordIndex < active;
              return (
                <span
                  key={`${word}-${wordIndex}`}
                  className={`transition-colors duration-[800ms] ease-fluid ${on ? "text-white" : "text-white/30"}`}
                >
                  {word}{" "}
                </span>
              );
            })}
          </span>
        ))}
      </h2>
    </section>
  );
}
