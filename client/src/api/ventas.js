const BASE = 'http://localhost:3000/api/ventas';

const headers = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

export const getAll = async () => {
    const res = await fetch(BASE, { headers: headers() });
    if (!res.ok) throw new Error('Error al obtener ventas');
    return res.json();
};

export const getById = async (id) => {
    const res = await fetch(`${BASE}/${id}`, { headers: headers() });
    if (!res.ok) throw new Error('Error al obtener venta');
    return res.json();
};

export const create = async (venta) => {
    const res = await fetch(BASE, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(venta),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al crear venta');
    }
    return res.json();
};
