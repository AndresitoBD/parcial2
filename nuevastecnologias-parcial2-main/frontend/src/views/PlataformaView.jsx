// Views/PlataformaView.js
import React, { useState, useEffect } from 'react';
import { PlusCircle, Layers, FileText, Send, TrendingUp, Home, Clock, CheckCircle } from 'lucide-react';

// Assuming StatCard is imported from Components/ReusableComponents
import { StatCard } from '../Components/ReusableComponents'; 

export function PlataformaGestionProductos({ productos, crearNuevoProducto, nuevoProducto, setNuevoProducto, proveedores }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      <div className="card">
        <div className="card-header"><h2 className="card-title"><PlusCircle size={24} /> Crear Nuevo Producto</h2></div>
        <div className="card-body">
          <form onSubmit={crearNuevoProducto}>
            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input type="text" className="form-input" value={nuevoProducto.nombre} onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea className="form-input" value={nuevoProducto.descripcion} onChange={(e) => setNuevoProducto({ ...nuevoProducto, descripcion: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Precio Base ($)</label>
              <input type="number" step="0.01" className="form-input" value={nuevoProducto.precio_base} onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio_base: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Proveedor (opcional)</label>
              <select className="form-input" value={nuevoProducto.proveedor_id || ''} onChange={(e) => setNuevoProducto({ ...nuevoProducto, proveedor_id: e.target.value })}>
                <option value="">Sin proveedor</option>
                {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Unidad</label>
              <input type="text" className="form-input" value={nuevoProducto.unidad} onChange={(e) => setNuevoProducto({ ...nuevoProducto, unidad: e.target.value })} placeholder="ej: kg, unidad, paquete" />
            </div>
            <button type="submit" className="btn-primary">Crear Producto</button>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h2 className="card-title"><Layers size={24} /> Productos Creados ({productos.length})</h2></div>
        <div className="card-body" style={{ maxHeight: '500px', overflowY: 'auto' }}>
          <ul className="product-list">
            {productos.map(p => (
              <li key={p.id} className="product-list-item">
                <strong>{p.nombre}</strong> (${(p.precio_base || 0).toLocaleString()} / {p.unidad}) 
                {p.proveedor_id ? <em> - Proveedor ID: {p.proveedor_id}</em> : null} 
                <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>{p.descripcion}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function PlataformaPedidos({ pedidos, groupedByZoneConsolidation, consolidarPedidos, asignarProveedor, despacharPedidos, proveedores, zonas, cargarPedidos, timeRemaining }) {
  const pedidosFiltrados = pedidos.filter(p => ['pendiente', 'consolidacion', 'asignacion', 'despacho'].includes(p.estado));
  const [seleccionados, setSeleccionados] = useState([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState('');
  const [zonaSeleccionada, setZonaSeleccionada] = useState('');

  useEffect(() => {
    setSeleccionados([]);
  }, [pedidos]);

  function toggleSeleccion(id) {
    setSeleccionados(sel => sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]);
  }
  
  // Custom hook-like effect to reload orders when filter changes (based on original App.js logic)
  useEffect(() => {
    cargarPedidos({ zona_id: zonaSeleccionada || undefined }); // Only zone filter applied here in view logic
  }, [zonaSeleccionada, cargarPedidos]); // Re-fetch all orders for the current platform filters

  return (
    <div className="card">
      <div className="card-header"><h2 className="card-title"><FileText size={24} /> Gestión de Pedidos Globales ({pedidosFiltrados.length})</h2></div>
      <div className="card-body">
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select className="form-input" style={{ width: 'auto' }} value={zonaSeleccionada} onChange={(e) => setZonaSeleccionada(e.target.value)}>
            <option value="">Filtrar por zona</option>
            {zonas.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
          </select>
          <button className="btn-action btn-yellow" onClick={() => consolidarPedidos(seleccionados)} disabled={seleccionados.length === 0}>Consolidar seleccionados</button>
          <select className="form-input" style={{ width: 'auto' }} value={proveedorSeleccionado} onChange={(e) => setProveedorSeleccionado(e.target.value)}>
            <option value="">Seleccionar Proveedor</option>
            {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
          <button className="btn-action btn-blue" onClick={() => asignarProveedor(seleccionados, proveedorSeleccionado)} disabled={seleccionados.length === 0 || !proveedorSeleccionado}>Asignar Proveedor</button>
          <button className="btn-action btn-purple" onClick={() => despacharPedidos(seleccionados)} disabled={seleccionados.length === 0}>Marcar Despacho</button>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <h4>Ventanas de consolidación por zona</h4>
          {groupedByZoneConsolidation.length === 0 ? <div style={{ color: '#6b7280' }}>No hay consolidaciones activas.</div> : (
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {groupedByZoneConsolidation.map(gr => (
                <div key={gr.zona_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: 6 }}>
                  <div>
                    <div><strong>{gr.zona_nombre || gr.zona_id}</strong></div>
                    <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Pedidos en ventana: {gr.pedidos.length} — Fecha límite: {gr.fecha_limite ? new Date(gr.fecha_limite).toLocaleString() : 'N/A'}</div>
                    <div style={{ fontSize: '0.9rem', color: '#ef4444' }}>{gr.fecha_limite ? `Tiempo restante: ${timeRemaining(gr.fecha_limite)}` : ''}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <select className="form-input" value={proveedorSeleccionado} onChange={(e) => setProveedorSeleccionado(e.target.value)}>
                      <option value="">Seleccionar Proveedor</option>
                      {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                    <button className="btn-action btn-blue" onClick={() => {
                      if (!proveedorSeleccionado) { alert('Selecciona proveedor'); return; }
                      asignarProveedor(gr.pedidos, proveedorSeleccionado);
                    }}>Asignar proveedor a ventana</button>
                    <button className="btn-action btn-purple" onClick={() => {
                      despacharPedidos(gr.pedidos);
                    }}>Marcar despacho</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="orders-list">
          {pedidosFiltrados.filter(p => !zonaSeleccionada || String(p.zona_id) === String(zonaSeleccionada)).map(pedido => (
            <div key={pedido.id} className="order-card plataforma-card">
              <div className="order-header">
                <div className="order-info" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input type="checkbox" checked={seleccionados.includes(pedido.id)} onChange={() => toggleSeleccion(pedido.id)} />
                  <div>
                    <div><strong>Pedido {pedido.id}</strong></div>
                    <div style={{ fontSize: '0.9rem' }}>{pedido.fecha_pedido || pedido.fecha} - Tendero: {pedido.tendero_nombre || pedido.tendero} (Zona: {pedido.zona_nombre || pedido.zona})</div>
                    {pedido.proveedor_nombre && <div style={{ fontSize: '0.9rem' }}>Proveedor: {pedido.proveedor_nombre}</div>}
                    {pedido.fecha_limite && <div style={{ fontSize: '0.9rem', color: '#ef4444' }}>Fecha límite envío: {new Date(pedido.fecha_limite).toLocaleString()}</div>}
                  </div>
                </div>
                <span className={`order-status ${pedido.estado}`}>{pedido.estado ? pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1) : ''}</span>
              </div>
              <div className="order-details">
                <h4 style={{ marginBottom: '0.5rem' }}>Productos:</h4>
                <ul>
                  {(pedido.productos || pedido.detalles || pedido.items || []).map(item => (
                    <li key={item.producto_id || item.id} className="order-detail-item"><span>{item.producto_nombre || item.nombre}</span><span className="order-detail-quantity">× {item.cantidad}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PlataformaEstadisticas({ resumenPorZona, statsGlobales }) {
  return (
    <div>
      <h2 className="card-title" style={{ marginBottom: '1.5rem' }}><TrendingUp size={24} /> Resumen General</h2>
      <div className="stats-grid">
        <StatCard icon={FileText} label="Total Pedidos" value={statsGlobales.totalPedidos} color="yellow" />
        <StatCard icon={Clock} label="Pendientes" value={statsGlobales.pendientes} color="blue" />
        <StatCard icon={Layers} label="En Consolidación" value={statsGlobales.consolidacion} color="orange" />
        <StatCard icon={CheckCircle} label="Entregados/Recibidos" value={statsGlobales.entregados} color="green" />
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header"><h2 className="card-title"><Home size={24} /> Resumen de Pedidos por Zona</h2></div>
        <div className="card-body">
          <table className="data-table">
            <thead>
              <tr><th>Zona</th><th>Total Pedidos</th><th>Pendientes</th><th>Entregados</th><th>Volumen Venta ($)</th></tr>
            </thead>
            <tbody>
              {resumenPorZona.map(z => (
                <tr key={z.id}><td><strong>{z.nombre}</strong></td><td>{z.totalPedidos}</td><td>{z.pedidosPendientes}</td><td>{z.pedidosEntregados}</td><td>${z.totalVentas}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}