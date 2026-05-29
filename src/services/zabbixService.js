import axios from 'axios';

const isProduction = import.meta.env.PROD;
const ZABBIX_URL = isProduction ? '/api/zabbix' : import.meta.env.VITE_ZABBIX_URL;
const ZABBIX_USER = import.meta.env.VITE_ZABBIX_USER;
const ZABBIX_PASS = import.meta.env.VITE_ZABBIX_PASS;

class ZabbixService {
    constructor() {
        this.token = null;
        this.authPromise = null;
        this.client = axios.create({
            headers: {
                'Content-Type': 'application/json-rpc',
            },
        });
    }

    async request(method, params = {}, auth = true) {
        const response = await this.client.post(ZABBIX_URL, {
            jsonrpc: '2.0',
            method,
            params,
            id: 1,
            auth: auth ? this.token : null,
        });

        if (response.data.error) {
            const errorMsg = response.data.error.data || response.data.error.message;
            // Se for erro de sessão/autorização, limpamos o token para forçar re-auth
            if (errorMsg.toLowerCase().includes('session') || errorMsg.toLowerCase().includes('auth')) {
                this.token = null;
            }
            throw new Error(errorMsg);
        }

        return response.data.result;
    }

    async authenticate() {
        if (this.authPromise) return this.authPromise;

        this.authPromise = (async () => {
            try {
                this.token = await this.request('user.login', {
                    username: ZABBIX_USER,
                    password: ZABBIX_PASS,
                }, false);
                return this.token;
            } catch (error) {
                console.error('Zabbix Auth Error:', error);
                throw error;
            } finally {
                this.authPromise = null;
            }
        })();

        return this.authPromise;
    }

    async getHostByName(name) {
        const hosts = await this.request('host.get', {
            filter: { name: name },
            output: ['hostid', 'name']
        });
        return hosts[0];
    }

    async getTrafficData() {
        const bgpHost = await this.getHostByName('BGP - NE40');
        if (!bgpHost) return null;

        const items = await this.request('item.get', {
            hostids: bgpHost.hostid,
            output: ['itemid', 'name', 'lastvalue'],
            monitored: true
        });

        const getInterfaceTraffic = (prefix) => {
            const rxItem = items.find(i =>
                i.name.includes(prefix) && i.name.toLowerCase().includes('bits received')
            );
            const txItem = items.find(i =>
                i.name.includes(prefix) && i.name.toLowerCase().includes('bits sent')
            );

            return {
                rx: rxItem ? parseFloat(rxItem.lastvalue || 0) : 0,
                tx: txItem ? parseFloat(txItem.lastvalue || 0) : 0
            };
        };

        const speednet = getInterfaceTraffic('100GE0/3/1(');
        const star1_v4 = getInterfaceTraffic('100GE0/3/3.562(');
        const star1_v6 = getInterfaceTraffic('100GE0/3/3.563(');
        const ixce_v4 = getInterfaceTraffic('100GE0/3/3.1193(');
        const ixce_v6 = getInterfaceTraffic('100GE0/3/3.1194(');
        const ixce = { rx: ixce_v4.rx + ixce_v6.rx, tx: ixce_v4.tx + ixce_v6.tx };
        const ixsp_v4 = getInterfaceTraffic('100GE0/3/3.2473(');
        const ixsp_v6 = getInterfaceTraffic('100GE0/3/3.2474(');
        const ixsp = { rx: ixsp_v4.rx + ixsp_v6.rx, tx: ixsp_v4.tx + ixsp_v6.tx };
        const ixrj_v4 = getInterfaceTraffic('100GE0/3/3.1728(');
        const ixrj_v6 = getInterfaceTraffic('100GE0/3/3.1729(');
        const ixrj = { rx: ixrj_v4.rx + ixrj_v6.rx, tx: ixrj_v4.tx + ixrj_v6.tx };
        const ixthe_v4 = getInterfaceTraffic('100GE0/3/3.1110(');
        const ixthe_v6 = getInterfaceTraffic('100GE0/3/3.1111(');
        const ixthe = { rx: ixthe_v4.rx + ixthe_v6.rx, tx: ixthe_v4.tx + ixthe_v6.tx };
        const ixma_v4 = getInterfaceTraffic('Eth-Trunk0.1011(');
        const ixma_v6 = getInterfaceTraffic('Eth-Trunk0.1012(');
        const ixma = { rx: ixma_v4.rx + ixma_v6.rx, tx: ixma_v4.tx + ixma_v6.tx };

        const ixTotal = {
            rx: ixce.rx + ixsp.rx + ixrj.rx + ixthe.rx + ixma.rx,
            tx: ixce.tx + ixsp.tx + ixrj.tx + ixthe.tx + ixma.tx
        };

        return {
            speednet,
            star1: {
                rx: star1_v4.rx + star1_v6.rx,
                tx: star1_v4.tx + star1_v6.tx
            },
            ix: {
                total: ixTotal,
                ce: ixce,
                sp: ixsp,
                rj: ixrj,
                the: ixthe,
                ma: ixma
            }
        };
    }

