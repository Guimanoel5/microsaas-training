const express = require("express");
const { 
    createUser, 
    getAllUsers, 
    getUserById, 
    updateUser, 
    deleteUser 
} = require("../controllers/userController");
// const authMiddleware = require("../middlewares/authMiddleware"); // Descomente quando tiver autenticação

const router = express.Router();

// Rotas de Usuário
// router.use(authMiddleware); // Aplique o middleware de autenticação aqui se necessário

router.post("/", createUser); // Criar novo usuário
router.get("/", getAllUsers); // Listar todos os usuários
router.get("/:id", getUserById); // Obter usuário por ID
router.put("/:id", updateUser); // Atualizar usuário
router.delete("/:id", deleteUser); // Excluir usuário

module.exports = router;