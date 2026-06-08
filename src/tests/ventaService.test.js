const ventaService = require('../services/ventaService');
const ventaRepository = require('../repositories/ventaRepository');
const productoService = require('../services/productoService');
const db = require('../db/connection');

jest.mock('../repositories/ventaRepository');
jest.mock('../services/productoService');
jest.mock('../db/connection');

describe('Pruebas Unitarias - Venta Service', () => {

    test('PU-07 Debe crear una venta correctamente', async () => {

        const client = {
            query: jest.fn(),
            release: jest.fn()
        };

        db.connect.mockResolvedValue(client);

        productoService.getById.mockResolvedValue({
            id: 1,
            nombre: 'Mouse',
            stock: 20
        });

        ventaRepository.crearVenta.mockResolvedValue({
            id: 1,
            total: 5000
        });

        productoService.descuentaStock.mockResolvedValue();

        const venta = {
            total: 5000
        };

        const detalles = [
            {
                id_producto: 1,
                cantidad: 2
            }
        ];

        const resultado = await ventaService.creaVenta(venta, detalles);

        expect(resultado.id).toBe(1);
        expect(ventaRepository.crearVenta).toHaveBeenCalled();
    });

});