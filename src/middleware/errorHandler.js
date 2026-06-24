// Middleware central de manejo de errores.
// Express 5 reenvía acá cualquier error lanzado en los controllers (incluso async),
// así que los controllers ya no necesitan try/catch ni mapear códigos a mano.
const manejadorErrores = (err, req, res, next) => {
    const status = err.status || 500;

    // Los 500 son fallos inesperados: los dejamos en el log del servidor para diagnosticar.
    if (status === 500) console.error(err);

    res.status(status).json({ error: err.message || 'Error interno del servidor' });
};

module.exports = manejadorErrores;
