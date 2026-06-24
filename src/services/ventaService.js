// Service de ventas.
const ventaRepository = require('../repositories/ventaRepository');

exports.consultarVentas = () => ventaRepository.consultarVentas();

exports.obtenerPorId = (id) => ventaRepository.obtenerPorId(id);

// Crea una venta. La atomicidad (resolver cliente + insertar venta y detalle, descontar
// stock y registrar el movimiento de inventario, todo o nada) la garantiza la función
// almacenada registrar_venta, que se invoca dentro de ventaRepository.crearVenta.
// El id_usuario viene en "venta" (lo toma el controller del token JWT).
exports.crearVenta = (venta, detalles) => ventaRepository.crearVenta(venta, detalles);
