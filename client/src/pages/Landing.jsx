import { useEffect, useState } from "react";
import { Brain, CaretDown, Flame, Heart, Person, PersonSimpleRun, Scales } from "@phosphor-icons/react";
import { api } from "../api";
import { usePageMeta } from "../hooks/usePageMeta";
import jumperAir from "../img/jumper-air.jpg";
import jumperSide from "../img/jumper-side.jpg";
import { BookingForm } from "../components/BookingForm";
import { ClassCalendar, currentMonthKey } from "../components/ClassCalendar";
import { Footer } from "../components/Footer";
import { HeroVisual } from "../components/HeroVisual";
import { Nav } from "../components/Nav";
import { Reveal } from "../components/Reveal";
import { Tagline } from "../components/Tagline";
import { buttonClass } from "../components/ui";

const BENEFITS = [
  { title: "Mejor resistencia", text: "Trabajas el corazón y los pulmones mientras sigues el ritmo.", icon: Heart },
  { title: "Más gasto energético", text: "La sesión sube el esfuerzo y puede apoyar tus metas de composición corporal.", icon: Flame },
  { title: "Piernas y glúteos con más fuerza", text: "El tren inferior trabaja mientras sostienes el ritmo.", icon: PersonSimpleRun },
  { title: "Mejor coordinación y equilibrio", text: "Aprendes a controlar cada movimiento sobre el trampolín.", icon: Scales },
  { title: "Menos estrés", text: "La música y el movimiento pueden ayudarte a mejorar el ánimo.", icon: Brain },
  { title: "Trabajas todo el cuerpo", text: "Según el paso, también participan el abdomen y los brazos.", icon: Person },
];

const STEPS = [
  { number: "01", title: "Elige día y clase", text: "En el calendario ves los lugares libres. Si el cupo se llena, esa clase se cierra." },
  { number: "02", title: "Paga y elige proteína", text: "Envía el Zelle y elige el sabor. Sin ese pago el lugar no se aparta." },
  { number: "03", title: "Muévete a tu ritmo", text: "Llegas sin experiencia, empiezas por lo básico y el instructor cuida la técnica." },
];

const TIPS = [
  "No necesitas experiencia. Cada persona empieza a su propio ritmo.",
  "Usa ropa deportiva cómoda, que te permita moverte con libertad.",
  "Lleva agua para mantenerte hidratado durante la clase.",
  "Empieza con movimientos básicos. No necesitas saltar alto ni seguir todos los pasos desde el primer minuto.",
  "Mantén el control. Sigue las indicaciones del instructor y prioriza la técnica sobre la velocidad.",
  "Escucha a tu cuerpo. Descansa cuando lo necesites y adapta la intensidad a tu condición.",
  "Ven con ganas de divertirte. No tienes que ser atleta para comenzar.",
];

const FAQS = [
  {
    q: "¿Necesito experiencia?",
    a: "No. Cada persona empieza a su propio ritmo y la clase se adapta a ese punto de partida.",
  },
  {
    q: "¿Qué llevo a la clase?",
    a: "Ropa deportiva cómoda y agua. Con eso puedes empezar.",
  },
  {
    q: "¿Tengo que saltar muy alto?",
    a: "No. Empiezas con movimientos básicos y la técnica va antes que la velocidad.",
  },
  {
    q: "¿Cómo aparto mi lugar con Zelle?",
    a: "Envías el Zelle al destino del estudio, escribes el nombre con el que pagaste y eliges el sabor de tu proteína. Así queda apartado tu lugar.",
  },
  {
    q: "¿Cuándo queda confirmada la clase?",
    a: "El lugar queda apartado cuando registras el Zelle. Pasa a pagado cuando el estudio ve el depósito.",
  },
  {
    q: "¿Puedo bajar la intensidad?",
    a: "Sí. Descansas cuando lo necesitas y adaptas el esfuerzo a tu condición.",
  },
  {
    q: "¿La clase es personalizada?",
    a: "Sí. Es una clase para ti, con indicaciones del instructor y progreso a tu ritmo.",
  },
  {
    q: "¿Qué pasa si la clase se llena?",
    a: "Se cierra. Cada registro ocupa un lugar y, al llegar al cupo, ya no se aceptan más personas.",
  },
  {
    q: "¿Puedo apartar sin pagar?",
    a: "No. El lugar se aparta cuando envías el Zelle y eliges el sabor de tu proteína.",
  },
];