    async getOpticalSignals() {
        const bgpHost = await this.getHostByName('BGP - NE40');
        if (!bgpHost) return { speednet: { rx: '-.--', tx: '-.--' }, star1: { rx: '-.--', tx: '-.--' } };

        const items = await this.request('item.get', {
            hostids: bgpHost.hostid,
            output: ['itemid', 'name', 'lastvalue', 'units'],
            search: {
                name: ['Potencia', 'dBm']
            },
            searchByAny: true,
            monitored: true
        });

        const getSignalForInterface = (ifaceName) => {
            // Filtramos itens que contenham o nome exato da interface no formato 100G ou o padrão de lane
            const rxItem = items.find(i =>
                i.name.includes(ifaceName) &&
                i.name.toLowerCase().includes('rx') &&
                (i.name.toLowerCase().includes('lane0') || !i.name.toLowerCase().includes('lane'))
            );
            const txItem = items.find(i =>
                i.name.includes(ifaceName) &&
                i.name.toLowerCase().includes('tx') &&
                (i.name.toLowerCase().includes('lane0') || !i.name.toLowerCase().includes('lane'))
            );

            return {
                rx: rxItem ? parseFloat(rxItem.lastvalue || 0).toFixed(2) : '-.--',
                tx: txItem ? parseFloat(txItem.lastvalue || 0).toFixed(2) : '-.--'
            };
        };

        // Usando o nome completo da interface para evitar match parcial (ex: 0/3/1 pegando 0/3/10)
        return {
            speednet: getSignalForInterface('100GE0/3/1'),
            star1: getSignalForInterface('100GE0/3/3')
        };
    }

    async getTrafficHistory(itemid, limit = 10) {
        return this.request('history.get', {
            itemids: itemid,
            history: 0,
            sortfield: 'clock',
            sortorder: 'DESC',
            limit: limit
        });
    }

    async getHosts() {
        return this.request('host.get', {
            output: ['hostid', 'name', 'status', 'available'],
            selectInterfaces: ['ip'],
            selectInventory: ['location', 'notes'],
            monitored_hosts: true,
        });
    }

    async getTriggers(since = null) {
        const params = {
            output: ['triggerid', 'description', 'priority', 'lastchange', 'value'],
            selectHosts: ['name'],
            only_true: true,
            filter: {
                value: 1,
            },
            sortfield: 'priority',
            sortorder: 'DESC',
        };

        if (since) {
            params.lastChangeSince = since;
        }

        return this.request('trigger.get', params);
    }

