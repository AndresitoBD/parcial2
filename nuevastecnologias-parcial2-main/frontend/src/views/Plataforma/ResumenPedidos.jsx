// src/views/Plataforma/ResumenPedidos.jsx
import React, { useState, useEffect } from 'react';
import { getAllOrders } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function ResumenPedidos() {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [summary, setSummary] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAndProcessOrders = async () => {
            try {
                const allOrders = await getAllOrders(token);
                setOrders(allOrders);
                processSummary(allOrders);
            } catch (error) {
                console.error("Error fetching all orders:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAndProcessOrders();
    }, [token]);

    // Función para agrupar y resumir los datos (Lógica General)
    const processSummary = (orders) => {
        const summaryMap = {}; // { "Zona A": { "Pendiente": 5, "En Consolidación": 2, ... }, ... }

        orders.forEach(pedido => {
            const zona = pedido.tendero?.zona || 'Sin Zona'; // Asume que el backend incluye el objeto tendero
            const estado = pedido.estado;

            if (!summaryMap[zona]) {
                summaryMap[zona] = {};
            }
            summaryMap[zona][estado] = (summaryMap[zona][estado] || 0) + 1;
        });

        setSummary(summaryMap);
    };

    if (loading) return <div>Cargando resumen de pedidos global...</div>;

    return (
        <div className="resumen-pedidos-container">
            <h2>Resumen de Pedidos por Zona y Estado</h2>
            
            {Object.keys(summary).length === 0 ? (
                <p>No hay datos de pedidos para mostrar el resumen.</p>
            ) : (
                <table className="summary-table">
                    <thead>
                        <tr>
                            <th>Zona</th>
                            {/* Definir las columnas de estado dinámicamente o fijas */}
                            <th>Pendiente</th>
                            <th>En Consolidación</th>
                            <th>En Asignación</th>
                            <th>En Despacho</th>
                            <th>Enviado</th>
                            <th>Entregado</th>
                            <th>Total Pedidos</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(summary).map(zona => {
                            const totalZona = Object.values(summary[zona]).reduce((sum, count) => sum + count, 0);
                            const row = summary[zona];
                            return (
                                <tr key={zona}>
                                    <td><strong>{zona}</strong></td>
                                    <td>{row['Pendiente'] || 0}</td>
                                    <td>{row['En Consolidación'] || 0}</td>
                                    <td>{row['En Asignación'] || 0}</td>
                                    <td>{row['En Despacho'] || 0}</td>
                                    <td>{row['Enviado'] || 0}</td>
                                    <td>{row['Entregado'] || 0}</td>
                                    <td><strong>{totalZona}</strong></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default ResumenPedidos;