import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProductos, createPedido, getPedidosByTendero, updatePedidoEstado } from '../utils/api';
import Input from '../components/Input';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';

function PedidosPage() {
  const { user } = useAuth();
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [selectedProducto, setSelectedProducto] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProductos();
    fetchPedidos();
  }, []);

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const data = await getProductos();
      setProductos(data);
    } catch (err) {
      alert('Error cargando productos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPedidos = async () => {
    setLoading(true);
    try {
      const data = await getPedidosByTendero(user.id);
      setPedidos(data);
    } catch (err) {
      alert('Error cargando pedidos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePedido = async () => {
    if (!selectedProducto || cantidad <= 0) return alert('Selecciona producto y cantidad válida.');
    setLoading(true);
    try {
      await createPedido({ tenderoId: user.id, productoId: selectedProducto, cantidad });
      alert('Pedido creado.');
      fetchPedidos();
    } catch (err) {
      alert('Error creando pedido: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarRecibido = async (pedidoId) => {
    setLoading(true);
    try {
      await updatePedidoEstado(pedidoId, 'recibido');
      fetchPedidos();
    } catch (err) {
      alert('Error actualizando: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Hacer Pedido</h2>
      <select onChange={(e) => setSelectedProducto(e.target.value)} className="input">
        <option value="">Seleccionar Producto</option>
        {productos.map(p => <option key={p.id} value={p.id}>{p.nombre} - ${p.precio}</option>)}
      </select>
      <Input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} min="1" />
      <Button onClick={handlePedido} disabled={loading}>Crear Pedido</Button>

      <h2>Mis Pedidos</h2>
      {loading && <LoadingSpinner />}
      <ul>
        {pedidos.map(p => (
          <li key={p.id}>
            {p.producto} - Cantidad: {p.cantidad} - Estado: {p.estado}
            {p.estado === 'entregado' && <Button onClick={() => handleMarcarRecibido(p.id)}>Marcar Recibido</Button>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PedidosPage;