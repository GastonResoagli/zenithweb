// Cliente HTTP para ventas.
// La URL del backend viene de VITE_API_URL (configurada en Vercel). En local cae a localhost.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const BASE = `${API_URL}/api/ventas`;

// El token se lee de localStorage en cada llamada para reflejar siempre el valor actual
const headers = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

// Listado de ventas (GET)
export const obtenerVentas = async () => {
    const res = await fetch(BASE, { headers: headers() });
    if (!res.ok) throw new Error('Error al obtener ventas');
    return res.json();
};

// Una venta con su detalle (GET por id)
export const obtenerPorId = async (id) => {
    const res = await fetch(`${BASE}/${id}`, { headers: headers() });
    if (!res.ok) throw new Error('Error al obtener venta');
    return res.json();
};

// Registra una venta nueva (POST)
export const crear = async (venta) => {
    const res = await fetch(BASE, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(venta),
    });
    if (!res.ok) {
        // Propagamos el mensaje del servidor (ej: "Stock insuficiente") al componente
        const err = await res.json();
        throw new Error(err.error || 'Error al crear venta');
    }
    return res.json();
};
