// Cliente HTTP para las categorías.
// La URL del backend viene de VITE_API_URL (configurada en Vercel). En local cae a localhost.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const BASE = `${API_URL}/api/categorias`;

// El token se lee de localStorage en cada llamada para reflejar siempre el valor actual
const headers = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

// Lista de categorías (GET)
export const obtenerCategorias = async () => {
    const res = await fetch(BASE, { headers: headers() });
    if (!res.ok) throw new Error('Error al obtener categorías');
    return res.json();
};

// Crea una categoría (POST). Propaga el mensaje del backend (p. ej. duplicado).
export const crear = async (descripcion) => {
    const res = await fetch(BASE, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ descripcion }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Error al crear categoría');
    return data;
};
