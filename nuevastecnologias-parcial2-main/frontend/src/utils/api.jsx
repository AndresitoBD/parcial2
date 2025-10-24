const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const registerUser = async (data) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error en registro');
  }
  return response.json();
};

export const loginUser = async (data) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Login fallido');
  return response.json();
};

export const createPedido = async (data, token) => {
  const response = await fetch(`${API_BASE_URL}/api/pedidos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Error creando pedido');
  return response.json();
};

export const getPedidos = async (token) => {
  const response = await fetch(`${API_BASE_URL}/api/pedidos`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Error obteniendo pedidos');
  return response.json();
};

export const getProductos = async () => {
  const response = await fetch(`${API_BASE_URL}/api/productos`);
  if (!response.ok) throw new Error('Error obteniendo productos');
  return response.json();
};

export const updatePedidoEstado = async (id, estado, token) => {
  const response = await fetch(`${API_BASE_URL}/api/pedidos/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ estado }),
  });
  if (!response.ok) throw new Error('Error actualizando pedido');
  return response.json();
};