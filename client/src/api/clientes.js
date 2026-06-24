// Cliente HTTP para clientes.
// La URL del backend viene de VITE_API_URL (configurada en Vercel). En local cae a localhost.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const BASE = `${API_URL}/api/clientes`;

const headers = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

// Lista de clientes (para autocompletar en ventas y filtrar reportes)
export const obtenerClientes = async () => {
    const res = await fetch(BASE, { headers: headers() });
    if (!res.ok) throw new Error('Error al obtener clientes');
    return res.json();
};
