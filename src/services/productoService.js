const productoRepository = require('../repositories/productoRepository');

exports.getAll = (soloActivos = false) => {
    return productoRepository.getAll(soloActivos);
};

exports.getById = (id) => {
    return productoRepository.getById(id);
}

exports.create = (producto) => {
    //validaciones
    return productoRepository.create(producto);
}

exports.update = (id, producto) => {
    return productoRepository.update(id, producto);
}

exports.remove = (id) => {
    return productoRepository.remove(id);
}

exports.setEstado = (id, estado) => {
    return productoRepository.setEstado(id, estado);
}