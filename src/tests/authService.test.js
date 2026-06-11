const authService = require('../services/authService');
const authRepository = require('../repositories/authRepository');
const jwt = require('jsonwebtoken');

jest.mock('../repositories/authRepository');
jest.mock('jsonwebtoken');

describe('Pruebas Unitarias - Auth Service', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

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

        // Debe buscar al usuario por el correo EXACTO recibido
        expect(authRepository.getUsuarioPorCorreo).toHaveBeenCalledWith('admin@test.com');

        // Debe firmar el token con el payload EXACTO (si cambia id_usuario, correo o rol, falla)
        expect(jwt.sign).toHaveBeenCalledWith(
            { id_usuario: 1, correo: 'admin@test.com', rol: 'ADMIN' },
            expect.any(String),
            { expiresIn: '8h' }
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

        // Con clave incorrecta NO debe generarse ningún token
        expect(authRepository.getUsuarioPorCorreo).toHaveBeenCalledWith('admin@test.com');
        expect(jwt.sign).not.toHaveBeenCalled();

    });

});
