exports.validarDatosLogin = (datos) => {
    const { usuario, password } = datos;
    if (!usuario || !password) {
        throw new Error('Usuario y contraseña son requeridos');
    }
};

exports.validarProducto = (datos) => {
    const { nombre, stock, precio_compra, precio_venta, id_categoria } = datos;
    if (!nombre) throw new Error('El nombre es requerido');
    if (stock === undefined || stock < 0) throw new Error('El stock no es válido');
    if (!precio_compra || precio_compra < 0) throw new Error('El precio de compra no es válido');
    if (!precio_venta || precio_venta < 0) throw new Error('El precio de venta no es válido');
    if (!id_categoria) throw new Error('La categoría es requerida');
};

exports.validarVenta = (datos) => {
    const { detalles } = datos;
    if (!detalles || detalles.length === 0) {
        throw new Error('La venta debe tener al menos un producto');
    }
};
