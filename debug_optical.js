import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const ZABBIX_URL = process.env.VITE_ZABBIX_URL;
const ZABBIX_USER = process.env.VITE_ZABBIX_USER;
const ZABBIX_PASS = process.env.VITE_ZABBIX_PASS;

async function debugOpticalSignals() {
    console.log('--- Zabbix Optical Signal Debugger ---');
    try {
        const authResponse = await axios.post(ZABBIX_URL, {
            jsonrpc: '2.0',
            method: 'user.login',
            params: { username: ZABBIX_USER, password: ZABBIX_PASS },
            id: 1,
            auth: null
        });

        const token = authResponse.data.result;
        console.log('Auth OK');

        const hostResponse = await axios.post(ZABBIX_URL, {
            jsonrpc: '2.0',
            method: 'host.get',
            params: { filter: { name: 'BGP - NE40' }, output: ['hostid', 'name'] },
            id: 1,
            auth: token
        });

        const host = hostResponse.data.result[0];
        if (!host) {
            console.log('Host BGP - NE40 not found');
            return;
        }
        console.log(`Found Host: ${host.name} (${host.hostid})`);

        const itemsResponse = await axios.post(ZABBIX_URL, {
            jsonrpc: '2.0',
            method: 'item.get',
            params: {
                hostids: host.hostid,
                output: ['itemid', 'name', 'lastvalue', 'units', 'key_'],
                search: {
                    name: 'Optical'
                }
            },
            id: 1,
            auth: token
        });

        const items = itemsResponse.data.result;
        console.log(`Found ${items.length} items with 'Optical' in name:`);
        items.forEach(item => {
            console.log(`- ${item.name} | Key: ${item.key_} | Value: ${item.lastvalue} ${item.units}`);
        });

        // Also search for dBm specifically if no Optical items found
        if (items.length === 0) {
            console.log('Searching for dBm...');
            const dbmItemsRes = await axios.post(ZABBIX_URL, {
                jsonrpc: '2.0',
                method: 'item.get',
                params: {
                    hostids: host.hostid,
                    output: ['itemid', 'name', 'lastvalue', 'units', 'key_'],
                    search: { units: 'dBm' }
                },
                id: 1,
                auth: token
            });
            const dbmItems = dbmItemsRes.data.result;
            console.log(`Found ${dbmItems.length} items with 'dBm' unit:`);
            dbmItems.forEach(item => {
                console.log(`- ${item.name} | Key: ${item.key_} | Value: ${item.lastvalue} ${item.units}`);
            });
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

debugOpticalSignals();
