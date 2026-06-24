const reporteService = require('../services/reporteService');
const reporteRepository = require('../repositories/reporteRepository');
const ventaService = require('../services/ventaService');

jest.mock('../repositories/reporteRepository');
jest.mock('../services/ventaService');

describe('Pruebas Unitarias - Reporte Service', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('PU-11 Debe obtener movimientos filtrados', async () => {

        const movimientosMock = [
            {
                id: 1,
                tipo: 'ENTRADA'
            }
        ];

        reporteRepository.obtenerMovimientos.mockResolvedValue(movimientosMock);

        const filtros = { tipo: 'entrada', id_producto: '21' };

        const resultado = await reporteService.obtenerMovimientos(filtros);

        // Debe pasar los filtros al repositorio EXACTAMENTE como llegaron.
        // Si se cambia algún valor (p. ej. id_producto '21' -> '22') la aserción falla.
        expect(reporteRepository.obtenerMovimientos).toHaveBeenCalledWith(
            { tipo: 'entrada', id_producto: '21' }
        );

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
                monto_total: 500
            }
        ]);

        const resultado = await reporteService.generarPDF({});

        // El PDF se arma a partir de las ventas: debe haberse consultado el listado
        expect(ventaService.consultarVentas).toHaveBeenCalledTimes(1);

        expect(Buffer.isBuffer(resultado)).toBe(true);
        expect(resultado.length).toBeGreaterThan(0);

    });

});
