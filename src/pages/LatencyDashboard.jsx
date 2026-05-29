import React, { useState, useEffect } from 'react';
import { zabbixService } from '../services/zabbixService';
import {
    Activity, Globe, Server, MonitorPlay, Gamepad2, Zap, RefreshCw, EyeOff, BarChart2
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const getIcon = (iconName, color) => {
    switch (iconName) {
        case 'google': return <Globe size={20} color={color} />;
        case 'cloudflare': return <Server size={20} color={color} />;
        case 'facebook': return <Globe size={20} color={color} />;
        case 'server': return <Server size={20} color={color} />;
        case 'monitor': return <MonitorPlay size={20} color={color} />;
        case 'gamepad': return <Gamepad2 size={20} color={color} />;
        default: return <Activity size={20} color={color} />;
    }
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
                                        <div style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                                            {getIcon(host.icon, theme.lightText)}
                                        </div>
                                        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.5px' }}>
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
                                    <span style={{ fontSize: '2.5rem', fontWeight: 900, color: theme.lightText, letterSpacing: '-1px', lineHeight: 1 }}>
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
                                <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={11} />
                                <YAxis stroke="var(--text-secondary)" fontSize={11} unit="ms" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#090d16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    itemStyle={{ fontSize: '0.8rem' }}
                                />
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
