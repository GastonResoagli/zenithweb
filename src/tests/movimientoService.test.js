const movimientoService = require('../services/movimientoService');
const movimientoRepository = require('../repositories/movimientoRepository');

jest.mock('../repositories/movimientoRepository');

describe('Pruebas Unitarias - Movimiento Service', () => {

    test('PU-05 Debe obtener todos los movimientos', async () => {

        const movimientosMock = [
            {
                id: 1,
                tipo: 'ENTRADA',
                cantidad: 10
            },
            {
                id: 2,
                tipo: 'SALIDA',
                cantidad: 5
            }
        ];

        movimientoRepository.obtenerMovimientos.mockResolvedValue(movimientosMock);

        const resultado = await movimientoService.obtenerMovimientos();

        expect(movimientoRepository.obtenerMovimientos).toHaveBeenCalledTimes(1);
        expect(resultado).toEqual(movimientosMock);
    });

    test('PU-06 Debe retornar una lista vacía si no existen movimientos', async () => {

        movimientoRepository.obtenerMovimientos.mockResolvedValue([]);

        const resultado = await movimientoService.obtenerMovimientos();

        expect(resultado).toEqual([]);
        expect(resultado.length).toBe(0);
    });

});