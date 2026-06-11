// Página de movimientos de stock: lista el historial y permite registrar/editar entradas.
import { useState, useEffect } from 'react';
import { getAll, registrarEntrada, actualizarEntrada } from '../api/movimientos';
import { getAll as getProductos } from '../api/productos';
import './Movimientos.css';

// Datos por defecto de una entrada nueva
const entradaVacia = { id_producto: '', cantidad: 1, precio_compra: '' };

const Movimientos = () => {
    const [movimientos, setMovimientos] = useState([]);
    const [productos, setProductos] = useState([]);
    const [formulario, setFormulario] = useState(false);    // muestra/oculta el form
    const [editandoId, setEditandoId] = useState(null);     // id_registro en edición (null = alta)
    const [entrada, setEntrada] = useState(entradaVacia);
    const [error, setError] = useState('');

    // Al montar el componente carga movimientos y productos en paralelo
    useEffect(() => { Promise.all([cargarMovimientos(), cargarProductos()]); }, []);

    const cargarMovimientos = async () => {
        try { setMovimientos(await getAll()); } catch { setError('Error al cargar movimientos'); }
    };

    // Solo productos activos: no se repone algo dado de baja
    const cargarProductos = async () => {
        try { setProductos(await getProductos({ soloActivos: true })); } catch { setError('Error al cargar productos'); }
    };

    // Abre el formulario en modo alta (entrada nueva)
    const nuevaEntrada = () => {
        setEditandoId(null);
        setEntrada(entradaVacia);
        setFormulario(true);
        setError('');
    };

    // Abre el formulario en modo edición, precargado con los datos del movimiento
    const editarEntrada = (m) => {
        setEditandoId(m.id_registro);
        setEntrada({ id_producto: m.id_producto, cantidad: m.cantidad, precio_compra: m.precio_compra });
        setFormulario(true);
        setError('');
    };

    // Cierra y resetea el formulario
    const cerrarFormulario = () => {
        setFormulario(false);
        setEditandoId(null);
        setEntrada(entradaVacia);
        setError('');
    };

    // Al elegir un producto (solo en alta), precarga su precio de compra actual (editable)
    const seleccionarProducto = (id) => {
        const producto = productos.find(p => p.id_producto === parseInt(id));
        setEntrada({
            ...entrada,
            id_producto: id,
            precio_compra: producto ? producto.precio_compra : '',
        });
    };

    // Confirma el formulario: crea o actualiza según el modo
    const guardarEntrada = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editandoId) {
                await actualizarEntrada(editandoId, {
                    cantidad: parseInt(entrada.cantidad),
                    precio_compra: parseFloat(entrada.precio_compra),
                });
            } else {
                await registrarEntrada({
                    id_producto: parseInt(entrada.id_producto),
                    cantidad: parseInt(entrada.cantidad),
                    precio_compra: parseFloat(entrada.precio_compra),
                });
            }
            await Promise.all([cargarMovimientos(), cargarProductos()]);
            cerrarFormulario();
        } catch (err) { setError(err.message); }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h2 className="page-title">Movimientos de Stock</h2>
                <button onClick={nuevaEntrada} className="btn-primary-sm">
                    + Registrar Entrada
                </button>
            </div>

            {error && <div className="alert-error">{error}</div>}

            {/* Formulario para registrar o editar un ingreso de stock */}
            {formulario && (
                <div className="card">
                    <h3 className="card-title">{editandoId ? 'Editar entrada de stock' : 'Registrar entrada de stock'}</h3>
                    <form onSubmit={guardarEntrada}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Producto</label>
                                {/* En edición el producto no se cambia: queda fijo por el registro */}
                                <select value={entrada.id_producto} onChange={e => seleccionarProducto(e.target.value)} required disabled={!!editandoId} className="form-input">
                                    <option value="">-- Seleccionar --</option>
                                    {productos.map(p => (
                                        <option key={p.id_producto} value={p.id_producto}>
                                            {p.nombre} (Stock: {p.stock})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Cantidad</label>
                                <input type="number" min="1" value={entrada.cantidad} onChange={e => setEntrada({ ...entrada, cantidad: e.target.value })} required className="form-input" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Precio de compra (unitario)</label>
                                <input type="number" min="0" step="0.01" value={entrada.precio_compra} onChange={e => setEntrada({ ...entrada, precio_compra: e.target.value })} required className="form-input" />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-primary">{editandoId ? 'Guardar cambios' : 'Confirmar entrada'}</button>
                            <button type="button" onClick={cerrarFormulario} className="btn-secondary">Cancelar</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="table-container">
                <h3 className="table-header-title">Historial de movimientos</h3>
                <table className="data-table">
                    <thead>
                        <tr>
                            {['Fecha', 'Producto', 'Tipo', 'Cantidad', ''].map(h => (
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
                                <td>
                                    {/* Solo las entradas se pueden editar (las salidas vienen de ventas) */}
                                    {m.tipo === 'entrada' && (
                                        <button onClick={() => editarEntrada(m)} className="action-btn">
                                            Editar
                                        </button>
                                    )}
                                </td>
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
