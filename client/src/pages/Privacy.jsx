import { Footer } from "../components/Footer";
import { Nav } from "../components/Nav";
import { usePageMeta } from "../hooks/usePageMeta";

export function Privacy() {
  usePageMeta({
    title: "Privacidad | JumpingKat",
    description: "Qué datos guarda JumpingKat cuando apartas una clase de jumping.",
  });
  return (
    <>
      <Nav />
      <main id="contenido" className="mx-auto w-full max-w-[680px] px-6 pb-16 pt-24">
        <h1 className="text-4xl font-semibold">Privacidad</h1>
        <div className="mt-6 grid gap-4 text-base text-muted">
          <p>JumpingKat guarda los datos que escribes en la agenda: nombre, correo, teléfono, la clase, si es tu primera clase, el sabor de proteína, una nota y los datos del Zelle.</p>
          <p>Usamos esa información para organizar tu clase y confirmar el pago.</p>
          <p>No vendemos estos datos. El panel de registros solo lo abre el estudio con una clave.</p>
          <p>Si quieres corregir o borrar tu registro, pídeselo al instructor en la clase o cuando confirmen tu Zelle.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
