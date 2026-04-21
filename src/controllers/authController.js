const jwt = require('jsonwebtoken');
const db = require('../db/connection');

exports.login = async (req, res) => {
    try {
        const { usuario, password } = req.body;

        const result = await db.query(
            'SELECT * FROM usuario WHERE correo = $1 AND estado = true',
            [usuario]
        );

        const user = result.rows[0];

        if (!user || user.clave !== password) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        const token = jwt.sign(
            { id_usuario: user.id_usuario, correo: user.correo },
            process.env.JWT_SECRET || 'secretkey',
            { expiresIn: '8h' }
        );

        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
