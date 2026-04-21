import { useState, useEffect } from 'react';
import { getAll, getById, create } from '../api/ventas';
import { getAll as getProductos } from '../api/productos';

const ventaVacia = {
    tipo_documento: 'BOLETA',
    documento_cliente: '',
    nombre_cliente: '',
};

const Ventas = () => {
    const [ventas, setVentas] = useState([]);
    const [productos, setProductos] = useState([]);
    const [formulario, setFormulario] = useState(false);
    const [datosVenta, setDatosVenta] = useState(ventaVacia);
    const [detalles, setDetalles] = useState([]);
    const [productoSel, setProductoSel] = useState('');
    const [cantidadSel, setCantidadSel] = useState(1);
    const [ventaDetalle, setVentaDetalle] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => { cargarVentas(); cargarProductos(); }, []);

    const cargarVentas = async () => {
        try { setVentas(await getAll()); } catch { setError('Error al cargar ventas'); }
    };

    const cargarProductos = async () => {
        try { setProductos(await getProductos()); } catch {}
    };

    const montoTotal = detalles.reduce((acc, d) => acc + d.subtotal, 0);

    const agregarDetalle = () => {
        if (!productoSel) return;
        const producto = productos.find(p => p.id_producto === parseInt(productoSel));
        if (!producto) return;

        const existe = detalles.find(d => d.id_producto === producto.id_producto);
        if (existe) {
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

    const quitarDetalle = (id_producto) => {
        setDetalles(detalles.filter(d => d.id_producto !== id_producto));
    };

    const guardarVenta = async (e) => {
        e.preventDefault();
        setError('');
        if (detalles.length === 0) { setError('Agregá al menos un producto'); return; }
        try {
            await create({
                ...datosVenta,
                monto_total: montoTotal,
                monto_pago: montoTotal,
                monto_cambio: 0,
                detalles,
            });
            await cargarVentas();
            setFormulario(false);
            setDatosVenta(ventaVacia);
            setDetalles([]);
        } catch (err) {
            setError(err.message);
        }
    };

    const verDetalle = async (id) => {
        try {
            const data = await getById(id);
            setVentaDetalle(data);
        } catch { setError('Error al cargar detalle'); }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={{ margin: 0 }}>Ventas</h2>
                <button style={styles.btnPrimary} onClick={() => { setFormulario(true); setError(''); }}>+ Nueva venta</button>
            </div>

            {error && <p style={styles.error}>{error}</p>}

            {formulario && (
                <div style={styles.formWrapper}>
                    <h3 style={{ margin: '0 0 16px' }}>Nueva venta</h3>
                    <form onSubmit={guardarVenta}>
                        <div style={styles.grid3}>
                            <div style={styles.campo}>
                                <label style={styles.label}>Tipo documento</label>
                                <select style={styles.input} value={datosVenta.tipo_documento}
                                    onChange={e => setDatosVenta({ ...datosVenta, tipo_documento: e.target.value })}>
                                    <option value="BOLETA">Boleta</option>
                                    <option value="FACTURA">Factura</option>
                                </select>
                            </div>
                            <div style={styles.campo}>
                                <label style={styles.label}>Documento cliente</label>
                                <input style={styles.input} value={datosVenta.documento_cliente}
                                    onChange={e => setDatosVenta({ ...datosVenta, documento_cliente: e.target.value })}
                                    placeholder="DNI / CUIT" required />
                            </div>
                            <div style={styles.campo}>
                                <label style={styles.label}>Nombre cliente</label>
                                <input style={styles.input} value={datosVenta.nombre_cliente}
                                    onChange={e => setDatosVenta({ ...datosVenta, nombre_cliente: e.target.value })}
                                    placeholder="Nombre completo" required />
                            </div>
                        </div>

                        <div style={{ ...styles.grid3, marginTop: '12px', alignItems: 'flex-end' }}>
                            <div style={styles.campo}>
                                <label style={styles.label}>Producto</label>
                                <select style={styles.input} value={productoSel} onChange={e => setProductoSel(e.target.value)}>
                                    <option value="">-- Seleccionar --</option>
                                    {productos.map(p => (
                                        <option key={p.id_producto} value={p.id_producto}>
                                            {p.nombre} — Stock: {p.stock} — ${p.precio_venta}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={styles.campo}>
                                <label style={styles.label}>Cantidad</label>
                                <input style={styles.input} type="number" min="1" value={cantidadSel}
                                    onChange={e => setCantidadSel(e.target.value)} />
                            </div>
                            <button type="button" style={styles.btnSecondary} onClick={agregarDetalle}>Agregar</button>
                        </div>

                        {detalles.length > 0 && (
                            <table style={{ ...styles.table, marginTop: '16px' }}>
                                <thead>
                                    <tr>
                                        {['Producto', 'Precio', 'Cantidad', 'Subtotal', ''].map(h => (
                                            <th key={h} style={styles.th}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {detalles.map(d => (
                                        <tr key={d.id_producto}>
                                            <td style={styles.td}>{d.nombre_producto}</td>
                                            <td style={styles.td}>${d.precio_venta}</td>
                                            <td style={styles.td}>{d.cantidad}</td>
                                            <td style={styles.td}>${d.subtotal.toFixed(2)}</td>
                                            <td style={styles.td}>
                                                <button type="button" style={styles.btnDelete} onClick={() => quitarDetalle(d.id_producto)}>X</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        <div style={{ ...styles.grid3, marginTop: '16px', alignItems: 'flex-end' }}>
                            <div style={styles.campo}>
                                <label style={styles.label}>Total</label>
                                <input style={{ ...styles.input, backgroundColor: '#f0f0f0', fontWeight: 'bold' }}
                                    value={`$${montoTotal.toFixed(2)}`} readOnly />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                            <button style={styles.btnPrimary} type="submit">Confirmar venta</button>
                            <button style={styles.btnSecondary} type="button"
                                onClick={() => { setFormulario(false); setDetalles([]); setDatosVenta(ventaVacia); setError(''); }}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {ventaDetalle && (
                <div style={styles.modal}>
                    <div style={styles.modalContent}>
                        <h3>Detalle venta #{ventaDetalle.id_venta}</h3>
                        <p><b>Cliente:</b> {ventaDetalle.nombre_cliente} — {ventaDetalle.documento_cliente}</p>
                        <p><b>Tipo:</b> {ventaDetalle.tipo_documento} | <b>Fecha:</b> {new Date(ventaDetalle.fecha).toLocaleString()}</p>
                        <table style={styles.table}>
                            <thead>
                                <tr>{['Producto', 'Precio', 'Cantidad', 'Subtotal'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr>
                            </thead>
                            <tbody>
                                {ventaDetalle.detalles.map(d => (
                                    <tr key={d.id_detalle_venta}>
                                        <td style={styles.td}>{d.nombre_producto}</td>
                                        <td style={styles.td}>${d.precio_venta}</td>
                                        <td style={styles.td}>{d.cantidad}</td>
                                        <td style={styles.td}>${parseFloat(d.subtotal).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <p><b>Total:</b> ${parseFloat(ventaDetalle.monto_total).toFixed(2)}</p>
                        <button style={styles.btnSecondary} onClick={() => setVentaDetalle(null)}>Cerrar</button>
                    </div>
                </div>
            )}

            <table style={styles.table}>
                <thead>
                    <tr>
                        {['#', 'Cliente', 'Documento', 'Tipo', 'Total', 'Fecha', 'Items', 'Detalle'].map(h => (
                            <th key={h} style={styles.th}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {ventas.map(v => (
                        <tr key={v.id_venta}>
                            <td style={styles.td}>{v.id_venta}</td>
                            <td style={styles.td}>{v.nombre_cliente}</td>
                            <td style={styles.td}>{v.documento_cliente}</td>
                            <td style={styles.td}>{v.tipo_documento}</td>
                            <td style={styles.td}>${parseFloat(v.monto_total).toFixed(2)}</td>
                            <td style={styles.td}>{new Date(v.fecha).toLocaleDateString()}</td>
                            <td style={styles.td}>{v.cantidad_items}</td>
                            <td style={styles.td}>
                                <button style={styles.btnEdit} onClick={() => verDetalle(v.id_venta)}>Ver</button>
                            </td>
                        </tr>
                    ))}
                    {ventas.length === 0 && (
                        <tr><td colSpan={8} style={{ ...styles.td, textAlign: 'center', color: '#999' }}>Sin ventas registradas</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

const styles = {
    container: { maxWidth: '1100px', margin: '0 auto', padding: '24px', fontFamily: 'sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    formWrapper: { backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '8px', padding: '20px', marginBottom: '20px' },
    grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' },
    campo: { display: 'flex', flexDirection: 'column', gap: '4px' },
    label: { fontSize: '13px', color: '#555' },
    input: { padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { backgroundColor: '#1677ff', color: '#fff', padding: '10px 12px', textAlign: 'left', fontSize: '13px' },
    td: { padding: '10px 12px', borderBottom: '1px solid #eee', fontSize: '13px' },
    btnPrimary: { padding: '8px 16px', backgroundColor: '#1677ff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' },
    btnSecondary: { padding: '8px 16px', backgroundColor: '#fff', color: '#333', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' },
    btnEdit: { padding: '4px 10px', backgroundColor: '#1677ff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
    btnDelete: { padding: '4px 8px', backgroundColor: '#ff4d4f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
    error: { color: 'red', fontSize: '13px' },
    modal: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: '#fff', padding: '24px', borderRadius: '8px', maxWidth: '700px', width: '90%', maxHeight: '80vh', overflowY: 'auto' },
};

export default Ventas;
