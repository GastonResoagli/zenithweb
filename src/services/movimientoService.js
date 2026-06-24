// Service de movimientos: delega la consulta del historial al repository.
const movimientoRepository = require('../repositories/movimientoRepository');

exports.obtenerMovimientos = () => movimientoRepository.obtenerMovimientos();

// Registra una entrada de stock. La suba de stock y el registro del movimiento
// 'entrada' (todo o nada) los garantiza el procedure registrar_entrada, que se
// invoca dentro de movimientoRepository.registrarEntrada.
// El id_usuario viene en "entrada" (lo toma el controller del token JWT).
exports.registrarEntrada = (entrada) => movimientoRepository.registrarEntrada(entrada);

// Actualiza una entrada existente. El ajuste de stock por diferencia, el recálculo
// del total y la validación (que exista y sea 'entrada') los garantiza el procedure
// actualizar_entrada, invocado dentro de movimientoRepository.actualizarEntrada.
exports.actualizarEntrada = (entrada) => movimientoRepository.actualizarEntrada(entrada);
