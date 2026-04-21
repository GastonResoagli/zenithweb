import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';

const Login = () => {
    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await login(usuario, password);
            localStorage.setItem('token', data.token);
            navigate('/productos');
        } catch (err) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bb-50">
            <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-8 border border-bb-100">
                <div className="mb-6 text-center">
                    <h2 className="text-3xl font-bold text-bb-900">ZenithWeb</h2>
                    <p className="text-sm text-bb-500 mt-1">Iniciá sesión para continuar</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium text-bb-800">Usuario</label>
                        <input
                            type="text"
                            placeholder="correo@ejemplo.com"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-bb-200 rounded-lg text-sm text-bb-900 focus:outline-none focus:ring-2 focus:ring-bb-400 focus:border-bb-400"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-bb-800">Contraseña</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-bb-200 rounded-lg text-sm text-bb-900 focus:outline-none focus:ring-2 focus:ring-bb-400 focus:border-bb-400"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 px-4 bg-bb-700 hover:bg-bb-800 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
