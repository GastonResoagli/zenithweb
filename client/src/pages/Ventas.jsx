import { useState, useEffect } from 'react';
import { getAll, getById, create } from '../api/ventas';
import { getAll as getProductos } from '../api/productos';
import styles from './Ventas.module.css';

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



    const cargarVentas = async () => {
        try { setVentas(await getAll()); } catch { setError('Error al cargar ventas'); }
    };

    const cargarProductos = async () => {
        try { setProductos(await getProductos()); } catch (err){console.error("Error al inicializar:", err);}
    };

     useEffect(() => {
    const inicializarVentas = async () => {
        try {
            // Usamos Promise.all para que carguen al mismo tiempo
            await Promise.all([cargarVentas(), cargarProductos()]);
        } catch (err) {
            setError('Error al conectar con el servidor');
            console.error(err);
        }
    };

    inicializarVentas();
}, []); // Se mantiene el array vacío
     
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
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Ventas</h2>
                <button className={styles.btnPrimary} onClick={() => { setFormulario(true); setError(''); }}>+ Nueva venta</button>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {formulario && (
                <div className={styles.formWrapper}>
                    <h3 style={{ marginBottom: '20px' }}>🛒 Registrar Nueva Venta</h3>
                    <form onSubmit={guardarVenta}>
                        <div className={styles.grid3}>
                            <div className={styles.campo}>
                                <label className={styles.label}>Tipo documento</label>
                                <select className={styles.input} value={datosVenta.tipo_documento}
                                    onChange={e => setDatosVenta({ ...datosVenta, tipo_documento: e.target.value })}>
                                    <option value="BOLETA">Boleta</option>
                                    <option value="FACTURA">Factura</option>
                                </select>
                            </div>
                            <div className={styles.campo}>
                                <label className={styles.label}>Documento cliente</label>
                                <input className={styles.input} value={datosVenta.documento_cliente}
                                    onChange={e => setDatosVenta({ ...datosVenta, documento_cliente: e.target.value })}
                                    placeholder="DNI / CUIT" required />
                            </div>
                            <div className={styles.campo}>
                                <label className={styles.label}>Nombre cliente</label>
                                <input className={styles.input} value={datosVenta.nombre_cliente}
                                    onChange={e => setDatosVenta({ ...datosVenta, nombre_cliente: e.target.value })}
                                    placeholder="Nombre completo" required />
                            </div>
                        </div>

                        <div className={styles.form} style={{ borderTop: '1px solid #eee', paddingTop: '20px', marginTop: '20px' }}>
                            <div className={styles.grid3} style={{ alignItems: 'flex-end' }}>
                                <div className={styles.campo}>
                                    <label className={styles.label}>Producto</label>
                                    <select className={styles.input} value={productoSel} onChange={e => setProductoSel(e.target.value)}>
                                        <option value="">-- Seleccionar producto --</option>
                                        {productos.map(p => (
                                            <option key={p.id_producto} value={p.id_producto}>
                                                {p.nombre} (Stock: {p.stock}) — ${p.precio_venta}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.campo}>
                                    <label className={styles.label}>Cantidad</label>
                                    <input className={styles.input} type="number" min="1" value={cantidadSel}
                                        onChange={e => setCantidadSel(e.target.value)} />
                                </div>
                                <button type="button" className={styles.btnSecondary} onClick={agregarDetalle}>+ Agregar Item</button>
                            </div>
                        </div>

                        {detalles.length > 0 && (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        {['Producto', 'Precio', 'Cantidad', 'Subtotal', 'Acción'].map(h => (
                                            <th key={h} className={styles.th}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {detalles.map(d => (
                                        <tr key={d.id_producto}>
                                            <td className={styles.td}>{d.nombre_producto}</td>
                                            <td className={styles.td}>${d.precio_venta}</td>
                                            <td className={styles.td}>{d.cantidad}</td>
                                            <td className={styles.td}>${d.subtotal.toFixed(2)}</td>
                                            <td className={styles.td}>
                                                <button type="button" className={styles.btnDelete} onClick={() => quitarDetalle(d.id_producto)}>Quitar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', alignItems: 'center', gap: '20px' }}>
                             <div className={styles.campo}>
                                <span className={styles.label}>Monto Total</span>
                                <div className={`${styles.input} ${styles.totalHighlight}`}>${montoTotal.toFixed(2)}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                            <button className={styles.btnPrimary} type="submit">Finalizar Venta</button>
                            <button className={styles.btnSecondary} type="button"
                                onClick={() => { setFormulario(false); setDetalles([]); setDatosVenta(ventaVacia); setError(''); }}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Modal de Detalle */}
            {ventaDetalle && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3 style={{ fontSize: '22px', marginBottom: '16px' }}>Detalle de Venta #{ventaDetalle.id_venta}</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                            <p><b>Cliente:</b> {ventaDetalle.nombre_cliente}</p>
                            <p><b>Documento:</b> {ventaDetalle.documento_cliente}</p>
                            <p><b>Tipo:</b> {ventaDetalle.tipo_documento}</p>
                            <p><b>Fecha:</b> {new Date(ventaDetalle.fecha).toLocaleString()}</p>
                        </div>
                        <table className={styles.table}>
                            <thead>
                                <tr>{['Producto', 'Precio', 'Cant.', 'Subtotal'].map(h => <th key={h} className={styles.th}>{h}</th>)}</tr>
                            </thead>
                            <tbody>
                                {ventaDetalle.detalles.map(d => (
                                    <tr key={d.id_detalle_venta}>
                                        <td className={styles.td}>{d.nombre_producto}</td>
                                        <td className={styles.td}>${d.precio_venta}</td>
                                        <td className={styles.td}>{d.cantidad}</td>
                                        <td className={styles.td}>${parseFloat(d.subtotal).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div style={{ textAlign: 'right', marginTop: '20px' }}>
                            <p style={{ fontSize: '18px' }}><b>Total Facturado:</b> ${parseFloat(ventaDetalle.monto_total).toFixed(2)}</p>
                            <button className={styles.btnPrimary} onClick={() => setVentaDetalle(null)} style={{ marginTop: '10px' }}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabla Principal de Ventas */}
            <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            {['# ID', 'Cliente', 'Tipo', 'Total', 'Fecha', 'Items', 'Acciones'].map(h => (
                                <th key={h} className={styles.th}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {ventas.map(v => (
                            <tr key={v.id_venta}>
                                <td className={styles.td}><b>{v.id_venta}</b></td>
                                <td className={styles.td}>
                                    <div>{v.nombre_cliente}</div>
                                    <small style={{ color: '#888' }}>{v.documento_cliente}</small>
                                </td>
                                <td className={styles.td}>{v.tipo_documento}</td>
                                <td className={styles.td}><b>${parseFloat(v.monto_total).toFixed(2)}</b></td>
                                <td className={styles.td}>{new Date(v.fecha).toLocaleDateString()}</td>
                                <td className={styles.td}>{v.cantidad_items}</td>
                                <td className={styles.td}>
                                    <button className={styles.btnPrimary} style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => verDetalle(v.id_venta)}>Ver detalle</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Ventas;