// Página de inicio de sesión.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { iniciarSesion } from '../api/auth';
import './Login.css';

const Login = () => {
    // Estados del formulario: campos, mensaje de error y bandera de carga
    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Envía las credenciales; si el login es correcto guarda token y rol y va al dashboard
    const handleSubmit = async (e) => {
        e.preventDefault(); // evita que el form recargue la página
        setError('');
        setLoading(true);
        try {
            const data = await iniciarSesion(usuario, password);
            // Guardamos token y rol en localStorage para usarlos en el resto de la app
            localStorage.setItem('token', data.token);
            localStorage.setItem('rol', data.rol);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false); // pase lo que pase, dejamos de mostrar "Ingresando..."
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <h2 className="login-title">ZenithWeb</h2>
                    <p className="login-subtitle">Iniciá sesión para continuar</p>
                </div>

                {error && (
                    <div className="alert-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label className="form-label">Usuario</label>
                        <input
                            type="text"
                            placeholder="correo@ejemplo.com"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Contraseña</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="form-input"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                    >
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
