import { NavLink, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const logout = () => { localStorage.removeItem('token'); navigate('/login'); };

    return (
        <nav style={styles.nav}>
            <span style={styles.brand}>ZenithWeb</span>
            <div style={styles.links}>
                <NavLink to="/productos" style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.linkActive : {}) })}>
                    Productos
                </NavLink>
                <NavLink to="/ventas" style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.linkActive : {}) })}>
                    Ventas
                </NavLink>
            </div>
            <button style={styles.btnLogout} onClick={logout}>Cerrar sesión</button>
        </nav>
    );
};

const styles = {
    nav: { display: 'flex', alignItems: 'center', gap: '24px', padding: '0 24px', height: '56px', backgroundColor: '#1677ff', color: '#fff' },
    brand: { fontWeight: 'bold', fontSize: '18px', marginRight: 'auto' },
    links: { display: 'flex', gap: '8px' },
    link: { color: 'rgba(255,255,255,0.8)', textDecoration: 'none', padding: '6px 14px', borderRadius: '4px', fontSize: '14px' },
    linkActive: { backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' },
    btnLogout: { padding: '6px 14px', backgroundColor: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' },
};

export default Navbar;
