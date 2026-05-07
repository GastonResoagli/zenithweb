const productoRepository = require('../repositories/productoRepository');

exports.obtenerProductos = (soloActivos = false) => {
    return productoRepository.obtenerProductos(soloActivos);
};

exports.getById = (id) => {
    return productoRepository.getById(id);
}

exports.crearProducto = (producto) => {
    //validaciones (movidas a validator)
    return productoRepository.crearProducto(producto);
}

exports.update = (id, producto) => {
    return productoRepository.update(id, producto);
}

// Baja lógica: el producto no se elimina físicamente para preservar el historial de ventas
exports.remove = (id) => {
    return productoRepository.remove(id);
}

exports.setEstado = (id, estado) => {
    return productoRepository.setEstado(id, estado);
}

exports.descuentaStock = (client, id, cantidad) => {
    return productoRepository.descuentaStock(client, id, cantidad);
}
