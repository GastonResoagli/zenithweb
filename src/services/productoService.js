// Service de productos: capa intermedia entre el controller y el acceso a datos.
const productoRepository = require('../repositories/productoRepository');
const { ErrorConflicto } = require('../utils/errors');

exports.obtenerProductos = (soloActivos = false) => {
    return productoRepository.obtenerProductos(soloActivos);
};

exports.obtenerPorId = (id) => {
    return productoRepository.obtenerPorId(id);
};

exports.crearProducto = async (producto) => {
    // Chequeo previo de duplicado para devolver un mensaje claro; el índice único
    // de la base es la garantía final (ver crearProducto del repository).
    const existente = await productoRepository.buscarPorNombre(producto.nombre);
    if (existente) throw new ErrorConflicto('Ya existe un producto con ese nombre');
    return productoRepository.crearProducto(producto);
};

exports.actualizar = async (id, producto) => {
    // Permite conservar el mismo nombre del propio producto, pero no tomar el de otro
    const existente = await productoRepository.buscarPorNombre(producto.nombre);
    if (existente && existente.id_producto !== parseInt(id)) {
        throw new ErrorConflicto('Ya existe un producto con ese nombre');
    }
    return productoRepository.actualizar(id, producto);
};

// Alta/baja lógica del producto (no se elimina físicamente para preservar el historial)
exports.cambiarEstado = (id, estado) => {
    return productoRepository.cambiarEstado(id, estado);
};
