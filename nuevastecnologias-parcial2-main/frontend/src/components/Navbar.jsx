import React from 'react';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import '../styles/components.css';

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <h1>Plataforma de Pedidos</h1>
      {user && (
        <div>
          <span>Bienvenido, {user.name} ({user.role})</span>
          <Button onClick={logout}>Cerrar Sesión</Button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;