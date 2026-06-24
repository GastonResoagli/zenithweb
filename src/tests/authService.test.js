const authService = require('../services/authService');
const authRepository = require('../repositories/authRepository');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

jest.mock('../repositories/authRepository');
jest.mock('jsonwebtoken');
jest.mock('bcryptjs');

describe('Pruebas Unitarias - Auth Service', () => {

    // El login firma el token con JWT_SECRET; lo definimos para el entorno de pruebas
    beforeAll(() => {
        process.env.JWT_SECRET = 'clave-de-prueba';
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('PU-09 Debe iniciar sesión correctamente', async () => {

        const usuarioMock = {
            id_usuario: 1,
            correo: 'admin@test.com',
            clave: '$2b$10$hashDeEjemplo',
            rol: 'ADMIN'
        };

        authRepository.buscarUsuarioPorCorreo.mockResolvedValue(usuarioMock);
        bcrypt.compare.mockResolvedValue(true); // la clave coincide con el hash almacenado
        jwt.sign.mockReturnValue('token-falso');

        const resultado = await authService.iniciarSesion(
            'admin@test.com',
            '1234'
        );

        // Debe buscar al usuario por el correo EXACTO recibido
        expect(authRepository.buscarUsuarioPorCorreo).toHaveBeenCalledWith('admin@test.com');

        // Debe comparar la clave recibida contra el hash almacenado
        expect(bcrypt.compare).toHaveBeenCalledWith('1234', usuarioMock.clave);

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
            clave: '$2b$10$hashDeEjemplo',
            rol: 'ADMIN'
        };

        authRepository.buscarUsuarioPorCorreo.mockResolvedValue(usuarioMock);
        bcrypt.compare.mockResolvedValue(false); // la clave NO coincide con el hash

        await expect(
            authService.iniciarSesion(
                'admin@test.com',
                '9999'
            )
        ).rejects.toThrow('Credenciales incorrectas');

        // Con clave incorrecta NO debe generarse ningún token
        expect(authRepository.buscarUsuarioPorCorreo).toHaveBeenCalledWith('admin@test.com');
        expect(jwt.sign).not.toHaveBeenCalled();

    });

});
