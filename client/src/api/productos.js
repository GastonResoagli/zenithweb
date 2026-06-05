// Cliente HTTP para el CRUD de productos.
const BASE = 'http://localhost:3000/api/productos';

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

// Crea un producto (POST)
export const create = async (producto) => {
    const res = await fetch(BASE, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(producto),
    });
    if (!res.ok) throw new Error('Error al crear producto');
    return res.json();
};

// Actualiza un producto existente (PUT)
export const update = async (id, producto) => {
    const res = await fetch(`${BASE}/${id}`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify(producto),
    });
    if (!res.ok) throw new Error('Error al actualizar producto');
    return res.json();
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
