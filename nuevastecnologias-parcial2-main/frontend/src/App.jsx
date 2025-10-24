import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Global variables (Mandatory to use for Firebase configuration)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Initialize Firebase App
let firebaseApp;
let db;
let auth;

if (Object.keys(firebaseConfig).length > 0) {
    try {
        firebaseApp = initializeApp(firebaseConfig);
        db = getFirestore(firebaseApp);
        auth = getAuth(firebaseApp);
        // setLogLevel('debug'); // Optional: Uncomment for detailed Firebase logging
    } catch (e) {
        console.error("Error al inicializar Firebase:", e);
    }
} else {
    console.warn("Firebase configuration no disponible. La autenticación será simulada.");
}

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Placeholder data for demonstration if Firebase is not configured
    const mockUsers = {
        'tendero@demo.com': { uid: 'tendero-id-123', role: 'tendero', name: 'Laura Tienda' },
        'plataforma@demo.com': { uid: 'platform-id-456', role: 'plataforma', name: 'Javier Central' },
        'proveedor@demo.com': { uid: 'supplier-id-789', role: 'proveedor', name: 'Sofia Distribuidora' },
    };

    const signIn = async (email, password) => {
        setLoading(true);
        if (auth) {
            // Placeholder: Implement actual Firebase sign-in logic here
            // For now, use mock sign-in based on the example roles
            const mockUser = mockUsers[email];
            if (mockUser) {
                // Simulate successful sign-in
                setUser(mockUser);
                setIsAuthenticated(true);
                setLoading(false);
                return { success: true, user: mockUser };
            } else {
                setLoading(false);
                return { success: false, error: 'Credenciales inválidas o rol no reconocido (demo).' };
            }
        } else {
            // Simulation for environment without Firebase
            const mockUser = mockUsers[email];
            if (mockUser) {
                setUser(mockUser);
                setIsAuthenticated(true);
                setLoading(false);
                return { success: true, user: mockUser };
            } else {
                setLoading(false);
                return { success: false, error: 'Credenciales inválidas (simulación).' };
            }
        }
    };

    const register = async (name, email, password, role) => {
        setLoading(true);
        if (auth) {
             // Placeholder: Implement actual Firebase registration logic here
            console.log("Simulando registro en Firebase. User:", email);
            setLoading(false);
            return { success: true };
        } else {
            // Simulation for environment without Firebase
            const newUser = { uid: `mock-${Date.now()}`, role, name };
            mockUsers[email] = newUser;
            setLoading(false);
            return { success: true };
        }
    };

    const logout = async () => {
        if (auth) {
            await signOut(auth);
        }
        setIsAuthenticated(false);
        setUser(null);
    };

    useEffect(() => {
        if (!auth) {
            setLoading(false); // If no Firebase, stop loading immediately
            return;
        }

        const handleAuth = async () => {
            try {
                if (initialAuthToken) {
                    await signInWithCustomToken(auth, initialAuthToken);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (error) {
                console.error("Error during initial Firebase sign-in:", error);
                await signInAnonymously(auth);
            }
        };

        handleAuth();

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                // In a real app, you'd fetch the user's role/details from Firestore here
                // For this demo, we use a placeholder user structure
                const userId = firebaseUser.uid;
                
                // --- SIMULATED USER DATA FETCH ---
                // Since Firebase is complex, we'll keep using mock data for the role 
                // but confirm authentication status.
                const loggedInUser = Object.values(mockUsers).find(u => u.uid === userId) || { 
                    uid: userId, 
                    role: 'tendero', // Default to tendero if role is unknown
                    name: 'Usuario Autenticado'
                };
                
                setUser(loggedInUser);
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const value = {
        isAuthenticated,
        user,
        loading,
        signIn,
        register,
        logout,
        db, // Firestore instance
        auth, // Auth instance
        appId, // Canvas app ID
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};