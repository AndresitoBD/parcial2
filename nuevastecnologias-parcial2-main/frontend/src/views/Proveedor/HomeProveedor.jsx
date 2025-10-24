// src/views/Proveedor/HomeProveedor.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function HomeProveedor() {
    const { user } = useAuth();
    return (
        <div className="dashboard-proveedor">
            <h2>Panel de Proveedor</h2>
            <p>Bienvenido, {user?.name}. Recibe y gestiona los pedidos consolidados por la plataforma.</p>
            <h3>Acciones</h3>
            <nav className="nav-actions">
                <Link to="/proveedor/envios" className="btn-action">Gestionar Estado de Envíos</Link>
            </nav>
        </div>
    );
}
export default HomeProveedor;