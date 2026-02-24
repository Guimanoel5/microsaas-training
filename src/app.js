const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// ==============================
// Middlewares
// ==============================

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

// ==============================
// Static Files (apenas públicos)
// ==============================

app.use(
  express.static(path.join(__dirname, "../public"), {
    index: false
  })
);

// ==============================
// API Routes
// ==============================

app.use("/auth", authRoutes);
app.use("/api/users", userRoutes);

// ==============================
// Dashboard (PROTEÇÃO FRONTEND)
// ==============================

app.get("/index.html", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/index.html"));
});

// ==============================
// Default Route → Login
// ==============================

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../public/login.html"));
});

// ==============================
// Error Handler
// ==============================

app.use(errorHandler);

module.exports = app;