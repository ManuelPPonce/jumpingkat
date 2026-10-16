import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, downloadCsv, formatClassDate, formatStamp, getToken, setToken, timeLabel } from "../api";
import { ClassPlanner } from "../components/ClassPlanner";
import { Mark } from "../components/Mark";
import { Button, fieldClass } from "../components/ui";
import { usePageMeta } from "../hooks/usePageMeta";

const FILTERS = [
  { id: "por-confirmar", label: "Por confirmar" },
  { id: "pendiente", label: "Pendiente" },
  { id: "apartado", label: "Apartado" },
  { id: "pagado", label: "Pagado" },
  { id: "todos", label: "Todos" },
];

const EMPTY_SETTINGS = { zelleName: "", zelleHandle: "", classPrice: "", location: "" };

export function Admin() {
  usePageMeta({ title: "Panel de registros | JumpingKat", robots: "noindex" });
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [times, setTimes] = useState([]);
  const [settings, setSettings] = useState(EMPTY_SETTINGS);
  const [draft, setDraft] = useState(EMPTY_SETTINGS);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("por-confirmar");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [confirmId, setConfirmId] = useState("");
  const [scheduleVersion, setScheduleVersion] = useState(0);
  const [savingSettings, setSavingSettings] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [list, meta] = await Promise.all([api("/api/bookings"), api("/api/meta")]);
      setBookings(list.bookings);
      setTimes(meta.times);
      setSettings(meta.settings);
      setDraft(meta.settings);
    } catch (loadError) {
      if (loadError.status === 401) {
        setToken("");
        setAuthed(false);
        return;
      }
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;
    async function check() {
      if (!getToken()) {
        setReady(true);
        return;
      }
      try {
        await api("/api/auth/me");
        if (ignore) return;
        setAuthed(true);
        await load();
      } catch {
        setToken("");
        if (!ignore) setAuthed(false);
      } finally {
        if (!ignore) setReady(true);
      }
    }
    check();
    return () => {
      ignore = true;
    };
  }, []);

  const counts = useMemo(() => ({
    pendiente: bookings.filter((item) => item.status === "pendiente").length,
    apartado: bookings.filter((item) => item.status === "apartado").length,
    pagado: bookings.filter((item) => item.status === "pagado").length,
  }), [bookings]);

  const visible = bookings.filter((booking) => {
    const matchesFilter = filter === "todos"
      || (filter === "por-confirmar" && (booking.status === "pendiente" || booking.status === "apartado"))
      || booking.status === filter;
    const haystack = [booking.name, booking.email, booking.phone, booking.zelleAccountName, booking.zelleReference, booking.notes, booking.proteinFlavor]
      .join(" ")
      .toLowerCase();
    return matchesFilter && haystack.includes(query.trim().toLowerCase());
  });

  async function changeStatus(id, status) {
    setBusyId(id);
    setError("");
    try {
      const data = await api(`/api/bookings/${id}`, { method: "PATCH", body: { status } });
      setBookings((current) => current.map((item) => (item.id === id ? data.booking : item)));
    } catch (statusError) {
      setError(statusError.message);
    } finally {
      setBusyId("");
    }
  }

  async function remove(id) {
    setBusyId(id);
    setError("");
    try {
      await api(`/api/bookings/${id}`, { method: "DELETE" });
      setBookings((current) => current.filter((item) => item.id !== id));
      setConfirmId("");
      setScheduleVersion((current) => current + 1);
    } catch (removeError) {
      setError(removeError.message);
    } finally {
      setBusyId("");
    }
  }

  async function saveSettings(event) {
    event.preventDefault();
    setSavingSettings(true);
    setNotice("");
    setError("");
    try {
      const data = await api("/api/settings", { method: "PUT", body: draft });
      setSettings(data.settings);
      setDraft(data.settings);
      setNotice("Datos de Zelle guardados.");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSavingSettings(false);
    }
  }

  async function logout() {
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    setToken("");
    setAuthed(false);
  }

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between gap-4 px-6 py-6">
        <Link to="/" className="ring-focus flex items-center gap-2 rounded-full text-sm font-semibold">
          <Mark />
          JumpingKat
        </Link>
        <p className="text-sm font-semibold" aria-current="page">Panel</p>
        {authed ? (
          <Button type="button" tone="quiet" size="small" onClick={logout}>
            Salir
          </Button>
        ) : <span />}
      </header>
      <main id="contenido" className="mx-auto w-full max-w-6xl px-6 pb-16">
        {!ready ? <Skeleton /> : null}
        {ready && !authed ? <Login onSuccess={() => { setAuthed(true); load(); }} /> : null}
        {ready && authed ? (
          <div className="grid gap-6">
            <div>
              <h1 className="max-w-[680px] text-4xl font-semibold">Quién apartó y quién ya pagó</h1>
              <p className="mt-4 max-w-[680px] text-base text-[#9B9B9B]">
                Apartado: la persona ya envió el Zelle y eligió su proteína. Pagado: tú confirmaste que el dinero llegó.
              </p>
            </div>
            {error ? <p className="text-sm text-[#FFB4B4]" role="alert">{error}</p> : null}
            <ClassPlanner version={scheduleVersion} />
            <div className="grid gap-3 md:grid-cols-3">
              <Stat label="Pendientes" value={counts.pendiente} />
              <Stat label="Apartados" value={counts.apartado} />
              <Stat label="Pagados" value={counts.pagado} />
            </div>
            <form className="rounded-3xl bg-[#181818] p-2" onSubmit={saveSettings}>
              <div className="rounded-2xl bg-[#1F1F1F] p-6">
                <h2 className="text-2xl font-semibold">Datos de Zelle</h2>
                {!settings.zelleHandle ? (
                  <p className="mt-3 text-sm text-[#9B9B9B]">Publica el destino para que la agenda muestre a dónde enviar el pago.</p>
                ) : null}
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <SettingField id="zelle-name" label="Nombre que ve el alumno" value={draft.zelleName} onChange={(value) => setDraft((current) => ({ ...current, zelleName: value }))} />
                  <SettingField id="zelle-handle" label="Correo o teléfono de Zelle" value={draft.zelleHandle} onChange={(value) => setDraft((current) => ({ ...current, zelleHandle: value }))} />
                  <SettingField id="zelle-price" label="Monto por clase" value={draft.classPrice} onChange={(value) => setDraft((current) => ({ ...current, classPrice: value }))} placeholder="28 USD" />
                  <SettingField id="zelle-location" label="Lugar de la clase" value={draft.location} onChange={(value) => setDraft((current) => ({ ...current, location: value }))} />
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <Button type="submit" disabled={savingSettings}>{savingSettings ? "Guardando" : "Guardar datos"}</Button>
                  {notice ? <p className="text-sm text-[#9B9B9B]">{notice}</p> : null}
                </div>
              </div>
            </form>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar registros">
                {FILTERS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={filter === item.id}
                    className={`rounded-full px-3 py-2 text-sm font-semibold transition-all duration-700 ease-fluid active:scale-[0.98] ring-focus ${filter === item.id ? "bg-[#D6FF3F] text-black" : "bg-[#272727] text-white hover:bg-[#313131]"}`}
                    onClick={() => setFilter(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button type="button" tone="quiet" size="small" onClick={load} disabled={loading}>
                  {loading ? "Actualizando" : "Actualizar"}
                </Button>
                <Button type="button" tone="quiet" size="small" onClick={() => downloadCsv(visible, times)} disabled={!visible.length}>
                  Descargar CSV
                </Button>
              </div>
            </div>
            <label className="block">
              <span className="text-sm font-semibold">Buscar</span>
              <input className={`${fieldClass(false)} mt-2`} value={query} placeholder="Nombre, correo, teléfono o Zelle" onChange={(event) => setQuery(event.target.value)} />
            </label>
            {loading && !bookings.length ? <Skeleton /> : null}
            {!loading && !bookings.length ? (
              <Empty title="Todavía no hay registros" text="Cuando alguien pague y elija su proteína, el registro aparece aquí como apartado." />
            ) : null}
            {!loading && bookings.length > 0 && !visible.length ? (
              <Empty title="Ningún registro coincide" text="Prueba otro filtro o borra la búsqueda." />
            ) : null}
            <div className="grid gap-4">
              {visible.map((booking) => (
                <article key={booking.id} className="rounded-2xl bg-[#181818] p-6">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold">{booking.name}</h2>
                      <p className="mt-2 text-sm text-[#9B9B9B]">
                        <a className="ring-focus rounded-full hover:text-white" href={`mailto:${booking.email}`}>{booking.email}</a>
                        {" · "}
                        <a className="ring-focus rounded-full hover:text-white" href={`tel:${booking.phone}`}>{booking.phone}</a>
                      </p>
                    </div>
                    <Status status={booking.status} />
                  </div>
                  <dl className="mt-4 grid gap-2 text-sm md:grid-cols-2">
                    <Info label="Clase" value={[booking.classTitle, formatClassDate(booking.classDate), timeLabel(booking.classTime, times)].filter(Boolean).join(", ")} />
                    <Info label="Primera clase" value={booking.firstClass ? "Sí" : "No"} />
                    <Info label="Proteína" value={booking.proteinFlavor || "Sin sabor"} />
                    <Info label="Nombre en Zelle" value={booking.zelleAccountName || "Sin nombre"} />
                    <Info label="Referencia" value={booking.zelleReference || "Sin referencia"} />
                    <Info label="Registrado" value={formatStamp(booking.createdAt)} />
                  </dl>
                  {booking.notes ? <p className="mt-4 text-sm text-[#9B9B9B]">Nota: {booking.notes}</p> : null}
                  <p className="mt-4 text-sm text-[#9B9B9B]">
                    {booking.status === "apartado" ? "Esta persona dice que ya envió el Zelle. Márcalo pagado cuando lo veas en tu cuenta." : null}
                    {booking.status === "pendiente" ? "Ocupa un lugar. El pago todavía no está confirmado. Si borras el registro, el lugar vuelve a abrirse." : null}
                    {booking.status === "pagado" ? "Pago confirmado por ti." : null}
                  </p>
                  <p className="mt-2 text-xs text-[#9B9B9B]">Ficha {booking.id.slice(0, 8).toUpperCase()}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button type="button" size="small" disabled={busyId === booking.id || booking.status === "pagado"} onClick={() => changeStatus(booking.id, "pagado")}>
                      Marcar pagado
                    </Button>
                    <Button type="button" tone="quiet" size="small" disabled={busyId === booking.id || booking.status === "apartado"} onClick={() => changeStatus(booking.id, "apartado")}>
                      Marcar apartado
                    </Button>
                    <Button type="button" tone="quiet" size="small" disabled={busyId === booking.id || booking.status === "pendiente"} onClick={() => changeStatus(booking.id, "pendiente")}>
                      Volver a pendiente
                    </Button>
                    {confirmId === booking.id ? (
                      <>
                        <Button type="button" tone="danger" size="small" disabled={busyId === booking.id} onClick={() => remove(booking.id)}>
                          Confirmar borrado
                        </Button>
                        <Button type="button" tone="quiet" size="small" onClick={() => setConfirmId("")}>
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <Button type="button" tone="danger" size="small" onClick={() => setConfirmId(booking.id)}>
                        Eliminar
                      </Button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

function Login({ onSuccess }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    if (!password) {
      setError("Escribe la clave del panel.");
      return;
    }
    setSaving(true);
    try {
      const data = await api("/api/auth/login", { method: "POST", body: { password } });
      setToken(data.token);
      onSuccess();
    } catch (loginError) {
      setError(loginError.fields?.password || loginError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="mx-auto max-w-[420px] rounded-3xl bg-[#181818] p-2" onSubmit={onSubmit} noValidate>
      <div className="rounded-2xl bg-[#1F1F1F] p-6">
        <h1 className="text-3xl font-semibold">Entrar al panel</h1>
        <p className="mt-3 text-sm text-[#9B9B9B]">Aquí ves quién se registró y si el Zelle está pendiente, apartado o pagado.</p>
        <label className="mt-6 block" htmlFor="clave">
          <span className="text-sm font-semibold">Clave</span>
          <input id="clave" type="password" autoComplete="current-password" className={`${fieldClass(Boolean(error))} mt-2`} value={password} onChange={(event) => setPassword(event.target.value)} aria-invalid={Boolean(error)} />
        </label>
        {error ? <p className="mt-2 text-sm text-[#FFB4B4]">{error}</p> : null}
        <Button className="mt-4" type="submit" disabled={saving}>{saving ? "Entrando" : "Entrar"}</Button>
      </div>
    </form>
  );
}

function SettingField({ id, label, value, onChange, placeholder }) {
  return (
    <label htmlFor={id}>
      <span className="text-sm font-semibold">{label}</span>
      <input id={id} className={`${fieldClass(false)} mt-2`} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#181818] p-6">
      <p className="text-sm text-[#9B9B9B]">{label}</p>
      <p className="mt-2 text-4xl font-semibold">{value}</p>
    </div>
  );
}

function Status({ status }) {
  const styles = {
    pendiente: "bg-[#272727] text-[#9B9B9B]",
    apartado: "bg-[#D6FF3F] text-black",
    pagado: "bg-white text-black",
  };
  const labels = { pendiente: "Pendiente", apartado: "Apartado", pagado: "Pagado" };
  return <p className={`w-max rounded-full px-3 py-2 text-sm font-semibold ${styles[status]}`}>{labels[status]}</p>;
}

function Info({ label, value }) {
  return (
    <div>
      <dt className="text-[#9B9B9B]">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}

function Empty({ title, text }) {
  return (
    <div className="rounded-2xl bg-[#181818] p-6">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-3 max-w-[680px] text-base text-[#9B9B9B]">{text}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid gap-4" aria-hidden="true">
      <div className="h-24 rounded-2xl bg-[#181818]" />
      <div className="h-24 rounded-2xl bg-[#181818]" />
      <div className="h-24 rounded-2xl bg-[#181818]" />
    </div>
  );
}
