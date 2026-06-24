// Página de reportes: consulta movimientos con filtros y permite descargar el PDF.
import { useState, useEffect } from 'react';
import { obtenerMovimientos, generarReporte } from '../api/reportes';
import { obtenerClientes } from '../api/clientes';
import './Reportes.css';

const Reportes = () => {
    // Filtros del formulario
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [tipo, setTipo] = useState('');
    const [idCliente, setIdCliente] = useState('');       // filtro por cliente (solo aplica a ventas)
    const [clientes, setClientes] = useState([]);         // clientes para el selector
    const [movimientos, setMovimientos] = useState(null); // null = todavía no se consultó
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);      // mientras consulta la tabla
    const [descargando, setDescargando] = useState(false);// mientras genera el PDF

    // Carga los clientes para el filtro (una sola vez)
    useEffect(() => { obtenerClientes().then(setClientes).catch(() => {}); }, []);

    const filtros = { fechaDesde, fechaHasta, tipo: tipo || undefined, id_cliente: idCliente || undefined };

    // Consulta los movimientos según los filtros y los muestra en la tabla
    const handleConsultar = async (e) => {
        e.preventDefault();
        setError('');
        setCargando(true);
        try {
            const data = await obtenerMovimientos(filtros);
            setMovimientos(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    // Descarga el PDF del reporte con los filtros actuales
    const handleDescargar = async () => {
        setError('');
        setDescargando(true);
        try {
            await generarReporte(filtros);
        } catch (err) {
            setError(err.message);
        } finally {
            setDescargando(false);
        }
    };

    // Calcula las métricas de resumen (totales y montos) a partir de los movimientos consultados
    const stats = movimientos ? {
        totalRegistros:  movimientos.length,
        unidadesEntrada: movimientos.filter(m => m.tipo === 'entrada').reduce((s, m) => s + Number(m.cantidad), 0),
        unidadesSalida:  movimientos.filter(m => m.tipo === 'salida').reduce((s, m)  => s + Number(m.cantidad), 0),
        montoEntradas:   movimientos.filter(m => m.tipo === 'entrada' && m.total).reduce((s, m) => s + Number(m.total), 0),
        montoSalidas:    movimientos.filter(m => m.tipo === 'salida'  && m.total).reduce((s, m) => s + Number(m.total), 0),
    } : null;

    return (
        <div className="page-container">

            {/* Encabezado */}
            <div className="page-header">
                <h2 className="page-title">Reportes</h2>
                {movimientos && (
                    <button
                        onClick={handleDescargar}
                        disabled={descargando}
                        className="btn-primary-sm"
                    >
                        <svg style={{width: '1rem', height: '1rem'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                        </svg>
                        {descargando ? 'Generando PDF...' : 'Descargar PDF'}
                    </button>
                )}
            </div>

            {error && (
                <div className="alert-error">{error}</div>
            )}

            {/* Filtros */}
            <form onSubmit={handleConsultar} className="card">
                <p className="card-title">Filtros</p>
                <div className="filters-grid">
                    <div className="filter-group">
                        <label className="form-label">Fecha desde</label>
                        <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} className="form-input" />
                    </div>
                    <div className="filter-group">
                        <label className="form-label">Fecha hasta</label>
                        <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} className="form-input" />
                    </div>
                    <div className="filter-group">
                        <label className="form-label">Tipo</label>
                        <select value={tipo} onChange={e => setTipo(e.target.value)} className="form-input">
                            <option value="">Todos</option>
                            <option value="entrada">Entrada</option>
                            <option value="salida">Salida</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label className="form-label">Cliente</label>
                        <select value={idCliente} onChange={e => setIdCliente(e.target.value)} className="form-input">
                            <option value="">Todos</option>
                            {clientes.map(c => (
                                <option key={c.id_cliente} value={c.id_cliente}>{c.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={cargando}
                        className="btn-primary-px6"
                    >
                        {cargando ? 'Consultando...' : 'Consultar'}
                    </button>
                </div>
            </form>

            {/* Tarjetas de resumen */}
            {stats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <p className="stat-label">Total registros</p>
                        <p className="stat-value">{stats.totalRegistros}</p>
                    </div>
                    <div className="stat-card">
                        <p className="stat-label">Unidades ingresadas</p>
                        <p className="stat-value success">{stats.unidadesEntrada}</p>
                        <p className="stat-subtext">${stats.montoEntradas.toFixed(2)}</p>
                    </div>
                    <div className="stat-card">
                        <p className="stat-label">Unidades vendidas</p>
                        <p className="stat-value danger">{stats.unidadesSalida}</p>
                        <p className="stat-subtext">${stats.montoSalidas.toFixed(2)}</p>
                    </div>
                    <div className="stat-card">
                        <p className="stat-label">Ingresos por ventas</p>
                        <p className="stat-value">${stats.montoSalidas.toFixed(2)}</p>
                    </div>
                </div>
            )}

            {/* Tabla de movimientos */}
            {movimientos && (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                {['Fecha', 'Producto', 'Tipo', 'Cantidad', 'Total', 'Cliente / Operador'].map(h => (
                                    <th key={h}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {movimientos.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="empty-state">
                                        Sin movimientos para los filtros seleccionados.
                                    </td>
                                </tr>
                            ) : movimientos.map((m, i) => (
                                <tr key={m.id_registro} className={i % 2 === 0 ? 'row-even' : 'row-odd'}>
                                    <td className="text-muted">
                                        {new Date(m.fecha).toLocaleString('es-AR', {
                                            day: '2-digit', month: '2-digit', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit',
                                        })}
                                    </td>
                                    <td className="font-medium">{m.nombre_producto}</td>
                                    <td>
                                        <span className={`badge ${
                                            m.tipo === 'entrada'
                                                ? 'badge-entrada'
                                                : 'badge-salida'
                                        }`}>
                                            {m.tipo.charAt(0).toUpperCase() + m.tipo.slice(1)}
                                        </span>
                                    </td>
                                    <td>{m.cantidad}</td>
                                    <td>
                                        {m.total != null ? `$${parseFloat(m.total).toFixed(2)}` : '-'}
                                    </td>
                                    <td className="text-muted">{m.nombre_actor}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Estado inicial — sin consulta */}
            {movimientos === null && !cargando && (
                <div className="initial-state">
                    <svg className="initial-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h0a4 4 0 014 4v2M9 17H5a2 2 0 01-2-2v-1a7 7 0 017-7h4a7 7 0 017 7v1a2 2 0 01-2 2h-4" />
                    </svg>
                    <p className="initial-text">Aplicá los filtros y consultá para ver los movimientos.</p>
                </div>
            )}

        </div>
    );
};

export default Reportes;
