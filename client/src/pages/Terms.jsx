import { Footer } from "../components/Footer";
import { Nav } from "../components/Nav";
import { usePageMeta } from "../hooks/usePageMeta";

export function Terms() {
  usePageMeta({
    title: "Términos | JumpingKat",
    description: "Cómo se aparta una clase de JumpingKat y cuándo el pago por Zelle queda confirmado.",
  });
  return (
    <>
      <Nav />
      <main id="contenido" className="mx-auto w-full max-w-[680px] px-6 py-16">
        <h1 className="text-4xl font-semibold">Términos</h1>
        <div className="mt-6 grid gap-4 text-base text-[#9B9B9B]">
          <p>Apartar una clase significa que enviaste el pago por Zelle, escribiste el nombre del envío y elegiste el sabor de tu proteína. El estado pasa a pagado cuando el estudio confirma que el dinero llegó.</p>
          <p>Sin ese pago no se aparta el lugar.</p>
          <p>Llega con ropa cómoda y agua. Puedes bajar la intensidad y descansar cuando lo necesites.</p>
          <p>El instructor puede proponer otra hora si ese horario ya no está libre. En ese caso te contacta por el correo o el teléfono que dejaste.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
