// Página de ABM (alta/baja/modificación) de productos.
import { useState, useEffect } from 'react';
import * as api from '../api/productos';
import * as catApi from '../api/categorias';
import './Productos.css';
const { cambiarEstado } = api;

// Valores iniciales del formulario (campos en blanco)
const camposVacios = {
    nombre: '', descripcion: '', stock: '', precio_compra: '', precio_venta: '', id_categoria: '',
};

const Productos = () => {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]); // categorías para el selector y la tabla
    const [formulario, setFormulario] = useState(null); // 'nuevo' | 'editar' | null
    const [datos, setDatos] = useState(camposVacios);   // datos del producto en edición/creación
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');
    const [modalConfirm, setModalConfirm] = useState(null); // producto pendiente de cambio de estado
    const [catForm, setCatForm] = useState(false);      // muestra/oculta el alta de categoría
    const [nuevaCat, setNuevaCat] = useState('');       // descripción de la categoría a crear
    const [catError, setCatError] = useState('');       // error específico del alta de categoría

    // Trae la lista de productos del backend y la guarda en el estado
     const cargar = async () => {
        try { setProductos(await api.obtenerProductos()); }
        catch { setError('Error al cargar productos'); }
    };

    // Trae las categorías (para el selector del formulario y mostrar el nombre en la tabla)
    const cargarCategorias = async () => {
        try { setCategorias(await catApi.obtenerCategorias()); }
        catch { /* el selector quedará vacío si falla */ }
    };

    // Devuelve la descripción de una categoría a partir de su ID (para la tabla)
    const nombreCategoria = (id) =>
        categorias.find(c => c.id_categoria === Number(id))?.descripcion ?? id;

    // Carga inicial al montar la página
    useEffect(() => { cargar(); cargarCategorias(); }, []);

    // Crea una categoría nueva y refresca el selector; muestra el aviso si está duplicada
    const guardarCategoria = async (e) => {
        e.preventDefault();
        setCatError('');
        try {
            await catApi.crear(nuevaCat);
            setNuevaCat('');
            setCatForm(false);
            await cargarCategorias();
            setExito('Categoría creada correctamente');
        } catch (err) { setCatError(err.message); }
    };



    const pedirConfirmacion = (p) => {
        // Guardamos el producto completo para mostrar nombre y estado en el modal
        setModalConfirm(p);
    };

    const confirmarToggle = async () => {
        const p = modalConfirm;
        setModalConfirm(null);
        try {
            // Invertimos el estado actual: si estaba false lo ponemos true y viceversa
            await cambiarEstado(p.id_producto, p.estado === false);
            await cargar();
        } catch { setError('Error al cambiar el estado del producto'); }
    };

    // Helpers para abrir/cerrar el formulario y actualizar sus campos
    const abrirNuevo = () => { setDatos(camposVacios); setFormulario('nuevo'); setError(''); setExito(''); };
    const abrirEditar = (p) => { setDatos(p); setFormulario('editar'); setError(''); setExito(''); };
    const cerrar = () => { setFormulario(null); setError(''); setExito(''); };
    const handleChange = (e) => setDatos({ ...datos, [e.target.name]: e.target.value });

    // Guarda el formulario: crea o actualiza según el modo, recarga la lista y cierra
    const guardar = async (e) => {
        e.preventDefault();
        try {
            if (formulario === 'nuevo') await api.crear(datos);
            else await api.actualizar(datos.id_producto, datos);
            await cargar();
            cerrar();
        } catch (err) { setError(err.message); }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h2 className="page-title">Productos</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => { setCatForm(true); setNuevaCat(''); setCatError(''); }}
                        className="btn-secondary"
                    >
                        + Nueva Categoría
                    </button>
                    <button
                        onClick={abrirNuevo}
                        className="btn-primary-sm"
                    >
                        + Nuevo Producto
                    </button>
                </div>
            </div>

            {error && <div className="alert-error">{error}</div>}
            {exito && <div className="alert-success">{exito}</div>}

            {/* Formulario de alta de categoría */}
            {catForm && (
                <div className="card">
                    <h3 className="card-title">Nueva categoría</h3>
                    {catError && <div className="alert-error">{catError}</div>}
                    <form onSubmit={guardarCategoria}>
                        <div className="form-group">
                            <label className="form-label">Descripción</label>
                            <input
                                name="descripcion"
                                value={nuevaCat}
                                onChange={(e) => setNuevaCat(e.target.value)}
                                required
                                className="form-input"
                                placeholder="Ej: Paneles monocristalinos"
                            />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn-primary">Guardar</button>
                            <button type="button" onClick={() => setCatForm(false)} className="btn-secondary">
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Formulario de creación y edición de producto */}
            {formulario && (
                <div className="card">
                    <h3 className="card-title">
                        {formulario === 'nuevo' ? 'Nuevo producto' : 'Editar producto'}
                    </h3>
                    <form onSubmit={guardar}>
                        <div className="form-grid">
                            {[
                                { name: 'nombre', label: 'Nombre' },
                                { name: 'descripcion', label: 'Descripción' },
                                { name: 'stock', label: 'Stock', type: 'number' },
                                { name: 'precio_compra', label: 'Precio compra', type: 'number' },
                                { name: 'precio_venta', label: 'Precio venta', type: 'number' },
                                { name: 'id_categoria', label: 'Categoría', type: 'select' },
                            ].map(({ name, label, type = 'text' }) => (
                                <div key={name} className="form-group">
                                    <label className="form-label">{label}</label>
                                    {type === 'select' ? (
                                        <select
                                            name={name}
                                            value={datos[name]}
                                            onChange={handleChange}
                                            required
                                            className="form-input"
                                        >
                                            <option value="">Seleccionar categoría...</option>
                                            {categorias.map(c => (
                                                <option key={c.id_categoria} value={c.id_categoria}>
                                                    {c.descripcion}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            name={name}
                                            type={type}
                                            value={datos[name]}
                                            onChange={handleChange}
                                            required
                                            className="form-input"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn-primary">
                                Guardar
                            </button>
                            <button type="button" onClick={cerrar} className="btn-secondary">
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}



            {/* Tabla de productos */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            {['ID', 'Nombre', 'Descripción', 'Estado', 'Stock', 'P. Compra', 'P. Venta', 'Categoría', 'Acciones'].map(h => (
                                <th key={h}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {productos.map((p, i) => {
                            // estado !== false para tratar null/undefined como activo (misma lógica que el backend)
                            const activo = p.estado !== false;
                            const rowClass = activo ? (i % 2 === 0 ? 'row-even' : 'row-odd') : 'row-inactive';
                            return (
                            <tr key={p.id_producto} className={rowClass}>
                                <td style={{fontWeight: 600, color: 'var(--color-bb-900)'}}>#{p.id_producto}</td>
                                <td>{p.nombre}</td>
                                <td style={{color: 'var(--color-bb-500)'}}>{p.descripcion}</td>
                                <td>
                                    <span className={`badge ${activo ? 'active' : 'inactive'}`}>
                                        {activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td>
                                    {/* Stock en rojo cuando llega a 5 o menos como alerta de reposición */}
                                    <span className={`badge ${p.stock <= 5 ? 'stock-low' : 'stock-ok'}`}>
                                        {p.stock}
                                    </span>
                                </td>
                                <td>${p.precio_compra}</td>
                                <td style={{fontWeight: 500, color: 'var(--color-bb-700)'}}>${p.precio_venta}</td>
                                <td>{nombreCategoria(p.id_categoria)}</td>
                                <td className="actions-cell">
                                    {activo && (
                                        <button onClick={() => abrirEditar(p)} className="action-btn edit">
                                            Editar
                                        </button>
                                    )}
                                    <button
                                        onClick={() => pedirConfirmacion(p)}
                                        className={`action-btn ${activo ? 'deactivate' : 'activate'}`}
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
                    <p className="empty-state">No hay productos registrados.</p>
                )}
            </div>

            {/* Modal de confirmación para cambio de estado del producto */}
            {modalConfirm && (() => {
                const activo = modalConfirm.estado !== false;
                return (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className={`modal-icon-container ${activo ? 'danger' : 'success'}`}>
                                {activo ? (
                                    <svg className="modal-icon danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                ) : (
                                    <svg className="modal-icon success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                            </div>
                            <h3 className="modal-title">
                                {activo ? 'Dar de baja producto' : 'Dar de alta producto'}
                            </h3>
                            <p className="modal-desc">
                                {activo
                                    ? <>¿Querés dar de baja <span style={{fontWeight: 500, color: 'var(--color-bb-800)'}}>"{modalConfirm.nombre}"</span>? El producto quedará inactivo.</>
                                    : <>¿Querés dar de alta <span style={{fontWeight: 500, color: 'var(--color-bb-800)'}}>"{modalConfirm.nombre}"</span>? El producto volverá a estar disponible.</>
                                }
                            </p>
                            <div className="modal-actions">
                                <button
                                    onClick={() => setModalConfirm(null)}
                                    className="btn-secondary"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmarToggle}
                                    className={activo ? 'btn-danger' : 'btn-success'}
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
