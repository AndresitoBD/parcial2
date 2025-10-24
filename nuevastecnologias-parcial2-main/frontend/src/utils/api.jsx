const API_BASE = 'http://localhost:5000/api'; // Cambia a tu backend en Gitpod

export const loginUser = async (data) => {
  const res = await fetch(`${API_BASE}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Login fallido');
  return res.json();
};

export const getProductos = async () => {
  const res = await fetch(`${API_BASE}/productos`);
  if (!res.ok) throw new Error('Error obteniendo productos');
  return res.json();
};

export const createPedido = async (data) => {
  const res = await fetch(`${API_BASE}/pedidos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Error creando pedido');
  return res.json();
};

export const getPedidosByTendero = async (tenderoId) => {
  const res = await fetch(`${API_BASE}/pedidos/tendero/${tenderoId}`);
  if (!res.ok) throw new Error('Error obteniendo pedidos');
  return res.json();
};

export const updatePedidoEstado = async (id, estado) => {
  const res = await fetch(`${API_BASE}/pedidos/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estado }) });
  if (!res.ok) throw new Error('Error actualizando pedido');
  return res.json();
};

export const getAllPedidos = async () => {
  const res = await fetch(`${API_BASE}/pedidos`);
  if (!res.ok) throw new Error('Error obteniendo pedidos');
  return res.json();
};

export const consolidatePedidos = async () => {
  const res = await fetch(`${API_BASE}/pedidos/consolidate`, { method: 'POST' });
  if (!res.ok) throw new Error('Error consolidando');
  return res.json();
};

export const assignProveedor = async (productoId) => {
  const res = await fetch(`${API_BASE}/pedidos/assign/${productoId}`, { method: 'PUT' });
  if (!res.ok) throw new Error('Error asignando proveedor');
  return res.json();
};

export const createConsolidatedPedido = async () => {
  const res = await fetch(`${API_BASE}/pedidos/consolidated`, { method: 'POST' });
  if (!res.ok) throw new Error('Error creando pedido consolidado');
  return res.json();
};

export const getConsolidatedPedidos = async () => {
  const res = await fetch(`${API_BASE}/pedidos/consolidated`);
  if (!res.ok) throw new Error('Error obteniendo pedidos consolidados');
  return res.json();
};

export const updateEstadoEnvio = async (id, estado) => {
  const res = await fetch(`${API_BASE}/pedidos/envio/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estado }) });
  if (!res.ok) throw new Error('Error actualizando envío');
  return res.json();
};

export const createProducto = async (data) => {
  const res = await fetch(`${API_BASE}/productos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Error creando producto');
  return res.json();
};

export const registerUser = async (data) => {
  const res = await fetch(`${API_BASE}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Registro fallido');
  return res.json();
};