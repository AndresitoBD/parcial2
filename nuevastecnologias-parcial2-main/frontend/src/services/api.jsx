// src/services/api.js

const API_BASE_URL = 'http://localhost:3000/api'; // *** ¡AJUSTA ESTA URL! ***

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en la solicitud');
    }
    return response.json();
};

// --- Autenticación y Usuarios ---

export const loginUser = async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });
    return handleResponse(response);
};

export const registerTendero = async (data) => {
    const response = await fetch(`${API_BASE_URL}/tenderos/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

// --- Funciones del Tendero ---

export const getAvailableProducts = async () => {
    const response = await fetch(`${API_BASE_URL}/productos`);
    return handleResponse(response);
};

export const createNewOrder = async (pedidoData, token) => {
    const response = await fetch(`${API_BASE_URL}/pedidos`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(pedidoData),
    });
    return handleResponse(response);
};

export const getTenderoOrders = async (tenderoId, token) => {
    const response = await fetch(`${API_BASE_URL}/pedidos/tendero/${tenderoId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
};

// --- Funciones de la Plataforma ---

export const getPendingOrders = async (token) => {
    const response = await fetch(`${API_BASE_URL}/plataforma/pedidos/pendientes`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
};

export const updateOrderStatus = async (pedidoId, newStatus, token) => {
    const response = await fetch(`${API_BASE_URL}/plataforma/pedidos/${pedidoId}/estado`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: newStatus }),
    });
    return handleResponse(response);
};

// src/services/api.js (Continuación)

// ... (funciones anteriores)

// --- Funciones del Tendero (Completas) ---
// Función para marcar un pedido como recibido
export const markOrderReceived = async (pedidoId, token) => {
    const response = await fetch(`${API_BASE_URL}/pedidos/${pedidoId}/recibir`, {
        method: 'PUT',
        headers: { 
            'Authorization': `Bearer ${token}` 
        },
    });
    return handleResponse(response);
};

// --- Funciones de la Plataforma (Completas) ---

// Función para listar todos los pedidos (para resumen)
export const getAllOrders = async (token) => {
    const response = await fetch(`${API_BASE_URL}/plataforma/pedidos/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
};

// Función para crear un nuevo producto
export const createProduct = async (productData, token) => {
    const response = await fetch(`${API_BASE_URL}/productos`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(productData),
    });
    return handleResponse(response);
};

// --- Funciones del Proveedor ---

// Función para obtener los pedidos consolidados para el proveedor
export const getConsolidatedOrders = async (token) => {
    const response = await fetch(`${API_BASE_URL}/proveedor/pedidos`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
};

// Función para que el proveedor actualice el estado del envío
export const updateShippingStatus = async (pedidoId, newStatus, token) => {
    const response = await fetch(`${API_BASE_URL}/proveedor/envios/${pedidoId}/estado`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: newStatus }),
    });
    return handleResponse(response);
};