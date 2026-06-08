const authService = require('../services/authService');
const authRepository = require('../repositories/authRepository');
const jwt = require('jsonwebtoken');

jest.mock('../repositories/authRepository');
jest.mock('jsonwebtoken');

describe('Pruebas Unitarias - Auth Service', () => {

    test('PU-09 Debe iniciar sesión correctamente', async () => {

        const usuarioMock = {
            id_usuario: 1,
            correo: 'admin@test.com',
            clave: '1234',
            rol: 'ADMIN'
        };

        authRepository.getUsuarioPorCorreo.mockResolvedValue(usuarioMock);

        jwt.sign.mockReturnValue('token-falso');

        const resultado = await authService.login(
            'admin@test.com',
            '1234'
        );

        expect(resultado.token).toBe('token-falso');
        expect(resultado.rol).toBe('ADMIN');

    });

    test('PU-10 Debe rechazar credenciales incorrectas', async () => {

        const usuarioMock = {
            id_usuario: 1,
            correo: 'admin@test.com',
            clave: '1234',
            rol: 'ADMIN'
        };

        authRepository.getUsuarioPorCorreo.mockResolvedValue(usuarioMock);

        await expect(
            authService.login(
                'admin@test.com',
                '9999'
            )
        ).rejects.toThrow('Credenciales incorrectas');

    });

});