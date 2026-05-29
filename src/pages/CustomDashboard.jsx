import React, { useState, useEffect, useCallback, useRef } from 'react';
import { zabbixService } from '../services/zabbixService';
import {
    Activity,
    Search,
    Plus,
    Trash2,
    Settings,
    LayoutDashboard,
    RefreshCw,
    X,
    PlusCircle,
    BarChart3,
    Filter,
    Layers,
    Server,
    Zap,
    AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * CustomTrafficCard
 * Objetivo: Exibir o tráfego de uma interface específica de forma visual e intuitiva.
 */
const CustomTrafficCard = ({ item, onRemove }) => {
    const value = parseFloat(item.lastvalue || 0);

    const formatBits = (bits) => {
        if (!bits || bits === 0) return '0 bps';
        const k = 1000;
        const sizes = ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps'];
        const i = Math.floor(Math.log(bits) / Math.log(k));
        return parseFloat((bits / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatted = formatBits(value).split(' ');
    const num = formatted[0];
    const unit = formatted[1];

    const getGlowColor = () => {
        if (value > 5000000000) return 'var(--danger)';
        if (value > 1000000000) return 'var(--warning)';
        return 'var(--success)';
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="glass-card glow-top-border"
            style={{
                '--glow-color': getGlowColor(),
                padding: '1.5rem',
                position: 'relative',
                minHeight: '220px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.3s ease',
                background: 'var(--surface-medium)',
                border: '1px solid var(--glass-border)'
            }}
        >
            <button
                onClick={() => onRemove(item.itemid)}
                style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'var(--surface-high)',
                    border: 'none',
                    color: 'var(--danger)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    padding: '0.4rem',
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                title="Remover Card"
            >
                <Trash2 size={16} />
            </button>

            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
                    <div style={{ padding: '0.5rem', background: 'var(--surface-medium)', borderRadius: '8px' }}>
                        <Server size={14} color="var(--accent-blue)" />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {item.hosts[0]?.name || 'HOST DESCONHECIDO'}
                    </span>
                </div>

                <h3 style={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    lineHeight: '1.4',
                    marginBottom: '1rem',
                    display: '-webkit-box',
                    WebkitLineClamp: '3',
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                }}>
                    {item.name}
                </h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', background: 'var(--surface-dark)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                <Zap size={24} color={getGlowColor()} style={{ marginBottom: '0.4rem' }} />
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                    <span style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1px' }}>{num}</span>
                    <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 700 }}>{unit}</span>
                </div>
            </div>
        </motion.div>
    );
};

/**
 * CustomDashboard
 * Objetivo: Dashboard dinâmico onde o usuário pode fixar interfaces do Zabbix.
 */
const CustomDashboard = () => {
    // Estados principais
    const [isInitialLoading, setIsInitialLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isFilterLoading, setIsFilterLoading] = useState(false);
    const [error, setError] = useState(null);

    // Estados de dados
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [hostGroups, setHostGroups] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState('');

    // Persistence logic
    const [dashboards, setDashboards] = useState(() => {
        const saved = localStorage.getItem('custom_dashboards');
        return saved ? JSON.parse(saved) : { 'Default': [] };
    });
    const [activeDashboard, setActiveDashboard] = useState(() => {
        return localStorage.getItem('active_dashboard') || 'Default';
    });

    const [pinnedIds, setPinnedIds] = useState(dashboards[activeDashboard] || []);
    const [pinnedItems, setPinnedItems] = useState([]);
    const [showManager, setShowManager] = useState(false);
    const [newDashName, setNewDashName] = useState('');

    // Refs para evitar loops de efeitos
    const initialFetchDone = useRef(false);

    // Carregar grupos de host apenas uma vez
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                if (!zabbixService.token) await zabbixService.authenticate();
                const groups = await zabbixService.getHostGroups();
                setHostGroups(groups.sort((a, b) => a.name.localeCompare(b.name)));
            } catch (err) {
                console.error('Erro ao carregar grupos:', err);
            }
        };
        fetchGroups();
    }, []);

    // Sincronizar pinnedIds com a dashboard ativa
    useEffect(() => {
        const ids = dashboards[activeDashboard] || [];
        setPinnedIds(ids);
        localStorage.setItem('active_dashboard', activeDashboard);
    }, [activeDashboard]);

    // Salvar estado global das dashboards quando pinnedIds mudar
    useEffect(() => {
        setDashboards(prev => {
            const updated = { ...prev, [activeDashboard]: pinnedIds };
            if (JSON.stringify(updated) !== JSON.stringify(prev)) {
                localStorage.setItem('custom_dashboards', JSON.stringify(updated));
                return updated;
            }
            return prev;
        });
    }, [pinnedIds, activeDashboard]);

    // Função para buscar dados das interfaces fixadas
    const fetchPinnedData = useCallback(async (showLoading = false) => {
        if (pinnedIds.length === 0) {
            setPinnedItems([]);
            setIsInitialLoading(false);
            return;
        }

        if (showLoading) setIsInitialLoading(true);

        try {
            if (!zabbixService.token) await zabbixService.authenticate();
            const items = await zabbixService.getItemsByIds(pinnedIds);
            setPinnedItems(items);
            setError(null);
        } catch (err) {
            console.error('Error fetching pinned items:', err);
            setError('Falha na conexão com Zabbix.');
        } finally {
            setIsInitialLoading(false);
        }
    }, [pinnedIds]);

    // Carregar dados iniciais e configurar intervalo
    useEffect(() => {
        fetchPinnedData(true);
        const interval = setInterval(() => fetchPinnedData(false), 5000);
        return () => clearInterval(interval);
    }, [fetchPinnedData]);

    const handleSearch = async (e) => {
        e?.preventDefault();
        setIsFilterLoading(true);
        try {
            if (!zabbixService.token) await zabbixService.authenticate();
            const groupIds = selectedGroupId ? [selectedGroupId] : [];
            const results = await zabbixService.getAllTrafficItems(searchQuery, groupIds);
            setSearchResults(results);
            setIsSearching(true);
            setError(null);
        } catch (err) {
            console.error('Search failed:', err);
            setError('Busca falhou. Verifique o servidor.');
        } finally {
            setIsFilterLoading(false);
        }
    };

    const togglePin = (id) => {
        setPinnedIds(prev =>
            prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
        );
    };

    const createDashboard = (e) => {
        e.preventDefault();
        const name = newDashName.trim();
        if (!name || dashboards[name]) return;
        setDashboards(prev => ({ ...prev, [name]: [] }));
        setActiveDashboard(name);
        setNewDashName('');
    };

    const deleteDashboard = (name) => {
        if (name === 'Default') return;
        setDashboards(prev => {
            const { [name]: removed, ...rest } = prev;
            return rest;
        });
        if (activeDashboard === name) {
            setActiveDashboard('Default');
        }
    };

    return (
        <div style={{ padding: '0.8rem', maxWidth: '1600px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.8rem', background: 'var(--surface-medium)', borderRadius: '16px', border: '1px solid var(--accent-blue)' }}>
                            <BarChart3 size={28} color="var(--accent-blue)" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-1.5px', color: 'var(--text-primary)', lineHeight: '1' }}>
                                {activeDashboard.toUpperCase()}
                            </h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.6rem' }}>
                                <button
                                    onClick={() => setShowManager(!showManager)}
                                    style={{
                                        background: 'var(--surface-medium)',
                                        border: '1px solid var(--glass-border)',
                                        color: 'var(--text-secondary)',
                                        padding: '0.4rem 1rem',
                                        borderRadius: '10px',
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontWeight: 700,
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <Settings size={14} /> GERENCIAR DASHBOARDS
                                </button>
                                <span style={{ width: '4px', height: '4px', background: 'var(--glass-border)', borderRadius: '50%' }}></span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                                    {pinnedIds.length} INTERFACES
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div className="glass-card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '220px', border: selectedGroupId ? '1px solid var(--accent-blue)' : '1px solid var(--glass-border)', background: 'var(--surface-medium)' }}>
                        <Layers size={18} color={selectedGroupId ? "var(--accent-blue)" : "var(--text-secondary)"} />
                        <select
                            value={selectedGroupId}
                            onChange={(e) => setSelectedGroupId(e.target.value)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                width: '100%',
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                            }}
                        >
                            <option value="">TODOS OS GRUPOS</option>
                            {hostGroups.map(group => (
                                <option key={group.groupid} value={group.groupid} style={{ background: 'var(--background)' }}>
                                    {group.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="glass-card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '300px', background: 'var(--surface-medium)' }}>
                        <Search size={18} color="var(--text-secondary)" />
                        <input
                            type="text"
                            placeholder="Nome da interface..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '100%', fontSize: '0.9rem', fontWeight: 600 }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isFilterLoading}
                        style={{
                            background: 'var(--accent-blue)',
                            color: 'white',
                            border: 'none',
                            padding: '0.8rem 1.8rem',
                            borderRadius: '12px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            transition: 'all 0.2s ease',
                            opacity: isFilterLoading ? 0.7 : 1
                        }}
                    >
                        {isFilterLoading ? <RefreshCw size={20} className="spin" /> : <Filter size={20} />}
                        {isFilterLoading ? 'BUSCANDO...' : 'FILTRAR'}
                    </button>
                </form>
            </header>

            {error && (
                <div style={{ background: 'rgba(213,0,0,0.1)', color: 'var(--danger)', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 700, border: '1px solid var(--danger)' }}>
                    <AlertTriangle size={20} /> {error}
                </div>
            )}

            {/* Dashboard Manager Overlay */}
            <AnimatePresence>
                {showManager && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, y: -20 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -20 }}
                        className="glass-card"
                        style={{ padding: '2rem', marginBottom: '2.5rem', border: '1px solid var(--glass-border)', overflow: 'hidden', background: 'var(--surface-dark)' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <Settings size={20} color="var(--accent-blue)" />
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 900 }}>GERENCIAR DASHBOARDS</h3>
                            </div>
                            <button onClick={() => setShowManager(false)} style={{ background: 'var(--surface-medium)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                            {Object.keys(dashboards).map(name => (
                                <div key={name} style={{ position: 'relative', minWidth: '180px' }}>
                                    <button
                                        onClick={() => setActiveDashboard(name)}
                                        style={{
                                            width: '100%',
                                            textAlign: 'left',
                                            background: activeDashboard === name ? 'var(--accent-blue)' : 'var(--surface-medium)',
                                            color: activeDashboard === name ? 'white' : 'var(--text-primary)',
                                            border: '1px solid var(--glass-border)',
                                            padding: '1.2rem',
                                            borderRadius: '16px',
                                            cursor: 'pointer',
                                            fontWeight: 800,
                                            transition: 'all 0.2s ease',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '0.4rem'
                                        }}
                                    >
                                        <LayoutDashboard size={18} />
                                        <span>{name}</span>
                                        <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>{dashboards[name]?.length || 0} interfaces</span>
                                    </button>
                                    {name !== 'Default' && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteDashboard(name); }}
                                            style={{ position: 'absolute', right: '0.8rem', top: '0.8rem', background: 'rgba(213, 0, 0, 0.2)', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.3rem', borderRadius: '6px' }}
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <form onSubmit={createDashboard} style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '2rem', display: 'flex', gap: '1rem' }}>
                            <input
                                type="text"
                                placeholder="Nome do novo dashboard..."
                                value={newDashName}
                                onChange={(e) => setNewDashName(e.target.value)}
                                style={{ flex: 1, background: 'var(--surface-medium)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '1.2rem', color: 'var(--text-primary)', outline: 'none', fontWeight: 700 }}
                            />
                            <button
                                type="submit"
                                style={{ background: 'var(--success)', color: 'black', border: 'none', fontWeight: 900, padding: '0 2rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.8rem' }}
                            >
                                <PlusCircle size={22} /> CRIAR
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Resultado de Busca */}
            <AnimatePresence>
                {isSearching && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="glass-card"
                        style={{ padding: '2rem', marginBottom: '3rem', border: '1px solid var(--accent-blue)', background: 'var(--surface-dark)' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <Search size={20} color="var(--accent-blue)" />
                                RESULTADOS: <span style={{ color: 'var(--accent-blue)' }}>{searchResults.length}</span>
                            </h2>
                            <button onClick={() => setIsSearching(false)} style={{ background: 'var(--surface-medium)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.6rem', borderRadius: '50%' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.2rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                            {searchResults.map(item => (
                                <div
                                    key={item.itemid}
                                    style={{
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        background: pinnedIds.includes(item.itemid) ? 'var(--nav-active-bg)' : 'var(--surface-medium)',
                                        border: pinnedIds.includes(item.itemid) ? '1px solid var(--accent-blue)' : '1px solid var(--glass-border)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div style={{ maxWidth: '75%' }}>
                                        <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 800 }}>{item.hosts[0]?.name}</div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>{item.name}</div>
                                    </div>
                                    <button
                                        onClick={() => togglePin(item.itemid)}
                                        style={{
                                            background: pinnedIds.includes(item.itemid) ? 'var(--danger)' : 'var(--accent-blue)',
                                            color: 'white',
                                            border: 'none',
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        {pinnedIds.includes(item.itemid) ? <Trash2 size={16} /> : <Plus size={18} />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Grid Principal */}
            {isInitialLoading && pinnedIds.length > 0 && pinnedItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '10rem 0' }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                        <RefreshCw size={48} color="var(--accent-blue)" />
                    </motion.div>
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontWeight: 700 }}>CARREGANDO DADOS...</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '2rem' }}>
                    {pinnedItems.length > 0 ? (
                        pinnedItems.map(item => (
                            <CustomTrafficCard
                                key={item.itemid}
                                item={item}
                                onRemove={togglePin}
                            />
                        ))
                    ) : (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '6rem 2rem', background: 'var(--surface-low)', borderRadius: '32px', border: '2px dashed var(--glass-border)' }}>
                            <LayoutDashboard size={48} color="var(--text-secondary)" style={{ opacity: 0.3, marginBottom: '1.5rem' }} />
                            <h2 style={{ color: 'var(--text-primary)', fontWeight: 900, fontSize: '1.5rem' }}>DASHBOARD VAZIO</h2>
                            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontWeight: 600 }}>Use a busca acima para monitorar novas interfaces.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomDashboard;
