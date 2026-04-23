const BASE = 'http://localhost:3000/api/productos';

const headers = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

export const getAll = async ({ soloActivos = false } = {}) => {
    const url = soloActivos ? `${BASE}?soloActivos=true` : BASE;
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) throw new Error('Error al obtener productos');
    return res.json();
};

export const setEstado = async (id, estado) => {
    const res = await fetch(`${BASE}/${id}/estado`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ estado }),
    });
    if (!res.ok) throw new Error('Error al actualizar estado');
    return res.json();
};

export const create = async (producto) => {
    const res = await fetch(BASE, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(producto),
    });
    if (!res.ok) throw new Error('Error al crear producto');
    return res.json();
};

export const update = async (id, producto) => {
    const res = await fetch(`${BASE}/${id}`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify(producto),
    });
    if (!res.ok) throw new Error('Error al actualizar producto');
    return res.json();
};

export const remove = async (id) => {
    const res = await fetch(`${BASE}/${id}`, {
        method: 'DELETE',
        headers: headers(),
    });
    if (!res.ok) throw new Error('Error al eliminar producto');
    return res.json();
};
