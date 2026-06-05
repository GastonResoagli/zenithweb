// Service de productos: capa intermedia entre el controller y el acceso a datos.
const productoRepository = require('../repositories/productoRepository');

exports.obtenerProductos = (soloActivos = false) => {
    return productoRepository.obtenerProductos(soloActivos);
};

exports.getById = (id) => {
    return productoRepository.getById(id);
}

exports.crearProducto = (producto) => {
    // Las validaciones se hacen en el controller (utils/validators), acá solo se persiste
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

// Recibe un "client" de transacción para descontar stock dentro de la venta (ver ventaService)
exports.descuentaStock = (client, id, cantidad) => {
    return productoRepository.descuentaStock(client, id, cantidad);
}
