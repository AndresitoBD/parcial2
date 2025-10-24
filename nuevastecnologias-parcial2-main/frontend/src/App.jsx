import React, { useEffect, useState, useMemo } from 'react';
import {
  ShoppingCart, Package, TrendingUp, Clock, CheckCircle, Truck,
  FileText, LogOut, Store, Building2, PlusCircle, Layers, Send, Home
} from 'lucide-react';

const API_BASE = 'http://localhost:5000';
const TOKEN_KEY = 'token';

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [vista, setVista] = useState('productos');
  const [tabActivo, setTabActivo] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formLogin, setFormLogin] = useState({ email: '', password: '' });
  const [formRegistro, setFormRegistro] = useState({ nombre: '', email: '', password: '', rol: 'tendero', contacto: '', zona_id: '' });

  const [productos, setProductos] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [proveedores, setProveedores] = useState([]);

  const [carrito, setCarrito] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);

  const [nuevoProducto, setNuevoProducto] = useState({ nombre: '', descripcion: '', precio_base: '', unidad: 'unidad', proveedor_id: '' });

  useEffect(() => {
    cargarZonas();
    const t = localStorage.getItem(TOKEN_KEY);
    if (t) verificarTokenYPerfil(t);
  }, []);

  useEffect(() => {
    if (usuario) {
      cargarProductos();
      cargarProveedores();
      cargarPedidos();
      setVista(usuario.rol === 'tendero' ? 'productos' : 'pedidos');
    } else {
      setProductos([]);
      setProveedores([]);
      setPedidos([]);
    }
  }, [usuario]);

  const authHeaders = () => {
    const t = localStorage.getItem(TOKEN_KEY);
    const base = { 'Content-Type': 'application/json' };
    return t ? { Authorization: `Bearer ${t}`, ...base } : base;
  };

  async function verificarTokenYPerfil(token) {
    try {
      const res = await fetch(`${API_BASE}/api/auth/profile`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        localStorage.removeItem(TOKEN_KEY);
        setUsuario(null);
        return;
      }
      const data = await res.json();
      setUsuario(data.user);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setUsuario(null);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    if (!formLogin.email || !formLogin.password) {
      setError('Por favor completa todos los campos');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formLogin.email, password: formLogin.password })
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(data.message || data.error || 'Login fallido');
        return;
      }
      localStorage.setItem(TOKEN_KEY, data.token);
      setUsuario(data.user);
      setFormLogin({ email: '', password: '' });
    } catch {
      setLoading(false);
      setError('Error conectando al servidor');
    }
  }

  async function handleRegistro(e) {
    e.preventDefault();
    setError('');
    if (!formRegistro.nombre || !formRegistro.email || !formRegistro.password || (formRegistro.rol === 'tendero' && !formRegistro.zona_id)) {
      setError('Por favor completa todos los campos requeridos para el rol');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formRegistro)
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(data.message || data.error || 'Registro fallido');
        return;
      }
      localStorage.setItem(TOKEN_KEY, data.token);
      setUsuario(data.user);
      setFormRegistro({ nombre: '', email: '', password: '', rol: 'tendero', contacto: '', zona_id: '' });
    } catch {
      setLoading(false);
      setError('Error conectando al servidor');
    }
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY);
    setUsuario(null);
    setCarrito([]);
    setVista('productos');
  }

  async function cargarZonas() {
    try {
      const res = await fetch(`${API_BASE}/api/zonas`);
      if (!res.ok) return;
      const data = await res.json();
      setZonas(data.data || data);
    } catch {}
  }

  async function cargarProveedores() {
    try {
      const res = await fetch(`${API_BASE}/api/usuarios?rol=proveedor`, { headers: authHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      setProveedores(data.data || data);
    } catch {}
  }

  async function cargarProductos() {
    try {
      const res = await fetch(`${API_BASE}/api/productos`, { headers: authHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      setProductos(data.data || data);
    } catch {}
  }

  async function cargarPedidos(opts = {}) {
    if (!usuario) return;
    try {
      let url = `${API_BASE}/api/pedidos`;
      if (usuario.rol === 'tendero') url = `${API_BASE}/api/pedidos/mis-pedidos`;
      else if (usuario.rol === 'plataforma') {
        const params = new URLSearchParams();
        if (opts.zona_id) params.append('zona_id', opts.zona_id);
        if (opts.estado) params.append('estado', opts.estado);
        const q = params.toString();
        url = `${API_BASE}/api/pedidos/todos${q ? `?${q}` : ''}`;
      } else if (usuario.rol === 'proveedor') {
        const params = new URLSearchParams();
        if (opts.estado) params.append('estado', opts.estado);
        if (opts.zona_id) params.append('zona_id', opts.zona_id);
        if (opts.tendero_id) params.append('tendero_id', opts.tendero_id);
        const q = params.toString();
        url = `${API_BASE}/api/pedidos/asignados${q ? `?${q}` : ''}`;
      }
      const res = await fetch(url, { headers: authHeaders() });
      if (!res.ok) {
        if (res.status === 401) handleLogout();
        return;
      }
      const data = await res.json();
      setPedidos(data.data || data);
    } catch {}
  }

  function agregarAlCarrito(producto) {
    if (!usuario || usuario.rol !== 'tendero') return;
    const itemExistente = carrito.find(item => item.producto_id === producto.id);
    if (itemExistente) {
      setCarrito(carrito.map(item => item.producto_id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item));
    } else {
      setCarrito([...carrito, { producto_id: producto.id, nombre: producto.nombre, precio_unitario: Number(producto.precio_base || producto.precio || 0), cantidad: 1, unidad: producto.unidad }]);
    }
  }

  function actualizarCantidad(producto_id, cantidad) {
    if (cantidad <= 0) {
      setCarrito(carrito.filter(item => item.producto_id !== producto_id));
    } else {
      setCarrito(carrito.map(item => item.producto_id === producto_id ? { ...item, cantidad } : item));
    }
  }

  function calcularTotal() {
    return carrito.reduce((total, item) => total + (Number(item.precio_unitario) * Number(item.cantidad)), 0);
  }

  async function obtenerFechaLimiteZona(zona_id) {
    try {
      const res = await fetch(`${API_BASE}/api/pedidos/todos?zona_id=${zona_id}&estado=pendiente`, { headers: authHeaders() });
      if (!res.ok) return null;
      const data = await res.json();
      const lista = data.data || data;
      if (!lista || lista.length === 0) return null;
      const orden = lista
        .map(p => ({ ...p, fecha_limite: p.fecha_limite ? new Date(p.fecha_limite) : null }))
        .filter(p => p.fecha_limite)
        .sort((a, b) => a.fecha_limite - b.fecha_limite);
      return orden.length > 0 ? orden[0].fecha_limite.toISOString() : null;
    } catch {
      return null;
    }
  }

  async function crearPedido() {
    if (!usuario || usuario.rol !== 'tendero' || carrito.length === 0) {
      alert('No se puede crear el pedido: verifica usuario, rol y que el carrito no esté vacío.');
      return;
    }
    if (!usuario.zona_id) {
      alert('Tu cuenta no tiene una zona asignada. Contacta a la plataforma.');
      return;
    }
    try {
      setLoading(true);
      const fechaLimiteExistente = await obtenerFechaLimiteZona(usuario.zona_id);
      const productosPayload = carrito.map(i => ({ producto_id: i.producto_id, cantidad: Number(i.cantidad) }));
      const payload = fechaLimiteExistente
        ? { productos: productosPayload, fecha_limite: fechaLimiteExistente }
        : { productos: productosPayload };
      const res = await fetch(`${API_BASE}/api/pedidos`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        if (res.status === 400 && data.pedido_activo) {
          const p = data.pedido_activo;
          alert(`Tienes un pedido activo (ID: ${p.id}, estado: ${p.estado}). Debes finalizarlo antes de crear otro.`);
          cargarPedidos();
          setMostrarModal(false);
          return;
        }
        alert(data.message || data.error || 'Error creando pedido');
        return;
      }
      setCarrito([]);
      setMostrarModal(false);
      cargarPedidos();
      alert('Pedido creado correctamente');
    } catch {
      setLoading(false);
      alert('Error conectando al servidor');
    }
  }

  async function marcarProductoRecibido(pedidoId, productoId) {
    if (!productoId) {
      alert('Producto inválido');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/pedidos/${pedidoId}/recibir`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ producto_id: productoId })
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) handleLogout();
        alert(data.message || data.error || 'Error marcando recibido');
        return;
      }
      if (data.pedido_completado) alert('Producto marcado. Pedido completado.');
      else alert('Producto marcado como recibido.');
      cargarPedidos();
    } catch {
      alert('Error conectando al servidor');
    }
  }

  async function consolidarPedidos(pedidos_ids) {
    try {
      const res = await fetch(`${API_BASE}/api/pedidos/consolidar`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ pedidos_ids })
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) handleLogout();
        alert(data.message || data.error || 'Error consolidando pedidos');
        return;
      }
      alert(`Pedidos consolidados. Entrega máxima: 72 horas.`);
      cargarPedidos();
    } catch {
      alert('Error conectando al servidor');
    }
  }

  async function asignarProveedor(pedidos_ids, proveedor_id) {
    try {
      const res = await fetch(`${API_BASE}/api/pedidos/asignar-proveedor`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ pedidos_ids, proveedor_id })
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) handleLogout();
        alert(data.message || data.error || 'Error asignando proveedor');
        return;
      }
      alert('Proveedor asignado a pedidos seleccionados');
      cargarPedidos();
    } catch {
      alert('Error conectando al servidor');
    }
  }

  async function despacharPedidos(pedidos_ids) {
    try {
      const res = await fetch(`${API_BASE}/api/pedidos/despachar`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ pedidos_ids })
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) handleLogout();
        alert(data.message || data.error || 'Error despachando pedidos');
        return;
      }
      alert('Pedidos marcados como en despacho');
      cargarPedidos();
    } catch {
      alert('Error conectando al servidor');
    }
  }

  async function actualizarEstadoProveedor(pedidoId, nuevoEstado) {
    try {
      const res = await fetch(`${API_BASE}/api/pedidos/${pedidoId}/estado`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ estado: nuevoEstado })
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) handleLogout();
        alert(data.message || data.error || 'Error actualizando estado');
        return;
      }
      cargarPedidos();
    } catch {
      alert('Error conectando al servidor');
    }
  }

  async function crearNuevoProducto(e) {
    e.preventDefault();
    if (!nuevoProducto.nombre || !nuevoProducto.precio_base) {
      alert('Nombre y Precio Base son requeridos');
      return;
    }
    try {
      const payload = { nombre: nuevoProducto.nombre, descripcion: nuevoProducto.descripcion, precio_base: Number(nuevoProducto.precio_base), unidad: nuevoProducto.unidad, proveedor_id: nuevoProducto.proveedor_id || null };
      const res = await fetch(`${API_BASE}/api/productos`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) handleLogout();
        alert(data.message || data.error || 'Error creando producto');
        return;
      }
      setNuevoProducto({ nombre: '', descripcion: '', precio_base: '', unidad: 'unidad', proveedor_id: '' });
      cargarProductos();
      alert('Producto creado y asignado al proveedor (si seleccionado).');
    } catch {
      alert('Error conectando al servidor');
    }
  }

  const pedidosFiltradosPorRol = useMemo(() => {
    if (!usuario) return [];
    return pedidos;
  }, [pedidos, usuario]);

  const groupedByZoneConsolidation = useMemo(() => {
    const map = {};
    pedidos
      .filter(p => ['pendiente', 'consolidacion'].includes(p.estado))
      .forEach(p => {
        const zid = p.zona_id || (p.zona_nombre ? p.zona_nombre : 'sin-zona');
        if (!map[zid]) map[zid] = { zona_id: zid, zona_nombre: p.zona_nombre || p.zona, pedidos: [], fecha_limite: null };
        map[zid].pedidos.push(p.id);
        if (p.fecha_limite) {
          const dt = new Date(p.fecha_limite);
          if (!map[zid].fecha_limite || dt < new Date(map[zid].fecha_limite)) map[zid].fecha_limite = dt.toISOString();
        }
      });
    return Object.values(map);
  }, [pedidos]);

  function timeRemaining(iso) {
    if (!iso) return null;
    const now = new Date();
    const end = new Date(iso);
    const diff = end - now;
    if (diff <= 0) return '0h';
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  }

  if (!usuario) {
    return (
      <div className="auth-screen">
        <div className="auth-container">
          <div className="auth-header">
            <div className="auth-icon"><Store size={40} color="#667eea" /></div>
            <h1 className="auth-title">Marketplace</h1>
            <p className="auth-subtitle">Sistema de gestión de pedidos colaborativo</p>
          </div>
          <div className="auth-body">
            <div className="auth-tabs">
              <button className={`auth-tab ${tabActivo === 'login' ? 'active' : ''}`} onClick={() => { setTabActivo('login'); setError(''); }}>Iniciar Sesión</button>
              <button className={`auth-tab ${tabActivo === 'registro' ? 'active' : ''}`} onClick={() => { setTabActivo('registro'); setError(''); }}>Registrarse</button>
            </div>

            {error && (<div className="error-alert"><div className="error-alert-content">⚠️ {error}</div></div>)}

            {tabActivo === 'login' ? (
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" placeholder="email" value={formLogin.email} onChange={(e) => setFormLogin({ ...formLogin, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Contraseña</label>
                  <input type="password" className="form-input" placeholder="Contraseña" value={formLogin.password} onChange={(e) => setFormLogin({ ...formLogin, password: e.target.value })} />
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Cargando...' : 'Iniciar Sesión'}</button>
              </form>
            ) : (
              <form onSubmit={handleRegistro}>
                <div className="form-group">
                  <label className="form-label">Nombre Completo</label>
                  <input type="text" className="form-input" placeholder="Ingresa tu nombre" value={formRegistro.nombre} onChange={(e) => setFormRegistro({ ...formRegistro, nombre: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" placeholder="email" value={formRegistro.email} onChange={(e) => setFormRegistro({ ...formRegistro, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Contraseña</label>
                  <input type="password" className="form-input" placeholder="Contraseña" value={formRegistro.password} onChange={(e) => setFormRegistro({ ...formRegistro, password: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Rol</label>
                  <div className="role-selector">
                    {['tendero', 'plataforma', 'proveedor'].map(rol => (
                      <button key={rol} type="button" className={`role-button ${formRegistro.rol === rol ? 'active' : ''}`} onClick={() => setFormRegistro({ ...formRegistro, rol })}>
                        {rol.charAt(0).toUpperCase() + rol.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {formRegistro.rol === 'tendero' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Contacto (Teléfono)</label>
                      <input type="text" className="form-input" placeholder="3001234567" value={formRegistro.contacto} onChange={(e) => setFormRegistro({ ...formRegistro, contacto: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Zona</label>
                      <select className="form-input" value={formRegistro.zona_id || ''} onChange={(e) => setFormRegistro({ ...formRegistro, zona_id: parseInt(e.target.value) })}>
                        <option value="">Seleccionar zona</option>
                        {zonas.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
                      </select>
                    </div>
                  </>
                )}

                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Cargando...' : 'Crear Cuenta'}</button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  const IconoRol = usuario.rol === 'tendero' ? Store : usuario.rol === 'plataforma' ? Building2 : Truck;

  return (
    <div className={`main-container ${usuario.rol}`}>
      <nav className={`navbar ${usuario.rol}`}>
        <div className="navbar-container">
          <div className="navbar-brand">
            <div className={`navbar-icon ${usuario.rol}`}><IconoRol size={24} color="white" /></div>
            <div>
              <h1 className={`navbar-title ${usuario.rol}`}>{usuario.rol === 'tendero' ? 'Tienda' : usuario.rol === 'plataforma' ? 'Plataforma Central' : 'Proveedor'}</h1>
              <p className="navbar-subtitle">{usuario.nombre}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button className="btn-logout" onClick={handleLogout}><LogOut size={18} /> Cerrar Sesión</button>
          </div>
        </div>
      </nav>

      <div className="content-wrapper">
        <div className="view-tabs">
          {usuario.rol === 'tendero' && (
            <>
              <button className={`view-tab ${vista === 'productos' ? 'active' : ''} ${usuario.rol}`} onClick={() => setVista('productos')}><ShoppingCart size={20} /> Productos</button>
              <button className={`view-tab ${vista === 'pedidos' ? 'active' : ''} ${usuario.rol}`} onClick={() => setVista('pedidos')}><Package size={20} /> Mis Pedidos</button>
            </>
          )}

          {usuario.rol === 'plataforma' && (
            <>
              <button className={`view-tab ${vista === 'pedidos' ? 'active' : ''} ${usuario.rol}`} onClick={() => setVista('pedidos')}><FileText size={20} /> Pedidos Globales</button>
              <button className={`view-tab ${vista === 'productos' ? 'active' : ''} ${usuario.rol}`} onClick={() => setVista('productos')}><PlusCircle size={20} /> Gestión Productos</button>
              <button className={`view-tab ${vista === 'estadisticas' ? 'active' : ''} ${usuario.rol}`} onClick={() => setVista('estadisticas')}><TrendingUp size={20} /> Resumen Zonas</button>
            </>
          )}

          {usuario.rol === 'proveedor' && (
            <button className={`view-tab ${vista === 'pedidos' ? 'active' : ''} ${usuario.rol}`} onClick={() => setVista('pedidos')}><Truck size={20} /> Pedidos Asignados</button>
          )}
        </div>

        {usuario.rol === 'tendero' && (
          vista === 'productos' ? (
            <TenderoProductos productosDisponibles={productos} carrito={carrito} agregarAlCarrito={agregarAlCarrito} actualizarCantidad={actualizarCantidad} calcularTotal={calcularTotal} setMostrarModal={setMostrarModal} />
          ) : (
            <TenderoPedidos pedidos={pedidosFiltradosPorRol} marcarProductoRecibido={marcarProductoRecibido} />
          )
        )}

        {usuario.rol === 'plataforma' && vista === 'pedidos' && (
          <PlataformaPedidos pedidos={pedidos} groupedByZoneConsolidation={groupedByZoneConsolidation} consolidarPedidos={consolidarPedidos} asignarProveedor={asignarProveedor} despacharPedidos={despacharPedidos} proveedores={proveedores} zonas={zonas} cargarPedidos={cargarPedidos} timeRemaining={timeRemaining} />
        )}

        {usuario.rol === 'plataforma' && vista === 'productos' && (
          <PlataformaGestionProductos productos={productos} crearNuevoProducto={crearNuevoProducto} nuevoProducto={nuevoProducto} setNuevoProducto={setNuevoProducto} proveedores={proveedores} />
        )}

        {usuario.rol === 'plataforma' && vista === 'estadisticas' && (
          <PlataformaEstadisticas pedidos={pedidos} zonas={zonas} resumenPorZona={groupedByZoneConsolidation.map(g => ({ id: g.zona_id, nombre: g.zona_nombre || g.zona_id, totalPedidos: g.pedidos.length }))} statsGlobales={{ totalPedidos: pedidos.length, pendientes: pedidos.filter(p => p.estado === 'pendiente').length, entregados: pedidos.filter(p => p.estado === 'entregado' || p.estado === 'recibido').length, consolidacion: pedidos.filter(p => p.estado === 'consolidacion').length }} />
        )}

        {usuario.rol === 'proveedor' && vista === 'pedidos' && (
          <ProveedorPedidos pedidos={pedidos} actualizarEstadoProveedor={actualizarEstadoProveedor} proveedorNombre={usuario.nombre} zonas={zonas} cargarPedidos={cargarPedidos} />
        )}
      </div>

      {mostrarModal && usuario.rol === 'tendero' && (
        <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Confirmar Pedido</h2>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>¿Deseas crear este pedido con {carrito.length} productos por un total de <strong>${calcularTotal().toLocaleString()}</strong>?</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setMostrarModal(false)}>Cancelar</button>
              <button className="btn-create" onClick={crearPedido}>Confirmar Pedido</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TenderoProductos({ productosDisponibles, carrito, agregarAlCarrito, actualizarCantidad, calcularTotal, setMostrarModal }) {
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

function TenderoPedidos({ pedidos, marcarProductoRecibido }) {
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

function PlataformaGestionProductos({ productos, crearNuevoProducto, nuevoProducto, setNuevoProducto, proveedores }) {
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
              <li key={p.id} className="product-list-item"><strong>{p.nombre}</strong> (${(p.precio_base || 0).toLocaleString()} / {p.unidad}) {p.proveedor_id ? <em> - Proveedor ID: {p.proveedor_id}</em> : null} <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>{p.descripcion}</div></li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function PlataformaPedidos({ pedidos, groupedByZoneConsolidation, consolidarPedidos, asignarProveedor, despacharPedidos, proveedores, zonas, cargarPedidos, timeRemaining }) {
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

function PlataformaEstadisticas({ pedidos, zonas, resumenPorZona, statsGlobales }) {
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

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-content">
        <div className="stat-info">
          <div className="stat-label">{label}</div>
          <div className="stat-value">{value}</div>
        </div>
        <Icon size={48} className="stat-icon" />
      </div>
    </div>
  );
}

function ProveedorPedidos({ pedidos, actualizarEstadoProveedor, proveedorNombre, zonas, cargarPedidos }) {
  const [zonaFilter, setZonaFilter] = useState('');
  const [tenderoFilter, setTenderoFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');

  useEffect(() => {
    cargarPedidos({ zona_id: zonaFilter || undefined, tendero_id: tenderoFilter || undefined, estado: estadoFilter || undefined });
  }, [zonaFilter, tenderoFilter, estadoFilter]);

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
