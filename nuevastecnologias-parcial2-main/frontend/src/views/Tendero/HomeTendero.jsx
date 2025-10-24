// src/views/Tendero/HomeTendero.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function HomeTendero() {
    const { user } = useAuth();
    return (
        <div className="dashboard-tendero">
            <h2>Bienvenido, {user?.name}</h2>
            <p>Zona de operación: {user?.zona}</p>
            <h3>Acciones Rápidas</h3>
            <nav className="nav-actions">
                <Link to="/tendero/pedido" className="btn-action">Realizar Nuevo Pedido</Link>
                <Link to="/tendero/pedidos" className="btn-action">Consultar Estado de Pedidos</Link>
            </nav>
        </div>
    );
}
export default HomeTendero;