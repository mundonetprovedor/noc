import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Sun, Moon, Activity, LayoutDashboard, BarChart3, Server, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { AuthProvider } from './contexts/AuthContext';
import Overview from './pages/Overview';
import LatencyDashboard from './pages/LatencyDashboard';
import CustomDashboard from './pages/CustomDashboard';
import OltHealthDashboard from './pages/OltHealthDashboard';
import BairrosDashboard from './pages/BairrosDashboard';
import CapacityPlanning from './pages/CapacityPlanning';

const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateStr = time.toLocaleDateString('pt-BR', options).toUpperCase();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', marginRight: '1rem' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: '1' }}>
        {hours}:{minutes}<span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>{seconds}</span>
      </div>
      <div style={{ fontSize: '0.65rem', color: 'var(--accent-blue)', fontWeight: 600, letterSpacing: '0.5px' }}>
        {dateStr}
      </div>
    </div>
  );
};

const Layout = ({ children, theme, setTheme }) => {
  const location = useLocation();

  return (
    <div className="dashboard-container">
      <header className="header" style={{ marginBottom: '2.5rem' }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
        >
          <img
            src="/logo_mundonet_new.png"
            alt="Mundonet Telecom"
            style={{ height: '40px', objectFit: 'contain', filter: 'var(--logo-shadow)', marginLeft: '-10px' }}
          />
        </motion.div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Clock />
          <nav className="glass-card" style={{ padding: '0.5rem', display: 'flex', gap: '0.3rem', borderRadius: '16px' }}>
            <NavLink to="/" style={({ isActive }) => navStyle(isActive, 'var(--accent-blue)')}>
              <LayoutDashboard size={14} /> Visão Geral
            </NavLink>
            <NavLink to="/bairros" style={({ isActive }) => navStyle(isActive, 'var(--accent-purple)')}>
              <Activity size={14} /> Saúde Bairros
            </NavLink>
            <NavLink to="/olts" style={({ isActive }) => navStyle(isActive, 'var(--success)')}>
              <Server size={14} /> Saúde OLTs
            </NavLink>
            <NavLink to="/latencia" style={({ isActive }) => navStyle(isActive, 'var(--danger)')}>
              <Activity size={14} /> Latência
            </NavLink>
            <NavLink to="/capacity" style={({ isActive }) => navStyle(isActive, 'var(--warning)')}>
              <TrendingUp size={14} /> Planejamento
            </NavLink>
            <NavLink to="/custom" style={({ isActive }) => navStyle(isActive, 'var(--accent-blue)')}>
              <BarChart3 size={14} /> Sessões Custom
            </NavLink>
          </nav>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="glass-card"
              style={iconButtonStyle}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Moon size={18} color="#ffffff" /> : <Sun size={18} color="#ff9900" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const navStyle = (isActive, accent) => ({
  padding: '0.4rem 0.8rem',
  borderRadius: '8px',
  color: isActive ? 'var(--nav-active-text)' : 'var(--text-secondary)',
  background: isActive ? 'var(--nav-active-bg)' : 'transparent',
  border: isActive ? `1px solid ${accent}` : '1px solid transparent',
  textDecoration: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '0.8rem',
  fontWeight: 700,
  transition: 'all 0.2s ease',
  boxShadow: isActive ? '0 0 10px var(--surface-low) inset' : 'none'
});

const iconButtonStyle = {
  padding: '0.6rem',
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  background: 'var(--card-bg)',
  color: 'var(--text-primary)',
  borderRadius: '16px',
  border: '1px solid var(--glass-border)'
};

const App = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem('noc-theme') || 'dark');

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
    localStorage.setItem('noc-theme', theme);
  }, [theme]);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout theme={theme} setTheme={setTheme}>
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/latencia" element={<LatencyDashboard />} />
            <Route path="/olts" element={<OltHealthDashboard />} />
            <Route path="/bairros" element={<BairrosDashboard />} />
            <Route path="/capacity" element={<CapacityPlanning />} />
            <Route path="/custom" element={<CustomDashboard />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
