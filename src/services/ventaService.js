const ventaRepository = require('../repositories/ventaRepository');

exports.getAll = () => ventaRepository.getAll();

exports.getById = (id) => ventaRepository.getById(id);

exports.create = (venta, detalles) => {
    if (!detalles || detalles.length === 0) {
        throw new Error('La venta debe tener al menos un producto');
    }
    return ventaRepository.create(venta, detalles);
};
