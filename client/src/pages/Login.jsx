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
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleSubmit} style={styles.form}>
                <h2 style={styles.title}>ZenithWeb</h2>
                {error && <p style={styles.error}>{error}</p>}
                <input
                    style={styles.input}
                    type="text"
                    placeholder="Usuario"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    required
                />
                <input
                    style={styles.input}
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button style={styles.button} type="submit" disabled={loading}>
                    {loading ? 'Ingresando...' : 'Ingresar'}
                </button>
            </form>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '100vh', backgroundColor: '#f0f2f5',
    },
    form: {
        display: 'flex', flexDirection: 'column', gap: '16px',
        backgroundColor: '#fff', padding: '40px', borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)', width: '320px',
    },
    title: { textAlign: 'center', margin: 0, color: '#333' },
    input: {
        padding: '10px 12px', borderRadius: '4px',
        border: '1px solid #ccc', fontSize: '14px',
    },
    button: {
        padding: '10px', backgroundColor: '#1677ff', color: '#fff',
        border: 'none', borderRadius: '4px', fontSize: '14px',
        cursor: 'pointer',
    },
    error: { color: 'red', margin: 0, fontSize: '13px', textAlign: 'center' },
};

export default Login;
