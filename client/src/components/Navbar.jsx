import { NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';

const linkClass = ({ isActive }) =>
    `nav-link ${isActive ? 'active' : ''}`;

const Navbar = () => {
    const navigate = useNavigate();
    const rol = localStorage.getItem('rol');

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
                    {(rol === 'gerente' || rol === 'vendedor') && (
                        <NavLink to="/ventas" className={linkClass}>
                            Ventas
                        </NavLink>
                    )}
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
