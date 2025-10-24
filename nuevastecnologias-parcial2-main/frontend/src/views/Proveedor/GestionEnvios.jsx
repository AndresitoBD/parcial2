// src/views/Proveedor/GestionEnvios.jsx
import React, { useState, useEffect } from 'react';
import { getConsolidatedOrders, updateShippingStatus } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const SHIPPING_STATUSES = ['En Preparación', 'Enviado', 'Entregado'];

function GestionEnvios() {
    const { token } = useAuth();
    const [envios, setEnvios] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchEnvios = async () => {
        try {
            // Asume que el backend filtra los pedidos que están en estado 'En Despacho'
            const data = await getConsolidatedOrders(token); 
            setEnvios(data.filter(p => p.estado !== 'Entregado')); // Mostrar solo activos
        } catch (error) {
            console.error("Error fetching envios:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnvios();
    }, [token]);

    const handleUpdateStatus = async (pedidoId, newStatus) => {
        try {
            await updateShippingStatus(pedidoId, newStatus, token);
            alert(`Envío #${pedidoId} actualizado a: ${newStatus}`);
            fetchEnvios(); 
        } catch (error) {
            alert(`Error al actualizar estado: ${error.message}`);
        }
    };

    if (loading) return <div>Cargando pedidos consolidados...</div>;

    return (
        <div className="proveedor-envios-container">
            <h2>Gestión de Envíos Consolidados</h2>
            {envios.length === 0 ? (
                <p>No hay envíos pendientes.</p>
            ) : (
                envios.map(envio => (
                    <div key={envio.id} className={`envio-card estado-${envio.estado.toLowerCase().replace(/\s/g, '-')}`}>
                        <h3>Envío Consolidado #{envio.id}</h3>
                        <p>Estado Actual: <strong>{envio.estado}</strong></p>
                        <p>Destino (Zona): **{envio.zona}** (Asume que el backend agrega el campo `zona` al consolidado)</p>
                        
                        <select 
                            value={envio.estado} 
                            onChange={(e) => handleUpdateStatus(envio.id, e.target.value)}
                        >
                            <option value="">Seleccione Estado</option>
                            {SHIPPING_STATUSES.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                ))
            )}
        </div>
    );
}

export default GestionEnvios;