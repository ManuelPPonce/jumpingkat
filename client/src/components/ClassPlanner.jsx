import { useEffect, useState } from "react";
import { addDays, api, formatClassDate, formatTime, todayISO } from "../api";
import { Button, fieldClass } from "./ui";

const EMPTY = { title: "Jumping", classDate: "", classTime: "", capacity: "8" };

export function ClassPlanner({ version = 0 }) {
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [drafts, setDrafts] = useState({});
  const [busyId, setBusyId] = useState("");

  async function load() {
    const data = await api(`/api/classes?from=${todayISO()}&to=${addDays(todayISO(), 180)}`);
    setClasses(data.classes);
    setDrafts(Object.fromEntries(data.classes.map((item) => [item.id, String(item.capacity)])));
  }

  useEffect(() => {
    load().catch((loadError) => setError(loadError.message));
  }, [version]);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function publish(event) {
    event.preventDefault();
    const next = {};
    if (form.title.trim().length < 2) next.title = "Escribe el nombre de la clase.";
    if (!form.classDate) next.classDate = "Elige una fecha.";
    if (!form.classTime) next.classTime = "Elige una hora.";
    const capacity = Number(form.capacity);
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 40) next.capacity = "El cupo debe ser un número entre 1 y 40.";
    setErrors(next);
    setError("");
    setMessage("");
    if (Object.keys(next).length) return;
    setSaving(true);
    try {
      await api("/api/classes", { method: "POST", body: { ...form, title: form.title.trim(), capacity } });
      setForm(EMPTY);
      setMessage("Clase publicada en el calendario.");
      await load();
    } catch (publishError) {
      setErrors(publishError.fields || {});
      setError(publishError.message);
    } finally {
      setSaving(false);
    }
  }

  async function saveCapacity(item) {
    const capacity = Number(drafts[item.id]);
    setBusyId(item.id);
    setError("");
    try {
      await api(`/api/classes/${item.id}`, { method: "PATCH", body: { capacity } });
      setMessage("Cupo actualizado.");
      await load();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setBusyId("");
    }
  }

  async function remove(item) {
    setBusyId(item.id);
    setError("");
    try {
      await api(`/api/classes/${item.id}`, { method: "DELETE" });
      setMessage("Clase quitada del calendario.");
      await load();
    } catch (removeError) {
      setError(removeError.message);
    } finally {
      setBusyId("");
    }
  }

  return (
    <section className="rounded-3xl bg-raise p-2">
      <div className="rounded-2xl bg-card p-6">
        <h2 className="text-2xl font-semibold">Programar clases</h2>
        <p className="mt-3 max-w-[680px] text-sm text-muted">
          Cada registro ocupa un lugar. Cuando el cupo se llena, la clase se cierra y ya no acepta más personas.
        </p>
        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
        {message ? <p className="mt-4 text-sm text-muted">{message}</p> : null}
        <form className="mt-6 grid gap-4" onSubmit={publish} noValidate>
          <label>
            <span className="text-sm font-semibold">Nombre de la clase</span>
            <input className={`${fieldClass(Boolean(errors.title))} mt-2`} value={form.title} onChange={(event) => update("title", event.target.value)} />
            {errors.title ? <p className="mt-2 text-sm text-danger">{errors.title}</p> : null}
          </label>
          <div className="grid gap-4 md:grid-cols-3">
            <label>
              <span className="text-sm font-semibold">Fecha</span>
              <input type="date" min={todayISO()} className={`${fieldClass(Boolean(errors.classDate))} mt-2`} value={form.classDate} onChange={(event) => update("classDate", event.target.value)} />
              {errors.classDate ? <p className="mt-2 text-sm text-danger">{errors.classDate}</p> : null}
            </label>
            <label>
              <span className="text-sm font-semibold">Hora</span>
              <input type="time" className={`${fieldClass(Boolean(errors.classTime))} mt-2`} value={form.classTime} onChange={(event) => update("classTime", event.target.value)} />
              {errors.classTime ? <p className="mt-2 text-sm text-danger">{errors.classTime}</p> : null}
            </label>
            <label>
              <span className="text-sm font-semibold">Cupo</span>
              <input type="number" min="1" max="40" className={`${fieldClass(Boolean(errors.capacity))} mt-2`} value={form.capacity} onChange={(event) => update("capacity", event.target.value)} />
              {errors.capacity ? <p className="mt-2 text-sm text-danger">{errors.capacity}</p> : null}
            </label>
          </div>
          <Button type="submit" disabled={saving}>{saving ? "Publicando" : "Publicar clase"}</Button>
        </form>
        <div className="mt-6 grid gap-3">
          {!classes.length ? <p className="text-sm text-muted">Todavía no hay clases publicadas.</p> : null}
          {classes.map((item) => (
            <article key={item.id} className="rounded-2xl bg-soft p-4">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted">
                {formatClassDate(item.classDate)} · {formatTime(item.classTime)}
              </p>
              <p className="mt-2 text-sm font-semibold">{item.state === "llena" ? "Llena" : `${item.taken} de ${item.capacity} lugares`}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <label className="text-sm font-semibold" htmlFor={`cupo-${item.id}`}>
                  Cupo
                </label>
                <input
                  id={`cupo-${item.id}`}
                  type="number"
                  min="1"
                  max="40"
                  className={`${fieldClass(false)} w-24`}
                  value={drafts[item.id] ?? ""}
                  onChange={(event) => setDrafts((current) => ({ ...current, [item.id]: event.target.value }))}
                />
                <Button type="button" size="small" tone="quiet" disabled={busyId === item.id} onClick={() => saveCapacity(item)}>
                  Guardar cupo
                </Button>
                <Button type="button" size="small" tone="danger" disabled={busyId === item.id || item.taken > 0} onClick={() => remove(item)}>
                  Quitar clase
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
