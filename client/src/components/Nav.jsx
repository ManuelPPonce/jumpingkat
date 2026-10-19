import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Mark } from "./Mark";
import { ThemeToggle } from "./ThemeToggle";
import { buttonClass } from "./ui";

const LINKS = [
  { id: "beneficios", label: "Beneficios" },
  { id: "como-funciona", label: "Cómo funciona" },
  { id: "primera-clase", label: "Primera clase" },
  { id: "preguntas", label: "Preguntas" },
];

function scrollToId(id) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById(id)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
}

export function Nav() {
  const location = useLocation();
  const onHome = location.pathname === "/";
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("inicio");

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!onHome) return undefined;
    const elements = ["inicio", ...LINKS.map((link) => link.id), "agenda"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setCurrent(visible.target.id);
      },
      { rootMargin: "-40% 0px -45% 0px", threshold: [0.1, 0.25, 0.5] }
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [onHome]);

  function follow(event, id) {
    setOpen(false);
    if (location.pathname !== "/") return;
    event.preventDefault();
    scrollToId(id);
  }

  const pageLabel = location.pathname === "/privacidad" ? "Privacidad" : location.pathname === "/terminos" ? "Términos" : "";
  const menu = [{ id: "inicio", label: "Inicio" }, ...LINKS, { id: "agenda", label: "Agenda" }];

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-6 z-50 flex justify-center px-6">
        <nav className="pointer-events-auto flex w-max max-w-full items-center gap-2 rounded-full bg-raise/90 px-3 py-2 backdrop-blur-3xl" aria-label="Principal">
          <Link to="/" className="ring-focus flex items-center gap-2 rounded-full px-2 text-sm font-semibold" aria-current={onHome && current === "inicio" ? "page" : undefined}>
            <Mark />
            <span>JumpingKat</span>
          </Link>
          {pageLabel ? <span className="px-2 text-sm font-semibold" aria-current="page">{pageLabel}</span> : null}
          <div className="hidden items-center gap-2 md:flex">
            {LINKS.map((link) => (
              <Link
                key={link.id}
                to={`/#${link.id}`}
                onClick={(event) => follow(event, link.id)}
                aria-current={onHome && current === link.id ? "true" : undefined}
                className={`ring-focus rounded-full px-3 py-2 text-sm font-semibold transition-all duration-700 ease-fluid ${onHome && current === link.id ? "text-[#FFD60A]" : "text-muted hover:text-ink"}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <Link
            to="/#agenda"
            onClick={(event) => follow(event, "agenda")}
            aria-current={onHome && current === "agenda" ? "true" : undefined}
            className={`${buttonClass({ size: "small" })} hidden md:inline-flex`}
          >
            Apartar mi clase
          </Link>
          <ThemeToggle />
          <button
            type="button"
            className="ring-focus relative h-6 w-6 rounded-full md:hidden"
            aria-expanded={open}
            aria-controls="menu-principal"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setOpen((value) => !value)}
          >
            <span className={`absolute left-0 h-0.5 w-6 origin-center bg-ink transition-all duration-700 ease-fluid ${open ? "top-3 rotate-45" : "top-1"}`} />
            <span className={`absolute left-0 top-3 h-0.5 w-6 origin-center bg-ink transition-all duration-700 ease-fluid ${open ? "-rotate-45" : ""}`} />
            <span className={`absolute left-0 h-0.5 w-6 origin-center bg-ink transition-all duration-700 ease-fluid ${open ? "top-3 rotate-45" : "top-5"}`} />
          </button>
        </nav>
      </div>
      <div
        id="menu-principal"
        role="dialog"
        aria-modal="true"
        aria-label="Menú"
        inert={open ? undefined : true}
        className={`menu-scrim fixed inset-0 z-40 backdrop-blur-3xl transition-all duration-700 ease-fluid md:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <div className="flex h-full flex-col justify-end gap-6 px-6 py-24">
          {menu.map((link, index) => (
            <Link
              key={link.id}
              to={link.id === "inicio" ? "/" : `/#${link.id}`}
              onClick={(event) => follow(event, link.id)}
              style={{ transitionDelay: open ? `${100 + index * 50}ms` : "0ms" }}
              className={`ring-focus text-4xl font-semibold transition-all duration-700 ease-fluid ${open ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"} ${onHome && current === link.id ? "text-[#FFD60A]" : "text-muted"}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
