// Cliente HTTP para el CRUD de productos.
// La URL del backend viene de VITE_API_URL (configurada en Vercel). En local cae a localhost.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const BASE = `${API_URL}/api/productos`;

// El token se lee de localStorage en cada llamada para reflejar siempre el valor actual
const headers = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

// Lista de productos (GET); soloActivos filtra los dados de baja
export const getAll = async ({ soloActivos = false } = {}) => {
    // soloActivos=true filtra los productos dados de baja (usado en el formulario de ventas)
    const url = soloActivos ? `${BASE}?soloActivos=true` : BASE;
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) throw new Error('Error al obtener productos');
    return res.json();
};

// Activa/desactiva un producto (PATCH alta/baja)
export const setEstado = async (id, estado) => {
    const res = await fetch(`${BASE}/${id}/estado`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ estado }),
    });
    if (!res.ok) throw new Error('Error al actualizar estado');
    return res.json();
};

// Crea un producto (POST). Propaga el mensaje del backend (p. ej. nombre duplicado).
export const create = async (producto) => {
    const res = await fetch(BASE, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(producto),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Error al crear producto');
    return data;
};

// Actualiza un producto existente (PUT). Propaga el mensaje del backend.
export const update = async (id, producto) => {
    const res = await fetch(`${BASE}/${id}`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify(producto),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Error al actualizar producto');
    return data;
};

// Baja lógica del producto (DELETE)
export const remove = async (id) => {
    const res = await fetch(`${BASE}/${id}`, {
        method: 'DELETE',
        headers: headers(),
    });
    if (!res.ok) throw new Error('Error al eliminar producto');
    return res.json();
};
