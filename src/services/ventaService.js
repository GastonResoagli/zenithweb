// Service de ventas: contiene la lógica transaccional de registrar una venta.
const ventaRepository = require('../repositories/ventaRepository');
const productoService = require('../services/productoService');
const db = require('../db/connection');

exports.consultarVentas = () => ventaRepository.consultarVentas();

exports.getById = (id) => ventaRepository.getById(id);

// Crea una venta de forma ATÓMICA: o se guarda todo (venta + detalles + descuento de stock) o nada.
exports.creaVenta = async (venta, detalles) => {
    // Tomamos un cliente del pool para manejar la transacción manualmente
    const client = await db.connect();
    try {
        await client.query('BEGIN'); // inicia la transacción

        // 1) Validar stock de cada producto ANTES de tocar la base
        for (const detalle of detalles) {
            const producto = await productoService.getById(detalle.id_producto);
            if (!producto || producto.stock < parseInt(detalle.cantidad)) {
                throw new Error(`Stock insuficiente para "${producto?.nombre || detalle.id_producto}"`);
            }
        }

        // 2) Insertar la venta con sus detalles y los registros de inventario
        const nuevaVenta = await ventaRepository.crearVenta(client, venta, detalles);

        // 3) Descontar el stock vendido de cada producto
        for (const detalle of detalles) {
            await productoService.descuentaStock(client, detalle.id_producto, detalle.cantidad);
        }

        await client.query('COMMIT'); // todo OK -> confirma los cambios
        return nuevaVenta;
    } catch (error) {
        await client.query('ROLLBACK'); // algo falló -> deshace todo (no quedan datos a medias)
        throw error;
    } finally {
        client.release(); // siempre devolvemos el cliente al pool
    }
};
