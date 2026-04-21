import { useState, useEffect } from 'react';
import * as api from '../api/productos';
import styles from './Productos.module.css';

const camposVacios = {
    nombre: '', descripcion: '', stock: '', precio_compra: '', precio_venta: '', id_categoria: '',
};

const Productos = () => {
    const [productos, setProductos] = useState([]);
    const [formulario, setFormulario] = useState(null); 
    const [datos, setDatos] = useState(camposVacios);
    const [error, setError] = useState('');


    const cargar = async () => {
        try {
            const data = await api.getAll();
            setProductos(data);
        } catch {
            setError('Error al cargar productos');
        }
    };
     useEffect(() => { const iniciarlizarCarga = async () =>{
        await cargar();
     };
     iniciarlizarCarga();
    }, []);

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
        <div className={styles.container}>
            <header className={styles.header}>
                <h2>Productos</h2>
                <button className={styles.btnPrimary} onClick={abrirNuevo}>+ Nuevo Producto</button>
            </header>

            {error && <div className={styles.error}>{error}</div>}

            {formulario && (
                <form onSubmit={guardar} className={styles.form}>
                    <h3 style={{ marginBottom: '20px' }}>
                        {formulario === 'nuevo' ? '✨ Crear Nuevo' : '📝 Editar Producto'}
                    </h3>
                    <div className={styles.grid}>
                        {[
                            { name: 'nombre', label: 'Nombre' },
                            { name: 'descripcion', label: 'Descripción' },
                            { name: 'stock', label: 'Stock', type: 'number' },
                            { name: 'precio_compra', label: 'Precio compra', type: 'number' },
                            { name: 'precio_venta', label: 'Precio venta', type: 'number' },
                            { name: 'id_categoria', label: 'Categoría (ID)', type: 'number' },
                        ].map(({ name, label, type = 'text' }) => (
                            <div key={name} className={styles.campo}>
                                <label className={styles.label}>{label}</label>
                                <input
                                    className={styles.input}
                                    name={name}
                                    type={type}
                                    value={datos[name]}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className={styles.btnPrimary} type="submit">Guardar Cambios</button>
                        <button className={styles.btnSecondary} type="button" onClick={cerrar}>Cancelar</button>
                    </div>
                </form>
            )}

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            {['ID', 'Nombre', 'Descripción', 'Stock', 'P. Compra', 'P. Venta', 'Categoría', 'Acciones'].map(h => (
                                <th key={h} className={styles.th}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {productos.map(p => (
                            <tr key={p.id_producto} className={styles.tr}>
                                <td className={styles.td}><strong>#{p.id_producto}</strong></td>
                                <td className={styles.td}>{p.nombre}</td>
                                <td className={styles.td}>{p.descripcion}</td>
                                <td className={styles.td}>{p.stock}</td>
                                <td className={styles.td}>${p.precio_compra}</td>
                                <td className={styles.td}>${p.precio_venta}</td>
                                <td className={styles.td}>{p.id_categoria}</td>
                                <td className={styles.td}>
                                    <button className={styles.btnEdit} onClick={() => abrirEditar(p)}>Editar</button>
                                    <button className={styles.btnDelete} onClick={() => eliminar(p.id_producto)}>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {productos.length === 0 && (
                    <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No hay productos registrados.</p>
                )}
            </div>
        </div>
    );
};

export default Productos;