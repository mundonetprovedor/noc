# PRD - Monitoramento Preditivo e Preventivo (NOC 2.0)

## 1. Introdução
Este documento detalha o plano de evolução do sistema NOC 2.0 de um modelo reativo para um modelo **preditivo e preventivo**. O objetivo é reduzir o MTTR (Mean Time To Repair) e, principalmente, aumentar o MTBF (Mean Time Between Failures) através da antecipação de anomalias.

## 2. Pilares da Melhoria

### A. Detecção Antecipada de Degradação de Link
*   **Funcionalidade**: Monitoramento de "Signal Drift" (Deriva de Sinal).
*   **Lógica**: Armazenar o sinal óptico de referência (baseline) e alertar caso a variação (Delta) exceda 1.5 dB em 24h, o que indica estresse físico na fibra ou degradação de SFP.
*   **Visualização**: Indicadores de tendência (setas de subida/descida) nos cards de Sinais Ópticos.

### B. Identificação Automática de Saturação (Capacity Watch)
*   **Funcionalidade**: Alerta de proximidade de limite.
*   **Lógica**: Definir a capacidade nominal dos links (ex: IX 100G, Star1 10G). Criar gatilhos em 80% (Warning) e 90% (Critical).
*   **Preditivo**: Analisar a taxa de crescimento (CAGR) do tráfego nos últimos 7 dias para estimar a data/hora em que o link atingirá 95% da capacidade.

### C. Alertas Inteligentes e Escalonamento
*   **Funcionalidade**: Integração com Telegram.
*   **Lógica**: Envio de notificações automáticas via bot para o grupo do NOC.
*   **Escalonamento**: 
    *   Nível 1 (Visual): Alerta no Dashboard.
    *   Nível 2 (Informativo): Telegram para avisos de 80% de carga.
    *   Nível 3 (Crítico): Telegram com @mention para avisos de 95% ou quedas de host.

### D. Dashboards Operacionais para NOC (View Master)
*   **Funcionalidade**: Tela de "Gestão de Saúde".
*   **Layout**: Um novo dashboard que resume a saúde de todos os setores (Links, OLTs, Bairros) em um único "Score de Disponibilidade".

### E. Capacity Planning (Histórico e Tendência)
*   **Funcionalidade**: Gráficos de Histórico de Longo Prazo.
*   **Lógica**: Integração com Zabbix History para exibir picos mensais e projetar a necessidade de upgrade de link.

## 3. Plano de Implementação Incremental

1.  **Fase 1 (Backend/Service)**: Atualizar o `zabbixService.js` para buscar dados históricos de 7 dias e calcular tendências.
2.  **Fase 2 (UI Interface)**: Adicionar medidores de porcentagem de uso nos cards de tráfego.
3.  **Fase 3 (Prevention Page)**: Criar a página de "Análise Preditiva".
4.  **Fase 4 (Notifications)**: Implementar service de integração com API de mensagens.

## 4. Impacto Esperado
*   **Eficiência**: Redução de 40% em incidentes de saturação não planejados.
*   **Confiança**: Maior previsibilidade para o time comercial e financeiro sobre custos de upgrade.
*   **Agilidade**: Identificação de degradação de fibra em minutos, antes que causem erros de CRC ou quedas de BGP.
