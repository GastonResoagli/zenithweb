const productoService = require('../services/productoService');
const productoRepository = require('../repositories/productoRepository');

jest.mock('../repositories/productoRepository');

describe('Pruebas Unitarias - Producto Service', () => {

    test('PU-01 Debe obtener todos los productos', async () => {

        const productosMock = [
            {
                id: 1,
                nombre: 'Mouse',
                precio: 1000
            },
            {
                id: 2,
                nombre: 'Teclado',
                precio: 2000
            }
        ];

        productoRepository.obtenerProductos.mockResolvedValue(productosMock);

        const resultado = await productoService.obtenerProductos();

        expect(resultado).toEqual(productosMock);
    });

    test('PU-02 Debe crear un producto', async () => {

        const producto = {
            nombre: 'Monitor',
            precio: 50000
        };

        productoRepository.crearProducto.mockResolvedValue({
            id: 3,
            ...producto
        });

        const resultado = await productoService.crearProducto(producto);

        expect(resultado.id).toBe(3);
        expect(resultado.nombre).toBe('Monitor');
        expect(resultado.precio).toBe(50000);
    });

});