import React, { useState, useEffect } from 'react';
import { getConsolidatedPedidos, updateEstadoEnvio } from '../utils/api';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';

function ProveedorPage() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filtroZona, setFiltroZona] = useState('');
  const [filtroTienda, setFiltroTienda] = useState('');

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getConsolidatedPedidos();
      setPedidos(data);
    } catch (err) {
      setError('Error cargando pedidos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEstado = async (pedidoId, estado) => {
    setLoading(true);
    setError('');
    try {
      await updateEstadoEnvio(pedidoId, estado);
      fetchPedidos();
    } catch (err) {
      setError('Error actualizando estado: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar pedidos
  const pedidosFiltrados = pedidos.filter(p =>
    (!filtroZona || p.zona.includes(filtroZona)) &&
    (!filtroTienda || p.tienda.includes(filtroTienda))
  );

  return (
    <div>
      <h2>Pedidos Consolidados</h2>
      <input
        type="text"
        placeholder="Filtrar por Zona"
        value={filtroZona}
        onChange={(e) => setFiltroZona(e.target.value)}
        className="input"
      />
      <input
        type="text"
        placeholder="Filtrar por Tienda"
        value={filtroTienda}
        onChange={(e) => setFiltroTienda(e.target.value)}
        className="input"
      />
      {loading && <LoadingSpinner />}
      {error && <p className="error">{error}</p>}

      <ul>
        {pedidosFiltrados.map(p => (
          <li key={p.id}>
            Zona: {p.zona} - Tienda: {p.tienda} - Estado: {p.estado}
            <select onChange={(e) => handleUpdateEstado(p.id, e.target.value)} className="input">
              <option value="">Cambiar Estado</option>
              <option value="en preparación">En Preparación</option>
              <option value="enviado">Enviado</option>
              <option value="entregado">Entregado</option>
            </select>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProveedorPage;