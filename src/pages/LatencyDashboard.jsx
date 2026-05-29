import React, { useState, useEffect } from 'react';
import { zabbixService } from '../services/zabbixService';
import {
    Activity, Globe, Server, AlertTriangle, MonitorPlay, Gamepad2, Wifi, Zap
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const getIcon = (iconName) => {
    switch (iconName) {
        case 'google': return <Globe size={24} color="#4285F4" />;
        case 'cloudflare': return <Server size={24} color="#F38020" />;
        case 'facebook': return <Globe size={24} color="#1877F2" />;
        case 'server': return <Server size={24} color="var(--accent-purple)" />;
        case 'monitor': return <MonitorPlay size={24} color="#E50914" />;
        case 'gamepad': return <Gamepad2 size={24} color="#00ff00" />;
        default: return <Activity size={24} color="var(--accent-blue)" />;
    }
};

const LatencyDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [latencies, setLatencies] = useState([]);
    const [history, setHistory] = useState([]); // Mocking history for now

    const fetchData = async () => {
        try {
            if (!zabbixService.token) {
                await zabbixService.authenticate();
            }

            const currentLatencies = await zabbixService.getLatencies();
            setLatencies(currentLatencies);

            // Update mocked history (simulate graph data)
            const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

            const newHistoryItem = { time: now };
            currentLatencies.forEach(l => {
                newHistoryItem[l.name] = l.ms;
            });

            setHistory(prev => {
                const next = [...prev, newHistoryItem];
                if (next.length > 20) return next.slice(next.length - 20);
                return next;
            });

            setError(null);
        } catch (err) {
            console.error('Failed to fetch latencies:', err);
            setError('Erro de conexão: ' + (err.message || 'Verifique o servidor Zabbix'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading && latencies.length === 0) {
        return (
            <div className="loading-container">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <Activity size={48} color="#00d2ff" />
                </motion.div>
            </div>
        );
    }

    const getStatusColor = (ms) => {
        if (ms < 30) return 'var(--success)';
        if (ms < 80) return 'var(--warning)';
        return 'var(--danger)';
    };

    return (
        <div className="dashboard-container">
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-purple)' }}>
                    <Zap size={28} /> Monitor de Latência (Smokeping)
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>Acompanhamento de Ping em Tempo Real (IPv4 / IPv6)</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <AnimatePresence>
                    {latencies.map((host) => (
                        <motion.div
                            key={host.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card glow-top-border"
                            style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.2rem', '--glow-color': getStatusColor(host.ms) }}
                        >
                            <div style={{ padding: '0.8rem', background: 'var(--surface-dark)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                {getIcon(host.icon)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{host.name}</h3>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.3rem' }}>
                                    <span style={{ fontSize: '2rem', fontWeight: 800, color: getStatusColor(host.ms), lineHeight: 1 }}>
                                        {host.ms}
                                    </span>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>ms</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="glass-card" style={{ height: '400px', width: '100%', padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                    <Activity size={20} color="var(--accent-blue)" /> Histórico Recente (Últimos Eventos)
                </h3>
                {history.length > 0 ? (
                    <ResponsiveContainer width="100%" height="85%">
                        <LineChart data={history} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                            <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={12} />
                            <YAxis stroke="var(--text-secondary)" fontSize={12} unit="ms" />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                                itemStyle={{ color: 'var(--text-primary)' }}
                            />
                            {latencies.map((host, index) => {
                                const colors = ['#00d2ff', '#9d50bb', '#00f2fe', '#fce38a', '#f857a6', '#4285F4', '#E50914', '#00ff00'];
                                return (
                                    <Line
                                        key={host.name}
                                        type="monotone"
                                        dataKey={host.name}
                                        stroke={colors[index % colors.length]}
                                        strokeWidth={2}
                                        dot={false}
                                        isAnimationActive={false}
                                    />
                                )
                            })}
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                        Aguardando dados...
                    </div>
                )}
            </div>
        </div>
    );
};

export default LatencyDashboard;
