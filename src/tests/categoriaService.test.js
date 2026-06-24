const categoriaService = require('../services/categoriaService');
const categoriaRepository = require('../repositories/categoriaRepository');

jest.mock('../repositories/categoriaRepository');

describe('Pruebas Unitarias - Categoria Service', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('PU-03 Debe obtener todas las categorías', async () => {

        const categoriasMock = [
            { id: 1, nombre: 'Periféricos' },
            { id: 2, nombre: 'Monitores' }
        ];

        categoriaRepository.obtenerCategorias.mockResolvedValue(categoriasMock);

        const resultado = await categoriaService.obtenerCategorias();

        expect(categoriaRepository.obtenerCategorias).toHaveBeenCalledTimes(1);
        expect(resultado).toEqual(categoriasMock);
    });

    test('PU-04 Debe retornar una lista vacía si no existen categorías', async () => {

        categoriaRepository.obtenerCategorias.mockResolvedValue([]);

        const resultado = await categoriaService.obtenerCategorias();

        expect(resultado).toEqual([]);
        expect(resultado.length).toBe(0);
    });

    test('PU-13 Debe crear una categoría con la descripción exacta', async () => {

        // No existe una categoría previa con esa descripción
        categoriaRepository.buscarPorDescripcion.mockResolvedValue(undefined);

        const categoriaCreada = { id_categoria: 8, descripcion: 'Cables y Conectores', estado: true };
        categoriaRepository.crearCategoria.mockResolvedValue(categoriaCreada);

        const resultado = await categoriaService.crearCategoria('Cables y Conectores');

        // Debe chequear duplicados y crear con la descripción EXACTA recibida.
        // Si cambia el texto (p. ej. 'Cables y Conectores' -> 'Cables') la aserción falla.
        expect(categoriaRepository.buscarPorDescripcion).toHaveBeenCalledWith('Cables y Conectores');
        expect(categoriaRepository.crearCategoria).toHaveBeenCalledWith('Cables y Conectores');

        expect(resultado).toEqual(categoriaCreada);
    });

    test('PU-14 Debe rechazar una categoría duplicada y no crearla', async () => {

        // Ya existe una categoría con esa descripción
        categoriaRepository.buscarPorDescripcion.mockResolvedValue({ id_categoria: 3, descripcion: 'Inversores' });

        await expect(
            categoriaService.crearCategoria('Inversores')
        ).rejects.toThrow('Ya existe una categoría con esa descripción');

        // Al estar duplicada, NO debe intentar insertarla
        expect(categoriaRepository.crearCategoria).not.toHaveBeenCalled();
    });

});
