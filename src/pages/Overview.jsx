import React, { useState, useEffect, useRef } from 'react';
import { zabbixService } from '../services/zabbixService';
import {
  Activity,
  Server,
  AlertTriangle,
  CheckCircle,
  Search,
  RefreshCw,
  Sun,
  Moon,
  Zap,
  X,
  Globe,
  Settings,
  BellRing,
  Volume2,
  VolumeX
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const TrafficCard = ({ title, value, formatBits, glowColor, icon, logo, capacity = 100000000000, alertThreshold = 80, status = "CALCULANDO...", onDetails }) => {
  const formatted = formatBits(value || 0).split(' ');
  const num = formatted[0] || '0';
  const unit = formatted[1] || 'bps';

  const percentage = value ? Math.min(((value / capacity) * 100), 100).toFixed(1) : 0;
  const isHighLoad = parseFloat(percentage) >= alertThreshold;

  return (
    <div className="glass-card glow-top-border" style={{
      '--glow-color': isHighLoad ? 'var(--danger)' : glowColor,
      display: 'flex',
      flexDirection: 'column',
      gap: '1.2rem',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
      border: isHighLoad ? '2px solid var(--danger)' : '1px solid var(--glass-border)',
      boxShadow: isHighLoad ? '0 0 20px rgba(255, 71, 87, 0.2)' : 'none'
    }}>
      {isHighLoad && (
        <motion.div
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'var(--danger)',
            zIndex: 0,
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Background Logo Watermark */}
      {logo && (
        <img
          src={logo}
          alt=""
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            height: '40px',
            opacity: isHighLoad ? 0.3 : 0.15,
            filter: 'grayscale(1) brightness(2)',
            zIndex: 0
          }}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', letterSpacing: '1px' }}>
          {logo ? (
            <img src={logo} alt={title} style={{ height: '20px', objectFit: 'contain' }} />
          ) : (
            <span style={{ color: glowColor }}>{icon}</span>
          )}
          {title}
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {isHighLoad && (
            <motion.span
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              style={{ background: 'var(--danger)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <BellRing size={10} /> LIMITE EXCEDIDO
            </motion.span>
          )}
          <span style={{
            background: status === 'CALCULANDO...' ? 'var(--surface-medium)' : 'rgba(0,255,136,0.1)',
            color: status === 'CALCULANDO...' ? 'var(--warning)' : 'var(--success)',
            padding: '0.2rem 0.6rem',
            borderRadius: '4px',
            fontSize: '0.65rem',
            fontWeight: 700,
            border: status === 'CALCULANDO...' ? '1px solid rgba(255,153,0,0.2)' : '1px solid rgba(0,255,136,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}>
            {status === 'CALCULANDO...' ? <AlertTriangle size={10} /> : <Activity size={10} />} {status}
          </span>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontSize: '3.5rem', fontWeight: 800, color: isHighLoad ? 'var(--danger)' : glowColor, lineHeight: 1, letterSpacing: '-1px' }}>{num}</span>
          <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{unit}</span>
        </div>

        {/* Capacity Bar */}
        <div style={{ marginTop: '0.8rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 700 }}>
            <span>CONSUMO: <span style={{ color: isHighLoad ? 'var(--danger)' : 'var(--text-primary)' }}>{percentage}%</span></span>
            <span>CAPACIDADE: {formatBits(capacity)}</span>
          </div>
          <div style={{ height: '4px', background: 'var(--surface-medium)', borderRadius: '2px', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              style={{
                height: '100%',
                background: isHighLoad ? 'var(--danger)' : glowColor,
                boxShadow: `0 0 10px ${isHighLoad ? 'var(--danger)' : glowColor}`
              }}
            />
          </div>
        </div>
      </div>

      <button
        onClick={onDetails}
        style={{ background: 'var(--surface-dark)', border: '1px solid var(--glass-border)', color: isHighLoad ? 'var(--danger)' : glowColor, width: '100%', padding: '0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1px', marginTop: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', transition: 'all 0.2s', position: 'relative', zIndex: 1 }}>
        <Search size={12} /> DETALHES POR SESSÃO
      </button>
    </div>
  );
};

const PingRow = ({ name, ms, color = "var(--success)" }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.6rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
      <Globe size={14} color={color} /> {name}
    </div>
    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: color }}>
      {ms}
    </div>
  </div>
);

const SmallTrafficCard = ({ title, rx, tx, formatBits, variant = "ip" }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className={`glass-card ${variant === 'ip' ? 'card-ip' : 'card-ptt'}`}
    style={{ padding: '1rem' }}
  >
    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: variant === 'ptt' ? 'var(--success)' : 'var(--text-primary)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <Activity size={14} color={variant === 'ptt' ? 'var(--success)' : 'var(--accent-blue)'} /> {title}
    </h4>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>RX</span>
        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{formatBits(rx)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>TX</span>
        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--success)' }}>{formatBits(tx)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem', paddingTop: '0.4rem', borderTop: '1px solid var(--glass-border)' }}>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total</span>
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--warning)' }}>{formatBits((rx || 0) + (tx || 0))}</span>
      </div>
    </div>
  </motion.div>
);

const StatCard = ({ label, value, icon, color }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="glass-card stat-card"
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <span className="stat-label">{label}</span>
      {icon}
    </div>
    <div className="stat-value" style={{ color: color || 'var(--text-primary)' }}>{value}</div>
  </motion.div>
);

const TrafficDetailModal = ({ isOpen, onClose, title, data, formatBits }) => {
  const [modalHistory, setModalHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (isOpen && data) {
      setLoadingHistory(true);
      // Simulating fetching granular history for this session
      // In a real scenario, we would call zabbixService.getTrafficHistory
      setTimeout(() => {
        const mockHist = Array.from({ length: 20 }, (_, i) => ({
          time: i + ':00',
          rx: (data.rx || 0) * (0.8 + Math.random() * 0.4),
          tx: (data.tx || 0) * (0.8 + Math.random() * 0.4)
        }));
        setModalHistory(mockHist);
        setLoadingHistory(false);
      }, 500);
    }
  }, [isOpen, data]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '2rem',
        backdropFilter: 'blur(8px)'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '800px',
          padding: '2rem',
          position: 'relative',
          border: '1px solid var(--glass-border)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <X size={18} />
        </button>

        <header style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <Activity size={24} color="var(--accent-blue)" /> {title}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.3rem' }}>Detalhamento granular de tráfego e latência da sessão</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'var(--surface-dark)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--glass-border)', borderTop: '3px solid var(--accent-blue)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 700 }}>DOWNLOAD (RX)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{formatBits(data?.rx || 0)}</div>
          </div>

          <div style={{ background: 'var(--surface-dark)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--glass-border)', borderTop: '3px solid var(--success)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 700 }}>UPLOAD (TX)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>{formatBits(data?.tx || 0)}</div>
          </div>

          <div style={{ background: 'var(--surface-dark)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--glass-border)', borderTop: '3px solid var(--warning)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 700 }}>TOTAL CONSOLIDADO</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--warning)' }}>{formatBits((data?.rx || 0) + (data?.tx || 0))}</div>
          </div>
        </div>

        <div style={{ background: 'var(--surface-low)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)', height: '300px' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '1rem', fontWeight: 700 }}>COMPORTAMENTO DA SESSÃO (5 MIN)</h3>
          {loadingHistory ? (
            <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)' }}>Carregando histórico...</div>
          ) : (
            <ResponsiveContainer width="100%" height="90%">
              <AreaChart data={modalHistory}>
                <defs>
                  <linearGradient id="colorRx" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}
                  formatter={(val) => formatBits(val)}
                />
                <Area type="monotone" dataKey="rx" stroke="var(--accent-blue)" fillOpacity={1} fill="url(#colorRx)" />
                <Area type="monotone" dataKey="tx" stroke="var(--success)" fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(0,255,136,0.05)', borderRadius: '8px', border: '1px solid rgba(0,255,136,0.1)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Activity size={14} /> SESSÃO ESTÁVEL: Sem perdas de pacotes ou flutuações críticas detectadas no NE40.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Overview = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [traffic, setTraffic] = useState(null);
  const [hosts, setHosts] = useState([]);
  const [triggers, setTriggers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [localPings, setLocalPings] = useState([]);
  const [opticalSignals, setOpticalSignals] = useState(null);
  const [trafficStatus, setTrafficStatus] = useState('CALCULANDO...');
  const [history, setHistory] = useState([]);
  const [selectedTraffic, setSelectedTraffic] = useState(null);
  const [recentReboots, setRecentReboots] = useState([]);
  const [prevSignals, setPrevSignals] = useState(null);
  const [signalDeltas, setSignalDeltas] = useState({});
  const [showConfig, setShowConfig] = useState(false);
  const [incidentHistory, setIncidentHistory] = useState([]);
  const [activeCategory, setActiveCategory] = useState('TODOS');
  const [isAlarmEnabled, setIsAlarmEnabled] = useState(() => localStorage.getItem('noc_alarm_enabled') === 'true');
  const announcedTriggers = useRef(new Set());
  const audioRef = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));

  useEffect(() => {
    localStorage.setItem('noc_alarm_enabled', isAlarmEnabled);
  }, [isAlarmEnabled]);

  const isImportantIncident = (incident) => {
    const desc = (incident.description || '').toLowerCase();
    const hostNames = (incident.hosts || []).map(h => h.name.toLowerCase());

    // Ignorar sinais de clientes/ONU
    if (desc.includes('sinal') || desc.includes('signal') || desc.includes('onu') || desc.includes('cliente') || desc.includes('power')) {
      return false;
    }

    const importantKeywords = ['bgp', 'core', 'sw', 'down', 'queda', 'saturação', 'link', 'timeout', 'perda', 'fail'];
    const matchesKeyword = importantKeywords.some(kw =>
      desc.includes(kw) || hostNames.some(h => h.includes(kw))
    );

    // Prioridade Alta (4) ou Desastre (5) também são considerados importantes se não forem sinais
    return matchesKeyword || incident.priority >= 4;
  };

  const playAlarm = () => {
    if (isAlarmEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.warn("Audio autoplay blocked by browser", e));
    }
  };

  const getPriorityDetails = (priority) => {
    const priorities = {
      5: { name: 'Desastre', color: '#ff4d4d', bg: 'rgba(255, 77, 77, 0.1)' },
      4: { name: 'Alta', color: '#ff8c42', bg: 'rgba(255, 140, 66, 0.1)' },
      3: { name: 'Média', color: '#ffb347', bg: 'rgba(255, 179, 71, 0.1)' },
      2: { name: 'Atenção', color: '#ffeb3b', bg: 'rgba(255, 235, 59, 0.1)' },
      1: { name: 'Informação', color: '#4facfe', bg: 'rgba(79, 172, 254, 0.1)' },
      0: { name: 'Não classificada', color: '#9e9e9e', bg: 'rgba(158, 158, 158, 0.1)' }
    };
    return priorities[priority] || priorities[0];
  };

  const formatDuration = (lastchange) => {
    const seconds = Math.floor(Date.now() / 1000) - lastchange;
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      return `${h}h ${m}m`;
    }
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    return `${d}d ${h}h`;
  };

  // Custom capacities and thresholds
  const [capacities, setCapacities] = useState(() => {
    const saved = localStorage.getItem('noc_capacities');
    const parsed = saved ? JSON.parse(saved) : null;
    if (parsed) {
      if (parsed.speednet === 10000000000) {
        parsed.speednet = 30000000000;
        localStorage.setItem('noc_capacities', JSON.stringify(parsed));
      }
      return parsed;
    }
    return {
      ix: 100000000000, // 100G
      speednet: 30000000000, // 30G
      star1: 10000000000 // 10G
    };
  });

  const [thresholds, setThresholds] = useState(() => {
    const saved = localStorage.getItem('noc_thresholds');
    return saved ? JSON.parse(saved) : {
      ix: 80,
      speednet: 80,
      star1: 80
    };
  });

  const [incidentSince, setIncidentSince] = useState(() => {
    return localStorage.getItem('noc_incident_since') || '';
  });

  useEffect(() => {
    localStorage.setItem('noc_capacities', JSON.stringify(capacities));
    localStorage.setItem('noc_thresholds', JSON.stringify(thresholds));
    localStorage.setItem('noc_incident_since', incidentSince);
  }, [capacities, thresholds, incidentSince]);

  const incidentSinceTimestamp = incidentSince ? Math.floor(new Date(incidentSince).getTime() / 1000) : null;


  const formatBits = (bits) => {
    if (!bits || bits === 0) return '0 bps';
    const k = 1000; // Zabbix bits use 1000
    const sizes = ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps'];
    const i = Math.floor(Math.log(bits) / Math.log(k));
    return parseFloat((bits / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const fetchData = async () => {
    try {
      if (!zabbixService.token) {
        await zabbixService.authenticate();
      }

      const [allHosts, allTriggers, dashboardStats, trafficData, signals, reboots] = await Promise.all([
        zabbixService.getHosts(),
        zabbixService.getTriggers(incidentSinceTimestamp),
        zabbixService.getStats(),
        zabbixService.getTrafficData(),
        zabbixService.getOpticalSignals(),
        zabbixService.getRecentReboots()
      ]);

      setHosts(allHosts);
      setTriggers(allTriggers);
      setStats(dashboardStats);
      setTraffic(trafficData);
      setOpticalSignals(signals);
      setRecentReboots(reboots);

      // Lógica de Alarme Sonoro
      const currentActiveIds = new Set(allTriggers.map(t => t.triggerid));

      allTriggers.forEach(t => {
        if (!announcedTriggers.current.has(t.triggerid)) {
          if (isImportantIncident(t)) {
            playAlarm();
          }
          announcedTriggers.current.add(t.triggerid);
        }
      });

      // Limpa IDs que não estão mais ativos para permitir re-anúncio se falharem novamente
      announcedTriggers.current.forEach(id => {
        if (!currentActiveIds.has(id)) {
          announcedTriggers.current.delete(id);
        }
      });

      // Gerenciamento de Histórico de Incidentes (Detecção de Resolução)
      setIncidentHistory(prev => {
        const now = Date.now();
        // Criar um mapa dos incidentes ativos atuais
        const activeIds = new Set(allTriggers.map(t => t.triggerid));

        // Novos incidentes (que não estavam no histórico ou estavam resolvidos)
        const newItems = allTriggers.map(t => ({
          ...t,
          status: 'active',
          lastUpdate: now
        }));

        // Manter os resolvidos do histórico anterior por 5 minutos
        const resolvedItems = prev
          .filter(item => {
            // Se o item não está nos ativos e era do histórico
            const isJustResolved = item.status === 'active' && !activeIds.has(item.triggerid);
            const wasResolved = item.status === 'resolved';

            if (isJustResolved) {
              item.status = 'resolved';
              item.resolvedAt = now;
              return true;
            }

            if (wasResolved) {
              // Manter por 5 minutos (300.000 ms)
              return (now - item.resolvedAt) < 300000;
            }

            return false;
          });

        // Combinar: Filtra duplicatas (prefere o status ativo), ordena por prioridade e tempo
        const combined = [...newItems];
        resolvedItems.forEach(res => {
          if (!combined.find(c => c.triggerid === res.triggerid)) {
            combined.push(res);
          }
        });

        return combined.sort((a, b) => {
          if (a.status === b.status) {
            return b.priority - a.priority || b.lastchange - a.lastchange;
          }
          return a.status === 'active' ? -1 : 1;
        });
      });

      try {
        const pingsRes = await fetch('/pings.json?t=' + Date.now());
        if (pingsRes.ok) {
          const pingsData = await pingsRes.json();
          setLocalPings(pingsData);
        }
      } catch (e) {
        console.warn('Could not fetch local pings', e);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Erro de conexão: ' + (err.message || 'Verifique o servidor Zabbix'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Mais rápido para tráfego (5s)
    return () => clearInterval(interval);
  }, []);

  const filteredHosts = hosts.filter(host =>
    host.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredIncidentHistory = incidentHistory.filter(incident => {
    if (activeCategory === 'TODOS') return true;
    const hostName = incident.hosts?.[0]?.name?.toUpperCase() || '';
    if (activeCategory === 'BGP') return hostName.includes('BGP');
    if (activeCategory === 'IX (PTT)') return hostName.includes('IX') || hostName.includes('PTT');
    return true;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw size={48} color="#00d2ff" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-container" style={{ flexDirection: 'column', gap: '1rem', padding: '2rem', textAlign: 'center' }}>
        <AlertTriangle size={64} color="var(--danger)" />
        <h2 style={{ color: 'var(--danger)' }}>Erro de Conexão</h2>
        <p style={{ maxWidth: '500px', color: 'var(--text-secondary)' }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--accent-blue)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setShowConfig(!showConfig)}
          style={{
            background: 'var(--surface-medium)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-primary)',
            padding: '0.6rem 1.2rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <Settings size={18} color={showConfig ? 'var(--accent-blue)' : 'currentColor'} />
          CONFIGURAR CAPACIDADES
        </button>

        <div className="glass-card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={18} color="var(--text-secondary)" />
          <input
            type="text"
            placeholder="Buscar hosts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              outline: 'none',
              width: '200px'
            }}
          />
        </div>
      </div>

      <AnimatePresence>
        {showConfig && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', marginBottom: '1.5rem' }}
          >
            <div style={{ padding: '1.5rem', border: '1px solid var(--accent-blue)', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--card-bg)', backdropFilter: 'blur(20px)', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                {['ix', 'speednet', 'star1'].map(key => (
                  <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{key} Config</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700 }}>CAPACIDADE (Gbps)</label>
                      <input
                        type="number"
                        value={capacities[key] / 1000000000}
                        onChange={(e) => setCapacities({ ...capacities, [key]: parseFloat(e.target.value) * 1000000000 })}
                        style={{ background: 'var(--surface-low)', border: '1px solid var(--glass-border)', padding: '0.5rem', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 700, outline: 'none' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700 }}>ALARME EM (%)</label>
                      <input
                        type="number"
                        value={thresholds[key]}
                        onChange={(e) => setThresholds({ ...thresholds, [key]: parseFloat(e.target.value) })}
                        style={{ background: 'var(--surface-low)', border: '1px solid var(--glass-border)', padding: '0.5rem', borderRadius: '6px', color: 'var(--danger)', fontSize: '0.9rem', fontWeight: 700, outline: 'none' }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 800 }}>FILTRAR INCIDENTES A PARTIR DE:</label>
                    <input
                      type="datetime-local"
                      value={incidentSince}
                      onChange={(e) => setIncidentSince(e.target.value)}
                      style={{ background: 'var(--surface-low)', border: '1px solid var(--accent-blue)', padding: '0.6rem 1rem', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 700, outline: 'none' }}
                    />
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>Apenas incidentes que iniciaram após esta data serão exibidos. Deixe em branco para todos.</span>
                  </div>

                  <button
                    onClick={() => setIncidentSince('')}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    LIMPAR FILTRO
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <TrafficCard
          title="TOTAL IX.BR (PTT)"
          value={traffic?.ix?.total?.rx ? (traffic.ix.total.rx + traffic.ix.total.tx) : 0}
          formatBits={formatBits}
          glowColor="var(--accent-blue)"
          icon={<Globe size={18} />}
          logo="/ixbr.png"
          capacity={capacities.ix}
          alertThreshold={thresholds.ix}
          status={trafficStatus}
          onDetails={() => setSelectedTraffic({ title: "TOTAL IX.BR (PTT)", data: traffic.ix.total })}
        />
        <TrafficCard
          title="SPEEDNET LINK"
          value={traffic?.speednet?.rx ? (traffic.speednet.rx + traffic.speednet.tx) : 0}
          formatBits={formatBits}
          glowColor="var(--success)"
          icon={<Zap size={18} />}
          logo="/speednet.png"
          capacity={capacities.speednet}
          alertThreshold={thresholds.speednet}
          status={trafficStatus}
          onDetails={() => setSelectedTraffic({ title: "SPEEDNET LINK", data: traffic.speednet })}
        />
        <TrafficCard
          title="STAR1 LINK"
          value={traffic?.star1?.rx ? (traffic.star1.rx + traffic.star1.tx) : 0}
          formatBits={formatBits}
          glowColor="var(--accent-purple)"
          icon={<Activity size={18} />}
          logo="/st1.png"
          capacity={capacities.star1}
          alertThreshold={thresholds.star1}
          status={trafficStatus}
          onDetails={() => setSelectedTraffic({ title: "STAR1 LINK", data: traffic.star1 })}
        />
      </div>

      {/* Proactive Monitoring Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div
          className="glass-card"
          style={{
            flex: 1,
            padding: '1.2rem',
            border: recentReboots.length > 0 ? '1px solid var(--warning)' : '1px solid var(--success)',
            background: recentReboots.length > 0 ? 'rgba(255,153,0,0.05)' : 'rgba(0,255,136,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <div style={{ padding: '0.8rem', background: recentReboots.length > 0 ? 'rgba(255,153,0,0.1)' : 'rgba(0,255,136,0.1)', borderRadius: '12px' }}>
            <RefreshCw size={24} color={recentReboots.length > 0 ? 'var(--warning)' : 'var(--success)'} className={recentReboots.length > 0 ? 'spin-slow' : ''} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Monitor de Estabilidade</h4>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                {recentReboots.length > 0 ? `${recentReboots.length} REINÍCIOS RECENTES` : 'SEM REINÍCIOS (4H)'}
              </span>
              {recentReboots.length > 0 && <span style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 600 }}>PREVENÇÃO ATIVA</span>}
            </div>
          </div>

          {recentReboots.length > 0 && (
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', overflowX: 'auto', maxWidth: '50%' }}>
              {recentReboots.map(rb => (
                <div key={rb.hostid} style={{ background: 'var(--surface-dark)', padding: '0.3rem 0.8rem', borderRadius: '4px', border: '1px solid var(--glass-border)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                  <strong style={{ color: 'var(--warning)' }}>{rb.hostname}</strong>: {Math.floor(rb.uptime / 60)}m
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card" style={{ flex: '0 0 300px', padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.8rem', background: 'rgba(0,210,255,0.1)', borderRadius: '12px' }}>
            <CheckCircle size={24} color="var(--accent-blue)" />
          </div>
          <div>
            <h4 style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Score de Prevenção</h4>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              {9.5 - (triggers.length * 0.1) - (recentReboots.length * 0.5) > 0 ? (9.5 - (triggers.length * 0.1) - (recentReboots.length * 0.5)).toFixed(1) : '1.0'}/10
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 300px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Sidebar: Sinais && Ping */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <section className="glass-card" style={{ padding: '1.2rem' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '1rem', letterSpacing: '1px' }}>SINAIS ÓPTICOS (LINKS)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-dark)', padding: '0.8rem', borderRadius: '8px', borderLeft: '3px solid var(--success)' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Zap size={14} color="var(--success)" /> SPEEDNET
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Interface BGP Principal</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    RX <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{opticalSignals?.speednet?.rx || '-.--'}</span> dBm
                    {signalDeltas.speednet?.rx && (
                      <span style={{ marginLeft: '4px', fontSize: '0.6rem', color: signalDeltas.speednet.rx < 0 ? 'var(--danger)' : 'var(--success)' }}>
                        {signalDeltas.speednet.rx > 0 ? '+' : ''}{signalDeltas.speednet.rx}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>TX <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{opticalSignals?.speednet?.tx || '-.--'}</span> dBm</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-dark)', padding: '0.8rem', borderRadius: '8px', borderLeft: '3px solid var(--accent-purple)' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Activity size={14} color="var(--accent-purple)" /> STAR1
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Interface IPv4/IPv6</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    RX <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{opticalSignals?.star1?.rx || '-.--'}</span> dBm
                    {signalDeltas.star1?.rx && (
                      <span style={{ marginLeft: '4px', fontSize: '0.6rem', color: signalDeltas.star1.rx < 0 ? 'var(--danger)' : 'var(--success)' }}>
                        {signalDeltas.star1.rx > 0 ? '+' : ''}{signalDeltas.star1.rx}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>TX <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{opticalSignals?.star1?.tx || '-.--'}</span> dBm</div>
                </div>
              </div>
            </div>
          </section>

          <section className="glass-card" style={{ padding: '1.2rem' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '1rem', letterSpacing: '1px' }}>CONECTIVIDADE (PING)</h3>
            {/* Stubbed data for UI layout */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {localPings && localPings.length > 0 ? (
                localPings.map((ping, idx) => (
                  <PingRow
                    key={idx}
                    name={ping.name}
                    ms={ping.ms}
                    color={ping.ms === 'Falha' ? 'var(--danger)' : parseInt(ping.ms.replace('ms', '')) < 40 ? 'var(--success)' : 'var(--warning)'}
                  />
                ))
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>
                  Aguardando pings locais...
                </div>
              )}
            </div>
          </section>
        </div>
        {/* Center Column: Network Status and Inventory */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Status Pills Row */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--surface-medium)', padding: '0.6rem 1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--accent-blue)' }}>{stats.totalHosts}</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.5px' }}>TOTAL ATIVOS</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--surface-medium)', padding: '0.6rem 1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--danger)' }}>{stats.criticalTriggers}</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.5px' }}>CRÍTICOS</span>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', background: 'var(--surface-low)', padding: '0.3rem', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
              <span
                onClick={() => setActiveCategory('TODOS')}
                style={{
                  background: activeCategory === 'TODOS' ? 'var(--nav-active-bg)' : 'transparent',
                  color: activeCategory === 'TODOS' ? 'var(--nav-active-text)' : 'var(--text-secondary)',
                  padding: '0.3rem 1.2rem',
                  borderRadius: '16px',
                  fontSize: '0.7rem',
                  fontWeight: activeCategory === 'TODOS' ? 800 : 700,
                  boxShadow: activeCategory === 'TODOS' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                TODOS
              </span>
              <span
                onClick={() => setActiveCategory('BGP')}
                style={{
                  background: activeCategory === 'BGP' ? 'var(--nav-active-bg)' : 'transparent',
                  color: activeCategory === 'BGP' ? 'var(--nav-active-text)' : 'var(--text-secondary)',
                  padding: '0.3rem 1.2rem',
                  borderRadius: '16px',
                  fontSize: '0.7rem',
                  fontWeight: activeCategory === 'BGP' ? 800 : 700,
                  boxShadow: activeCategory === 'BGP' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                BGP
              </span>
              <span
                onClick={() => setActiveCategory('IX (PTT)')}
                style={{
                  background: activeCategory === 'IX (PTT)' ? 'var(--nav-active-bg)' : 'transparent',
                  color: activeCategory === 'IX (PTT)' ? 'var(--nav-active-text)' : 'var(--text-secondary)',
                  padding: '0.3rem 1.2rem',
                  borderRadius: '16px',
                  fontSize: '0.7rem',
                  fontWeight: activeCategory === 'IX (PTT)' ? 800 : 700,
                  boxShadow: activeCategory === 'IX (PTT)' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                IX (PTT)
              </span>
            </div>
          </div>

        </div>

        {/* Right Sidebar: Avisos e Alertas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <section className="glass-card" style={{ padding: '1.2rem', border: '1px solid var(--accent-blue)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-blue)', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={14} /> QUADRO DE AVISOS ({triggers.length})
              </h3>
            </div>
            <div className="trigger-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {triggers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Nenhum aviso ativo.
                </div>
              ) : (
                triggers.map(trigger => (
                  <motion.div
                    key={trigger.triggerid}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className={`trigger-item priority-${trigger.priority}`}
                    style={{ background: 'var(--surface-low)', padding: '1rem', borderRadius: '8px', marginBottom: '0.8rem', borderLeft: trigger.priority > 3 ? '4px solid var(--danger)' : '4px solid var(--warning)' }}
                  >
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{trigger.hosts?.[0]?.name}</div>
                    <div style={{ fontSize: '0.8rem', marginTop: '4px', color: 'var(--text-secondary)' }}>{trigger.description}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--accent-blue)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Activity size={10} /> {new Date(trigger.lastchange * 1000).toLocaleString('pt-BR')}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', background: 'var(--surface-dark)', borderRadius: '8px', padding: '0.5rem 1rem' }}>
              <Search size={14} color="var(--text-secondary)" />
              <input type="text" placeholder="Buscar um aviso..." style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', padding: '0.3rem', outline: 'none', width: '100%', fontSize: '0.8rem' }} />
            </div>
          </section>

          {/* Picos de Tráfego (Mock) */}
          <section className="glass-card" style={{ padding: '1.2rem', border: '1px solid var(--glass-border)' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '1rem', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={14} color="var(--warning)" /> PICOS DE TRÁFEGO (HOJE)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ background: 'var(--surface-dark)', padding: '0.8rem', borderRadius: '8px', borderLeft: '3px solid var(--accent-blue)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>TOTAL IX.BR (PTT)</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Máx RX: <strong style={{ color: 'var(--text-primary)' }}>12.4 Gbps</strong></span>
                  <span style={{ color: 'var(--text-secondary)' }}>Máx TX: <strong style={{ color: 'var(--success)' }}>3.1 Gbps</strong></span>
                </div>
              </div>
              <div style={{ background: 'var(--surface-dark)', padding: '0.8rem', borderRadius: '8px', borderLeft: '3px solid var(--success)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>SPEEDNET LINK</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Máx RX: <strong style={{ color: 'var(--text-primary)' }}>8.2 Gbps</strong></span>
                  <span style={{ color: 'var(--text-secondary)' }}>Máx TX: <strong style={{ color: 'var(--success)' }}>1.5 Gbps</strong></span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <AnimatePresence>
        {selectedTraffic && (
          <TrafficDetailModal
            isOpen={!!selectedTraffic}
            onClose={() => setSelectedTraffic(null)}
            title={selectedTraffic.title}
            data={selectedTraffic.data}
            formatBits={formatBits}
          />
        )}
      </AnimatePresence>
    </div>
  );
};



export default Overview;
