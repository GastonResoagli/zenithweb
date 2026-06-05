// Controller de autenticación: maneja la petición HTTP de login.
const authService = require('../services/authService');
const { validarDatosLogin } = require('../utils/validators');

exports.login = async (req, res) => {
    try {
        // Valida que vengan usuario y password (lanza error si falta alguno)
        validarDatosLogin(req.body);

        const { usuario, password } = req.body;
        // Delega la lógica al service, que devuelve { token, rol } si las credenciales son correctas
        const data = await authService.login(usuario, password);

        res.json(data);
    } catch (error) {
        // Errores de credenciales -> 401 (no autorizado); el resto -> 500 (error del servidor)
        if (error.message === 'Usuario y contraseña son requeridos' || error.message === 'Credenciales incorrectas') {
             return res.status(401).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
};
