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

    useEffect(() => { Promise.all([cargarVentas(), cargarProductos()]); }, []);

    const cargarVentas = async () => {
        try { setVentas(await getAll()); } catch { setError('Error al cargar ventas'); }
    };

    const cargarProductos = async () => {
        try { setProductos(await getProductos({ soloActivos: true })); } catch {}
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

    const quitarDetalle = (id) => setDetalles(detalles.filter(d => d.id_producto !== id));

    const guardarVenta = async (e) => {
        e.preventDefault();
        setError('');
        if (detalles.length === 0) { setError('Agregá al menos un producto'); return; }
        try {
            await create({ ...datosVenta, monto_total: montoTotal, monto_pago: montoTotal, monto_cambio: 0, detalles });
            await cargarVentas();
            setFormulario(false);
            setDatosVenta(ventaVacia);
            setDetalles([]);
        } catch (err) { setError(err.message); }
    };

    const verDetalle = async (id) => {
        try { setVentaDetalle(await getById(id)); } catch { setError('Error al cargar detalle'); }
    };

    const inputClass = "w-full px-3 py-2 border border-bb-200 rounded-lg text-sm text-bb-900 focus:outline-none focus:ring-2 focus:ring-bb-400 focus:border-bb-400";

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-bb-900">Ventas</h2>
                <button
                    onClick={() => { setFormulario(true); setError(''); }}
                    className="px-4 py-2 bg-bb-700 hover:bg-bb-800 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    + Nueva Venta
                </button>
            </div>

            {error && <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">{error}</div>}

            {formulario && (
                <div className="mb-6 p-6 bg-white border border-bb-100 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-bb-900 mb-4">Registrar nueva venta</h3>
                    <form onSubmit={guardarVenta}>
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div>
                                <label className="block mb-1 text-sm font-medium text-bb-700">Tipo documento</label>
                                <select value={datosVenta.tipo_documento} onChange={e => setDatosVenta({ ...datosVenta, tipo_documento: e.target.value })} className={inputClass}>
                                    <option value="BOLETA">Boleta</option>
                                    <option value="FACTURA">Factura</option>
                                </select>
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-bb-700">Documento cliente</label>
                                <input value={datosVenta.documento_cliente} onChange={e => setDatosVenta({ ...datosVenta, documento_cliente: e.target.value })} placeholder="DNI / CUIT" required className={inputClass} />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-bb-700">Nombre cliente</label>
                                <input value={datosVenta.nombre_cliente} onChange={e => setDatosVenta({ ...datosVenta, nombre_cliente: e.target.value })} placeholder="Nombre completo" required className={inputClass} />
                            </div>
                        </div>

                        <div className="border-t border-bb-100 pt-4 mb-4">
                            <p className="text-sm font-medium text-bb-700 mb-3">Agregar productos</p>
                            <div className="grid grid-cols-3 gap-4 items-end">
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-bb-700">Producto</label>
                                    <select value={productoSel} onChange={e => setProductoSel(e.target.value)} className={inputClass}>
                                        <option value="">-- Seleccionar --</option>
                                        {productos.map(p => (
                                            <option key={p.id_producto} value={p.id_producto}>
                                                {p.nombre} (Stock: {p.stock}) — ${p.precio_venta}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-bb-700">Cantidad</label>
                                    <input type="number" min="1" value={cantidadSel} onChange={e => setCantidadSel(e.target.value)} className={inputClass} />
                                </div>
                                <button type="button" onClick={agregarDetalle} className="px-4 py-2 bg-bb-100 hover:bg-bb-200 text-bb-800 text-sm font-medium border border-bb-200 rounded-lg transition-colors">
                                    + Agregar
                                </button>
                            </div>
                        </div>

                        {detalles.length > 0 && (
                            <div className="mb-4 overflow-hidden rounded-lg border border-bb-100">
                                <table className="w-full text-sm text-left text-bb-700">
                                    <thead className="text-xs text-white uppercase bg-bb-700">
                                        <tr>
                                            {['Producto', 'Precio', 'Cantidad', 'Subtotal', ''].map(h => (
                                                <th key={h} className="px-4 py-2">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {detalles.map(d => (
                                            <tr key={d.id_producto} className="bg-white border-b border-bb-50">
                                                <td className="px-4 py-2">{d.nombre_producto}</td>
                                                <td className="px-4 py-2">${d.precio_venta}</td>
                                                <td className="px-4 py-2">{d.cantidad}</td>
                                                <td className="px-4 py-2 font-medium text-bb-800">${d.subtotal.toFixed(2)}</td>
                                                <td className="px-4 py-2">
                                                    <button type="button" onClick={() => quitarDetalle(d.id_producto)} className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs rounded transition-colors">
                                                        Quitar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-bb-100">
                            <div className="flex gap-3">
                                <button type="submit" className="px-4 py-2 bg-bb-700 hover:bg-bb-800 text-white text-sm font-medium rounded-lg transition-colors">
                                    Confirmar venta
                                </button>
                                <button type="button" onClick={() => { setFormulario(false); setDetalles([]); setDatosVenta(ventaVacia); setError(''); }} className="px-4 py-2 bg-white hover:bg-bb-50 text-bb-700 text-sm font-medium border border-bb-200 rounded-lg transition-colors">
                                    Cancelar
                                </button>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-bb-400 uppercase font-medium">Total</p>
                                <p className="text-3xl font-bold text-bb-800">${montoTotal.toFixed(2)}</p>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {ventaDetalle && (
                <div className="fixed inset-0 bg-bb-950/60 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                        <h3 className="text-lg font-bold text-bb-900 mb-4">Detalle venta #{ventaDetalle.id_venta}</h3>
                        <div className="grid grid-cols-2 gap-3 mb-4 p-4 bg-bb-50 rounded-lg text-sm text-bb-700">
                            <p><span className="font-medium text-bb-900">Cliente:</span> {ventaDetalle.nombre_cliente}</p>
                            <p><span className="font-medium text-bb-900">Documento:</span> {ventaDetalle.documento_cliente}</p>
                            <p><span className="font-medium text-bb-900">Tipo:</span> {ventaDetalle.tipo_documento}</p>
                            <p><span className="font-medium text-bb-900">Fecha:</span> {new Date(ventaDetalle.fecha).toLocaleString()}</p>
                        </div>
                        <table className="w-full text-sm text-left text-bb-700 mb-4">
                            <thead className="text-xs text-white uppercase bg-bb-700">
                                <tr>
                                    {['Producto', 'Precio', 'Cant.', 'Subtotal'].map(h => (
                                        <th key={h} className="px-4 py-2">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {ventaDetalle.detalles.map(d => (
                                    <tr key={d.id_detalle_venta} className="border-b border-bb-50">
                                        <td className="px-4 py-2">{d.nombre_producto}</td>
                                        <td className="px-4 py-2">${d.precio_venta}</td>
                                        <td className="px-4 py-2">{d.cantidad}</td>
                                        <td className="px-4 py-2 font-medium">${parseFloat(d.subtotal).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="flex items-center justify-between pt-3 border-t border-bb-100">
                            <p className="text-xl font-bold text-bb-900">Total: ${parseFloat(ventaDetalle.monto_total).toFixed(2)}</p>
                            <button onClick={() => setVentaDetalle(null)} className="px-4 py-2 bg-white hover:bg-bb-50 text-bb-700 text-sm font-medium border border-bb-200 rounded-lg transition-colors">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white border border-bb-100 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left text-bb-700">
                    <thead className="text-xs text-white uppercase bg-bb-800">
                        <tr>
                            {['#', 'Cliente', 'Documento', 'Tipo', 'Total', 'Fecha', 'Items', 'Detalle'].map(h => (
                                <th key={h} className="px-4 py-3">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {ventas.map((v, i) => (
                            <tr key={v.id_venta} className={`border-b border-bb-50 ${i % 2 === 0 ? 'bg-white' : 'bg-bb-50'}`}>
                                <td className="px-4 py-3 font-semibold text-bb-900">#{v.id_venta}</td>
                                <td className="px-4 py-3">{v.nombre_cliente}</td>
                                <td className="px-4 py-3 text-bb-500">{v.documento_cliente}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${v.tipo_documento === 'FACTURA' ? 'bg-bb-100 text-bb-700' : 'bg-bb-50 text-bb-600'}`}>
                                        {v.tipo_documento}
                                    </span>
                                </td>
                                <td className="px-4 py-3 font-semibold text-bb-800">${parseFloat(v.monto_total).toFixed(2)}</td>
                                <td className="px-4 py-3 text-bb-500">{new Date(v.fecha).toLocaleDateString()}</td>
                                <td className="px-4 py-3">{v.cantidad_items}</td>
                                <td className="px-4 py-3">
                                    <button onClick={() => verDetalle(v.id_venta)} className="px-3 py-1 bg-bb-100 hover:bg-bb-200 text-bb-800 text-xs font-medium rounded transition-colors">
                                        Ver
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {ventas.length === 0 && (
                    <p className="text-center py-10 text-bb-300">Sin ventas registradas.</p>
                )}
            </div>
        </div>
    );
};

export default Ventas;
