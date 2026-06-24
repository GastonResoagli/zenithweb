const clienteService = require('../services/clienteService');
const clienteRepository = require('../repositories/clienteRepository');

jest.mock('../repositories/clienteRepository');

describe('Pruebas Unitarias - Cliente Service', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Debe obtener todos los clientes', async () => {
        const clientesMock = [
            { id_cliente: 1, dni: '20-12345678-9', nombre: 'Juan Perez' },
            { id_cliente: 2, dni: '27-98765432-1', nombre: 'Maria Gomez' },
        ];
        clienteRepository.obtenerClientes.mockResolvedValue(clientesMock);

        const resultado = await clienteService.obtenerClientes();

        expect(clienteRepository.obtenerClientes).toHaveBeenCalledTimes(1);
        expect(resultado).toEqual(clientesMock);
    });

    test('Debe retornar una lista vacía si no existen clientes', async () => {
        clienteRepository.obtenerClientes.mockResolvedValue([]);

        const resultado = await clienteService.obtenerClientes();

        expect(resultado).toEqual([]);
        expect(resultado.length).toBe(0);
    });

});
