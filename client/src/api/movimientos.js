// Cliente HTTP para movimientos de inventario.
// La URL del backend viene de VITE_API_URL (configurada en Vercel). En local cae a localhost.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const BASE = `${API_URL}/api/movimientos`;

// Headers con el token JWT guardado en localStorage (requerido por las rutas protegidas)
const headers = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

// Trae el historial de movimientos
export const getAll = async () => {
    const res = await fetch(BASE, { headers: headers() });
    if (!res.ok) throw new Error('Error al obtener movimientos');
    return res.json();
};


