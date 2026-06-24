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

        productoRepository.obtenerPorId.mockResolvedValue(productoMock);

        const resultado = await productoService.obtenerPorId(1);

        expect(productoRepository.obtenerPorId)
            .toHaveBeenCalledWith(1);

        expect(resultado).toEqual(productoMock);
    });

    // PU-04
    test('Debe crear un producto con los datos exactos', async () => {

        // No existe otro producto con ese nombre
        productoRepository.buscarPorNombre.mockResolvedValue(undefined);

        productoRepository.crearProducto
            .mockResolvedValue({ id: 3, nombre: 'Monitor', precio: 50000 });

        const producto = {
            nombre: 'Monitor',
            precio: 50000
        };

        const resultado = await productoService.crearProducto(producto);

        // Debe chequear duplicado por nombre y crear con los datos EXACTOS.
        // Si cambia un valor del producto (p. ej. precio 50000 -> 60000) la aserción falla.
        expect(productoRepository.buscarPorNombre)
            .toHaveBeenCalledWith('Monitor');

        expect(productoRepository.crearProducto)
            .toHaveBeenCalledWith({ nombre: 'Monitor', precio: 50000 });

        expect(resultado).toEqual({ id: 3, nombre: 'Monitor', precio: 50000 });
    });

    // PU-05
    test('Debe actualizar un producto con los datos exactos', async () => {

        productoRepository.buscarPorNombre.mockResolvedValue(undefined);

        productoRepository.actualizar.mockResolvedValue({
            id: 1,
            nombre: 'Monitor Gamer',
            precio: 60000
        });

        const productoActualizado = {
            nombre: 'Monitor Gamer',
            precio: 60000
        };

        const resultado = await productoService.actualizar(
            1,
            productoActualizado
        );

        expect(productoRepository.actualizar)
            .toHaveBeenCalledWith(
                1,
                { nombre: 'Monitor Gamer', precio: 60000 }
            );

        expect(resultado.nombre)
            .toBe('Monitor Gamer');
    });

    // PU-07
    test('Debe cambiar el estado de un producto', async () => {

        productoRepository.cambiarEstado.mockResolvedValue({
            id: 1,
            estado: false
        });

        const resultado = await productoService.cambiarEstado(
            1,
            false
        );

        expect(productoRepository.cambiarEstado)
            .toHaveBeenCalledWith(
                1,
                false
            );

        expect(resultado.estado)
            .toBe(false);
    });

    // PU-09
    test('Debe rechazar un producto con nombre duplicado y no crearlo', async () => {

        // Ya existe un producto con ese nombre
        productoRepository.buscarPorNombre.mockResolvedValue({ id_producto: 7, nombre: 'Monitor' });

        await expect(
            productoService.crearProducto({ nombre: 'Monitor', precio: 50000 })
        ).rejects.toThrow('Ya existe un producto con ese nombre');

        // Al estar duplicado, NO debe intentar insertarlo
        expect(productoRepository.crearProducto).not.toHaveBeenCalled();
    });

});
