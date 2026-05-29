import React from 'react';
import { motion } from 'framer-motion';
import { Activity, MapPin, Construction } from 'lucide-react';

const BairrosDashboard = () => {
    return (
        <div style={{ padding: '0.5rem' }}>
            <header style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1.5px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Activity size={32} color="var(--accent-purple)" /> SAÚDE DOS BAIRROS
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontWeight: 500, fontSize: '1rem' }}>
                    Monitoramento geográfico de estabilidade e incidentes por região.
                </p>
            </header>

            <div style={{ height: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '32px', border: '2px dashed var(--glass-border)' }}>
                <div style={{ position: 'relative' }}>
                    <MapPin size={80} color="var(--accent-purple)" style={{ opacity: 0.3 }} />
                    <Construction size={32} color="var(--warning)" style={{ position: 'absolute', bottom: 0, right: 0 }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ color: 'var(--text-primary)', fontWeight: 800 }}>EM CONSTRUÇÃO</h2>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', marginTop: '0.5rem' }}>
                        Esta funcionalidade está sendo integrada ao mapa geográfico para exibição de incidentes em tempo real.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BairrosDashboard;
