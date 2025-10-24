import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Simulamos un usuario base (Plataforma)
const defaultUser = {
    id: 1,
    name: 'Admin Central',
    email: 'plataforma@app.com',
    role: 'plataforma', // 'tendero', 'plataforma', 'proveedor'
    zona: 'Central',
};

/**
 * Función de simulación de login (debería usar la API real en producción)
 * @param {object} credentials - { email, password }
 * @returns {Promise<object>} El objeto de usuario simulado con rol asignado.
 */
const simulateLogin = async ({ email }) => {
    // Simulación simple basada en el email para asignar roles
    if (email.startsWith('tendero')) return { ...defaultUser, id: 101, name: 'Tendero A', email, role: 'tendero', zona: 'Zona A' };
    if (email.startsWith('proveedor')) return { ...defaultUser, id: 201, name: 'Proveedor X', email, role: 'proveedor', zona: 'Global' };
    if (email === 'plataforma@app.com') return defaultUser;
    
    // Si no coincide con un usuario de prueba, lanza un error de simulación
    throw new Error('Credenciales inválidas o usuario no reconocido. Usa: plataforma@app.com, tendero@app.com, proveedor@app.com.');
};


export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Simulación de carga inicial / chequeo de token
    useEffect(() => {
        // En una app real, aquí se revisaría localStorage o una cookie
        setLoading(false); 
    }, []);

    const login = async (credentials) => {
        setLoading(true);
        try {
            const loggedInUser = await simulateLogin(credentials); 
            const authToken = `fake-token-${loggedInUser.role}-${Date.now()}`;

            setUser(loggedInUser);
            setToken(authToken);
            setIsAuthenticated(true);
            setLoading(false);
            return true;
        } catch (error) {
            console.error('Login failed:', error.message);
            setLoading(false);
            // Propagamos el error para que Login.jsx pueda mostrarlo
            return { success: false, error: error.message }; 
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
    };

    const register = async (userData) => {
        console.log("Simulación de registro de tendero:", userData);
        // En un sistema real, se haría la llamada a la API y se devolvería el estado.
        // Simulamos éxito para permitir al usuario probar el flujo de registro.
        return true; 
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, token, loading, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);