// Cliente HTTP para el endpoint de autenticación.
const BASE = 'http://localhost:3000/api/auth';

// Envía las credenciales al backend; si son correctas devuelve { token, rol }
export const login = async (usuario, password) => {
    const res = await fetch(`${BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, password }),
    });
    if (!res.ok) {
        // El backend manda el mensaje de error en el campo "error" del JSON
        const err = await res.json();
        throw new Error(err.error || 'Error al iniciar sesión');
    }
    return res.json();
};
