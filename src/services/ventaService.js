const ventaRepository = require('../repositories/ventaRepository');
const productoService = require('../services/productoService');
const db = require('../db/connection');

exports.consultarVentas = () => ventaRepository.consultarVentas();

exports.getById = (id) => ventaRepository.getById(id);

exports.creaVenta = async (venta, detalles) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        for (const detalle of detalles) {
            const producto = await productoService.getById(detalle.id_producto);
            if (!producto || producto.stock < parseInt(detalle.cantidad)) {
                throw new Error(`Stock insuficiente para "${producto?.nombre || detalle.id_producto}"`);
            }
        }

        const nuevaVenta = await ventaRepository.crearVenta(client, venta, detalles);

        for (const detalle of detalles) {
            await productoService.descuentaStock(client, detalle.id_producto, detalle.cantidad);
        }

        await client.query('COMMIT');
        return nuevaVenta;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};
