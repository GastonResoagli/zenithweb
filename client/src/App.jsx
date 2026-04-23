import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Productos from './pages/Productos';
import Ventas from './pages/Ventas';
import Reportes from './pages/Reportes';
import PrivateRoute from './components/PrivateRoute';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={
                    <PrivateRoute><Dashboard /></PrivateRoute>
                } />
                <Route path="/productos" element={
                    <PrivateRoute><Productos /></PrivateRoute>
                } />
                <Route path="/ventas" element={
                    <PrivateRoute allowedRoles={['gerente', 'vendedor']}><Ventas /></PrivateRoute>
                } />
                <Route path="/reportes" element={
                    <PrivateRoute allowedRoles={['gerente']}><Reportes /></PrivateRoute>
                } />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
