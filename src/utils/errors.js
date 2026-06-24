// Errores de dominio tipados. Cada uno lleva su código HTTP; el middleware
// errorHandler los traduce a la respuesta. Evita el frágil "error.message.includes(...)".

class ErrorAplicacion extends Error {
    constructor(mensaje, status) {
        super(mensaje);
        this.name = this.constructor.name;
        this.status = status;
    }
}

class ErrorValidacion extends ErrorAplicacion {        // 400 — datos inválidos
    constructor(mensaje) { super(mensaje, 400); }
}
class ErrorAutenticacion extends ErrorAplicacion {     // 401 — credenciales/sesión
    constructor(mensaje) { super(mensaje, 401); }
}
class ErrorAutorizacion extends ErrorAplicacion {      // 403 — rol insuficiente
    constructor(mensaje) { super(mensaje, 403); }
}
class ErrorNoEncontrado extends ErrorAplicacion {      // 404 — recurso inexistente
    constructor(mensaje) { super(mensaje, 404); }
}
class ErrorConflicto extends ErrorAplicacion {         // 409 — duplicado / stock insuficiente
    constructor(mensaje) { super(mensaje, 409); }
}

module.exports = {
    ErrorAplicacion,
    ErrorValidacion,
    ErrorAutenticacion,
    ErrorAutorizacion,
    ErrorNoEncontrado,
    ErrorConflicto,
};
