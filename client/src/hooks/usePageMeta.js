import { useEffect } from "react";

export function usePageMeta({ title, robots = "index,follow", description }) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;
    const robotsEl = ensureMeta("robots");
    const previousRobots = robotsEl.getAttribute("content");
    robotsEl.setAttribute("content", robots);
    const descriptionEl = description ? ensureMeta("description") : null;
    const previousDescription = descriptionEl?.getAttribute("content");
    if (descriptionEl && description) descriptionEl.setAttribute("content", description);

    return () => {
      document.title = previousTitle;
      robotsEl.setAttribute("content", previousRobots || "index,follow");
      if (descriptionEl && previousDescription != null) descriptionEl.setAttribute("content", previousDescription);
    };
  }, [title, robots, description]);
}

function ensureMeta(name) {
  let element = document.querySelector(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("name", name);
    document.head.appendChild(element);
  }
  return element;
}
