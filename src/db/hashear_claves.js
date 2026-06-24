// ============================================================================
// Script de migración (uso único): hashea con bcrypt las claves de usuario que
// todavía estén en texto plano. Es idempotente: las claves ya hasheadas se omiten,
// así que se puede volver a correr sin problema.
//
// Ejecutar:  node src/db/hashear_claves.js
// ============================================================================
const bcrypt = require('bcryptjs');
const db = require('./connection');

const SALT_ROUNDS = 10;

// Una clave ya hasheada por bcrypt empieza con $2a$, $2b$ o $2y$
const estaHasheada = (clave) => typeof clave === 'string' && /^\$2[aby]\$/.test(clave);

(async () => {
    try {
        const { rows } = await db.query('SELECT id_usuario, clave FROM usuario');
        let actualizadas = 0;

        for (const usuario of rows) {
            if (!usuario.clave || estaHasheada(usuario.clave)) continue;
            const hash = await bcrypt.hash(usuario.clave, SALT_ROUNDS);
            await db.query('UPDATE usuario SET clave = $1 WHERE id_usuario = $2', [hash, usuario.id_usuario]);
            actualizadas++;
        }

        console.log(`Claves hasheadas: ${actualizadas} (de ${rows.length} usuarios).`);
    } catch (error) {
        console.error('Error al hashear claves:', error.message);
        process.exitCode = 1;
    } finally {
        await db.end();
    }
})();
