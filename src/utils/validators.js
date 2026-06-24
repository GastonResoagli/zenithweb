// Validadores de entrada reutilizables. Lanzan ErrorValidacion (400) si los datos
// no son válidos; el middleware central de errores arma la respuesta HTTP.
const { ErrorValidacion } = require('./errors');

// Login: usuario y contraseña obligatorios
exports.validarDatosLogin = (datos) => {
    const { usuario, password } = datos;
    if (!usuario || !password) {
        throw new ErrorValidacion('Usuario y contraseña son requeridos');
    }
};

// Producto: nombre y categoría obligatorios; stock y precios no pueden ser negativos
exports.validarProducto = (datos) => {
    const { nombre, stock, precio_compra, precio_venta, id_categoria } = datos;
    if (!nombre) throw new ErrorValidacion('El nombre es requerido');
    if (stock === undefined || stock < 0) throw new ErrorValidacion('El stock no es válido');
    if (precio_compra === undefined || precio_compra === null || precio_compra === '' || precio_compra < 0) throw new ErrorValidacion('El precio de compra no es válido');
    if (precio_venta === undefined || precio_venta === null || precio_venta === '' || precio_venta < 0) throw new ErrorValidacion('El precio de venta no es válido');
    if (!id_categoria) throw new ErrorValidacion('La categoría es requerida');
};

// Venta: debe incluir al menos una línea de detalle (un producto)
exports.validarVenta = (datos) => {
    const { detalles } = datos;
    if (!detalles || detalles.length === 0) {
        throw new ErrorValidacion('La venta debe tener al menos un producto');
    }
};

// Entrada de stock: producto obligatorio, cantidad positiva y precio de compra no negativo
exports.validarEntrada = (datos) => {
    const { id_producto, cantidad, precio_compra } = datos;
    if (!id_producto) throw new ErrorValidacion('El producto es requerido');
    if (!cantidad || cantidad <= 0) throw new ErrorValidacion('La cantidad debe ser mayor a 0');
    if (precio_compra === undefined || precio_compra < 0) throw new ErrorValidacion('El precio de compra no es válido');
};

// Actualización de entrada: cantidad positiva y precio de compra no negativo
exports.validarActualizacionEntrada = (datos) => {
    const { cantidad, precio_compra } = datos;
    if (!cantidad || cantidad <= 0) throw new ErrorValidacion('La cantidad debe ser mayor a 0');
    if (precio_compra === undefined || precio_compra < 0) throw new ErrorValidacion('El precio de compra no es válido');
};

// Categoría: la descripción es obligatoria
exports.validarCategoria = (datos) => {
    const { descripcion } = datos;
    if (!descripcion || !descripcion.trim()) {
        throw new ErrorValidacion('La descripción de la categoría es requerida');
    }
};
