import { NavLink, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const logout = () => { localStorage.removeItem('token'); navigate('/login'); };

    return (
        <nav className="bg-bb-800 px-6 py-3">
            <div className="flex items-center justify-between">
                <span className="text-white text-xl font-bold tracking-wide">ZenithWeb</span>
                <div className="flex items-center gap-2">
                    <NavLink
                        to="/productos"
                        className={({ isActive }) =>
                            `px-4 py-2 rounded text-sm font-medium transition-colors ${isActive ? 'bg-bb-500 text-white' : 'text-bb-100 hover:bg-bb-700'}`
                        }
                    >
                        Productos
                    </NavLink>
                    <NavLink
                        to="/ventas"
                        className={({ isActive }) =>
                            `px-4 py-2 rounded text-sm font-medium transition-colors ${isActive ? 'bg-bb-500 text-white' : 'text-bb-100 hover:bg-bb-700'}`
                        }
                    >
                        Ventas
                    </NavLink>
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
