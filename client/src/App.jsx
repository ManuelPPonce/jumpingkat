import { Component } from "react";
import { Route, Routes } from "react-router-dom";
import { buttonClass } from "./components/ui";
import { Landing } from "./pages/Landing";
import { Admin } from "./pages/Admin";
import { Privacy } from "./pages/Privacy";
import { Terms } from "./pages/Terms";
import { NotFound } from "./pages/NotFound";

class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main id="contenido" className="mx-auto max-w-[680px] px-6 py-24">
          <h1 className="text-4xl font-semibold">No pudimos mostrar esta página.</h1>
          <p className="mt-4 text-base text-[#9B9B9B]">Recarga e inténtalo otra vez. Si sigue igual, vuelve al inicio.</p>
          <a className={`inline-flex ${buttonClass()} mt-6`} href="/">
            Volver al inicio
          </a>
        </main>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <a
        href="#contenido"
        className="sr-only ring-focus focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-[60] focus:rounded-full focus:bg-[#D6FF3F] focus:px-3 focus:py-2 focus:text-base focus:font-semibold focus:text-black"
      >
        Saltar al contenido
      </a>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/privacidad" element={<Privacy />} />
        <Route path="/terminos" element={<Terms />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}
