// Service de productos: capa intermedia entre el controller y el acceso a datos.
const productoRepository = require('../repositories/productoRepository');

exports.obtenerProductos = (soloActivos = false) => {
    return productoRepository.obtenerProductos(soloActivos);
};

exports.getById = (id) => {
    return productoRepository.getById(id);
}

exports.crearProducto = async (producto) => {
    // Chequeo previo de duplicado para devolver un mensaje claro; el índice único
    // de la base es la garantía final (ver crearProducto del repository).
    const existente = await productoRepository.getPorNombre(producto.nombre);
    if (existente) throw new Error('Ya existe un producto con ese nombre');
    return productoRepository.crearProducto(producto);
}

exports.update = async (id, producto) => {
    // Permite conservar el mismo nombre del propio producto, pero no tomar el de otro
    const existente = await productoRepository.getPorNombre(producto.nombre);
    if (existente && existente.id_producto !== parseInt(id)) {
        throw new Error('Ya existe un producto con ese nombre');
    }
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
