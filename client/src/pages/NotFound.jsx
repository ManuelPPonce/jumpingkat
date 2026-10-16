import { Link } from "react-router-dom";
import { Mark } from "../components/Mark";
import { buttonClass } from "../components/ui";
import { usePageMeta } from "../hooks/usePageMeta";

export function NotFound() {
  usePageMeta({ title: "Página no encontrada | JumpingKat", robots: "noindex" });
  return (
    <main id="contenido" className="mx-auto flex min-h-screen w-full max-w-[680px] flex-col justify-center px-6 py-24">
      <Mark className="h-12 w-12" />
      <h1 className="mt-6 text-4xl font-semibold">No encontramos esa página</h1>
      <p className="mt-4 text-base text-[#9B9B9B]">El enlace no corresponde a una clase ni a una sección de JumpingKat.</p>
      <Link className={`inline-flex ${buttonClass()} mt-6 w-max`} to="/">
        Volver al inicio
      </Link>
    </main>
  );
}
