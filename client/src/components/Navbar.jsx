import { NavLink, useNavigate } from 'react-router-dom';

const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded text-sm font-medium transition-colors ${isActive ? 'bg-bb-500 text-white' : 'text-bb-100 hover:bg-bb-700'}`;

const Navbar = () => {
    const navigate = useNavigate();
    const rol = localStorage.getItem('rol');

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('rol');
        navigate('/login');
    };

    return (
        <nav className="bg-bb-800 px-6 py-3">
            <div className="flex items-center justify-between">
                <NavLink to="/dashboard" className="text-white text-xl font-bold tracking-wide hover:text-bb-200 transition-colors">
                    ZenithWeb
                </NavLink>
                <div className="flex items-center gap-2">
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
                        className="ml-4 px-4 py-2 text-sm text-bb-100 border border-bb-600 rounded hover:bg-bb-700 transition-colors"
                    >
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