export function Landing() {
  const [meta, setMeta] = useState(null);
  const [month, setMonth] = useState(() => currentMonthKey());
  const [classes, setClasses] = useState([]);
  const [classesError, setClassesError] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  usePageMeta({
    title: "Clases personalizadas de jumping | JumpingKat",
    description: "Agenda tu clase personalizada de jumping. Música, coordinación y resistencia, a tu ritmo. Aparta tu lugar por Zelle.",
  });

  function loadMeta() {
    setMeta(null);
    api("/api/meta")
      .then(setMeta)
      .catch(() => setMeta({ error: true }));
  }

  function loadClasses(nextMonth = month) {
    setClassesError(false);
    api(`/api/classes?month=${nextMonth}`)
      .then((data) => setClasses(data.classes))
      .catch(() => setClassesError(true));
  }

  useEffect(() => {
    loadMeta();
  }, []);

  useEffect(() => {
    loadClasses(month);
  }, [month]);

  const selectedClass = classes.find((item) => item.id === selectedId) || null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <>
      <Nav />
      <main id="contenido">
        <Reveal as="section" id="inicio" className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-16 md:py-24 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-sm font-semibold text-[#D6FF3F]">Clase personalizada</p>
            <h1 className="mt-4 max-w-[680px] text-3xl font-semibold sm:text-4xl md:text-5xl lg:text-6xl">
              {["Tu clase de jumping", "personalizada,", "a tu ritmo."].map((line) => (
                <span key={line} className="block bg-gradient-to-r from-white to-[#9B9B9B] bg-clip-text text-transparent">
                  {line}
                </span>
              ))}
            </h1>
            <p className="mt-6 max-w-[680px] text-lg text-[#9B9B9B]">
              Un entrenamiento con música, coordinación y resistencia. Empiezas sin experiencia y avanzas según tu cuerpo.
            </p>
            <a className={`inline-flex ${buttonClass()} mt-6`} href="#agenda">
              Apartar mi clase
            </a>
            <p className="mt-6 max-w-[680px] text-sm text-[#9B9B9B]">Sin experiencia previa. La técnica va antes que la velocidad.</p>
          </div>
          <HeroVisual settings={meta?.settings} />
        </Reveal>

        <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-16 md:grid-cols-2 md:py-24">
          <Reveal>
            <h2 className="max-w-[680px] text-4xl font-semibold">Mucho más que saltar</h2>
            <p className="mt-4 max-w-[680px] text-lg text-[#9B9B9B]">
              ¿Crees que el jumping es solo brincar en un trampolín? Es un entrenamiento cardiovascular que combina música, coordinación, resistencia y diversión.
            </p>
          </Reveal>
          <Reveal>
            <p className="max-w-[680px] text-base text-[#9B9B9B]">
              Trabajas el corazón, las piernas y la coordinación mientras sigue la música. La clase es para ti, así que la intensidad se adapta a tu cuerpo.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {["Música", "Coordinación", "Resistencia", "Diversión"].map((item) => (
                <li key={item} className="rounded-full bg-[#181818] px-3 py-2 text-sm font-semibold">
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </section>

        <section id="beneficios" className="bg-[#181818] px-6 py-24">
          <div className="mx-auto w-full max-w-6xl">
            <Reveal>
              <h2 className="max-w-[680px] text-4xl font-semibold">Por qué practicar jumping</h2>
              <p className="mt-4 max-w-[680px] text-lg text-[#9B9B9B]">Una clase suma ritmo, esfuerzo y control. Estos son los cambios que puedes notar.</p>
            </Reveal>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {BENEFITS.map((benefit) => {
                const Icon = benefit.icon;
                return (
                <Reveal key={benefit.title}>
                  <article className="h-full rounded-2xl bg-[#1F1F1F] p-6 transition-all duration-700 ease-fluid hover:-translate-y-1">
                    <Icon size={24} aria-hidden="true" />
                    <h3 className="mt-6 text-xl font-semibold">{benefit.title}</h3>
                    <p className="mt-3 text-base text-[#9B9B9B]">{benefit.text}</p>
                  </article>
                </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <Tagline />

        <section id="como-funciona" className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24">
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div>
              <Reveal>
                <h2 className="max-w-[680px] text-4xl font-semibold">Cómo apartas tu clase</h2>
                <p className="mt-4 max-w-[680px] text-lg text-[#9B9B9B]">
                  Puedes entrenar, mejorar tu resistencia y disfrutar de la música. Eliges la hora, apartas por Zelle y entras a moverte mejor.
                </p>
              </Reveal>
              <ol className="mt-8 grid list-none gap-8">
                {STEPS.map((step) => (
                  <Reveal key={step.number} as="li" className="grid gap-4 md:grid-cols-[96px_1fr] md:items-start">
                    <span className="text-5xl font-semibold text-[#9B9B9B]">{step.number}</span>
                    <div className="max-w-[680px]">
                      <h3 className="text-2xl font-semibold">{step.title}</h3>
                      <p className="mt-3 text-base text-[#9B9B9B]">{step.text}</p>
                    </div>
                  </Reveal>
                ))}
              </ol>
            </div>
            <div className="grid w-full max-w-md grid-cols-2 gap-4">
              <figure className="overflow-hidden rounded-3xl bg-[#181818] p-2">
                <img src={jumperAir} alt="Persona saltando sobre un trampolín de jumping" className="aspect-[3/4] w-full rounded-2xl object-cover object-top" />
              </figure>
              <figure className="overflow-hidden rounded-3xl bg-[#181818] p-2">
                <img src={jumperSide} alt="Persona rebotando sobre un trampolín de jumping" className="aspect-[3/4] w-full rounded-2xl object-cover object-top" />
              </figure>
            </div>
          </div>
        </section>

        <section id="primera-clase" className="bg-[#181818] px-6 py-24">
          <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <Reveal>
              <h2 className="max-w-[680px] text-4xl font-semibold">Si es tu primera clase</h2>
              <p className="mt-4 max-w-[680px] text-lg text-[#9B9B9B]">Llegas como estás. El instructor marca la técnica y tú marcas hasta dónde llegas hoy.</p>
            </Reveal>
            <ol className="grid list-none gap-3">
              {TIPS.map((tip, index) => (
                <Reveal key={tip} as="li" className="rounded-2xl bg-[#1F1F1F] p-4">
                  <p className="text-sm font-semibold text-[#D6FF3F]">{String(index + 1).padStart(2, "0")}</p>
                  <p className="mt-2 text-base">{tip}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        <section id="preguntas" className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24">
          <Reveal>
            <h2 className="max-w-[680px] text-4xl font-semibold">Preguntas frecuentes</h2>
          </Reveal>
          <div className="mt-8 grid max-w-[680px] gap-3">
            {FAQS.map((item) => (
              <details key={item.q} className="group rounded-2xl bg-[#181818] p-4">
                <summary className="ring-focus flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                  {item.q}
                  <CaretDown size={20} className="shrink-0 text-[#9B9B9B] transition-transform duration-700 ease-fluid group-open:rotate-180" aria-hidden="true" />
                </summary>
                <p className="mt-4 text-base text-[#9B9B9B]">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="agenda" className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24">
          <Reveal>
            <h2 className="max-w-[680px] text-4xl font-semibold">Elige tu clase</h2>
            <p className="mt-4 max-w-[680px] text-lg text-[#9B9B9B]">Toca un día marcado y aparta un lugar libre. El pago por Zelle es obligatorio, y al pagarlo eliges el sabor de tu proteína.</p>
          </Reveal>
          <div className="mt-8 grid items-start gap-8 lg:grid-cols-[24rem_minmax(0,1fr)]">
            <div className="w-full lg:max-w-sm">
              <ClassCalendar
                classes={classes}
                month={month}
                onMonth={(next) => {
                  setMonth(next);
                  setSelectedId("");
                }}
                selectedId={selectedId}
                onSelect={setSelectedId}
                error={classesError}
                onRetry={() => loadClasses(month)}
              />
            </div>
            <BookingForm meta={meta} selectedClass={selectedClass} onBooked={() => loadClasses(month)} onRetry={loadMeta} />
          </div>
        </section>
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </>
  );
}
