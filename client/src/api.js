const TOKEN_KEY = "jumpingkat.token";

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
}

export async function api(path, { method = "GET", body } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    const error = new Error("No pudimos conectar con el servidor. Revisa tu conexión e inténtalo otra vez.");
    error.status = 0;
    error.fields = {};
    throw error;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "No se pudo completar la solicitud.");
    error.status = response.status;
    error.fields = data.fields || {};
    throw error;
  }
  return data;
}

export function todayISO() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function formatClassDate(iso) {
  if (!iso) return "";
  const [year, month, day] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(year, month - 1, day));
}

export function formatStamp(iso) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function addDays(iso, days) {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  const nextMonth = String(date.getMonth() + 1).padStart(2, "0");
  const nextDay = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${nextMonth}-${nextDay}`;
}

export function formatTime(value) {
  const match = /^(\d{2}):(\d{2})/.exec(value || "");
  if (!match) return value || "";
  const hour = Number(match[1]);
  const minute = match[2];
  const suffix = hour >= 12 ? "p. m." : "a. m.";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute} ${suffix}`;
}

export function timeLabel(value, times = []) {
  return times.find((item) => item.value === value)?.label || formatTime(value);
}

export function downloadCsv(rows, times) {
  const header = [
    "Nombre",
    "Correo",
    "Teléfono",
    "Clase",
    "Fecha",
    "Hora",
    "Primera clase",
    "Proteína",
    "Estado",
    "Zelle enviado",
    "Nombre en Zelle",
    "Referencia",
    "Nota",
    "Registrado",
  ];
  const lines = [header, ...rows.map((row) => [
    row.name,
    row.email,
    row.phone,
    row.classTitle || "",
    row.classDate,
    timeLabel(row.classTime, times),
    row.firstClass ? "Sí" : "No",
    row.proteinFlavor || "",
    row.status,
    row.zelleSent ? "Sí" : "No",
    row.zelleAccountName,
    row.zelleReference,
    row.notes,
    row.createdAt,
  ])].map((columns) => columns.map(csvCell).join(","));

  const blob = new Blob([`\uFEFF${lines.join("\n")}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "jumpingkat-registros.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}
