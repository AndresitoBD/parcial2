// Views/ProveedorView.js
import React, { useState, useEffect } from 'react';
import { Truck, Send, CheckCircle } from 'lucide-react';

export function ProveedorPedidos({ pedidos, actualizarEstadoProveedor, proveedorNombre, zonas, cargarPedidos }) {
  const [zonaFilter, setZonaFilter] = useState('');
  const [tenderoFilter, setTenderoFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');

  // Effect to load/filter orders based on selection
  useEffect(() => {
    cargarPedidos({ zona_id: zonaFilter || undefined, tendero_id: tenderoFilter || undefined, estado: estadoFilter || undefined });
  }, [zonaFilter, tenderoFilter, estadoFilter, cargarPedidos]);

  const pedidosProveedor = pedidos.filter(p => ['asignacion', 'despacho', 'preparacion', 'enviado', 'entregado'].includes(p.estado));
  
  return (
    <div className="card">
      <div className="card-header"><h2 className="card-title"><Truck size={24} /> Pedidos Asignados a {proveedorNombre} ({pedidosProveedor.length})</h2></div>
      <div className="card-body">
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <select className="form-input" value={zonaFilter} onChange={(e) => setZonaFilter(e.target.value)}><option value="">Filtrar por zona</option>{zonas.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}</select>
          <input className="form-input" placeholder="Filtrar por tienda (tendero id)" value={tenderoFilter} onChange={(e) => setTenderoFilter(e.target.value)} />
          <select className="form-input" value={estadoFilter} onChange={(e) => setEstadoFilter(e.target.value)}><option value="">Filtrar por estado</option><option value="despacho">Despacho</option><option value="enviado">Enviado</option><option value="entregado">Entregado</option><option value="asignacion">Asignación</option></select>
        </div>

        {pedidosProveedor.length === 0 ? (
          <div className="empty-state"><Truck size={48} className="empty-state-icon" /><p className="empty-state-text">No tienes pedidos pendientes de envío.</p></div>
        ) : (
          <div className="orders-list">
            {pedidosProveedor.map(pedido => (
              <div key={pedido.id} className="order-card proveedor-card">
                <div className="order-header">
                  <div className="order-info"><span className="order-id">Pedido {pedido.id}</span><span className="order-date">Tendero: {pedido.tendero_nombre || pedido.tendero} ({pedido.tendero_contacto || pedido.contacto_tendero || ''}) - Zona: {pedido.zona_nombre || pedido.zona}</span></div>
                  <span className={`order-status ${pedido.estado}`}>{pedido.estado ? pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1) : ''}</span>
                </div>
                <div className="order-details">
                  <h4 style={{ marginBottom: '0.5rem' }}>Productos a Suministrar:</h4>
                  <ul>
                    {(pedido.productos || pedido.detalles || pedido.items || []).map(item => (
                      <li key={item.producto_id || item.id} className="order-detail-item"><span>{item.producto_nombre || item.nombre}</span><span className="order-detail-quantity">× {item.cantidad}</span></li>
                    ))}
                  </ul>
                  <div className="order-actions">
                    {pedido.estado === 'despacho' && (<button className="btn-action btn-blue" onClick={() => actualizarEstadoProveedor(pedido.id, 'enviado')}><Send size={16} /> Marcar como Enviado</button>)}
                    {pedido.estado === 'enviado' && (<button className="btn-action btn-green" onClick={() => actualizarEstadoProveedor(pedido.id, 'entregado')}><CheckCircle size={16} /> Marcar como Entregado</button>)}
                    {pedido.estado === 'asignacion' && (<span style={{ color: '#9ca3af' }}>En Preparación (Asignado)</span>)}
                    {pedido.estado === 'entregado' && (<span style={{ color: '#4CAF50' }}>Entrega Finalizada</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}