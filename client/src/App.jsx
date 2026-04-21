import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Productos from './pages/Productos';
import Ventas from './pages/Ventas';
import PrivateRoute from './components/PrivateRoute';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/productos" element={
                    <PrivateRoute><Productos /></PrivateRoute>
                } />
                <Route path="/ventas" element={
                    <PrivateRoute><Ventas /></PrivateRoute>
                } />
                <Route path="*" element={<Navigate to="/productos" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
