const categoriaService = require('../services/categoriaService');
const categoriaRepository = require('../repositories/categoriaRepository');

jest.mock('../repositories/categoriaRepository');

describe('Pruebas Unitarias - Categoria Service', () => {

    test('PU-03 Debe obtener todas las categorías', async () => {

        const categoriasMock = [
            { id: 1, nombre: 'Periféricos' },
            { id: 2, nombre: 'Monitores' }
        ];

        categoriaRepository.obtenerCategorias.mockResolvedValue(categoriasMock);

        const resultado = await categoriaService.obtenerCategorias();

        expect(resultado).toEqual(categoriasMock);
    });

    test('PU-04 Debe retornar una lista vacía si no existen categorías', async () => {

        categoriaRepository.obtenerCategorias.mockResolvedValue([]);

        const resultado = await categoriaService.obtenerCategorias();

        expect(resultado).toEqual([]);
        expect(resultado.length).toBe(0);
    });

});