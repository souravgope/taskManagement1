const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

/* ================= MIDDLEWARE ================= */

// Allow frontend + local dev
app.use(
  cors({
    origin: [
      "https://taskmanagement1-099v.onrender.com", // Render frontend
      "http://localhost:5173",                    // Local dev
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

/* ================= ROUTES ================= */

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

/* ================= HEALTH CHECK ================= */

app.get("/", (req, res) => {
  res.status(200).send("API is running...");
});

/* ================= 404 HANDLER ================= */

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

module.exports = app;