    async getLatencies() {
        const latencyTargets = [
            { name: "Google", icon: "google" },
            { name: "CloudFire", icon: "cloudflare" },
            { name: "Facebook CDN", icon: "facebook" },
            { name: "Akamai", icon: "server" },
            { name: "Netflix", icon: "monitor" },
            { name: "Paramount+", icon: "monitor" },
            { name: "Twitch", icon: "monitor" },
            { name: "PUBG", icon: "gamepad" },
            { name: "FREE FIRE", icon: "gamepad" }
        ];

        const items = await this.request('item.get', {
            search: { key_: 'icmpping' },
            output: ['itemid', 'name', 'lastvalue', 'key_'],
            selectHosts: ['name'],
            monitored: true
        });

        const latencies = [];
        for (const target of latencyTargets) {
            const matchedItems = items.filter(i =>
                (i.hosts && i.hosts.length > 0 && i.hosts[0].name.toLowerCase().includes(target.name.toLowerCase())) ||
                i.name.toLowerCase().includes(target.name.toLowerCase()) ||
                (i.key_ && i.key_.toLowerCase().includes(target.name.toLowerCase().replace(' ', '')))
            );

            if (matchedItems.length > 0) {
                const secItem = matchedItems.find(i => i.key_ && i.key_.includes('icmppingsec'));
                const lossItem = matchedItems.find(i => i.key_ && i.key_.includes('icmppingloss'));
                const pingItem = matchedItems.find(i => i.key_ && i.key_.includes('icmpping') && !i.key_.includes('sec') && !i.key_.includes('loss'));

                const secVal = secItem ? parseFloat(secItem.lastvalue) : null;
                const ms = secVal !== null && !isNaN(secVal) ? parseFloat((secVal * 1000).toFixed(2)) : 0;

                const lossVal = lossItem ? parseFloat(lossItem.lastvalue) : 0;
                const loss = !isNaN(lossVal) ? lossVal : 0;

                const statusVal = pingItem ? parseInt(pingItem.lastvalue, 10) : 1;
                const status = !isNaN(statusVal) ? statusVal : 1;

                latencies.push({
                    name: target.name,
                    icon: target.icon,
                    ms: ms,
                    loss: loss,
                    status: status
                });
            }
        }

        return latencies;
    }

    async getStats() {
        const hosts = await this.getHosts();
        const triggers = await this.getTriggers();

        return {
            totalHosts: hosts.length,
            availableHosts: hosts.filter(h => h.available == 1).length,
            problemHosts: hosts.filter(h => h.available == 2).length,
            activeTriggers: triggers.length,
            criticalTriggers: triggers.filter(t => t.priority >= 4).length,
        };
    }

    async getHostGroups() {
        return this.request('hostgroup.get', {
            output: ['groupid', 'name'],
            real_hosts: true,
            monitored_hosts: true
        });
    }

    async getAllTrafficItems(searchString = '', groupIds = []) {
        const params = {
            output: ['itemid', 'name', 'lastvalue', 'units'],
            selectHosts: ['name'],
            monitored: true,
            search: {
                name: 'bits'
            }
        };

        if (groupIds && groupIds.length > 0) {
            params.groupids = groupIds;
        }

        if (searchString) {
            params.searchByAny = true;
            params.search = {
                ...params.search,
                name: ['bits', searchString]
            };
        }

        const items = await this.request('item.get', params);
        return items.sort((a, b) => parseFloat(b.lastvalue || 0) - parseFloat(a.lastvalue || 0));
    }

    async getItemsByIds(itemIds) {
        if (!itemIds || itemIds.length === 0) return [];
        return this.request('item.get', {
            itemids: itemIds,
            output: ['itemid', 'name', 'lastvalue', 'units'],
            selectHosts: ['name']
        });
    }

