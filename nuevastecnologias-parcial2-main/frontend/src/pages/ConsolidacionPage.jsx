import React, { useState, useEffect } from 'react';
import { getAllPedidos, consolidatePedidos, assignProveedor, createConsolidatedPedido } from '../utils/api';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';

function ConsolidacionPage() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllPedidos();
      setPedidos(data);
    } catch (err) {
      setError('Error cargando pedidos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConsolidate = async () => {
    setLoading(true);
    setError('');
    try {
      await consolidatePedidos();
      alert('Pedidos consolidados.');
      fetchPedidos();
    } catch (err) {
      setError('Error consolidando: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignProveedor = async (productoId) => {
    setLoading(true);
    setError('');
    try {
      await assignProveedor(productoId);
      alert('Proveedor asignado.');
      fetchPedidos();
    } catch (err) {
      setError('Error asignando proveedor: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConsolidated = async () => {
    setLoading(true);
    setError('');
    try {
      await createConsolidatedPedido();
      alert('Pedido consolidado enviado.');
      fetchPedidos();
    } catch (err) {
      setError('Error enviando pedido: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Resumen por zona (agrupado)
  const resumenPorZona = pedidos.reduce((acc, p) => {
    if (!acc[p.zona]) acc[p.zona] = { total: 0, estados: {} };
    acc[p.zona].total++;
    acc[p.zona].estados[p.estado] = (acc[p.zona].estados[p.estado] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <h2>Gestión de Pedidos</h2>
      <Button onClick={handleConsolidate} disabled={loading}>Consolidar Pedidos</Button>
      <Button onClick={handleCreateConsolidated} disabled={loading}>Enviar Pedido Consolidado</Button>
      {loading && <LoadingSpinner />}
      {error && <p className="error">{error}</p>}

      <h3>Pedidos Pendientes</h3>
      <ul>
        {pedidos.map(p => (
          <li key={p.id}>
            {p.producto} - Zona: {p.zona} - Estado: {p.estado}
            {p.estado === 'consolidado' && <Button onClick={() => handleAssignProveedor(p.productoId)}>Asignar Proveedor</Button>}
          </li>
        ))}
      </ul>

      <h3>Resumen por Zona</h3>
      <ul>
        {Object.entries(resumenPorZona).map(([zona, data]) => (
          <li key={zona}>
            Zona {zona}: {data.total} pedidos - Estados: {JSON.stringify(data.estados)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ConsolidacionPage;