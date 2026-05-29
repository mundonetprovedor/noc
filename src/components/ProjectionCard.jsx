/**
 * ProjectionCard.jsx
 * 
 * Componente que exibe um cartão de projeção de capacidade para um link específico.
 * Inclui o percentual de uso, crescimento e estimativa de dias para saturação (95%).
 * 
 * @param {string} title - Nome do link (ex: IX.BR (PTT)).
 * @param {number} current - Tráfego atual em bits.
 * @param {number} capacity - Capacidade total em bits.
 * @param {number} growth - Percentual de crescimento nos últimos 7 dias.
 * @param {number} daysToLimit - Estimativa automática de dias para atingir o limite.
 * @param {number|null} manualEstimate - Ajuste manual (se houver) para sobrescrever a estimativa automática.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar } from 'lucide-react';

const ProjectionCard = ({ title, current, capacity, growth, daysToLimit, manualEstimate }) => {
    const displayDays = manualEstimate !== undefined && manualEstimate !== null ? manualEstimate : daysToLimit;
    const percentage = ((current / capacity) * 100).toFixed(1);
    const isCritical = displayDays < 30;

    return (
        <div className="glass-card" style={{ padding: '1.5rem', border: isCritical ? '1px solid var(--danger)' : '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                    <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>{title}</h4>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '0.2rem' }}>{percentage}%</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>CRESCIMENTO (7D)</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.3rem' }}>
                        <TrendingUp size={14} /> +{growth}%
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ height: '8px', background: 'var(--surface-medium)', borderRadius: '4px', overflow: 'hidden' }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        style={{ height: '100%', background: isCritical ? 'var(--danger)' : 'var(--accent-blue)' }}
                    />
                </div>
            </div>

            <div style={{ background: isCritical ? 'rgba(255,71,87,0.1)' : 'var(--surface-dark)', padding: '1rem', borderRadius: '8px', border: isCritical ? '1px solid var(--danger)' : '1px solid var(--glass-border)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>ESTIMATIVA DE SATURAÇÃO (95%)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={16} color={isCritical ? 'var(--danger)' : 'var(--success)'} />
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: isCritical ? 'var(--danger)' : 'var(--success)' }}>
                        EM {displayDays} DIAS {manualEstimate ? '(AJUSTE MANUAL)' : ''}
                    </span>
                </div>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    {manualEstimate
                        ? 'Sobrescrito manualmente pelo administrador.'
                        : 'Baseado na regressão linear da última semana de picos de tráfego.'}
                </p>
            </div>
        </div>
    );
};

export default ProjectionCard;
