import { useState, useEffect } from 'react';
import * as api from '../api/productos';

const camposVacios = {
    nombre: '', descripcion: '', stock: '', precio_compra: '', precio_venta: '', id_categoria: '',
};

const Productos = () => {
    const [productos, setProductos] = useState([]);
    const [formulario, setFormulario] = useState(null);
    const [datos, setDatos] = useState(camposVacios);
    const [error, setError] = useState('');

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        try { setProductos(await api.getAll()); }
        catch { setError('Error al cargar productos'); }
    };

    const abrirNuevo = () => { setDatos(camposVacios); setFormulario('nuevo'); };
    const abrirEditar = (p) => { setDatos(p); setFormulario('editar'); };
    const cerrar = () => { setFormulario(null); setError(''); };
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

    const eliminar = async (id) => {
        if (!confirm('¿Eliminar este producto?')) return;
        try { await api.remove(id); await cargar(); }
        catch { setError('Error al eliminar'); }
    };

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

            {formulario && (
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
                                        className="w-full px-3 py-2 border border-bb-200 rounded-lg text-sm text-bb-900 focus:outline-none focus:ring-2 focus:ring-bb-400 focus:border-bb-400"
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

            <div className="bg-white border border-bb-100 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left text-bb-700">
                    <thead className="text-xs text-white uppercase bg-bb-800">
                        <tr>
                            {['ID', 'Nombre', 'Descripción', 'Stock', 'P. Compra', 'P. Venta', 'Categoría', 'Acciones'].map(h => (
                                <th key={h} className="px-4 py-3">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {productos.map((p, i) => (
                            <tr key={p.id_producto} className={`border-b border-bb-50 ${i % 2 === 0 ? 'bg-white' : 'bg-bb-50'}`}>
                                <td className="px-4 py-3 font-semibold text-bb-900">#{p.id_producto}</td>
                                <td className="px-4 py-3">{p.nombre}</td>
                                <td className="px-4 py-3 text-bb-500">{p.descripcion}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${p.stock <= 5 ? 'bg-red-100 text-red-700' : 'bg-bb-100 text-bb-700'}`}>
                                        {p.stock}
                                    </span>
                                </td>
                                <td className="px-4 py-3">${p.precio_compra}</td>
                                <td className="px-4 py-3 font-medium text-bb-700">${p.precio_venta}</td>
                                <td className="px-4 py-3">{p.id_categoria}</td>
                                <td className="px-4 py-3 flex gap-2">
                                    <button onClick={() => abrirEditar(p)} className="px-3 py-1 bg-bb-100 hover:bg-bb-200 text-bb-800 text-xs font-medium rounded transition-colors">
                                        Editar
                                    </button>
                                    <button onClick={() => eliminar(p.id_producto)} className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded transition-colors">
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {productos.length === 0 && (
                    <p className="text-center py-10 text-bb-300">No hay productos registrados.</p>
                )}
            </div>
        </div>
    );
};

export default Productos;
