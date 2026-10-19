import { useState } from "react";
import { api, formatClassDate, formatTime } from "../api";
import { Button, fieldClass } from "./ui";

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  firstClass: true,
  notes: "",
  proteinFlavor: "",
  zelleAccountName: "",
  zelleReference: "",
  company: "",
};

function validate(values, selectedClass) {
  const fields = {};
  const digits = values.phone.replace(/\D/g, "");
  if (values.name.trim().length < 2) fields.name = "Escribe tu nombre.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) fields.email = "Escribe un correo válido.";
  if (digits.length < 7) fields.phone = "Escribe un teléfono con al menos 7 dígitos.";
  if (!selectedClass?.open) fields.classId = "Elige una clase abierta en el calendario.";
  if (values.zelleAccountName.trim().length < 2) {
    fields.zelleAccountName = "Escribe el nombre con el que enviaste el Zelle.";
  }
  if (!values.proteinFlavor) fields.proteinFlavor = "Elige el sabor de tu proteína.";
  return fields;
}

function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function BookingForm({ meta, selectedClass, onBooked, onRetry }) {
  if (!meta) return <FormSkeleton />;
  if (meta.error) {
    return (
      <div className="rounded-3xl bg-raise p-2">
        <div className="rounded-2xl bg-card p-6">
          <p className="text-base">No pudimos cargar los horarios.</p>
          <Button className="mt-4" type="button" onClick={onRetry}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }
  return <Form meta={meta} selectedClass={selectedClass} onBooked={onBooked} />;
}

function Form({ meta, selectedClass, onBooked }) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [booking, setBooking] = useState(null);
  const [copied, setCopied] = useState(false);
  const settings = meta.settings || {};

  function update(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(values, selectedClass);
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length) return;
    setSaving(true);
    try {
      const data = await api("/api/bookings", {
        method: "POST",
        body: {
          ...values,
          classId: selectedClass.id,
          name: values.name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          firstClass: values.firstClass,
          zelleAccountName: values.zelleAccountName.trim(),
          zelleReference: values.zelleReference.trim(),
          notes: values.notes.trim(),
          proteinFlavor: values.proteinFlavor,
          zelleChoice: "sent",
        },
      });
      setBooking(data.booking);
      onBooked?.();
    } catch (error) {
      setErrors(error.fields || {});
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function copyHandle() {
    try {
      await navigator.clipboard.writeText(settings.zelleHandle);
      setCopied(true);
    } catch {
      setCopied(false);
      setFormError("No pudimos copiar el destino. Selecciónalo a mano.");
    }
  }

  if (booking) {
    return (
      <div className="rounded-3xl bg-raise p-2" aria-live="polite">
        <div className="rounded-2xl bg-card p-6">
          <p className="text-sm font-semibold text-blue">Registro guardado</p>
          <h3 className="mt-3 text-3xl font-semibold">{booking.name}, tu lugar quedó apartado.</h3>
          <p className="mt-4 max-w-[680px] text-base text-muted">
            El estudio lo marca pagado cuando ve el depósito en Zelle. Tu proteína es {booking.proteinFlavor}.
          </p>
          <dl className="mt-6 grid gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Clase</dt>
              <dd className="text-right font-semibold">
                {booking.classTitle ? `${booking.classTitle}, ` : ""}
                {formatClassDate(booking.classDate)} · {formatTime(booking.classTime)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Proteína</dt>
              <dd className="text-right font-semibold">{booking.proteinFlavor}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Referencia</dt>
              <dd className="font-semibold">{String(booking.id).slice(0, 8).toUpperCase()}</dd>
            </div>
          </dl>
          <Button
            className="mt-6"
            type="button"
            tone="quiet"
            onClick={() => {
              setBooking(null);
              setValues(EMPTY);
              setCopied(false);
            }}
          >
            Registrar a otra persona
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form className="rounded-3xl bg-raise p-2" noValidate onSubmit={onSubmit}>
      <div className="relative rounded-2xl bg-card p-6">
        <div aria-live="polite">{formError ? <p className="mb-4 text-sm text-danger">{formError}</p> : null}</div>
        <ZelleBox settings={settings} copied={copied} onCopy={copyHandle} />
        <div className="mt-6 grid gap-4">
          <Field id="nombre" label="Nombre" error={errors.name}>
            <input id="nombre" className={fieldClass(Boolean(errors.name))} autoComplete="name" placeholder="Mariana López" value={values.name} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "nombre-error" : undefined} onChange={(event) => update("name", event.target.value)} />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field id="correo" label="Correo" error={errors.email}>
              <input id="correo" type="email" className={fieldClass(Boolean(errors.email))} autoComplete="email" placeholder="mariana@correo.com" value={values.email} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "correo-error" : undefined} onChange={(event) => update("email", event.target.value)} />
            </Field>
            <Field id="telefono" label="Teléfono" error={errors.phone}>
              <input id="telefono" type="tel" className={fieldClass(Boolean(errors.phone))} autoComplete="tel" placeholder="555 014 2837" value={values.phone} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "telefono-error" : undefined} onChange={(event) => update("phone", event.target.value)} />
            </Field>
          </div>
          {errors.classId ? <p className="text-sm text-danger">{errors.classId}</p> : null}
          <ChosenClass selectedClass={selectedClass} />
          <label className="choice flex cursor-pointer items-start gap-3 rounded-2xl border border-line p-4">
            <input type="checkbox" className="mt-1 h-4 w-4 accent-[#FFD60A]" checked={values.firstClass} onChange={(event) => update("firstClass", event.target.checked)} />
            <span>
              <span className="block text-base font-semibold">Es mi primera clase</span>
              <span className="mt-1 block text-sm text-muted">Empezamos por lo básico y ajustamos la intensidad.</span>
            </span>
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <Field id="zelle-nombre" label="Nombre en Zelle" error={errors.zelleAccountName}>
              <input id="zelle-nombre" className={fieldClass(Boolean(errors.zelleAccountName))} placeholder="Nombre de quien envió el pago" value={values.zelleAccountName} aria-invalid={Boolean(errors.zelleAccountName)} aria-describedby={errors.zelleAccountName ? "zelle-nombre-error" : undefined} onChange={(event) => update("zelleAccountName", event.target.value)} />
            </Field>
            <Field id="zelle-ref" label="Referencia del envío" error="">
              <input id="zelle-ref" className={fieldClass(false)} placeholder="Opcional, si Zelle te dio una nota" value={values.zelleReference} onChange={(event) => update("zelleReference", event.target.value)} />
            </Field>
          </div>
          <FlavorList flavors={meta.flavors || []} value={values.proteinFlavor} error={errors.proteinFlavor} onChange={(flavor) => update("proteinFlavor", flavor)} />
          <Field id="nota" label="Nota para el instructor" error="">
            <textarea id="nota" rows="3" maxLength="400" className={fieldClass(false)} placeholder="Algo que debamos saber de tu ritmo o una lesión" value={values.notes} onChange={(event) => update("notes", event.target.value)} />
          </Field>
          <div className="absolute h-0 w-0 overflow-hidden" aria-hidden="true">
            <label>
              Empresa
              <input tabIndex={-1} autoComplete="off" value={values.company} onChange={(event) => update("company", event.target.value)} />
            </label>
          </div>
          <Button type="submit" disabled={saving || !selectedClass?.open} aria-busy={saving}>
            {saving ? "Guardando registro" : "Apartar mi clase"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function ChosenClass({ selectedClass }) {
  if (!selectedClass) {
    return <p className="rounded-2xl bg-soft p-4 text-sm text-muted">Elige una clase abierta en el calendario.</p>;
  }
  return (
    <p className="rounded-2xl bg-soft p-4 text-sm">
      <span className="block font-semibold">{selectedClass.title}</span>
      <span className="mt-1 block text-muted">
        {formatClassDate(selectedClass.classDate)} · {formatTime(selectedClass.classTime)}
      </span>
      <span className="mt-2 block font-semibold">
        {selectedClass.open
          ? `${selectedClass.capacity - selectedClass.taken} ${selectedClass.capacity - selectedClass.taken === 1 ? "lugar libre" : "lugares libres"}`
          : "Llena"}
      </span>
    </p>
  );
}

function ZelleBox({ settings, copied, onCopy }) {
  return (
    <div className="rounded-2xl bg-soft p-4">
      <h3 className="text-base font-semibold">A dónde enviar el Zelle</h3>
      {settings.zelleHandle ? (
        <>
          <p className="mt-2 text-sm text-muted">
            Envía el pago a {settings.zelleName || "JumpingKat"}
            {settings.classPrice ? `. Monto: ${settings.classPrice}` : ""}. Sin ese pago no se aparta el lugar. En la nota escribe tu nombre y la fecha de la clase.
          </p>
          {settings.location ? <p className="mt-2 text-sm text-muted">La clase es en {settings.location}.</p> : null}
          <p className="mt-3 text-xl font-semibold">{settings.zelleHandle}</p>
          <Button className="mt-3" type="button" tone="quiet" size="small" onClick={onCopy}>
            {copied ? "Destino copiado" : "Copiar destino"}
          </Button>
        </>
      ) : (
        <p className="mt-2 text-sm text-muted">
          El estudio todavía no publica el destino de Zelle. El pago es obligatorio para apartar, y al enviarlo eliges el sabor de tu proteína.
        </p>
      )}
    </div>
  );
}

function FlavorList({ flavors, value, error, onChange }) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold">Sabor de proteína</legend>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {flavors.map((flavor) => {
          const checked = value === flavor;
          return (
            <label
              key={flavor}
              className={`ring-focus cursor-pointer rounded-2xl border px-3 py-2 text-center text-sm font-semibold transition-all duration-700 ease-fluid active:scale-[0.98] ${checked ? "border-[#FFD60A] bg-[#FFD60A] text-black" : "border-line bg-soft text-ink hover:bg-line"}`}
            >
              <input className="sr-only" type="radio" name="protein" checked={checked} onChange={() => onChange(flavor)} />
              {flavor}
            </label>
          );
        })}
      </div>
      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
    </fieldset>
  );
}

function FormSkeleton() {
  return (
    <div className="rounded-3xl bg-raise p-2" aria-hidden="true">
      <div className="rounded-2xl bg-card p-6">
        <div className="h-6 w-40 rounded-lg bg-soft" />
        <div className="mt-6 h-24 rounded-2xl bg-soft" />
        <div className="mt-4 h-12 rounded-lg bg-soft" />
        <div className="mt-4 h-12 rounded-lg bg-soft" />
        <div className="mt-4 h-12 w-40 rounded-full bg-soft" />
      </div>
    </div>
  );
}
