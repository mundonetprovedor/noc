import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext({});

/**
 * AuthProvider
 * Gerencia o estado global de autenticação usando o servidor LOCAL.
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('noc_token');
            if (token) {
                try {
                    const data = await authService.getMe();
                    setUser(data.user);
                } catch (err) {
                    console.error('Sessão expirada ou inválida');
                    localStorage.removeItem('noc_token');
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const signIn = async ({ email, password }) => {
        try {
            const data = await authService.login(email, password);
            setUser(data.user);
            return { error: null };
        } catch (err) {
            return { error: err.response?.data?.error || 'Erro ao entrar' };
        }
    };

    const signUp = async (userData) => {
        try {
            await authService.register(userData);
            return { error: null };
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.message || 'Erro ao cadastrar';
            return { error: errorMsg };
        }
    };

    const signOut = () => {
        authService.logout();
        setUser(null);
    };

    const value = {
        user,
        loading,
        signIn,
        signUp,
        signOut
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
