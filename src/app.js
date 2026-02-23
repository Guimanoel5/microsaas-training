const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const errorHandler = require("./middlewares/errorHandler");

// ... imports
const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

// 1. Serve arquivos estáticos primeiro
app.use(express.static(path.join(__dirname, "../public")));

// 2. Rotas da API
app.use("/api/users", userRoutes);

// 3. Rota coringa para o Frontend (CORRIGIDA)
// Substitua a linha 24 por esta:
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

app.use(errorHandler);
module.exports = app;