const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (!result.rows.length) {
            return res.status(401).json({
                message: "Usuário não encontrado"
            });
        }

        const user = result.rows[0];

        const validPassword = await bcrypt.compare(
            password,
            user.password
        );

        if (!validPassword) {
            return res.status(401).json({
                message: "Senha inválida"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        return res.json({ token });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            message: "Erro interno do servidor"
        });
    }
};