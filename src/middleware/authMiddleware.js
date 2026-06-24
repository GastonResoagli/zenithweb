// Middleware de autenticación: valida el token JWT antes de dejar pasar la petición.
const jwt = require('jsonwebtoken');
const { ErrorAutenticacion, ErrorAutorizacion } = require('../utils/errors');

const authenticateToken = (req, res, next) => {
    // El token viaja en el header "Authorization: Bearer <token>"; extraemos la segunda parte
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // Sin token no se puede identificar al usuario -> 401 (no autenticado)
    if (!token) return next(new ErrorAutenticacion('Token requerido'));

    // Verifica la firma del token; si es válido decodifica el payload (id, correo, rol)
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return next(new ErrorAutorizacion('Token inválido')); // expirado o adulterado
        req.user = user; // queda disponible para los siguientes middlewares/controllers
        next();
    });
};

module.exports = authenticateToken;
