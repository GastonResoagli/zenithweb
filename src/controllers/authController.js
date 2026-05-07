const authService = require('../services/authService');
const { validarDatosLogin } = require('../utils/validators');

exports.login = async (req, res) => {
    try {
        // Valida datos según el diagrama
        validarDatosLogin(req.body);

        const { usuario, password } = req.body;
        const data = await authService.login(usuario, password);

        res.json(data);
    } catch (error) {
        if (error.message === 'Usuario y contraseña son requeridos' || error.message === 'Credenciales incorrectas') {
             return res.status(401).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
};
