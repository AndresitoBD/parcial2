// Views/TenderoView.js
import React from 'react';
import { ShoppingCart, Package, CheckCircle } from 'lucide-react';

export function TenderoProductos({ productosDisponibles, carrito, agregarAlCarrito, actualizarCantidad, calcularTotal, setMostrarModal }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
      <div className="card">
        <div className="card-header"><h2 className="card-title"><ShoppingCart size={24} /> Catálogo de Productos</h2></div>
        <div className="card-body">
          <div className="products-grid">
            {productosDisponibles.map(producto => (
              <div key={producto.id} className={`product-card`} onClick={() => agregarAlCarrito(producto)}>
                <div className="product-header"><h3 className="product-name">{producto.nombre}</h3></div>
                <p className="product-description">{producto.descripcion}</p>
                <div className="product-footer">
                  <span className="product-price">${(producto.precio_base || producto.precio || 0).toLocaleString()}</span>
                  <span className="product-unit">{producto.unidad}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="cart-container">
          <h2 className="card-title" style={{ marginBottom: '1.5rem' }}><ShoppingCart size={24} /> Carrito ({carrito.length})</h2>
          {carrito.length === 0 ? (
            <div className="empty-state"><ShoppingCart size={48} className="empty-state-icon" /><p className="empty-state-text">Tu carrito está vacío</p></div>
          ) : (
            <>
              {carrito.map(item => (
                <div key={item.producto_id} className="cart-item">
                  <span className="cart-item-name">{item.nombre}</span>
                  <div className="cart-item-controls">
                    <input type="number" className="quantity-input" value={item.cantidad} onChange={(e) => actualizarCantidad(item.producto_id, parseInt(e.target.value) || 0)} min="1" />
                    <span className="cart-item-price">${(item.precio_unitario * item.cantidad).toLocaleString()}</span>
                    <button className="btn-remove" onClick={() => actualizarCantidad(item.producto_id, 0)}>Eliminar</button>
                  </div>
                </div>
              ))}
              <div className="cart-total">
                <div className="cart-total-row">
                  <span className="cart-total-label">Total:</span>
                  <span className="cart-total-amount">${calcularTotal().toLocaleString()}</span>
                </div>
              </div>
              <button className="btn-primary" onClick={() => setMostrarModal(true)}>Crear Pedido</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function TenderoPedidos({ pedidos, marcarProductoRecibido }) {
  return (
    <div className="card">
      <div className="card-header"><h2 className="card-title"><Package size={24} /> Mis Pedidos</h2></div>
      <div className="card-body">
        {pedidos.length === 0 ? (
          <div className="empty-state"><Package size={48} className="empty-state-icon" /><p className="empty-state-text">No tienes pedidos aún</p></div>
        ) : (
          <div className="orders-list">
            {pedidos.map(pedido => {
              const items = pedido.productos || pedido.detalles || pedido.items || [];
              return (
                <div key={pedido.id} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <span className="order-id">Pedido {pedido.id}</span>
                      <span className="order-date">{pedido.fecha_pedido || pedido.fecha}</span>
                    </div>
                    <span className={`order-status ${pedido.estado}`}>{pedido.estado ? pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1) : ''}</span>
                  </div>
                  <div className="order-details">
                    {items.map(item => (
                      <div key={item.producto_id || item.id} className="order-detail-item">
                        <span className="order-detail-name">{item.producto_nombre || item.nombre} <span className="order-detail-quantity">× {item.cantidad}</span></span>
                        <span>${((item.precio_unitario || item.precio || 0) * item.cantidad).toLocaleString()}</span>
                        {pedido.estado === 'entregado' && !item.recibido && (
                          <button className="btn-secondary" onClick={() => marcarProductoRecibido(pedido.id, item.producto_id || item.id)} style={{ marginLeft: '0.5rem' }}><CheckCircle size={14} /> Marcar recibido</button>
                        )}
                        {item.recibido && <span style={{ marginLeft: '0.5rem', color: '#10B981' }}>Recibido</span>}
                      </div>
                    ))}
                    <div className="cart-total" style={{ marginTop: '1rem' }}>
                      <div className="cart-total-row">
                        <span style={{ fontSize: '1rem' }}>Total:</span>
                        <span style={{ fontSize: '1.5rem' }} className="cart-total-amount">${(pedido.total || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}