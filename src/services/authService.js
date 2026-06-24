// Service de autenticación: lógica de negocio del inicio de sesión.
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authRepository = require('../repositories/authRepository');
const { ErrorAutenticacion } = require('../utils/errors');

exports.iniciarSesion = async (usuario, password) => {
    // Busca el usuario por correo en la base
    const user = await authRepository.buscarUsuarioPorCorreo(usuario);

    // Compara la contraseña recibida contra el hash almacenado (bcrypt).
    // Si el usuario no existe o la clave no coincide -> credenciales inválidas.
    const claveValida = user && user.clave ? await bcrypt.compare(password, user.clave) : false;
    if (!claveValida) {
        throw new ErrorAutenticacion('Credenciales incorrectas');
    }

    // Genera el JWT con los datos del usuario en el payload; vence a las 8 horas
    const token = jwt.sign(
        { id_usuario: user.id_usuario, correo: user.correo, rol: user.rol },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
    );

    // Devuelve el token (para futuras peticiones) y el rol (para que el frontend arme el menú)
    return { token, rol: user.rol };
};
