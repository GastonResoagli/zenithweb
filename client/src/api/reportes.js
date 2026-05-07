const BASE = 'http://localhost:3000/api/reportes';

const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

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
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_${Date.now()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
};