    async getOltHealthData() {
        const groups = await this.getHostGroups();
        const oltGroup = groups.find(g => g.name === 'OLT');
        if (!oltGroup) return [];

        const hosts = await this.request('host.get', {
            groupids: oltGroup.groupid,
            output: ['hostid', 'name', 'status'],
            monitored_hosts: true,
            filter: { status: 0 }
        });

        const hostIds = hosts.map(h => h.hostid);

        const items = await this.request('item.get', {
            hostids: hostIds,
            output: ['itemid', 'name', 'lastvalue', 'units', 'key_', 'hostid'],
            search: {
                name: ['CPU', 'Mem', 'Uptime', 'Temperatura']
            },
            searchByAny: true,
            monitored: true
        });

        return hosts.map(host => {
            const hostItems = items.filter(i => i.hostid === host.hostid);

            // CPU: Média das placas ou CPU total
            const cpuItems = hostItems.filter(i =>
                (i.name.toLowerCase().includes('cpu') && i.name.toLowerCase().includes('placa')) ||
                (i.name.toLowerCase().includes('cpu') && i.name.toLowerCase().includes('utiliz'))
            );

            let cpuVal = null;
            if (cpuItems.length > 0) {
                const validCpuItems = cpuItems.filter(i => parseFloat(i.lastvalue) >= 0 && parseFloat(i.lastvalue) <= 100);
                if (validCpuItems.length > 0) {
                    const totalCpu = validCpuItems.reduce((acc, i) => acc + parseFloat(i.lastvalue || 0), 0);
                    cpuVal = (totalCpu / validCpuItems.length).toFixed(1);
                }
            }

            // Memória: Buscar padrões comuns de utilização de RAM
            const mem = hostItems.find(i =>
                (i.name.toLowerCase().includes('mem') && i.name.toLowerCase().includes('utiliz')) ||
                (i.name.toLowerCase().includes('ram') && i.name.toLowerCase().includes('utiliz')) ||
                (i.name.toLowerCase().includes('mem') && i.name.toLowerCase().includes('uso')) ||
                (i.name.toLowerCase().includes('dram') && i.name.toLowerCase().includes('utiliz'))
            );

            // Uptime: Tentar sysUpTime ou Uptime amigável
            const uptime = hostItems.find(i =>
                i.name.toLowerCase() === 'uptime' ||
                i.key_.includes('system.uptime') ||
                i.key_.includes('sysUpTime')
            );

            // Temperatura: Filtrar sensores de board e ignorar valores inválidos (0 ou erro de sensor)
            const tempItems = hostItems.filter(i =>
                (i.name.toLowerCase().includes('temp') || i.name.toLowerCase().includes('graus')) &&
                !i.name.toLowerCase().includes('pon') // Ignorar temperatura de SFP/PON se houver sensor de placa
            );

            let tempVal = null;
            if (tempItems.length > 0) {
                // Filtrar valores realistas (entre 1 e 120 graus) para ignorar o '0' bugado e o maxInt
                const realisticTemps = tempItems
                    .map(i => parseFloat(i.lastvalue))
                    .filter(v => v > 0 && v < 150 && v !== 2147483647);

                if (realisticTemps.length > 0) {
                    // Pegamos a maior temperatura entre as placas (pior cenário)
                    tempVal = Math.max(...realisticTemps).toFixed(1);
                }
            }

            return {
                id: host.hostid,
                name: host.name,
                cpu: cpuVal,
                memory: mem ? parseFloat(mem.lastvalue).toFixed(1) : null,
                uptime: uptime ? uptime.lastvalue : null,
                temperature: tempVal
            };
        });
    }

    async getRecentReboots() {
        const items = await this.request('item.get', {
            output: ['itemid', 'name', 'lastvalue', 'lastclock'],
            selectHosts: ['name', 'hostid'],
            search: {
                key_: ['system.uptime', 'sysUpTime']
            },
            searchByAny: true,
            filter: {
                value_type: 3
            },
            monitored: true
        });

        return items
            .filter(i => {
                const val = parseInt(i.lastvalue);
                return val > 0 && val < 14400;
            })
            .map(i => ({
                hostid: i.hosts[0].hostid,
                hostname: i.hosts[0].name,
                uptime: parseInt(i.lastvalue),
                itemid: i.itemid
            }))
            .sort((a, b) => a.uptime - b.uptime);
    }
}

export const zabbixService = new ZabbixService();
