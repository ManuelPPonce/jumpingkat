import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";

const EASE = [0.32, 0.72, 0, 1];

const TAGS = {
  div: motion.div,
  li: motion.li,
  span: motion.span,
  section: motion.section,
  article: motion.article,
  p: motion.p,
};

export function useReduceMotion() {
  const [reduce, setReduce] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduce(media.matches);
    media.addEventListener("change", onChange);
    setReduce(media.matches);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return reduce;
}

export function Reveal({ as = "div", delay = 0, from = "up", className = "", children, ...props }) {
  const reduce = useReduceMotion();
  if (reduce) {
    const Plain = as;
    return (
      <Plain className={className} {...props}>
        {children}
      </Plain>
    );
  }

  const Tag = TAGS[as] ?? motion.div;
  const offset = from === "left" ? { x: -48, y: 0 } : from === "right" ? { x: 48, y: 0 } : { x: 0, y: 64 };

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, filter: "blur(12px)", ...offset }}
      whileInView={{ opacity: 1, filter: "blur(0px)", x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, delay, ease: EASE }}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function Drift({ className = "", range = 28, children }) {
  const reduce = useReduceMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [range, -range]);

  return (
    <motion.div ref={ref} className={className} style={reduce ? undefined : { y }}>
      {children}
    </motion.div>
  );
}
