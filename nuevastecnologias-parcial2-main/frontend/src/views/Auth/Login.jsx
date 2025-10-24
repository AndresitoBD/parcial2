// src/views/Auth/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(credentials);
        if (success) {
            // La redirección automática se maneja en App.jsx al cambiar el estado de autenticación
        } else {
            alert('Fallo en la autenticación. Verifique sus credenciales.');
        }
    };

    return (
        <div className="auth-container">
            <h2>Iniciar Sesión</h2>
            <form onSubmit={handleSubmit}>
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                <input type="password" name="password" placeholder="Contraseña" onChange={handleChange} required />
                <button type="submit" disabled={loading}>
                    {loading ? 'Cargando...' : 'Entrar'}
                </button>
            </form>
            <p>¿Eres Tendero nuevo? <a href="/register">Regístrate aquí</a></p>
        </div>
    );
}
export default Login;