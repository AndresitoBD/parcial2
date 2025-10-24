import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx'; // FIX: Se añade la extensión .jsx
import { useNavigate } from 'react-router-dom';

function RegisterTendero() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [userData, setUserData] = useState({ name: '', email: '', password: '', address: '', zona: 'Zona A' });
    const [message, setMessage] = useState(null); // Estado para mostrar mensajes al usuario

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('Registrando...');
        
        // Nota: Esta es una simulación. Aquí iría la llamada a la API real.
        const success = await register(userData);
        
        if (success) {
            setMessage('Registro exitoso (simulado). Redirigiendo a Login...');
            // Redirigir después de mostrar el mensaje
            setTimeout(() => navigate('/login'), 1500); 
        } else {
            setMessage('Fallo en el registro (simulado).');
        }
    };

    return (
        <div className="auth-container">
            <h2>Registro de Tendero</h2>
            {/* Mostrar mensaje de estado/error */}
            {message && (
                <p style={{ 
                    padding: '10px', 
                    background: message.includes('Fallo') ? '#ffebee' : '#e0f7fa', 
                    color: message.includes('Fallo') ? '#c62828' : '#00796b', 
                    borderRadius: '4px',
                    textAlign: 'center'
                }}>
                    {message}
                </p>
            )}
            <form onSubmit={handleSubmit}>
                <input type="text" name="name" placeholder="Nombre de la Tienda" value={userData.name} onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" value={userData.email} onChange={handleChange} required />
                <input type="password" name="password" placeholder="Contraseña" value={userData.password} onChange={handleChange} required />
                <input type="text" name="address" placeholder="Dirección" value={userData.address} onChange={handleChange} required />
                <select name="zona" value={userData.zona} onChange={handleChange} required>
                    <option value="Zona A">Zona A</option>
                    <option value="Zona B">Zona B</option>
                    <option value="Zona C">Zona C</option>
                </select>
                <button type="submit">Registrar Tienda</button>
            </form>
        </div>
    );
}
export default RegisterTendero;
