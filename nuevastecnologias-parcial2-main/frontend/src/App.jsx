// App.js
import React, { useEffect, useState, useMemo } from 'react';
import {
  ShoppingCart, Package, TrendingUp, Clock, CheckCircle, Truck,
  FileText, LogOut, Store, Building2, PlusCircle, Layers, Send, Home
} from 'lucide-react';

// Import Views
import { TenderoProductos, TenderoPedidos } from './Views/TenderoView';
import { PlataformaGestionProductos, PlataformaPedidos, PlataformaEstadisticas } from './Views/PlataformaView';
import { ProveedorPedidos } from './Views/ProveedorView';

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

  // --- Initial Load Effects ---
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

  // --- Auth Functions & Helpers ---
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

  // --- Data Loading Functions ---
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

  // --- Tendero/Carrito Functions ---
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

  // --- Plataforma Functions ---
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
  
  // --- Proveedor Functions ---
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

  // --- Memos and Utility Functions ---
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

  const statsGlobales = useMemo(() => {
    return { 
      totalPedidos: pedidos.length, 
      pendientes: pedidos.filter(p => p.estado === 'pendiente').length, 
      entregados: pedidos.filter(p => p.estado === 'entregado' || p.estado === 'recibido').length, 
      consolidacion: pedidos.filter(p => p.estado === 'consolidacion').length 
    };
  }, [pedidos]);
  
  const resumenPorZona = useMemo(() => {
    // Note: This is a placeholder for a more complex aggregation done in the original file, 
    // which would require iterating over all products/items to calculate total sales.
    // For simplicity, we use the groupedByZoneConsolidation structure for zone identification.
    return groupedByZoneConsolidation.map(g => {
        const zonePedidos = pedidos.filter(p => (p.zona_id || p.zona_nombre) === g.zona_id || (p.zona_nombre && g.zona_nombre === p.zona_nombre));
        return { 
            id: g.zona_id, 
            nombre: g.zona_nombre || g.zona_id, 
            totalPedidos: zonePedidos.length,
            pedidosPendientes: zonePedidos.filter(p => p.estado === 'pendiente').length,
            pedidosEntregados: zonePedidos.filter(p => p.estado === 'entregado' || p.estado === 'recibido').length,
            totalVentas: zonePedidos.reduce((acc, p) => acc + (p.total || 0), 0).toLocaleString(undefined, { maximumFractionDigits: 0 }),
        };
    });
  }, [pedidos, groupedByZoneConsolidation]);


  // --- Render Logic (Auth Screen) ---
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

  // --- Render Logic (Authenticated App) ---
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
          vista === 'productos' ?
            (
              <TenderoProductos 
                productosDisponibles={productos} 
                carrito={carrito} 
                agregarAlCarrito={agregarAlCarrito} 
                actualizarCantidad={actualizarCantidad} 
                calcularTotal={calcularTotal} 
                setMostrarModal={setMostrarModal} 
              />
            ) : (
              <TenderoPedidos 
                pedidos={pedidosFiltradosPorRol} 
                marcarProductoRecibido={marcarProductoRecibido} 
              />
            )
        )}

        {usuario.rol === 'plataforma' && vista === 'pedidos' && (
          <PlataformaPedidos 
            pedidos={pedidos} 
            groupedByZoneConsolidation={groupedByZoneConsolidation} 
            consolidarPedidos={consolidarPedidos} 
            asignarProveedor={asignarProveedor} 
            despacharPedidos={despacharPedidos} 
            proveedores={proveedores} 
            zonas={zonas} 
            cargarPedidos={cargarPedidos} 
            timeRemaining={timeRemaining} 
          />
        )}

        {usuario.rol === 'plataforma' && vista === 'productos' && (
          <PlataformaGestionProductos 
            productos={productos} 
            crearNuevoProducto={crearNuevoProducto} 
            nuevoProducto={nuevoProducto} 
            setNuevoProducto={setNuevoProducto} 
            proveedores={proveedores} 
          />
        )}

        {usuario.rol === 'plataforma' && vista === 'estadisticas' && (
          <PlataformaEstadisticas 
            pedidos={pedidos} 
            zonas={zonas} 
            resumenPorZona={resumenPorZona} 
            statsGlobales={statsGlobales} 
          />
        )}

        {usuario.rol === 'proveedor' && vista === 'pedidos' && (
          <ProveedorPedidos 
            pedidos={pedidos} 
            actualizarEstadoProveedor={actualizarEstadoProveedor} 
            proveedorNombre={usuario.nombre} 
            zonas={zonas} 
            cargarPedidos={cargarPedidos} 
          />
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