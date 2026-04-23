import { useState } from 'react';
import { generarReporte } from '../api/reportes';

const Reportes = () => {
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [tipo, setTipo] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const handleGenerar = async (e) => {
        e.preventDefault();
        setError('');
        setCargando(true);
        try {
            await generarReporte({ fechaDesde, fechaHasta, tipo: tipo || undefined });
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    const inputClass = "w-full px-3 py-2 border border-bb-200 rounded-lg text-sm text-bb-900 focus:outline-none focus:ring-2 focus:ring-bb-400 focus:border-bb-400";

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-bb-900 mb-6">Generar Reporte</h2>

            <div className="p-6 bg-white border border-bb-100 rounded-xl shadow-sm">
                <h3 className="text-base font-semibold text-bb-900 mb-4">Seleccionar filtros</h3>

                {error && <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">{error}</div>}

                <form onSubmit={handleGenerar} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 text-sm font-medium text-bb-700">Fecha desde</label>
                            <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} className={inputClass} />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-medium text-bb-700">Fecha hasta</label>
                            <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} className={inputClass} />
                        </div>
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium text-bb-700">Tipo de movimiento</label>
                        <select value={tipo} onChange={e => setTipo(e.target.value)} className={inputClass}>
                            <option value="">Todos</option>
                            <option value="entrada">Entrada</option>
                            <option value="salida">Salida</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={cargando}
                        className="w-full px-4 py-2 bg-bb-700 hover:bg-bb-800 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        {cargando ? 'Generando...' : 'Generar y descargar PDF'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Reportes;
