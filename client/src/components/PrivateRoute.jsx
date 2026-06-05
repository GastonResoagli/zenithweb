// Guarda de rutas: protege las páginas privadas según autenticación y rol.
import { Navigate } from 'react-router-dom';
import Navbar from './Navbar';

const PrivateRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');

    // Sin token -> al login (no autenticado)
    if (!token) return <Navigate to="/login" replace />;
    // Con token pero sin el rol permitido -> al dashboard (no autorizado para esa sección)
    if (allowedRoles && !allowedRoles.includes(rol)) {
        return <Navigate to="/dashboard" replace />;
    }

    // Acceso permitido: muestra el Navbar y el contenido de la página
    return (
        <>
            <Navbar />
            {children}
        </>
    );
};

export default PrivateRoute;
