// Componente raíz: define el ruteo de toda la aplicación.
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Productos from './pages/Productos';
import Ventas from './pages/Ventas';
import Movimientos from './pages/Movimientos';
import Reportes from './pages/Reportes';
import PrivateRoute from './components/PrivateRoute';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Ruta pública: login */}
                <Route path="/login" element={<Login />} />

                {/* Rutas privadas: PrivateRoute exige token; allowedRoles restringe por rol */}
                <Route path="/dashboard" element={
                    <PrivateRoute><Dashboard /></PrivateRoute>
                } />
                <Route path="/productos" element={
                    <PrivateRoute><Productos /></PrivateRoute>
                } />
                <Route path="/ventas" element={
                    <PrivateRoute allowedRoles={['gerente', 'vendedor']}><Ventas /></PrivateRoute>
                } />
                <Route path="/movimientos" element={
                    <PrivateRoute allowedRoles={['gerente', 'operador_stock']}><Movimientos /></PrivateRoute>
                } />
                <Route path="/reportes" element={
                    <PrivateRoute allowedRoles={['gerente']}><Reportes /></PrivateRoute>
                } />

                {/* Cualquier otra URL redirige al dashboard */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
