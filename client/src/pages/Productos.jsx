import { useState, useEffect } from 'react';
import * as api from '../api/productos';

const camposVacios = {
    nombre: '', descripcion: '', stock: '', precio_compra: '', precio_venta: '', id_categoria: '',
};

const Productos = () => {
    const [productos, setProductos] = useState([]);
    const [formulario, setFormulario] = useState(null); // null = cerrado, {} = nuevo, {id,...} = editar
    const [datos, setDatos] = useState(camposVacios);
    const [error, setError] = useState('');

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        try {
            const data = await api.getAll();
            setProductos(data);
        } catch {
            setError('Error al cargar productos');
        }
    };

    const abrirNuevo = () => { setDatos(camposVacios); setFormulario('nuevo'); };
    const abrirEditar = (p) => { setDatos(p); setFormulario('editar'); };
    const cerrar = () => { setFormulario(null); setError(''); };

    const handleChange = (e) => setDatos({ ...datos, [e.target.name]: e.target.value });

    const guardar = async (e) => {
        e.preventDefault();
        try {
            if (formulario === 'nuevo') {
                await api.create(datos);
            } else {
                await api.update(datos.id_producto, datos);
            }
            await cargar();
            cerrar();
        } catch (err) {
            setError(err.message);
        }
    };

    const eliminar = async (id) => {
        if (!confirm('¿Eliminar este producto?')) return;
        try {
            await api.remove(id);
            await cargar();
        } catch {
            setError('Error al eliminar');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={{ margin: 0 }}>Productos</h2>
                <button style={styles.btnPrimary} onClick={abrirNuevo}>+ Nuevo</button>
            </div>

            {error && <p style={styles.error}>{error}</p>}

            {formulario && (
                <form onSubmit={guardar} style={styles.form}>
                    <h3 style={{ margin: '0 0 12px' }}>
                        {formulario === 'nuevo' ? 'Nuevo producto' : 'Editar producto'}
                    </h3>
                    <div style={styles.grid}>
                        {[
                            { name: 'nombre', label: 'Nombre' },
                            { name: 'descripcion', label: 'Descripción' },
                            { name: 'stock', label: 'Stock', type: 'number' },
                            { name: 'precio_compra', label: 'Precio compra', type: 'number' },
                            { name: 'precio_venta', label: 'Precio venta', type: 'number' },
                            { name: 'id_categoria', label: 'Categoría', type: 'number' },
                        ].map(({ name, label, type = 'text' }) => (
                            <div key={name} style={styles.campo}>
                                <label style={styles.label}>{label}</label>
                                <input
                                    style={styles.input}
                                    name={name}
                                    type={type}
                                    value={datos[name]}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <button style={styles.btnPrimary} type="submit">Guardar</button>
                        <button style={styles.btnSecondary} type="button" onClick={cerrar}>Cancelar</button>
                    </div>
                </form>
            )}

            <table style={styles.table}>
                <thead>
                    <tr>
                        {['ID', 'Nombre', 'Descripción', 'Stock', 'P. Compra', 'P. Venta', 'Categoría', 'Acciones'].map(h => (
                            <th key={h} style={styles.th}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {productos.map(p => (
                        <tr key={p.id_producto} style={styles.tr}>
                            <td style={styles.td}>{p.id_producto}</td>
                            <td style={styles.td}>{p.nombre}</td>
                            <td style={styles.td}>{p.descripcion}</td>
                            <td style={styles.td}>{p.stock}</td>
                            <td style={styles.td}>${p.precio_compra}</td>
                            <td style={styles.td}>${p.precio_venta}</td>
                            <td style={styles.td}>{p.id_categoria}</td>
                            <td style={styles.td}>
                                <button style={styles.btnEdit} onClick={() => abrirEditar(p)}>Editar</button>
                                <button style={styles.btnDelete} onClick={() => eliminar(p.id_producto)}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                    {productos.length === 0 && (
                        <tr><td colSpan={8} style={{ ...styles.td, textAlign: 'center', color: '#999' }}>Sin productos</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

const styles = {
    container: { maxWidth: '1100px', margin: '0 auto', padding: '24px', fontFamily: 'sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    form: { backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '8px', padding: '20px', marginBottom: '20px' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' },
    campo: { display: 'flex', flexDirection: 'column', gap: '4px' },
    label: { fontSize: '13px', color: '#555' },
    input: { padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { backgroundColor: '#1677ff', color: '#fff', padding: '10px 12px', textAlign: 'left', fontSize: '13px' },
    td: { padding: '10px 12px', borderBottom: '1px solid #eee', fontSize: '13px' },
    tr: { backgroundColor: '#fff' },
    btnPrimary: { padding: '8px 16px', backgroundColor: '#1677ff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' },
    btnSecondary: { padding: '8px 16px', backgroundColor: '#fff', color: '#333', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' },
    btnEdit: { marginRight: '6px', padding: '4px 10px', backgroundColor: '#faad14', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
    btnDelete: { padding: '4px 10px', backgroundColor: '#ff4d4f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
    error: { color: 'red', fontSize: '13px' },
};

export default Productos;
