const pool = require("../config/database"); // Assuma que você exporta o pool do pg

// Helper para hash de senha (instale bcrypt: npm install bcrypt)
const bcrypt = require("bcrypt");

// Criar um novo usuário
exports.createUser = async (req, res, next) => {
    const { name, email, password } = req.body;
    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Nome, e-mail e senha são obrigatórios." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
            [name, email, hashedPassword]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') { // Código de erro para violação de unique constraint (email duplicado)
            return res.status(409).json({ message: "Este e-mail já está em uso." });
        }
        next(error); // Passa o erro para o errorHandler
    }
};

// Obter todos os usuários
exports.getAllUsers = async (req, res, next) => {
    try {
        const result = await pool.query("SELECT id, name, email FROM users ORDER BY id DESC");
        res.status(200).json(result.rows);
    } catch (error) {
        next(error);
    }
};

// Obter usuário por ID
exports.getUserById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await pool.query("SELECT id, name, email FROM users WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

// Atualizar usuário
exports.updateUser = async (req, res, next) => {
    const { id } = req.params;
    const { name, email, password } = req.body;
    try {
        let updateQuery = "UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email";
        let queryParams = [name, email, id];

        if (password) { // Se uma nova senha for fornecida, atualiza também
            const hashedPassword = await bcrypt.hash(password, 10);
            updateQuery = "UPDATE users SET name = $1, email = $2, password = $3 WHERE id = $4 RETURNING id, name, email";
            queryParams = [name, email, hashedPassword, id];
        }

        const result = await pool.query(updateQuery, queryParams);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Usuário não encontrado para atualização." });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: "Este e-mail já está em uso por outro usuário." });
        }
        next(error);
    }
};

// Excluir usuário
exports.deleteUser = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Usuário não encontrado para exclusão." });
        }
        res.status(204).send(); // 204 No Content para exclusões bem-sucedidas
    } catch (error) {
        next(error);
    }
};