import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

/**
 * RegisterPage
 * Cadastro simplificado para novos operadores.
 */
const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            return setError('As senhas não coincidem.');
        }

        setLoading(true);

        const { error } = await signUp({ email, password, full_name: email.split('@')[0] });

        if (error) {
            setError(error);
            setLoading(false);
        } else {
            alert('Cadastro realizado com sucesso!');
            navigate('/login');
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
                <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700, marginBottom: '2rem' }}>
                    <ArrowLeft size={16} /> VOLTAR AO LOGIN
                </Link>

                <div style={{ marginBottom: '2.5rem' }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1px' }}>
                        SOLICITAR <span style={{ color: 'var(--accent-blue)' }}>ACESSO</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, marginTop: '0.5rem' }}>
                        Crie seu perfil de operador
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
                            placeholder="Email Corporativo"
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
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="password"
                            placeholder="Sua Senha"
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
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="password"
                            placeholder="Confirmar Senha"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '1rem 1rem 1rem 3rem',
                                background: 'var(--surface-medium)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '12px',
                                color: 'var(--text-primary)',
                                fontWeight: 600,
                                outline: 'none'
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
                        {loading ? <Loader2 size={24} className="spin" /> : <>CADASTRAR <UserPlus size={20} /></>}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default Register;
