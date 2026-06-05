// Página de ventas: lista las ventas y permite registrar nuevas.
import { useState, useEffect } from 'react';
import { getAll, getById, create } from '../api/ventas';
import { getAll as getProductos } from '../api/productos';
import './Ventas.css';

// Datos por defecto de una venta nueva
const ventaVacia = {
    tipo_documento: 'BOLETA',
    documento_cliente: '',
    nombre_cliente: '',
};

const Ventas = () => {
    const [ventas, setVentas] = useState([]);
    const [productos, setProductos] = useState([]);
    const [formulario, setFormulario] = useState(false);    // muestra/oculta el form de nueva venta
    const [datosVenta, setDatosVenta] = useState(ventaVacia);
    const [detalles, setDetalles] = useState([]);       // líneas de la venta en curso
    const [productoSel, setProductoSel] = useState('');     // producto elegido para agregar
    const [cantidadSel, setCantidadSel] = useState(1);      // cantidad elegida para agregar
    const [ventaDetalle, setVentaDetalle] = useState(null); // venta abierta en el modal de detalle
    const [error, setError] = useState('');


     const cargarVentas = async () => {
        try { setVentas(await getAll()); } catch { setError('Error al cargar ventas'); }
    };


    // Solo productos activos: no se puede vender algo dado de baja
    const cargarProductos = async () => {
        try { setProductos(await getProductos({ soloActivos: true })); } catch {setError('Error al cargar productos');}
    };

     // Carga inicial en paralelo de ventas y productos
     useEffect(() => { Promise.all([cargarVentas(), cargarProductos()]); }, []);

    // Total de la venta en curso: suma de los subtotales de cada línea
    const montoTotal = detalles.reduce((acc, d) => acc + d.subtotal, 0);

    // Agrega el producto seleccionado a las líneas de la venta
    const agregarDetalle = () => {
        if (!productoSel) return;
        const producto = productos.find(p => p.id_producto === parseInt(productoSel));
        if (!producto) return;
        const existe = detalles.find(d => d.id_producto === producto.id_producto);
        if (existe) {
            // Si el producto ya está en la lista, sumamos la cantidad en lugar de duplicar la fila
            setDetalles(detalles.map(d =>
                d.id_producto === producto.id_producto
                    ? { ...d, cantidad: d.cantidad + parseInt(cantidadSel), subtotal: (d.cantidad + parseInt(cantidadSel)) * d.precio_venta }
                    : d
            ));
        } else {
            setDetalles([...detalles, {
                id_producto: producto.id_producto,
                nombre_producto: producto.nombre,
                precio_venta: parseFloat(producto.precio_venta),
                cantidad: parseInt(cantidadSel),
                subtotal: parseFloat(producto.precio_venta) * parseInt(cantidadSel),
            }]);
        }
        setProductoSel('');
        setCantidadSel(1);
    };

    // Elimina una línea de la venta en curso
    const quitarDetalle = (id) => setDetalles(detalles.filter(d => d.id_producto !== id));

    // Confirma y envía la venta al backend
    const guardarVenta = async (e) => {
        e.preventDefault();
        setError('');
        if (detalles.length === 0) { setError('Agregá al menos un producto'); return; }
        try {
            // monto_pago y monto_cambio se simplifican al total (pago exacto); no se gestiona vuelto
            await create({ ...datosVenta, monto_total: montoTotal, monto_pago: montoTotal, monto_cambio: 0, detalles });
            await cargarVentas();
            setFormulario(false);
            setDatosVenta(ventaVacia);
            setDetalles([]);
        } catch (err) { setError(err.message); }
    };

    // Abre el modal con el detalle completo de una venta ya registrada
    const verDetalle = async (id) => {
        try { setVentaDetalle(await getById(id)); } catch { setError('Error al cargar detalle'); }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h2 className="page-title">Ventas</h2>
                <button
                    onClick={() => { setFormulario(true); setError(''); }}
                    className="btn-primary-sm"
                >
                    + Nueva Venta
                </button>
            </div>

            {error && <div className="alert-error">{error}</div>}

            {/* Formulario para registrar una nueva venta */}
            {formulario && (
                <div className="card">
                    <h3 className="card-title">Registrar nueva venta</h3>
                    <form onSubmit={guardarVenta}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Tipo documento</label>
                                <select value={datosVenta.tipo_documento} onChange={e => setDatosVenta({ ...datosVenta, tipo_documento: e.target.value })} className="form-input">
                                    <option value="BOLETA">Boleta</option>
                                    <option value="FACTURA">Factura</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Documento cliente</label>
                                <input value={datosVenta.documento_cliente} onChange={e => setDatosVenta({ ...datosVenta, documento_cliente: e.target.value })} placeholder="DNI / CUIT" required className="form-input" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Nombre cliente</label>
                                <input value={datosVenta.nombre_cliente} onChange={e => setDatosVenta({ ...datosVenta, nombre_cliente: e.target.value })} placeholder="Nombre completo" required className="form-input" />
                            </div>
                        </div>

                        <div className="section-divider">
                            <p className="section-title">Agregar productos</p>
                            <div className="add-product-grid">
                                <div className="form-group">
                                    <label className="form-label">Producto</label>
                                    <select value={productoSel} onChange={e => setProductoSel(e.target.value)} className="form-input">
                                        <option value="">-- Seleccionar --</option>
                                        {productos.map(p => (
                                            <option key={p.id_producto} value={p.id_producto}>
                                                {p.nombre} (Stock: {p.stock}) — ${p.precio_venta}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Cantidad</label>
                                    <input type="number" min="1" value={cantidadSel} onChange={e => setCantidadSel(e.target.value)} className="form-input" />
                                </div>
                                <button type="button" onClick={agregarDetalle} className="btn-outline">
                                    + Agregar
                                </button>
                            </div>
                        </div>

                        {detalles.length > 0 && (
                            <div className="details-container">
                                <table className="details-table">
                                    <thead>
                                        <tr>
                                            {['Producto', 'Precio', 'Cantidad', 'Subtotal', ''].map(h => (
                                                <th key={h}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {detalles.map(d => (
                                            <tr key={d.id_producto}>
                                                <td>{d.nombre_producto}</td>
                                                <td>${d.precio_venta}</td>
                                                <td>{d.cantidad}</td>
                                                <td style={{fontWeight: 500, color: 'var(--color-bb-800)'}}>${d.subtotal.toFixed(2)}</td>
                                                <td>
                                                    <button type="button" onClick={() => quitarDetalle(d.id_producto)} className="btn-danger">
                                                        Quitar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="form-footer">
                            <div className="form-actions">
                                <button type="submit" className="btn-primary">
                                    Confirmar venta
                                </button>
                                <button type="button" onClick={() => { setFormulario(false); setDetalles([]); setDatosVenta(ventaVacia); setError(''); }} className="btn-secondary">
                                    Cancelar
                                </button>
                            </div>
                            <div style={{textAlign: 'right'}}>
                                <p className="total-label">Total</p>
                                <p className="total-value">${montoTotal.toFixed(2)}</p>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Modal de detalle de venta */}
            {ventaDetalle && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 className="modal-title">Detalle venta #{ventaDetalle.id_venta}</h3>
                        <div className="modal-info-grid">
                            <p><span className="modal-info-label">Cliente:</span> {ventaDetalle.nombre_cliente}</p>
                            <p><span className="modal-info-label">Documento:</span> {ventaDetalle.documento_cliente}</p>
                            <p><span className="modal-info-label">Tipo:</span> {ventaDetalle.tipo_documento}</p>
                            <p><span className="modal-info-label">Fecha:</span> {new Date(ventaDetalle.fecha).toLocaleString()}</p>
                        </div>
                        <div className="details-container" style={{marginBottom: '1rem'}}>
                            <table className="details-table">
                                <thead>
                                    <tr>
                                        {['Producto', 'Precio', 'Cant.', 'Subtotal'].map(h => (
                                            <th key={h}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {ventaDetalle.detalles.map(d => (
                                        <tr key={d.id_detalle_venta}>
                                            <td>{d.nombre_producto}</td>
                                            <td>${d.precio_venta}</td>
                                            <td>{d.cantidad}</td>
                                            <td style={{fontWeight: 500}}>${parseFloat(d.subtotal).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="modal-footer">
                            <p className="modal-total">Total: ${parseFloat(ventaDetalle.monto_total).toFixed(2)}</p>
                            <button onClick={() => setVentaDetalle(null)} className="btn-secondary">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabla de ventas registradas */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            {['#', 'Cliente', 'Documento', 'Tipo', 'Total', 'Fecha', 'Items', 'Detalle'].map(h => (
                                <th key={h}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {ventas.map((v, i) => (
                            <tr key={v.id_venta} className={i % 2 === 0 ? 'row-even' : 'row-odd'}>
                                <td className="font-semibold">#{v.id_venta}</td>
                                <td>{v.nombre_cliente}</td>
                                <td className="text-muted">{v.documento_cliente}</td>
                                <td>
                                    <span className={`badge ${v.tipo_documento === 'FACTURA' ? 'badge-factura' : 'badge-boleta'}`}>
                                        {v.tipo_documento}
                                    </span>
                                </td>
                                <td style={{fontWeight: 600, color: 'var(--color-bb-800)'}}>${parseFloat(v.monto_total).toFixed(2)}</td>
                                <td className="text-muted">{new Date(v.fecha).toLocaleDateString()}</td>
                                <td>{v.cantidad_items}</td>
                                <td>
                                    <button onClick={() => verDetalle(v.id_venta)} className="action-btn">
                                        Ver
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {ventas.length === 0 && (
                    <p className="empty-state">Sin ventas registradas.</p>
                )}
            </div>
        </div>
    );
};

export default Ventas;
