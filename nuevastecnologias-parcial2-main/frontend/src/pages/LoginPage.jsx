import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser, registerUser } from '../utils/api';  // Agrega registerUser
import Input from '../components/Input';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';

function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);  // Estado para alternar login/registro
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [zona, setZona] = useState('');
  const [contacto, setContacto] = useState('');
  const [role, setRole] = useState('tendero');  // Por defecto tendero
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isRegister) {
        const response = await registerUser({ email, password, role, name, zona, contacto });
        login(response.user);
      } else {
        const response = await loginUser({ email, password });
        login(response.user);
      }
      navigate('/dashboard');
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h2>{isRegister ? 'Registro' : 'Login'}</h2>
      <form onSubmit={handleSubmit}>
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {isRegister && (
          <>
            <Input placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input placeholder="Zona" value={zona} onChange={(e) => setZona(e.target.value)} required />
            <Input placeholder="Contacto" value={contacto} onChange={(e) => setContacto(e.target.value)} required />
            <select value={role} onChange={(e) => setRole(e.target.value)} className="input">
              <option value="tendero">Tendero</option>
              <option value="plataforma">Plataforma</option>
              <option value="proveedor">Proveedor</option>
            </select>
          </>
        )}
        <Button type="submit" disabled={loading}>{isRegister ? 'Registrarse' : 'Iniciar Sesión'}</Button>
        {loading && <LoadingSpinner />}
        {error && <p className="error">{error}</p>}
      </form>
      <button onClick={() => setIsRegister(!isRegister)} className="link-btn">
        {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
      </button>
    </div>
  );
}

export default LoginPage;