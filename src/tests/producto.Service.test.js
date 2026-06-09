const productoService = require('../services/productoService');
const productoRepository = require('../repositories/productoRepository');

jest.mock('../repositories/productoRepository');

describe('Pruebas Unitarias - Producto Service', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // PU-01
    test('Debe obtener todos los productos', async () => {

        const productosMock = [
            { id: 1, nombre: 'Mouse' },
            { id: 2, nombre: 'Teclado' }
        ];

        productoRepository.obtenerProductos.mockResolvedValue(productosMock);

        const resultado = await productoService.obtenerProductos(false);

        expect(productoRepository.obtenerProductos)
            .toHaveBeenCalledWith(false);

        expect(resultado).toEqual(productosMock);
    });

    // PU-02
    test('Debe obtener solo productos activos', async () => {

        const productosActivos = [
            { id: 1, nombre: 'Mouse', activo: true }
        ];

        productoRepository.obtenerProductos.mockResolvedValue(productosActivos);

        const resultado = await productoService.obtenerProductos(true);

        expect(productoRepository.obtenerProductos)
            .toHaveBeenCalledWith(true);

        expect(resultado).toEqual(productosActivos);
    });

    // PU-03
    test('Debe obtener un producto por ID', async () => {

        const productoMock = {
            id: 1,
            nombre: 'Mouse'
        };

        productoRepository.getById.mockResolvedValue(productoMock);

        const resultado = await productoService.getById(1);

        expect(productoRepository.getById)
            .toHaveBeenCalledWith(1);

        expect(resultado).toEqual(productoMock);
    });

    // PU-04
    test('Debe crear un producto', async () => {

        const producto = {
            nombre: 'Monitor',
            precio: 50000
        };

        const productoCreado = {
            id: 3,
            ...producto
        };

        productoRepository.crearProducto
            .mockResolvedValue(productoCreado);

        const resultado = await productoService.crearProducto(producto);

        expect(productoRepository.crearProducto)
            .toHaveBeenCalledWith(producto);

        expect(resultado).toEqual(productoCreado);
    });

    // PU-05
    test('Debe actualizar un producto', async () => {

        const productoActualizado = {
            nombre: 'Monitor Gamer',
            precio: 60000
        };

        productoRepository.update.mockResolvedValue({
            id: 1,
            ...productoActualizado
        });

        const resultado = await productoService.update(
            1,
            productoActualizado
        );

        expect(productoRepository.update)
            .toHaveBeenCalledWith(
                1,
                productoActualizado
            );

        expect(resultado.nombre)
            .toBe('Monitor Gamer');
    });

    // PU-06
    test('Debe realizar baja lógica de un producto', async () => {

        productoRepository.remove.mockResolvedValue({
            success: true
        });

        const resultado = await productoService.remove(1);

        expect(productoRepository.remove)
            .toHaveBeenCalledWith(1);

        expect(resultado.success)
            .toBe(true);
    });

    // PU-07
    test('Debe cambiar el estado de un producto', async () => {

        productoRepository.setEstado.mockResolvedValue({
            id: 1,
            estado: false
        });

        const resultado = await productoService.setEstado(
            1,
            false
        );

        expect(productoRepository.setEstado)
            .toHaveBeenCalledWith(
                1,
                false
            );

        expect(resultado.estado)
            .toBe(false);
    });

    // PU-08
    test('Debe descontar stock de un producto', async () => {

        const clientMock = {};

        productoRepository.descuentaStock.mockResolvedValue({
            success: true
        });

        const resultado =
            await productoService.descuentaStock(
                clientMock,
                1,
                5
            );

        expect(productoRepository.descuentaStock)
            .toHaveBeenCalledWith(
                clientMock,
                1,
                5
            );

        expect(resultado.success)
            .toBe(true);
    });

});