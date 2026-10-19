import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { useReduceMotion } from "./Reveal";

const LINES = [
  ["Aquí", "no", "se", "trata", "de", "saltar", "más", "alto."],
  ["Se", "trata", "de", "moverte", "mejor", "y", "progresar", "a", "tu", "ritmo."],
];

const WORDS = LINES.flat();

export function Tagline() {
  const reduce = useReduceMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.82", "start 0.34"],
  });
  const [active, setActive] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (reduce) return;
    setActive(Math.floor(value * WORDS.length));
  });

  useEffect(() => {
    if (reduce) {
      setActive(WORDS.length);
      return;
    }
    setActive(Math.floor(scrollYProgress.get() * WORDS.length));
  }, [reduce, scrollYProgress]);

  const shown = reduce ? WORDS.length : active;
  let index = 0;

  return (
    <section ref={ref} className="flex min-h-[70vh] items-center px-6 py-24" aria-label="Idea central">
      <h2 className="mx-auto max-w-[680px] text-4xl font-semibold md:text-5xl">
        {LINES.map((line) => (
          <span key={line.join(" ")} className="mb-3 block">
            {line.map((word) => {
              const wordIndex = index;
              index += 1;
              const on = wordIndex < shown;
              return (
                <span
                  key={`${word}-${wordIndex}`}
                  className={`transition-colors duration-[800ms] ease-fluid ${on ? "text-ink" : "text-ink/30"}`}
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
