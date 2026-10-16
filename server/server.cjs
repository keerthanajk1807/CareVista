
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const app = express();

const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ||
  [
    "http://localhost:5173",
    "http://localhost:4173",
    "https://care-vista-6wnsva3l5-medi-team2.vercel.app"
  ].join(",")
)
  .split(",")
  .map((value) => value.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    const normalizedOrigin = origin?.replace(/\/$/, "");

    if (!origin || allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    console.warn("CORS blocked origin:", origin);
    return callback(new Error("Origin not allowed by CORS"));
  }
}));

app.use(express.json());

const doctors = require("./doctors.cjs");

const dataFile =
  process.env.DATA_FILE || path.join(__dirname, "data.json");

fs.mkdirSync(path.dirname(dataFile), { recursive: true });

const saved = fs.existsSync(dataFile)
  ? JSON.parse(fs.readFileSync(dataFile, "utf8"))
  : {};

const users = saved.users || [];
let appointments = saved.appointments || [];
let nextId = saved.nextId || 1;

function persist() {
  fs.writeFileSync(
    dataFile,
    JSON.stringify({ users, appointments, nextId }, null, 2)
  );
}

const tokens = new Map();

app.use((req, res, next) => {
  res.on("finish", () => {
    console.log(`[API] ${req.method} ${req.path} -> ${res.statusCode}`);
  });
  next();
});

const today = () => new Date().toISOString().slice(0, 10);

const dates = () =>
  Array.from({ length: 30 }, (_, i) =>
    new Date(Date.now() + i * 86400000).toISOString().slice(0, 10)
  );

const doctorDates = (doctor) =>
  dates().filter((date) =>
    doctor.availableDays.includes(
      new Date(date + "T12:00:00Z").toLocaleDateString("en-US", {
        weekday: "long",
        timeZone: "UTC"
      })
    )
  );

function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const session = tokens.get(token);
  const user = session?.user;

  if (!user || session.expiresAt <= Date.now()) {
    return res.status(401).json({
      message: "Please log in again."
    });
  }

  req.user = user;
  req.token = token;
  next();
}

app.get("/", (req, res) => {
  res.json({ message: "MediSlot API is running." });
});

app.get("/api/doctors", (req, res) => {
  const search = String(req.query.search || "").toLowerCase();
  const specialty = String(req.query.specialty || "All").toLowerCase();

  const result = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(search) ||
      doctor.specialty.toLowerCase().includes(search);

    const matchesSpecialty =
      specialty === "all" ||
      doctor.specialty.toLowerCase() === specialty;

    return matchesSearch && matchesSpecialty;
  });

  res.json(result);
});

app.get("/api/doctors/:id", (req, res) => {
  const doctor = doctors.find(
    (item) =>
      String(item.id) === req.params.id ||
      String(item.routeId) === req.params.id
  );

  if (!doctor) {
    return res.status(404).json({ message: "Doctor not found." });
  }

  res.json(doctor);
});

app.get("/api/doctors/:id/availability", (req, res) => {
  const doctor = doctors.find(
    (item) =>
      String(item.id) === req.params.id ||
      String(item.routeId) === req.params.id
  );

  if (!doctor) {
    return res.status(404).json({ message: "Doctor not found." });
  }

  const date = req.query.date || doctorDates(doctor)[0];

  if (!doctorDates(doctor).includes(date)) {
    return res.status(400).json({
      message: "Select a date within the next 30 days."
    });
  }

  const booked = appointments
    .filter(
      (item) =>
        item.doctorId === doctor.id &&
        item.date === date &&
        item.status !== "Cancelled"
    )
    .map((item) => item.time);

  res.json({
    doctorId: doctor.id,
    date,
    dates: doctorDates(doctor),
    slots: doctor.timeSlots,
    bookedSlots: booked
  });
});

