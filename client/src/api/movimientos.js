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

// Registra una entrada de stock (POST). Propaga el mensaje del backend.
export const registrarEntrada = async (entrada) => {
    const res = await fetch(`${BASE}/entrada`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(entrada),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Error al registrar la entrada');
    return data;
};

// Actualiza una entrada de stock existente (PUT). Propaga el mensaje del backend.
export const actualizarEntrada = async (id, entrada) => {
    const res = await fetch(`${BASE}/entrada/${id}`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify(entrada),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Error al actualizar la entrada');
    return data;
};


