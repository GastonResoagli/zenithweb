// Middleware de autorización por rol.
// Es una "fábrica": se le pasan los roles permitidos y devuelve el middleware que filtra.
// Ej: authorizeRoles('gerente', 'vendedor') -> solo deja pasar a gerentes y vendedores.
const { ErrorAutorizacion } = require('../utils/errors');

const authorizeRoles = (...roles) => (req, res, next) => {
    // req.user lo setea authMiddleware; si el rol no está en la lista permitida -> 403 (prohibido)
    if (!req.user || !roles.includes(req.user.rol)) {
        return next(new ErrorAutorizacion('Acceso denegado: rol insuficiente'));
    }
    next();
};

module.exports = authorizeRoles;
