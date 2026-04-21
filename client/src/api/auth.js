const BASE = 'http://localhost:3000/api/auth';

export const login = async (usuario, password) => {
    const res = await fetch(`${BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, password }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al iniciar sesión');
    }
    return res.json();
};
