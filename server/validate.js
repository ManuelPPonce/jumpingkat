export const PROTEIN_FLAVORS = [
  "Mango Piña",
  "Fresa",
  "Dulce de leche",
  "Choco coco",
  "Cookies and cream",
  "Piña colada",
  "Banana Caramel",
  "Naranja",
  "Cheesecake strawberry",
  "Cafe latte",
];

export const CLASS_TIMES = [
  { value: "06:30", label: "6:30 a. m." },
  { value: "07:15", label: "7:15 a. m." },
  { value: "08:00", label: "8:00 a. m." },
  { value: "09:30", label: "9:30 a. m." },
  { value: "12:15", label: "12:15 p. m." },
  { value: "17:45", label: "5:45 p. m." },
  { value: "19:10", label: "7:10 p. m." },
  { value: "20:30", label: "8:30 p. m." },
];

export function todayISO() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function cleanLine(value, max) {
  return String(value ?? "")
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function isRealDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function addDays(iso, days) {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  const nextMonth = String(date.getMonth() + 1).padStart(2, "0");
  const nextDay = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${nextMonth}-${nextDay}`;
}

function cleanTime(value) {
  const match = /^(\d{2}):(\d{2})/.exec(cleanLine(value, 8));
  if (!match) return "";
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return "";
  return `${match[1]}:${match[2]}`;
}

export function validateClass(body) {
  const fields = {};
  const title = cleanLine(body.title, 60);
  const classDate = cleanLine(body.classDate, 10);
  const classTime = cleanTime(body.classTime);
  const capacity = Number(body.capacity);

  if (title.length < 2) fields.title = "Escribe el nombre de la clase.";
  if (!isRealDate(classDate)) fields.classDate = "Elige una fecha válida.";
  else if (classDate < todayISO()) fields.classDate = "La fecha ya pasó.";
  if (!classTime) fields.classTime = "Elige una hora válida.";
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 40) {
    fields.capacity = "El cupo debe ser un número entre 1 y 40.";
  }

  return { fields, value: { title, classDate, classTime, capacity } };
}

export function classRange(query) {
  if (typeof query.month === "string" && /^\d{4}-\d{2}$/.test(query.month)) {
    const [year, month] = query.month.split("-").map(Number);
    if (month < 1 || month > 12) return null;
    const last = new Date(year, month, 0).getDate();
    return {
      from: `${query.month}-01`,
      to: `${query.month}-${String(last).padStart(2, "0")}`,
    };
  }
  const from = typeof query.from === "string" && isRealDate(query.from) ? query.from : todayISO();
  let to = typeof query.to === "string" && isRealDate(query.to) ? query.to : addDays(from, 120);
  if (to < from) to = from;
  if (addDays(from, 370) < to) to = addDays(from, 370);
  return { from, to };
}

export function validateBooking(body, findClass) {
  const fields = {};
  const name = cleanLine(body.name, 80);
  const email = cleanLine(body.email, 120).toLowerCase();
  const phone = cleanLine(body.phone, 30);
  const notes = String(body.notes ?? "").replace(/\r/g, "").trim().slice(0, 400);
  const zelleAccountName = cleanLine(body.zelleAccountName, 80);
  const zelleReference = cleanLine(body.zelleReference, 80);
  const proteinFlavor = cleanLine(body.proteinFlavor, 40);
  const classId = cleanLine(body.classId, 80);
  const digits = phone.replace(/\D/g, "");
  const scheduled = classId ? findClass(classId) : null;

  if (name.length < 2) fields.name = "Escribe tu nombre.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fields.email = "Escribe un correo válido.";
  if (digits.length < 7 || digits.length > 15) fields.phone = "Escribe un teléfono con al menos 7 dígitos.";
  if (!scheduled) fields.classId = "Elige una clase del calendario.";
  else if (!scheduled.open) fields.classId = scheduled.state === "pasada" ? "Esa clase ya pasó." : "Esa clase ya está llena.";
  if (zelleAccountName.length < 2) {
    fields.zelleAccountName = "Escribe el nombre con el que enviaste el Zelle.";
  }
  if (!PROTEIN_FLAVORS.includes(proteinFlavor)) {
    fields.proteinFlavor = "Elige el sabor de tu proteína.";
  }

  return {
    fields,
    value: {
      name,
      email,
      phone,
      classId,
      classDate: scheduled?.classDate || "",
      classTime: scheduled?.classTime || "",
      firstClass: body.firstClass === true,
      notes,
      proteinFlavor,
      zelleSent: true,
      zelleAccountName,
      zelleReference,
    },
  };
}
