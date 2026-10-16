import path from "node:path";
import { timingSafeEqual } from "node:crypto";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { existsSync } from "node:fs";
import {
  createBooking,
  createClass,
  createSession,
  deleteBooking,
  deleteClass,
  deleteSession,
  getClass,
  getSession,
  getSettings,
  listBookings,
  listClassesBetween,
  saveSettings,
  updateBookingStatus,
  updateClassCapacity,
} from "./db.js";
import { CLASS_TIMES, PROTEIN_FLAVORS, classRange, validateBooking, validateClass } from "./validate.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const adminPassword = process.env.ADMIN_PASSWORD || "";
if (!adminPassword || adminPassword === "cambia-esta-clave" || adminPassword.length < 8) {
  console.error("Define ADMIN_PASSWORD en las variables del servicio, con al menos 8 caracteres.");
  process.exit(1);
}

const app = express();
const port = Number(process.env.PORT || 3001);
const hits = new Map();

app.disable("x-powered-by");
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "32kb" }));
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
});

function passwordsMatch(input, expected) {
  const left = Buffer.from(String(input));
  const right = Buffer.from(String(expected));
  if (left.length !== right.length) {
    timingSafeEqual(right, right);
    return false;
  }
  return timingSafeEqual(left, right);
}

function clientIp(req) {
  return req.ip || req.socket?.remoteAddress || "desconocido";
}

function isLocal(ip) {
  return ip === "::1" || ip === "127.0.0.1" || ip.endsWith("127.0.0.1");
}

function allow(key, limit, windowMs) {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((stamp) => now - stamp < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}

function readToken(req) {
  const header = req.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || "";
}

function requireAdmin(req, res, next) {
  const session = getSession(readToken(req));
  if (!session) {
    res.status(401).json({ message: "Tu sesión terminó. Entra de nuevo." });
    return;
  }
  next();
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/meta", (_req, res) => {
  res.json({ times: CLASS_TIMES, flavors: PROTEIN_FLAVORS, settings: getSettings() });
});

app.get("/api/classes", (req, res) => {
  const range = classRange(req.query);
  if (!range) {
    res.status(400).json({ message: "Ese mes no es válido." });
    return;
  }
  res.json({ classes: listClassesBetween(range.from, range.to) });
});

app.post("/api/classes", requireAdmin, (req, res) => {
  const { fields, value } = validateClass(req.body || {});
  if (Object.keys(fields).length) {
    res.status(400).json({ message: "Revisa los campos de la clase.", fields });
    return;
  }
  res.status(201).json({ class: createClass(value) });
});

app.patch("/api/classes/:id", requireAdmin, (req, res) => {
  const capacity = Number(req.body?.capacity);
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 40) {
    res.status(400).json({ message: "El cupo debe ser un número entre 1 y 40." });
    return;
  }
  const result = updateClassCapacity(req.params.id, capacity);
  if (result.error === "missing") {
    res.status(404).json({ message: "No encontramos esa clase." });
    return;
  }
  if (result.error === "too-small") {
    res.status(400).json({ message: `El cupo no puede ser menor que los ${result.taken} lugares ya ocupados.` });
    return;
  }
  res.json({ class: result.class });
});

app.delete("/api/classes/:id", requireAdmin, (req, res) => {
  const result = deleteClass(req.params.id);
  if (result.error === "missing") {
    res.status(404).json({ message: "No encontramos esa clase." });
    return;
  }
  if (result.error === "has-bookings") {
    res.status(400).json({ message: "Esa clase ya tiene registros. Borra esos registros si quieres quitarla." });
    return;
  }
  res.json({ ok: true });
});

app.post("/api/bookings", (req, res) => {
  const ip = clientIp(req);
  if (!isLocal(ip) && !allow(`book:${ip}`, 8, 60 * 60 * 1000)) {
    res.status(429).json({ message: "Recibimos muchos registros desde esta red. Espera un momento e inténtalo otra vez." });
    return;
  }
  if (String(req.body?.company || "").trim()) {
    res.status(201).json({
      booking: {
        id: "recibido",
        name: "Registro",
        classDate: req.body?.classDate || "",
        classTime: req.body?.classTime || "",
        status: req.body?.zelleChoice === "sent" ? "apartado" : "pendiente",
      },
    });
    return;
  }
  const { fields, value } = validateBooking(req.body || {}, getClass);
  if (Object.keys(fields).length) {
    res.status(400).json({ message: "Revisa los campos marcados.", fields });
    return;
  }
  try {
    res.status(201).json({ booking: createBooking(value) });
  } catch (error) {
    if (error.code === "full") {
      res.status(409).json({ message: "Esa clase ya está llena.", fields: { classId: "Esa clase ya está llena." } });
      return;
    }
    if (error.code === "missing") {
      res.status(400).json({ message: "Elige una clase del calendario.", fields: { classId: "Elige una clase del calendario." } });
      return;
    }
    throw error;
  }
});

app.post("/api/auth/login", (req, res) => {
  const ip = clientIp(req);
  if (!isLocal(ip) && !allow(`login:${ip}`, 8, 10 * 60 * 1000)) {
    res.status(429).json({ message: "Demasiados intentos. Espera unos minutos." });
    return;
  }
  const password = String(req.body?.password || "");
  if (!password) {
    res.status(400).json({ message: "Escribe la clave del panel.", fields: { password: "Escribe la clave del panel." } });
    return;
  }
  if (!passwordsMatch(password, adminPassword)) {
    res.status(401).json({ message: "La clave no coincide.", fields: { password: "La clave no coincide." } });
    return;
  }
  res.json(createSession());
});

app.get("/api/auth/me", requireAdmin, (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/auth/logout", (req, res) => {
  deleteSession(readToken(req));
  res.json({ ok: true });
});

app.get("/api/bookings", requireAdmin, (_req, res) => {
  res.json({ bookings: listBookings() });
});

app.patch("/api/bookings/:id", requireAdmin, (req, res) => {
  const status = req.body?.status;
  if (!["pendiente", "apartado", "pagado"].includes(status)) {
    res.status(400).json({ message: "Ese estado no existe." });
    return;
  }
  const booking = updateBookingStatus(req.params.id, status);
  if (!booking) {
    res.status(404).json({ message: "No encontramos ese registro." });
    return;
  }
  res.json({ booking });
});

app.delete("/api/bookings/:id", requireAdmin, (req, res) => {
  if (!deleteBooking(req.params.id)) {
    res.status(404).json({ message: "No encontramos ese registro." });
    return;
  }
  res.json({ ok: true });
});

app.put("/api/settings", requireAdmin, (req, res) => {
  const settings = saveSettings(req.body || {});
  res.json({ settings });
});

app.use("/api", (_req, res) => {
  res.status(404).json({ message: "No encontramos ese recurso." });
});

const clientDist = path.resolve(__dirname, "../client/dist");
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api")) return next();
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.use((err, _req, res, _next) => {
  if (err?.type === "entity.parse.failed") {
    res.status(400).json({ message: "No pudimos leer el formulario." });
    return;
  }
  console.error(err);
  res.status(500).json({ message: "Tuvimos un problema en el servidor." });
});

const server = app.listen(port, () => {
  console.log(`API lista en http://localhost:${port}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`El puerto ${port} ya está en uso.`);
  } else {
    console.error(error);
  }
  process.exit(1);
});
