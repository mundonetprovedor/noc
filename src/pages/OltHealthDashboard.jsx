import React, { useState, useEffect } from 'react';
import { zabbixService } from '../services/zabbixService';
import {
    Server,
    Cpu,
    HardDrive,
    Clock,
    Thermometer,
    RefreshCw,
    AlertTriangle,
    CheckCircle2,
    Activity
} from 'lucide-react';
import { motion } from 'framer-motion';

const OltCard = ({ olt }) => {
    const formatUptime = (seconds) => {
        if (!seconds) return 'N/A';
        const s = parseInt(seconds, 10);
        if (isNaN(s)) return seconds; // Already formatted or unknown string

        const days = Math.floor(s / 86400);
        const hours = Math.floor((s % 86400) / 3600);
        const minutes = Math.floor((s % 3600) / 60);

        if (days > 0) return `${days}d ${hours}h ${minutes}m`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const getStatusColor = (val, type) => {
        const num = parseFloat(val);
        if (isNaN(num)) return 'var(--text-secondary)';
        if (type === 'cpu' || type === 'mem') {
            if (num > 80) return 'var(--danger)';
            if (num > 50) return 'var(--warning)';
            return 'var(--success)';
        }
        if (type === 'temp') {
            if (num > 70) return 'var(--danger)';
            if (num > 55) return 'var(--warning)';
            return 'var(--success)';
        }
        return 'var(--success)';
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card glow-top-border"
            style={{
                padding: '1.5rem',
                '--glow-color': olt.cpu > 80 || olt.memory > 80 ? 'var(--danger)' : 'var(--success)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                minHeight: '280px'
            }}
        >
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                    <div style={{ padding: '0.6rem', background: 'var(--surface-medium)', borderRadius: '12px' }}>
                        <Server size={20} color="var(--accent-blue)" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{olt.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                            <CheckCircle2 size={12} color="var(--success)" />
                            <span style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 700 }}>OPERACIONAL</span>
                        </div>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'flex-end' }}>
                        <Clock size={12} /> UPTIME
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.1rem' }}>
                        {formatUptime(olt.uptime)}
                    </div>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* CPU */}
                <div style={{ background: 'var(--surface-dark)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Cpu size={14} /> CPU
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: getStatusColor(olt.cpu, 'cpu') }}>
                            {olt.cpu ? `${olt.cpu}%` : 'N/A'}
                        </span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--surface-medium)', borderRadius: '3px', overflow: 'hidden' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${olt.cpu || 0}%` }}
                            style={{ height: '100%', background: getStatusColor(olt.cpu, 'cpu'), boxShadow: `0 0 10px ${getStatusColor(olt.cpu, 'cpu')}` }}
                        />
                    </div>
                </div>

                {/* MEMORIA */}
                <div style={{ background: 'var(--surface-dark)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <HardDrive size={14} /> MEMÓRIA
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: getStatusColor(olt.memory, 'mem') }}>
                            {olt.memory ? `${olt.memory}%` : 'N/A'}
                        </span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--surface-medium)', borderRadius: '3px', overflow: 'hidden' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${olt.memory || 0}%` }}
                            style={{ height: '100%', background: getStatusColor(olt.memory, 'mem'), boxShadow: `0 0 10px ${getStatusColor(olt.memory, 'mem')}` }}
                        />
                    </div>
                </div>
            </div>

            {olt.temperature && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem', background: 'var(--surface-low)', borderRadius: '8px' }}>
                    <Thermometer size={14} color={getStatusColor(olt.temperature, 'temp')} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TEMPERATURA:</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: getStatusColor(olt.temperature, 'temp') }}>{olt.temperature}°C</span>
                </div>
            )}
        </motion.div>
    );
};

const OltHealthDashboard = () => {
    const [olts, setOlts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    const fetchData = async () => {
        try {
            if (!zabbixService.token) await zabbixService.authenticate();
            const data = await zabbixService.getOltHealthData();
            setOlts(data);
            setLastUpdate(new Date());
        } catch (err) {
            console.error('Error fetching OLT health data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // 30s update
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ padding: '0.5rem' }}>
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1.5px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Activity size={32} color="var(--success)" /> SAÚDE DAS OLTs
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontWeight: 500, fontSize: '1rem' }}>
                        Monitoramento em tempo real de hardware, processamento e disponibilidade.
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '1px' }}>ÚLTIMA ATUALIZAÇÃO</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--accent-blue)', fontWeight: 800 }}>{lastUpdate.toLocaleTimeString()}</div>
                    </div>
                    <button
                        onClick={() => { setLoading(true); fetchData(); }}
                        className="glass-card"
                        style={{ padding: '0.8rem', border: 'none', cursor: 'pointer', display: 'flex' }}
                    >
                        <RefreshCw size={20} className={loading ? 'spin' : ''} />
                    </button>
                </div>
            </header>

            {loading && olts.length === 0 ? (
                <div style={{ height: '50vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
                    <RefreshCw size={48} className="spin" color="var(--accent-blue)" />
                    <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Coletando dados do Zabbix...</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {olts.map(olt => (
                        <OltCard key={olt.id} olt={olt} />
                    ))}
                    {olts.length === 0 && !loading && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px' }}>
                            <AlertTriangle size={48} color="var(--warning)" style={{ marginBottom: '1rem' }} />
                            <h2 style={{ color: 'var(--text-primary)' }}>Nenhuma OLT encontrada.</h2>
                            <p style={{ color: 'var(--text-secondary)' }}>Verifique se o grupo de hosts 'OLT' existe no Zabbix.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default OltHealthDashboard;
