// Página principal tras el login: muestra accesos a los módulos según el rol.
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

// Etiquetas legibles para cada rol (lo que se muestra en pantalla)
const ROLES_LABELS = {
    gerente: 'Gerente',
    operador_stock: 'Operador de Stock',
    vendedor: 'Vendedor',
};

// Definición de los módulos disponibles. Cada uno declara qué roles pueden verlo.
const MODULOS = [
    {
        id: 'productos',
        titulo: 'Administrar Productos',
        descripcion: 'Consultá, agregá, modificá y eliminá productos del inventario.',
        ruta: '/productos',
        roles: ['gerente', 'operador_stock', 'vendedor'],
        icono: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
        ),
    },
    {
        id: 'ventas',
        titulo: 'Ventas',
        descripcion: 'Registrá nuevas ventas y consultá el historial de movimientos.',
        ruta: '/ventas',
        roles: ['gerente', 'vendedor'],
        icono: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
        ),
    },
    {
        id: 'movimientos',
        titulo: 'Movimientos de Stock',
        descripcion: 'Registrá entradas de stock y consultá el historial de movimientos del inventario.',
        ruta: '/movimientos',
        roles: ['gerente', 'operador_stock'],
        icono: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-9L21 7.5m0 0L16.5 3M21 7.5H7.5" />
            </svg>
        ),
    },
    {
        id: 'reportes',
        titulo: 'Reportes',
        descripcion: 'Generá reportes PDF de movimientos de inventario con filtros.',
        ruta: '/reportes',
        roles: ['gerente'],
        icono: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
        ),
    },
];

const Dashboard = () => {
    const navigate = useNavigate();
    const rol = localStorage.getItem('rol');
    // Filtra los módulos para mostrar solo los permitidos al rol del usuario logueado
    const modulos = MODULOS.filter(m => m.roles.includes(rol));

    return (
        <div className="dashboard-page">
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <h1 className="dashboard-title">Panel de Control</h1>
                    <p className="dashboard-subtitle">
                        Rol: <span className="role-badge">{ROLES_LABELS[rol] ?? rol}</span>
                    </p>
                </div>

                <div className="modules-grid">
                    {modulos.map(m => (
                        <button
                            key={m.id}
                            onClick={() => navigate(m.ruta)}
                            className="module-card"
                        >
                            <div className="module-icon">
                                {m.icono}
                            </div>
                            <h2 className="module-title">{m.titulo}</h2>
                            <p className="module-desc">{m.descripcion}</p>
                            <span className="module-action">
                                Ir a {m.titulo} →
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
