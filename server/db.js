import fs from "node:fs";
import path from "node:path";
import { randomBytes, randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import { todayISO } from "./validate.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "data");
fs.mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(path.join(dataDir, "jumpingkat.db"));
db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    class_date TEXT NOT NULL,
    class_time TEXT NOT NULL,
    first_class INTEGER NOT NULL,
    notes TEXT NOT NULL,
    zelle_sent INTEGER NOT NULL,
    zelle_account_name TEXT NOT NULL,
    zelle_reference TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pendiente', 'apartado', 'pagado')),
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    expires_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS classes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    class_date TEXT NOT NULL,
    class_time TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    created_at TEXT NOT NULL
  );
`);

const bookingColumns = db.prepare("PRAGMA table_info(bookings)").all();
if (!bookingColumns.some((column) => column.name === "class_id")) {
  db.exec("ALTER TABLE bookings ADD COLUMN class_id TEXT NOT NULL DEFAULT ''");
}
if (!bookingColumns.some((column) => column.name === "protein_flavor")) {
  db.exec("ALTER TABLE bookings ADD COLUMN protein_flavor TEXT NOT NULL DEFAULT ''");
}

const SETTING_KEYS = ["zelleName", "zelleHandle", "classPrice", "location"];
const DEFAULT_SETTINGS = {
  zelleName: "Katia A Perez Ponce",
  zelleHandle: "720 877 6988",
  classPrice: "",
  location: "",
};

function toBooking(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    classDate: row.class_date,
    classTime: row.class_time,
    firstClass: Boolean(row.first_class),
    notes: row.notes,
    proteinFlavor: row.protein_flavor || "",
    zelleSent: Boolean(row.zelle_sent),
    zelleAccountName: row.zelle_account_name,
    zelleReference: row.zelle_reference,
    status: row.status,
    createdAt: row.created_at,
    classId: row.class_id || "",
    classTitle: row.class_title || "",
  };
}

function occupancy(classId) {
  const row = db.prepare("SELECT COUNT(*) AS total FROM bookings WHERE class_id = ?").get(classId);
  return Number(row?.total || 0);
}

function toClass(row) {
  const taken = occupancy(row.id);
  const past = row.class_date < todayISO();
  let state = "abierta";
  if (past) state = "pasada";
  else if (taken >= row.capacity) state = "llena";
  return {
    id: row.id,
    title: row.title,
    classDate: row.class_date,
    classTime: row.class_time,
    capacity: row.capacity,
    taken,
    open: state === "abierta",
    state,
  };
}

export function createBooking(input) {
  const scheduled = getClass(input.classId);
  if (!scheduled || scheduled.classDate < todayISO()) {
    const error = new Error("missing");
    error.code = "missing";
    throw error;
  }
  if (!scheduled.open) {
    const error = new Error("full");
    error.code = "full";
    throw error;
  }
  const booking = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    status: input.zelleSent ? "apartado" : "pendiente",
    ...input,
    classId: scheduled.id,
    classDate: scheduled.classDate,
    classTime: scheduled.classTime,
  };
  db.prepare(
    `INSERT INTO bookings (
      id, name, email, phone, class_date, class_time, first_class, notes, protein_flavor,
      zelle_sent, zelle_account_name, zelle_reference, status, created_at, class_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    booking.id,
    booking.name,
    booking.email,
    booking.phone,
    booking.classDate,
    booking.classTime,
    booking.firstClass ? 1 : 0,
    booking.notes,
    booking.proteinFlavor || "",
    booking.zelleSent ? 1 : 0,
    booking.zelleAccountName,
    booking.zelleReference,
    booking.status,
    booking.createdAt,
    booking.classId
  );
  return getBooking(booking.id);
}

export function listBookings() {
  return db
    .prepare(
      `SELECT bookings.*, classes.title AS class_title
       FROM bookings
       LEFT JOIN classes ON classes.id = bookings.class_id
       ORDER BY bookings.created_at DESC`
    )
    .all()
    .map(toBooking);
}

export function getClass(id) {
  const row = db.prepare("SELECT * FROM classes WHERE id = ?").get(id);
  return row ? toClass(row) : null;
}

export function listClassesBetween(from, to) {
  return db
    .prepare("SELECT * FROM classes WHERE class_date >= ? AND class_date <= ? ORDER BY class_date, class_time")
    .all(from, to)
    .map(toClass);
}

export function createClass(input) {
  const id = randomUUID();
  db.prepare(
    "INSERT INTO classes (id, title, class_date, class_time, capacity, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(id, input.title, input.classDate, input.classTime, input.capacity, new Date().toISOString());
  return getClass(id);
}

export function updateClassCapacity(id, capacity) {
  const scheduled = getClass(id);
  if (!scheduled) return { error: "missing" };
  if (capacity < scheduled.taken) return { error: "too-small", taken: scheduled.taken };
  db.prepare("UPDATE classes SET capacity = ? WHERE id = ?").run(capacity, id);
  return { class: getClass(id) };
}

export function deleteClass(id) {
  const scheduled = getClass(id);
  if (!scheduled) return { error: "missing" };
  if (scheduled.taken > 0) return { error: "has-bookings" };
  db.prepare("DELETE FROM classes WHERE id = ?").run(id);
  return { ok: true };
}

export function getBooking(id) {
  const row = db.prepare(
    `SELECT bookings.*, classes.title AS class_title
     FROM bookings
     LEFT JOIN classes ON classes.id = bookings.class_id
     WHERE bookings.id = ?`
  ).get(id);
  return row ? toBooking(row) : null;
}

export function updateBookingStatus(id, status) {
  const result = db.prepare("UPDATE bookings SET status = ? WHERE id = ?").run(status, id);
  if (result.changes === 0) return null;
  return getBooking(id);
}

export function deleteBooking(id) {
  const result = db.prepare("DELETE FROM bookings WHERE id = ?").run(id);
  return result.changes > 0;
}

export function getSettings() {
  const stored = {};
  for (const row of db.prepare("SELECT key, value FROM settings").all()) {
    if (SETTING_KEYS.includes(row.key)) stored[row.key] = String(row.value ?? "").trim();
  }
  if (!stored.zelleHandle) {
    return {
      zelleName: DEFAULT_SETTINGS.zelleName,
      zelleHandle: DEFAULT_SETTINGS.zelleHandle,
      classPrice: stored.classPrice || "",
      location: stored.location || "",
    };
  }
  return {
    zelleName: stored.zelleName || DEFAULT_SETTINGS.zelleName,
    zelleHandle: stored.zelleHandle,
    classPrice: stored.classPrice || "",
    location: stored.location || "",
  };
}

export function saveSettings(input) {
  const statement = db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  );
  for (const key of SETTING_KEYS) {
    statement.run(key, String(input[key] ?? "").trim().slice(0, 160));
  }
  return getSettings();
}

export function createSession() {
  const token = randomBytes(32).toString("hex");
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  db.prepare("INSERT INTO sessions (token, expires_at) VALUES (?, ?)").run(token, expiresAt);
  return { token, expiresAt };
}

export function getSession(token) {
  if (!token) return null;
  const row = db.prepare("SELECT token, expires_at FROM sessions WHERE token = ?").get(token);
  if (!row) return null;
  if (row.expires_at < Date.now()) {
    deleteSession(token);
    return null;
  }
  return row;
}

export function deleteSession(token) {
  db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
}
