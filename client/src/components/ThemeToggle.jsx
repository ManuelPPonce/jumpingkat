import { useState } from "react";
import { Moon, Sun } from "@phosphor-icons/react";

const KEY = "jumpingkat.theme";

function currentTheme() {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "light" ? "#ffffff" : "#000000");
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* El modo sigue en esta visita si el navegador bloquea el almacenamiento. */
  }
}

export function ThemeToggle({ className = "" }) {
  const [theme, setTheme] = useState(currentTheme);
  const light = theme === "light";

  function toggle() {
    const next = light ? "dark" : "light";
    applyTheme(next);
    setTheme(next);
  }

  return (
    <button
      type="button"
      className={`ring-focus inline-flex h-8 w-8 items-center justify-center rounded-full text-ink transition-all duration-700 ease-fluid active:scale-[0.98] ${className}`}
      aria-pressed={light}
      aria-label={light ? "Activar modo oscuro" : "Activar modo claro"}
      onClick={toggle}
    >
      {light ? <Moon size={20} aria-hidden="true" /> : <Sun size={20} aria-hidden="true" />}
    </button>
  );
}
