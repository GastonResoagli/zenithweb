// Middleware de autenticación: valida el token JWT antes de dejar pasar la petición.
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    // El token viaja en el header "Authorization: Bearer <token>"; extraemos la segunda parte
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // Sin token no se puede identificar al usuario -> 401 (no autenticado)
    if (!token) return res.status(401).json({ error: 'Token requerido' });

    // Verifica la firma del token; si es válido decodifica el payload (id, correo, rol)
    jwt.verify(token, process.env.JWT_SECRET || 'secretkey', (err, user) => {
        if (err) return res.status(403).json({ error: 'Token inválido' }); // expirado o adulterado
        req.user = user; // queda disponible para los siguientes middlewares/controllers
        next();
    });
};

module.exports = authenticateToken;
