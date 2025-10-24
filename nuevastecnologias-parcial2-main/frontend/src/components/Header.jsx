import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header() {
    const { isAuthenticated, user, logout } = useAuth();

    return (
        <header className="main-header">
            <nav>
                <Link to="/" className="logo">Plataforma de Pedidos</Link>
                {isAuthenticated ? (
                    <div className="nav-links">
                        <span>Bienvenido, **{user.role.toUpperCase()}**</span>
                        <button onClick={logout} className="btn-logout">Cerrar Sesión</button>
                    </div>
                ) : (
                    <div className="nav-links">
                        <Link to="/login">Iniciar Sesión</Link>
                        <Link to="/register">Registro</Link>
                    </div>
                )}
            </nav>
        </header>
    );
}
export default Header;