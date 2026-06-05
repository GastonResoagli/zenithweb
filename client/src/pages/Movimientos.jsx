// Página del historial de movimientos de stock.
// NOTA: este componente existe pero no está enlazado en App.jsx (no hay <Route> que lo use).
import { useState, useEffect } from 'react';
import { getAll } from '../api/movimientos';
import './Movimientos.css';

const Movimientos = () => {
    const [movimientos, setMovimientos] = useState([]);
    const [error, setError] = useState('');

    // Al montar el componente carga los movimientos una sola vez
    useEffect(() => { cargarMovimientos(); }, []);

    const cargarMovimientos = async () => {
        try { setMovimientos(await getAll()); } catch { setError('Error al cargar movimientos'); }
    };

    return (
        <div className="page-container">
            <h2 className="page-title">Movimientos de Stock</h2>
            {error && <div className="alert-error">{error}</div>}

            <div className="table-container">
                <h3 className="table-header-title">Historial de movimientos</h3>
                <table className="data-table">
                    <thead>
                        <tr>
                            {['Fecha', 'Producto', 'Tipo', 'Cantidad', 'Usuario'].map(h => (
                                <th key={h}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {movimientos.map((m, i) => (
                            <tr key={m.id_registro} className={i % 2 === 0 ? 'row-even' : 'row-odd'}>
                                <td className="text-muted">{new Date(m.fecha).toLocaleString('es-AR')}</td>
                                <td>{m.nombre_producto}</td>
                                <td>
                                    <span className={`badge ${m.tipo === 'entrada' ? 'badge-entrada' : 'badge-salida'}`}>
                                        {m.tipo}
                                    </span>
                                </td>
                                <td className="font-semibold">{m.cantidad}</td>
                                <td className="text-muted">{m.nombre_usuario}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {movimientos.length === 0 && (
                    <p className="empty-state">Sin movimientos registrados.</p>
                )}
            </div>
        </div>
    );
};

export default Movimientos;
