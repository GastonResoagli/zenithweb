const BASE = 'http://localhost:3000/api/movimientos';

const headers = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

export const getAll = async () => {
    const res = await fetch(BASE, { headers: headers() });
    if (!res.ok) throw new Error('Error al obtener movimientos');
    return res.json();
};

export const registrarEntrada = async ({ id_producto, cantidad, precio_compra }) => {
    const res = await fetch(`${BASE}/entrada`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ id_producto, cantidad, precio_compra }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al registrar entrada');
    }
    return res.json();
};
