// Service de movimientos: delega la consulta del historial al repository.
const movimientoRepository = require('../repositories/movimientoRepository');

exports.getAll = () => movimientoRepository.getAll();
