const authorizeRoles = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
        return res.status(403).json({ error: 'Acceso denegado: rol insuficiente' });
    }
    next();
};

module.exports = authorizeRoles;
