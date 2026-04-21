import { Navigate } from 'react-router-dom';
import Navbar from './Navbar';

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to="/login" replace />;
    return (
        <>
            <Navbar />
            {children}
        </>
    );
};

export default PrivateRoute;
