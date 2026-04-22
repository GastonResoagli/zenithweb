import { Navigate } from 'react-router-dom';
import Navbar from './Navbar';

const PrivateRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');

    if (!token) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(rol)) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <>
            <Navbar />
            {children}
        </>
    );
};

export default PrivateRoute;
