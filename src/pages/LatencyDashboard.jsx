import React, { useState, useEffect } from 'react';
import { zabbixService } from '../services/zabbixService';
import {
    Activity, Globe, Server, MonitorPlay, Gamepad2, Zap, RefreshCw, EyeOff, BarChart2
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const getLogo = (name, color) => {
    const norm = name.toLowerCase();
    if (norm.includes('google')) {
        return (
            <svg viewBox="0 0 24 24" width="24" height="24" fill={color}>
                <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.746-.08-1.32-.176-1.785H12.24z"/>
            </svg>
        );
    }
    if (norm.includes('cloudfire') || norm.includes('cloudflare')) {
        return (
            <svg viewBox="0 0 24 24" width="24" height="24" fill={color}>
                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z"/>
            </svg>
        );
    }
    if (norm.includes('facebook') || norm.includes('meta')) {
        return (
            <svg viewBox="0 0 24 24" width="24" height="24" fill={color}>
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
        );
    }
    if (norm.includes('akamai')) {
        return (
            <svg viewBox="0 0 24 24" width="24" height="24" fill={color}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15.5h-2v-2h2v2zm0-4h-2V7h2v6.5z"/>
            </svg>
        );
    }
    if (norm.includes('netflix')) {
        return (
            <svg viewBox="0 0 24 24" width="24" height="24" fill={color}>
                <path d="M5.598 1.467h3.195v16.14l9.61-16.14h3.195v21.066h-3.195V6.393l-9.61 16.14H5.598V1.467z"/>
            </svg>
        );
    }
    if (norm.includes('paramount')) {
        return (
            <svg viewBox="0 0 24 24" width="24" height="24" fill={color}>
                <path d="M12 2L1 21h22L12 2zm0 4.5L18.5 18H5.5L12 6.5z M12 9a1 1 0 110 2 1 1 0 010-2z M8.5 12a1 1 0 110 2 1 1 0 010-2z M15.5 12a1 1 0 110 2 1 1 0 010-2z"/>
            </svg>
        );
    }
    if (norm.includes('twitch')) {
        return (
            <svg viewBox="0 0 24 24" width="24" height="24" fill={color}>
                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
            </svg>
        );
    }
    if (norm.includes('pubg')) {
        return (
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M12 8v8" />
                <path d="M8 12h8" />
            </svg>
        );
    }
    if (norm.includes('free fire') || norm.includes('fire')) {
        return (
            <svg viewBox="0 0 24 24" width="24" height="24" fill={color}>
                <path d="M12 .587c1.785 2.27 3.518 4.316 4.743 6.945.748 1.603 1.257 3.327 1.257 5.12 0 4.103-3.327 7.43-7.43 7.43-4.103 0-7.43-3.327-7.43-7.43 0-2.822 1.34-5.267 3.473-6.666L8.03 12c0 2.21 1.79 4 4 4s4-1.79 4-4c0-2.73-1.89-5.46-4.03-7.413z"/>
            </svg>
        );
    }
    return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
    );
};

const themeConfig = {
    excellent: {
        bg: 'rgba(6, 78, 59, 0.2)',
        border: 'rgba(16, 185, 129, 0.3)',
        hoverBorder: 'rgba(16, 185, 129, 0.7)',
        text: '#10B981',
        lightText: '#34D399',
        glow: 'rgba(16, 185, 129, 0.35)',
        label: 'Excelente',
        color: '#10B981'
    },
    warning: {
        bg: 'rgba(120, 53, 4, 0.2)',
        border: 'rgba(245, 158, 11, 0.3)',
        hoverBorder: 'rgba(245, 158, 11, 0.7)',
        text: '#F59E0B',
        lightText: '#FBBF24',
        glow: 'rgba(245, 158, 11, 0.35)',
        label: 'Instável',
        color: '#F59E0B'
    },
    critical: {
        bg: 'rgba(127, 29, 29, 0.25)',
        border: 'rgba(239, 68, 68, 0.35)',
        hoverBorder: 'rgba(239, 68, 68, 0.8)',
        text: '#EF4444',
        lightText: '#F87171',
        glow: 'rgba(239, 68, 68, 0.45)',
        label: 'Crítico',
        color: '#EF4444'
    }
};

