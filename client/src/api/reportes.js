// Cliente HTTP para reportes.
// La URL del backend viene de VITE_API_URL (configurada en Vercel). En local cae a localhost.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const BASE = `${API_URL}/api/reportes`;

const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

// Consulta movimientos filtrados. Arma el query string solo con los filtros que tengan valor.
export const obtenerMovimientos = async (filtros) => {
    const params = new URLSearchParams();
    if (filtros.fechaDesde) params.set('fechaDesde', filtros.fechaDesde);
    if (filtros.fechaHasta) params.set('fechaHasta', filtros.fechaHasta);
    if (filtros.tipo)       params.set('tipo', filtros.tipo);

    const res = await fetch(`${BASE}?${params}`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Error al obtener movimientos');
    return res.json();
};

// Pide el PDF al backend y dispara su descarga en el navegador
export const generarReporte = async (filtros) => {
    const res = await fetch(BASE, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(filtros),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al generar reporte');
    }

    // Convertimos la respuesta binaria en un blob y disparamos la descarga automáticamente
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_${Date.now()}.pdf`;
    a.click();
    // Liberamos la URL de objeto para evitar fuga de memoria
    URL.revokeObjectURL(url);
};
