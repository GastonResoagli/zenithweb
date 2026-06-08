const reporteService = require('../services/reporteService');
const reporteRepository = require('../repositories/reporteRepository');
const ventaService = require('../services/ventaService');

jest.mock('../repositories/reporteRepository');
jest.mock('../services/ventaService');

describe('Pruebas Unitarias - Reporte Service', () => {

    test('PU-11 Debe obtener movimientos filtrados', async () => {

        const movimientosMock = [
            {
                id: 1,
                tipo: 'ENTRADA'
            }
        ];

        reporteRepository.getMovimientos.mockResolvedValue(movimientosMock);

        const resultado = await reporteService.getMovimientos({});

        expect(resultado).toEqual(movimientosMock);
    });

    test('PU-12 Debe generar un PDF de ventas', async () => {

        ventaService.consultarVentas.mockResolvedValue([
            {
                fecha: new Date(),
                tipo_documento: 'DNI',
                documento_cliente: '12345678',
                nombre_cliente: 'Juan Perez',
                cantidad_items: 2,
                monto_total: 5000
            }
        ]);

        const resultado = await reporteService.generarPDF({});

        expect(Buffer.isBuffer(resultado)).toBe(true);
        expect(resultado.length).toBeGreaterThan(0);

    });

});