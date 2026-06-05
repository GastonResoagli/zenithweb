// Barra de navegación superior, presente en todas las páginas privadas.
import { NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';

// Resalta el link de la sección activa
const linkClass = ({ isActive }) =>
    `nav-link ${isActive ? 'active' : ''}`;

const Navbar = () => {
    const navigate = useNavigate();
    const rol = localStorage.getItem('rol'); // según el rol se muestran u ocultan opciones

    // Cierra sesión: borra el token y el rol y vuelve al login
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('rol');
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <NavLink to="/dashboard" className="navbar-brand">
                    ZenithWeb
                </NavLink>
                <div className="navbar-links">
                    <NavLink to="/productos" className={linkClass}>
                        Productos
                    </NavLink>
                    {/* Ventas: solo visible para gerente y vendedor */}
                    {(rol === 'gerente' || rol === 'vendedor') && (
                        <NavLink to="/ventas" className={linkClass}>
                            Ventas
                        </NavLink>
                    )}
                    {/* Reportes: solo visible para gerente */}
                    {rol === 'gerente' && (
                        <NavLink to="/reportes" className={linkClass}>
                            Reportes
                        </NavLink>
                    )}
                    <button
                        onClick={logout}
                        className="btn-logout"
                    >
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
