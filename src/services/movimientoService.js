const movimientoRepository = require('../repositories/movimientoRepository');

exports.entrada = (id_producto, cantidad, precio_compra, id_usuario) => {
    if (!cantidad || parseInt(cantidad) <= 0) {
        throw new Error('La cantidad debe ser mayor a 0');
    }
    if (!precio_compra || parseFloat(precio_compra) <= 0) {
        throw new Error('El precio de compra debe ser mayor a 0');
    }
    return movimientoRepository.entrada(
        parseInt(id_producto),
        parseInt(cantidad),
        parseFloat(precio_compra),
        parseInt(id_usuario)
    );
};

exports.getAll = () => movimientoRepository.getAll();
