// src/views/Plataforma/HomePlataforma.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function HomePlataforma() {
    const { user } = useAuth();
    return (
        <div className="dashboard-plataforma">
            <h2>Panel Central de la Plataforma</h2>
            <p>Bienvenido, {user?.name}. Tienes acceso completo a la gestión de pedidos y productos.</p>
            <h3>Gestión</h3>
            <nav className="nav-actions">
                <Link to="/plataforma/consolidar" className="btn-action">Consolidar y Despachar Pedidos</Link>
                <Link to="/plataforma/productos" className="btn-action">Crear/Gestionar Productos</Link>
                <Link to="/plataforma/resumen" className="btn-action">Ver Resumen de Pedidos</Link>
            </nav>
        </div>
    );
}
export default HomePlataforma;