// src/views/Tendero/ConsultarPedidos.jsx
import React, { useState, useEffect } from 'react';
import { getTenderoOrders, markOrderReceived } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function ConsultarPedidos() {
    const { user, token } = useAuth();
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        if (!user) return;
        try {
            const data = await getTenderoOrders(user.id, token);
            setPedidos(data);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [user, token]);

    const handleMarkReceived = async (pedidoId) => {
        try {
            await markOrderReceived(pedidoId, token);
            alert('Producto(s) marcados como Recibidos.');
            fetchOrders(); // Recargar
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    if (loading) return <div>Cargando el estado de tus pedidos...</div>;

    return (
        <div className="tendero-pedidos-container">
            <h2>Mis Pedidos ({user?.name})</h2>
            {pedidos.length === 0 ? (
                <p>No tienes pedidos realizados.</p>
            ) : (
                pedidos.map(pedido => (
                    <div key={pedido.id} className={`pedido-item estado-${pedido.estado.toLowerCase().replace(/\s/g, '-')}`}>
                        <h4>Pedido #{pedido.id} | Fecha: {new Date(pedido.fecha).toLocaleDateString()}</h4>
                        <p>Estado: <strong>{pedido.estado}</strong></p>
                        <p>Total: ${pedido.total}</p>
                        
                        {/* Asume que solo se puede marcar como recibido si está "Entregado" */}
                        {(pedido.estado === 'Entregado' && !pedido.recibido) && (
                            <button onClick={() => handleMarkReceived(pedido.id)} className="btn-success">
                                Marcar como Recibido
                            </button>
                        )}
                        {pedido.recibido && <p className="success-msg">✅ Producto Recibido</p>}
                        
                        {/* Mostrar detalle de productos (opcional) */}
                        {/* <ul>{pedido.items.map(...)}</ul> */}
                    </div>
                ))
            )}
        </div>
    );
}

export default ConsultarPedidos;