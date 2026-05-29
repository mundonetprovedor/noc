import axios from 'axios';

const isProduction = import.meta.env.PROD;
const API_URL = isProduction ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:3001');

/**
 * Local API Client
 * Gerencia a comunicação com o servidor de autenticação local.
 */
const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Adicionar token em todas as requisições se existir
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('noc_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    login: async (email, password) => {
        console.log(`Tentando login em: ${API_URL}/api/login`);
        const response = await apiClient.post('/api/login', { email, password });
        if (response.data.token) {
            localStorage.setItem('noc_token', response.data.token);
        }
        return response.data;
    },
    register: async (userData) => {
        console.log(`Tentando cadastro em: ${API_URL}/api/register`);
        try {
            const response = await apiClient.post('/api/register', userData);
            return response.data;
        } catch (err) {
            console.error('Erro detalhado no registro:', err.response?.data || err.message);
            throw err;
        }
    },
    getMe: async () => {
        const response = await apiClient.get('/api/me');
        return response.data;
    },
    logout: () => {
        localStorage.removeItem('noc_token');
    }
};
