# NOC 2.0 - Monitoramento Zabbix

Este projeto é um dashboard moderno e premium para monitoramento de rede utilizando a API do Zabbix.

## Tecnologias Utilizadas
- **React + Vite**
- **Axios** (Consumo de API)
- **Framer Motion** (Animações suaves)
- **Lucide React** (Ícones modernos)
- **Recharts** (Gráficos de rede)
- **CSS Vanilla** (Glassmorphism & Design Premium)

## Configuração

1.  **Instalação**:
    ```bash
    npm install
    ```

2.  **Variáveis de Ambiente**:
    Edite o arquivo `.env` na raiz do projeto com os dados do seu servidor Zabbix:
    ```env
    VITE_ZABBIX_URL=https://seu-zabbix/api_jsonrpc.php
    VITE_ZABBIX_USER=SeuUsuario
    VITE_ZABBIX_PASS=SuaSenha
    ```

3.  **Execução**:
    ```bash
    npm run dev
    ```

## Recursos
- **Descoberta Automática**: O serviço consome a API do Zabbix para listar todos os hosts monitorados.
- **Alertas em Tempo Real**: Lista de incidentes ativos com prioridade.
- **Interface Premium**: Design em Dark Mode com efeitos de vidro (Glassmorphism) e micro-interações.
- **Responsivo**: Adaptado para diferentes resoluções de tela (Monitor NOC ou Desktop).
