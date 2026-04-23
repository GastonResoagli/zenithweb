import { useState, useEffect } from 'react';
import { getAll, registrarEntrada } from '../api/movimientos';
import { getAll as getProductos } from '../api/productos';

const Movimientos = () => {
    const [movimientos, setMovimientos] = useState([]);
    const [productos, setProductos] = useState([]);
    const [idProducto, setIdProducto] = useState('');
    const [cantidad, setCantidad] = useState(1);
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');

    useEffect(() => { Promise.all([cargarMovimientos(), cargarProductos()]); }, []);

    const cargarMovimientos = async () => {
        try { setMovimientos(await getAll()); } catch { setError('Error al cargar movimientos'); }
    };

    const cargarProductos = async () => {
        try { setProductos(await getProductos({ soloActivos: true })); } catch {}
    };

    const guardar = async (e) => {
        e.preventDefault();
        setError('');
        setExito('');
        try {
            await registrarEntrada({ id_producto: idProducto, cantidad });
            setExito('Entrada registrada correctamente');
            setIdProducto('');
            setCantidad(1);
            await cargarMovimientos();
            await cargarProductos();
        } catch (err) {
            setError(err.message);
        }
    };

    const inputClass = "w-full px-3 py-2 border border-bb-200 rounded-lg text-sm text-bb-900 focus:outline-none focus:ring-2 focus:ring-bb-400 focus:border-bb-400";

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-bb-900 mb-6">Movimientos de Stock</h2>

            <div className="mb-8 p-6 bg-white border border-bb-100 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-bb-900 mb-4">Registrar entrada de stock</h3>
                {error && <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">{error}</div>}
                {exito && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">{exito}</div>}
                <form onSubmit={guardar} className="grid grid-cols-3 gap-4 items-end">
                    <div>
                        <label className="block mb-1 text-sm font-medium text-bb-700">Producto</label>
                        <select value={idProducto} onChange={e => setIdProducto(e.target.value)} required className={inputClass}>
                            <option value="">-- Seleccionar --</option>
                            {productos.map(p => (
                                <option key={p.id_producto} value={p.id_producto}>
                                    {p.nombre} (Stock actual: {p.stock})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-bb-700">Cantidad</label>
                        <input
                            type="number" min="1" value={cantidad}
                            onChange={e => setCantidad(e.target.value)}
                            required className={inputClass}
                        />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-bb-700 hover:bg-bb-800 text-white text-sm font-medium rounded-lg transition-colors">
                        Registrar entrada
                    </button>
                </form>
            </div>

            <div className="bg-white border border-bb-100 rounded-xl shadow-sm overflow-hidden">
                <h3 className="px-6 py-4 text-base font-semibold text-bb-900 border-b border-bb-100">Historial de movimientos</h3>
                <table className="w-full text-sm text-left text-bb-700">
                    <thead className="text-xs text-white uppercase bg-bb-800">
                        <tr>
                            {['Fecha', 'Producto', 'Tipo', 'Cantidad', 'Usuario'].map(h => (
                                <th key={h} className="px-4 py-3">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {movimientos.map((m, i) => (
                            <tr key={m.id_registro} className={`border-b border-bb-50 ${i % 2 === 0 ? 'bg-white' : 'bg-bb-50'}`}>
                                <td className="px-4 py-3 text-bb-500">{new Date(m.fecha).toLocaleString('es-AR')}</td>
                                <td className="px-4 py-3">{m.nombre_producto}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${m.tipo === 'entrada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {m.tipo}
                                    </span>
                                </td>
                                <td className="px-4 py-3 font-semibold">{m.cantidad}</td>
                                <td className="px-4 py-3 text-bb-500">{m.nombre_usuario}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {movimientos.length === 0 && (
                    <p className="text-center py-10 text-bb-300">Sin movimientos registrados.</p>
                )}
            </div>
        </div>
    );
};

export default Movimientos;
