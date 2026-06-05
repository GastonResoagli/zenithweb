// Service de autenticación: lógica de negocio del login.
const jwt = require('jsonwebtoken');
const authRepository = require('../repositories/authRepository');

exports.login = async (usuario, password) => {
    // Busca el usuario por correo en la base
    const user = await authRepository.getUsuarioPorCorreo(usuario);

    // Si no existe o la contraseña no coincide -> credenciales inválidas
    // OJO: la clave se compara en texto plano; lo ideal sería hashearla con bcrypt
    if (!user || user.clave !== password) {
        throw new Error('Credenciales incorrectas');
    }

    // Genera el JWT con los datos del usuario en el payload; vence a las 8 horas
    const token = jwt.sign(
        { id_usuario: user.id_usuario, correo: user.correo, rol: user.rol },
        process.env.JWT_SECRET || 'secretkey',
        { expiresIn: '8h' }
    );

    // Devuelve el token (para futuras peticiones) y el rol (para que el frontend arme el menú)
    return { token, rol: user.rol };
};
