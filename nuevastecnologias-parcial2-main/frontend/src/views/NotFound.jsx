// src/views/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
    return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <h1>404 - Página No Encontrada</h1>
            <p>Lo sentimos, la página que buscas no existe.</p>
            <Link to="/" style={{ color: '#007bff', textDecoration: 'none' }}>Volver al Inicio</Link>
        </div>
    );
}

export default NotFound;