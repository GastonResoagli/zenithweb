const ventaService = require('../services/ventaService');
const ventaRepository = require('../repositories/ventaRepository');

jest.mock('../repositories/ventaRepository');

describe('Pruebas Unitarias - Venta Service', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('PU-07 Debe crear una venta delegando en el repositorio con los datos exactos', async () => {

        // La venta que devuelve la función almacenada (via repositorio)
        const ventaCreada = { id_venta: 1, monto_total: 330000 };
        ventaRepository.crearVenta.mockResolvedValue(ventaCreada);

        const venta = {
            tipo_documento: 'Boleta',
            nombre_cliente: 'Juan Perez',
            monto_total: 330000,
            id_usuario: 2
        };

        const detalles = [
            { id_producto: 1, cantidad: 2, precio_venta: 165000 }
        ];

        const resultado = await ventaService.crearVenta(venta, detalles);

        // El service debe delegar en ventaRepository.crearVenta (registrar_venta) con
        // EXACTAMENTE estos datos. Se comparan contra valores literales: si se cambia
        // cualquier número (p. ej. id_producto 1 -> 2, o cantidad 2 -> 3) la aserción
        // falla y el test no pasa.
        expect(ventaRepository.crearVenta).toHaveBeenCalledWith(
            {
                tipo_documento: 'Boleta',
                nombre_cliente: 'Juan Perez',
                monto_total: 330000,
                id_usuario: 2
            },
            [
                { id_producto: 1, cantidad: 2, precio_venta: 165000 }
            ]
        );

        // Y debe devolver tal cual lo que retorna el repositorio
        expect(resultado).toEqual(ventaCreada);
    });

});
