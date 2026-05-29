
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

const ZABBIX_URL = process.env.VITE_ZABBIX_URL;
const ZABBIX_USER = process.env.VITE_ZABBIX_USER;
const ZABBIX_PASS = process.env.VITE_ZABBIX_PASS;

async function debugOltItems() {
    try {
        console.log(`Using URL: ${ZABBIX_URL}`);
        // Authenticate
        const authResponse = await axios.post(ZABBIX_URL, {
            jsonrpc: '2.0',
            method: 'user.login',
            params: {
                username: ZABBIX_USER,
                password: ZABBIX_PASS
            },
            id: 1
        });

        if (!authResponse.data.result) {
            console.error('Login Failed:', authResponse.data.error || authResponse.data);
            return;
        }

        const token = authResponse.data.result;
        console.log('Login Successful');

        // Find Host
        const hostResponse = await axios.post(ZABBIX_URL, {
            jsonrpc: '2.0',
            method: 'host.get',
            params: {
                filter: { name: 'OLT MUNDONET MARACANA HW' },
                output: ['hostid', 'name']
            },
            id: 2
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!hostResponse.data || !hostResponse.data.result || !hostResponse.data.result.length) {
            console.log('Host not found or API error:', hostResponse.data);
            return;
        }

        const hostid = hostResponse.data.result[0].hostid;
        console.log(`Checking items for Host ID: ${hostid} (${hostResponse.data.result[0].name})`);

        // Get All Items
        const itemsResponse = await axios.post(ZABBIX_URL, {
            jsonrpc: '2.0',
            method: 'item.get',
            params: {
                hostids: hostid,
                output: ['name', 'key_', 'lastvalue', 'units'],
                monitored: true
            },
            id: 3
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const items = itemsResponse.data.result;
        console.log(`Found ${items.length} items.`);

        const searchTerms = ['temp', 'temperature', 'graus', 'cpu', 'mem', 'uptime', 'ram', 'util', 'uso'];
        const relevantItems = items.filter(i =>
            searchTerms.some(term => i.name.toLowerCase().includes(term) || i.key_.toLowerCase().includes(term))
        );

        console.log('\n--- Relevant Items ---');
        relevantItems.forEach(i => {
            console.log(`Name: ${i.name} | Key: ${i.key_} | LastValue: ${i.lastvalue} ${i.units || ''}`);
        });

    } catch (error) {
        console.error('Error:', error.message);
    }
}

debugOltItems();
