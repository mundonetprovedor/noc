import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

/**
 * LoginPage
 * Estilo Premium Glassmorphism com Logo Mundonet.
 */
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { error } = await signIn({ email, password });

        if (error) {
            setError('Credenciais inválidas. Verifique seu email e senha.');
            setLoading(false);
        } else {
            navigate('/');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--background)',
            padding: '1.5rem'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card"
                style={{
                    width: '100%',
                    maxWidth: '420px',
                    padding: '2.5rem',
                    background: 'var(--card-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '24px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <img
                        src="/logo_mundonet_new.png"
                        alt="Mundonet"
                        style={{
                            width: '100%',
                            maxWidth: '220px',
                            height: 'auto',
                            marginBottom: '1rem',
                            filter: 'var(--logo-shadow)',
                            display: 'block',
                            margin: '0 auto'
                        }}
                    />
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1px' }}>
                        NOC <span style={{ color: 'var(--accent-blue)' }}>2.0</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, marginTop: '0.5rem' }}>
                        Acesse a central de monitoramento
                    </p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            background: 'rgba(213,0,0,0.1)',
                            border: '1px solid var(--danger)',
                            padding: '1rem',
                            borderRadius: '12px',
                            color: 'var(--danger)',
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.8rem',
                            marginBottom: '1.5rem',
                            fontWeight: 700
                        }}
                    >
                        <AlertCircle size={18} /> {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '1rem 1rem 1rem 3rem',
                                background: 'var(--surface-medium)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '12px',
                                color: 'var(--text-primary)',
                                fontWeight: 600,
                                outline: 'none',
                                transition: 'all 0.2s ease'
                            }}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="password"
                            placeholder="Senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '1rem 1rem 1rem 3rem',
                                background: 'var(--surface-medium)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '12px',
                                color: 'var(--text-primary)',
                                fontWeight: 600,
                                outline: 'none',
                                transition: 'all 0.2s ease'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            background: 'var(--accent-blue)',
                            color: 'white',
                            border: 'none',
                            padding: '1.2rem',
                            borderRadius: '14px',
                            fontWeight: 800,
                            fontSize: '1rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.8rem',
                            transition: 'all 0.3s ease',
                            marginTop: '0.5rem',
                            boxShadow: '0 4px 12px rgba(0, 85, 255, 0.3)'
                        }}
                    >
                        {loading ? <Loader2 size={24} className="spin" /> : <>ENTRAR <LogIn size={20} /></>}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
                        Ainda não tem conta?{' '}
                        <Link to="/register" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 800 }}>
                            Solicitar Acesso
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