app.post("/api/auth/signup", (req, res) => {
  const { name, email, password } = req.body;

  if (
    !name?.trim() ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "") ||
    typeof password !== "string" ||
    password.length < 6
  ) {
    return res.status(400).json({
      message: "Enter name, email and password."
    });
  }

  if (users.some((user) => user.email === email.toLowerCase())) {
    return res.status(409).json({
      message: "Email already registered."
    });
  }

  const user = {
    id: crypto.randomUUID(),
    name,
    email: email.toLowerCase(),
    password: crypto
      .scryptSync(password, email.toLowerCase(), 64)
      .toString("hex")
  };

  users.push(user);
  persist();

  res.status(201).json({
    message: "Account created. Please log in."
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  const normalizedEmail = String(email || "").toLowerCase();

  const user = users.find(
    (item) =>
      (
        item.email === normalizedEmail ||
        ("PAT-" + item.id).toLowerCase() === normalizedEmail
      ) &&
      typeof password === "string" &&
      item.password ===
        crypto.scryptSync(password, item.email, 64).toString("hex")
  );

  if (!user) {
    return res.status(401).json({
      message: "Invalid email or password."
    });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt =
    Date.now() + Number(process.env.TOKEN_TTL_SECONDS || 3600) * 1000;

  tokens.set(token, {
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    },
    expiresAt
  });

  res.json({
    token,
    expiresAt,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
});

app.post("/api/auth/logout", authenticate, (req, res) => {
  tokens.delete(req.token);
  res.json({ message: "Logged out successfully." });
});

app.get("/api/appointments", authenticate, (req, res) => {
  const result = appointments.filter(
    (item) => item.userId === req.user.id
  );

  res.json({ appointments: result });
});

app.get("/api/appointments/history", authenticate, (req, res) => {
  const result = appointments.filter(
    (item) =>
      item.userId === req.user.id &&
      (
        ["Completed", "Cancelled"].includes(item.status) ||
        item.date < today()
      )
  );

  res.json({ appointments: result });
});

app.post("/api/appointments", authenticate, (req, res) => {
  const { doctorId, date, time, patientName, phone } = req.body;

  const doctor = doctors.find(
    (item) => String(item.id) === String(doctorId)
  );

  if (!doctor || !date || !time || !patientName || !phone) {
    return res.status(400).json({
      message: "Fill in all appointment details."
    });
  }

  if (
    !doctorDates(doctor).includes(date) ||
    !doctor.timeSlots.includes(time) ||
    !patientName.trim() ||
    !/^\d{10}$/.test(phone)
  ) {
    return res.status(400).json({ message: "Invalid time slot." });
  }

  const alreadyBooked = appointments.some(
    (item) =>
      item.doctorId === doctor.id &&
      item.date === date &&
      item.time === time &&
      item.status !== "Cancelled"
  );

  if (alreadyBooked) {
    return res.status(409).json({
      message: "This time slot is already booked."
    });
  }

  const appointment = {
    id: String(nextId++),
    userId: req.user.id,
    doctorId: doctor.id,
    doctorName: doctor.name,
    specialty: doctor.specialty,
    fee: doctor.fee,
    date,
    time,
    patientName,
    phone,
    status: "Upcoming",
    createdAt: new Date().toISOString()
  };

  appointments.push(appointment);
  persist();

  res.status(201).json({ appointment });
});

app.patch("/api/appointments/:id", authenticate, (req, res) => {
  const appointment = appointments.find(
    (item) =>
      (
        String(item.id) === req.params.id ||
        String(item.routeId) === req.params.id
      ) &&
      item.userId === req.user.id
  );

  if (!appointment) {
    return res.status(404).json({
      message: "Appointment not found."
    });
  }

  if (appointment.status === "Cancelled") {
    return res.status(400).json({
      message: "Cancelled appointments cannot be rescheduled."
    });
  }

  const date = req.body.date || appointment.date;
  const time = req.body.time || appointment.time;

  const doctor = doctors.find(
    (item) => String(item.id) === String(appointment.doctorId)
  );

  if (!doctor || !doctorDates(doctor).includes(date) ||
      !doctor.timeSlots.includes(time)) {
    return res.status(400).json({ message: "Invalid time slot." });
  }

  const conflict = appointments.some(
    (item) =>
      item.id !== appointment.id &&
      item.doctorId === appointment.doctorId &&
      item.date === date &&
      item.time === time &&
      item.status !== "Cancelled"
  );

  if (conflict) {
    return res.status(409).json({
      message: "This time slot is already booked."
    });
  }

  appointment.date = date;
  appointment.time = time;
  appointment.status = "Rescheduled";

  persist();
  res.json({ appointment });
});

app.delete("/api/appointments/:id", authenticate, (req, res) => {
  const appointment = appointments.find(
    (item) =>
      (
        String(item.id) === req.params.id ||
        String(item.routeId) === req.params.id
      ) &&
      item.userId === req.user.id
  );

  if (!appointment) {
    return res.status(404).json({
      message: "Appointment not found."
    });
  }

  appointment.status = "Cancelled";
  persist();

  res.json({ appointment });
});

app.listen(process.env.PORT || 5000, () => {
  console.log("MediSlot API is running.");
});
