import { useState, useEffect } from 'react';
import * as api from '../api/productos';
const { setEstado } = api;
import { registrarEntrada } from '../api/movimientos';

const camposVacios = {
    nombre: '', descripcion: '', stock: '', precio_compra: '', precio_venta: '', id_categoria: '',
};

const Productos = () => {
    const [productos, setProductos] = useState([]);
    const [formulario, setFormulario] = useState(null);
    const [datos, setDatos] = useState(camposVacios);
    const [cantidadEntrada, setCantidadEntrada] = useState(1);
    const [precioEntrada, setPrecioEntrada] = useState('');
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');
    const [modalConfirm, setModalConfirm] = useState(null);

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        try { setProductos(await api.getAll()); }
        catch { setError('Error al cargar productos'); }
    };

    const pedirConfirmacion = (p) => {
        setModalConfirm(p);
    };

    const confirmarToggle = async () => {
        const p = modalConfirm;
        setModalConfirm(null);
        try {
            await setEstado(p.id_producto, p.estado === false);
            await cargar();
        } catch { setError('Error al cambiar el estado del producto'); }
    };

    const abrirNuevo = () => { setDatos(camposVacios); setFormulario('nuevo'); setError(''); setExito(''); };
    const abrirEditar = (p) => { setDatos(p); setFormulario('editar'); setError(''); setExito(''); };
    const abrirEntrada = (p) => { setDatos(p); setCantidadEntrada(1); setPrecioEntrada(''); setFormulario('entrada'); setError(''); setExito(''); };
    const cerrar = () => { setFormulario(null); setError(''); setExito(''); };
    const handleChange = (e) => setDatos({ ...datos, [e.target.name]: e.target.value });

    const guardar = async (e) => {
        e.preventDefault();
        try {
            if (formulario === 'nuevo') await api.create(datos);
            else await api.update(datos.id_producto, datos);
            await cargar();
            cerrar();
        } catch (err) { setError(err.message); }
    };

    const guardarEntrada = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await registrarEntrada({ id_producto: datos.id_producto, cantidad: cantidadEntrada, precio_compra: precioEntrada });
            setExito(`Entrada registrada: +${cantidadEntrada} unidades de "${datos.nombre}"`);
            await cargar();
            setFormulario(null);
        } catch (err) { setError(err.message); }
    };

    const inputClass = "w-full px-3 py-2 border border-bb-200 rounded-lg text-sm text-bb-900 focus:outline-none focus:ring-2 focus:ring-bb-400 focus:border-bb-400";

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-bb-900">Productos</h2>
                <button
                    onClick={abrirNuevo}
                    className="px-4 py-2 bg-bb-700 hover:bg-bb-800 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    + Nuevo Producto
                </button>
            </div>

            {error && <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">{error}</div>}
            {exito && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">{exito}</div>}

            {formulario && formulario !== 'entrada' && (
                <div className="mb-6 p-6 bg-white border border-bb-100 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-bb-900 mb-4">
                        {formulario === 'nuevo' ? 'Nuevo producto' : 'Editar producto'}
                    </h3>
                    <form onSubmit={guardar}>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            {[
                                { name: 'nombre', label: 'Nombre' },
                                { name: 'descripcion', label: 'Descripción' },
                                { name: 'stock', label: 'Stock', type: 'number' },
                                { name: 'precio_compra', label: 'Precio compra', type: 'number' },
                                { name: 'precio_venta', label: 'Precio venta', type: 'number' },
                                { name: 'id_categoria', label: 'Categoría (ID)', type: 'number' },
                            ].map(({ name, label, type = 'text' }) => (
                                <div key={name}>
                                    <label className="block mb-1 text-sm font-medium text-bb-700">{label}</label>
                                    <input
                                        name={name}
                                        type={type}
                                        value={datos[name]}
                                        onChange={handleChange}
                                        required
                                        className={inputClass}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <button type="submit" className="px-4 py-2 bg-bb-700 hover:bg-bb-800 text-white text-sm font-medium rounded-lg transition-colors">
                                Guardar
                            </button>
                            <button type="button" onClick={cerrar} className="px-4 py-2 bg-white hover:bg-bb-50 text-bb-700 text-sm font-medium border border-bb-200 rounded-lg transition-colors">
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {formulario === 'entrada' && (() => {
                const stockActual = parseFloat(datos.stock) || 0;
                const precioActual = parseFloat(datos.precio_compra) || 0;
                const cant = parseInt(cantidadEntrada) || 0;
                const precio = parseFloat(precioEntrada) || 0;
                const promedio = cant > 0 && precio > 0
                    ? ((stockActual * precioActual + cant * precio) / (stockActual + cant)).toFixed(2)
                    : null;
                return (
                    <div className="mb-6 p-6 bg-white border border-bb-100 rounded-xl shadow-sm">
                        <h3 className="text-lg font-semibold text-bb-900 mb-1">Registrar entrada de stock</h3>
                        <p className="text-sm text-bb-500 mb-4">
                            Producto: <span className="font-medium text-bb-800">{datos.nombre}</span>
                            <span className="ml-3 text-bb-400">Stock actual: <span className="font-medium text-bb-700">{stockActual}</span></span>
                            <span className="ml-3 text-bb-400">Precio compra actual: <span className="font-medium text-bb-700">${precioActual}</span></span>
                        </p>
                        <form onSubmit={guardarEntrada} className="flex items-end gap-4 flex-wrap">
                            <div>
                                <label className="block mb-1 text-sm font-medium text-bb-700">Cantidad a ingresar</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={cantidadEntrada}
                                    onChange={e => setCantidadEntrada(e.target.value)}
                                    required
                                    className={`w-36 ${inputClass}`}
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-bb-700">Precio de compra</label>
                                <input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={precioEntrada}
                                    onChange={e => setPrecioEntrada(e.target.value)}
                                    required
                                    placeholder="0.00"
                                    className={`w-36 ${inputClass}`}
                                />
                            </div>
                            {promedio && (
                                <div className="px-4 py-2 bg-bb-50 border border-bb-200 rounded-lg text-sm">
                                    <span className="text-bb-500">Nuevo precio promedio: </span>
                                    <span className="font-semibold text-bb-800">${promedio}</span>
                                </div>
                            )}
                            <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">
                                Confirmar entrada
                            </button>
                            <button type="button" onClick={cerrar} className="px-4 py-2 bg-white hover:bg-bb-50 text-bb-700 text-sm font-medium border border-bb-200 rounded-lg transition-colors">
                                Cancelar
                            </button>
                        </form>
                    </div>
                );
            })()}

            <div className="bg-white border border-bb-100 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left text-bb-700">
                    <thead className="text-xs text-white uppercase bg-bb-800">
                        <tr>
                            {['ID', 'Nombre', 'Descripción', 'Estado', 'Stock', 'P. Compra', 'P. Venta', 'Categoría', 'Acciones'].map(h => (
                                <th key={h} className="px-4 py-3">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {productos.map((p, i) => {
                            const activo = p.estado !== false;
                            return (
                            <tr key={p.id_producto} className={`border-b border-bb-50 ${activo ? (i % 2 === 0 ? 'bg-white' : 'bg-bb-50') : 'bg-gray-100 opacity-60'}`}>
                                <td className="px-4 py-3 font-semibold text-bb-900">#{p.id_producto}</td>
                                <td className="px-4 py-3">{p.nombre}</td>
                                <td className="px-4 py-3 text-bb-500">{p.descripcion}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${p.stock <= 5 ? 'bg-red-100 text-red-700' : 'bg-bb-100 text-bb-700'}`}>
                                        {p.stock}
                                    </span>
                                </td>
                                <td className="px-4 py-3">${p.precio_compra}</td>
                                <td className="px-4 py-3 font-medium text-bb-700">${p.precio_venta}</td>
                                <td className="px-4 py-3">{p.id_categoria}</td>
                                <td className="px-4 py-3 flex gap-2">
                                    {activo && (
                                        <button onClick={() => abrirEntrada(p)} className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-medium rounded transition-colors">
                                            + Entrada
                                        </button>
                                    )}
                                    {activo && (
                                        <button onClick={() => abrirEditar(p)} className="px-3 py-1 bg-bb-100 hover:bg-bb-200 text-bb-800 text-xs font-medium rounded transition-colors">
                                            Editar
                                        </button>
                                    )}
                                    <button
                                        onClick={() => pedirConfirmacion(p)}
                                        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${activo ? 'bg-red-100 hover:bg-red-200 text-red-700' : 'bg-green-100 hover:bg-green-200 text-green-700'}`}
                                    >
                                        {activo ? 'Dar de baja' : 'Dar de alta'}
                                    </button>
                                </td>
                            </tr>
                            );
                        })}
                    </tbody>
                </table>
                {productos.length === 0 && (
                    <p className="text-center py-10 text-bb-300">No hay productos registrados.</p>
                )}
            </div>
            {modalConfirm && (() => {
                const activo = modalConfirm.estado !== false;
                return (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto ${activo ? 'bg-red-100' : 'bg-green-100'}`}>
                                {activo ? (
                                    <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                            </div>
                            <h3 className="text-base font-semibold text-bb-900 text-center mb-1">
                                {activo ? 'Dar de baja producto' : 'Dar de alta producto'}
                            </h3>
                            <p className="text-sm text-bb-500 text-center mb-6">
                                {activo
                                    ? <>¿Querés dar de baja <span className="font-medium text-bb-800">"{modalConfirm.nombre}"</span>? El producto quedará inactivo.</>
                                    : <>¿Querés dar de alta <span className="font-medium text-bb-800">"{modalConfirm.nombre}"</span>? El producto volverá a estar disponible.</>
                                }
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setModalConfirm(null)}
                                    className="flex-1 px-4 py-2 bg-white hover:bg-bb-50 text-bb-700 text-sm font-medium border border-bb-200 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmarToggle}
                                    className={`flex-1 px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors ${activo ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                                >
                                    {activo ? 'Dar de baja' : 'Dar de alta'}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default Productos;
