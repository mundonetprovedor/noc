import React, { createContext, useContext } from 'react';

const AuthContext = createContext({});

/**
 * AuthProvider
 * Autenticação removida — o sistema funciona sem login.
 */
export const AuthProvider = ({ children }) => {
    const value = {
        user: { name: 'Operador NOC' },
        loading: false,
        signIn: async () => ({ error: null }),
        signUp: async () => ({ error: null }),
        signOut: () => {},
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
