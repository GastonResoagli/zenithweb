// Controller de autenticación: maneja la petición HTTP de inicio de sesión.
// Sin try/catch: Express 5 reenvía los errores al middleware central (errorHandler).
const authService = require('../services/authService');
const { validarDatosLogin } = require('../utils/validators');

exports.iniciarSesion = async (req, res) => {
    // Valida que vengan usuario y password (lanza ErrorValidacion si falta alguno)
    validarDatosLogin(req.body);

    const { usuario, password } = req.body;
    // Delega la lógica al service, que devuelve { token, rol } si las credenciales son correctas
    const data = await authService.iniciarSesion(usuario, password);

    res.json(data);
};
