import { Link } from "react-router-dom";
import { Mark } from "./Mark";

export function Footer() {
  return (
    <footer className="bg-raise px-6 py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <Link to="/" className="ring-focus flex w-max items-center gap-2 rounded-full text-sm font-semibold">
          <Mark />
          JumpingKat
        </Link>
        <p className="max-w-[680px] text-sm text-muted">Clases personalizadas de jumping. Música, coordinación y resistencia a tu ritmo.</p>
        <nav className="flex gap-4 text-sm" aria-label="Legal">
          <Link className="ring-focus rounded-full text-muted transition-all duration-700 ease-fluid hover:text-ink" to="/privacidad">
            Privacidad
          </Link>
          <Link className="ring-focus rounded-full text-muted transition-all duration-700 ease-fluid hover:text-ink" to="/terminos">
            Términos
          </Link>
        </nav>
      </div>
    </footer>
  );
}
