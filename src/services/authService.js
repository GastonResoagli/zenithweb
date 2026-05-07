const jwt = require('jsonwebtoken');
const authRepository = require('../repositories/authRepository');

exports.login = async (usuario, password) => {
    const user = await authRepository.getUsuarioPorCorreo(usuario);

    if (!user || user.clave !== password) {
        throw new Error('Credenciales incorrectas');
    }

    const token = jwt.sign(
        { id_usuario: user.id_usuario, correo: user.correo, rol: user.rol },
        process.env.JWT_SECRET || 'secretkey',
        { expiresIn: '8h' }
    );

    return { token, rol: user.rol };
};