const getStatus = (ms, loss, active) => {
    if (active === 0 || ms === 0 || loss >= 50) return 'critical';
    if (ms >= 80 || loss > 0) return 'warning';
    return 'excellent';
};

const LatencyDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [latencies, setLatencies] = useState([]);
    const [history, setHistory] = useState([]);
    const [selectedHost, setSelectedHost] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchData = async () => {
        setIsRefreshing(true);
        try {
            if (!zabbixService.token) {
                await zabbixService.authenticate();
            }

            const currentLatencies = await zabbixService.getLatencies();
            setLatencies(currentLatencies);

            const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

            const newHistoryItem = { time: now };
            currentLatencies.forEach(l => {
                newHistoryItem[l.name] = l.ms;
                newHistoryItem[`${l.name}_loss`] = l.loss;
                newHistoryItem[`${l.name}_status`] = l.status;
            });

            setHistory(prev => {
                const next = [...prev, newHistoryItem];
                if (next.length > 30) return next.slice(next.length - 30);
                return next;
            });

            setError(null);
        } catch (err) {
            console.error('Failed to fetch latencies:', err);
            setError('Erro de conexão: ' + (err.message || 'Verifique o servidor Zabbix'));
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleCardClick = (hostName) => {
        setSelectedHost(prev => prev === hostName ? null : hostName);
    };

    const getHostMetrics = (hostName) => {
        const samples = history.map(h => h[hostName]).filter(v => v !== undefined && v !== null && v > 0);
        
        const min = samples.length > 0 ? Math.min(...samples) : 0;
        const max = samples.length > 0 ? Math.max(...samples) : 0;
        const avg = samples.length > 0 ? (samples.reduce((a, b) => a + b, 0) / samples.length) : 0;
        
        let jitter = 0;
        if (samples.length > 1) {
            let diffs = 0;
            for (let i = 1; i < samples.length; i++) {
                diffs += Math.abs(samples[i] - samples[i - 1]);
            }
            jitter = diffs / (samples.length - 1);
        }

        return {
            min: min.toFixed(2),
            max: max.toFixed(2),
            avg: avg.toFixed(2),
            jitter: jitter.toFixed(2)
        };
    };

    if (loading && latencies.length === 0) {
        return (
            <div className="loading-container">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <Activity size={48} color="#00d2ff" />
                </motion.div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-purple)' }}>
                        <Zap size={28} /> Monitor de Latência (Smokeping de Alta Precisão)
                    </h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Acompanhamento de Ping com telemetria unificada. Clique em um card para isolar o histórico.
                    </p>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.8rem' }}>
                    {selectedHost && (
                        <button
                            onClick={() => setSelectedHost(null)}
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem'
                            }}
                        >
                            <EyeOff size={14} /> Limpar Filtro ({selectedHost})
                        </button>
                    )}
                    <button
                        onClick={fetchData}
                        disabled={isRefreshing}
                        style={{
                            padding: '0.5rem 1rem',
                            background: 'var(--accent-purple)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            opacity: isRefreshing ? 0.7 : 1
                        }}
                    >
                        <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} /> 
                        {isRefreshing ? 'Atualizando...' : 'Atualizar Agora'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="glass-card" style={{ padding: '1rem', marginBottom: '2rem', borderLeft: '4px solid var(--danger)', background: 'rgba(255, 71, 87, 0.1)' }}>
                    <p style={{ color: 'var(--danger)', fontWeight: 600 }}>{error}</p>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <AnimatePresence>
                    {latencies.map((host) => {
                        const status = getStatus(host.ms, host.loss, host.status);
                        const theme = themeConfig[status];
                        const metrics = getHostMetrics(host.name);
                        const isSelected = selectedHost === host.name;

                        // Sparkline data
                        const sparklineData = history.map(h => ({
                            time: h.time,
                            ms: h[host.name] || 0
                        })).filter(d => d.ms > 0);

                        return (
                            <motion.div
                                key={host.name}
                                onClick={() => handleCardClick(host.name)}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="glass-card"
                                style={{
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    padding: '1.25rem',
                                    background: theme.bg,
                                    borderColor: isSelected ? theme.color : theme.border,
                                    borderWidth: isSelected ? '2px' : '1px',
                                    boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.3), 0 0 12px ${theme.glow}`,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'border-color 0.2s, box-shadow 0.2s'
                                }}
                                whileHover={{ scale: 1.02 }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '1rem', width: '100%' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <div style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {getLogo(host.name, theme.lightText)}
                                        </div>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', letterSpacing: '0.5px' }}>
                                            {host.name}
                                        </h3>
                                    </div>
                                    <span style={{
                                        marginLeft: 'auto',
                                        fontSize: '0.65rem',
                                        fontWeight: 800,
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '10px',
                                        backgroundColor: theme.color,
                                        color: '#000000',
                                        textTransform: 'uppercase'
                                    }}>
                                        {theme.label}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <span style={{ fontSize: '2.8rem', fontWeight: 900, color: theme.lightText, letterSpacing: '-1.5px', lineHeight: 1 }}>
                                        {host.status === 0 || host.loss >= 100 ? 'OFFLINE' : `${host.ms.toFixed(2)}`}
                                    </span>
                                    {host.status !== 0 && host.loss < 100 && (
                                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>ms</span>
                                    )}
                                </div>

                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: '1fr 1fr', 
                                    gap: '0.5rem', 
                                    padding: '0.6rem', 
                                    background: 'rgba(0,0,0,0.15)', 
                                    borderRadius: '8px', 
                                    fontSize: '0.75rem', 
                                    color: 'var(--text-secondary)',
                                    marginBottom: '1rem'
                                }}>
                                    <div>Perda: <strong style={{ color: host.loss > 0 ? 'var(--danger)' : '#ffffff' }}>{host.loss.toFixed(1)}%</strong></div>
                                    <div>Jitter: <strong style={{ color: '#ffffff' }}>{metrics.jitter}ms</strong></div>
                                    <div>Mín: <strong style={{ color: '#ffffff' }}>{metrics.min}ms</strong></div>
                                    <div>Máx: <strong style={{ color: '#ffffff' }}>{metrics.max}ms</strong></div>
                                </div>

                                <div style={{ height: '40px', width: '100%', marginTop: 'auto', opacity: 0.85 }}>
                                    {sparklineData.length > 1 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={sparklineData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id={`gradient-${host.name}`} x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={theme.color} stopOpacity={0.4}/>
                                                        <stop offset="95%" stopColor={theme.color} stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <Area
                                                    type="monotone"
                                                    dataKey="ms"
                                                    stroke={theme.color}
                                                    strokeWidth={1.5}
                                                    fillOpacity={1}
                                                    fill={`url(#gradient-${host.name})`}
                                                    isAnimationActive={false}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                                            Coletando histórico...
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem', border: selectedHost ? '1px solid var(--accent-purple)' : '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', margin: 0, fontSize: '1.1rem' }}>
                        <BarChart2 size={20} color="var(--accent-purple)" /> 
                        Histórico Comparativo em Tempo Real 
                        {selectedHost && <span style={{ fontSize: '0.85rem', color: 'var(--accent-purple)', background: 'rgba(181, 56, 255, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>Foco em: {selectedHost}</span>}
                    </h3>
                </div>
                {history.length > 0 ? (
                    <div style={{ height: '400px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={history} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                                <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={13} fontWeight={600} />
                                <YAxis stroke="var(--text-secondary)" fontSize={13} fontWeight={600} unit="ms" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#090d16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    itemStyle={{ fontSize: '0.95rem', fontWeight: 700 }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '15px', fontSize: '0.95rem', fontWeight: 700 }} />
                                {latencies.map((host, index) => {
                                    const colors = ['#00d2ff', '#b538ff', '#00ff9d', '#fce38a', '#ff4757', '#4285F4', '#E50914', '#00ff00', '#F38020'];
                                    const isHighlighted = selectedHost === null || selectedHost === host.name;
                                    return (
                                        <Line
                                            key={host.name}
                                            type="monotone"
                                            dataKey={host.name}
                                            stroke={colors[index % colors.length]}
                                            strokeWidth={isSelected(selectedHost, host.name) ? 4.5 : 1.5}
                                            opacity={isHighlighted ? 1 : 0.15}
                                            dot={false}
                                            activeDot={isHighlighted}
                                            isAnimationActive={false}
                                        />
                                    );
                                })}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', color: 'var(--text-secondary)' }}>
                        Aguardando pacotes adicionais para renderização...
                    </div>
                )}
            </div>
        </div>
    );
};

const isSelected = (selected, current) => {
    return selected === current;
};

export default LatencyDashboard;
