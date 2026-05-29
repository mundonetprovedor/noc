import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputFile = path.join(__dirname, '..', 'public', 'pings.json');

const targets = [
    { name: 'Cloudflare DNS', host: '1.1.1.1' },
    { name: 'Globo / Regional', host: 'globo.com' },
    { name: 'Google / YouTube', host: '8.8.8.8' },
    { name: 'Meta (WA/FB/IG)', host: 'wa.me' },
    { name: 'Roblox Server', host: 'roblox.com' },
    { name: 'Steam Content', host: 'steampowered.com' },
    { name: 'TikTok', host: 'tiktok.com' }
];

const isWindows = process.platform === 'win32';

async function pingHost(target) {
    const cmd = isWindows ? `ping -n 1 -w 1000 ${target.host}` : `ping -c 1 -W 1 ${target.host}`;
    try {
        const { stdout } = await execAsync(cmd);

        // Parse the output
        let ms = 0;
        if (isWindows) {
            // Windows output: "tempo=14ms" or "time=14ms"
            const match = stdout.match(/(?:tempo|time)[=<](\d+)ms/i);
            if (match) ms = parseInt(match[1], 10);
        } else {
            // Linux output: "time=14.1 ms"
            const match = stdout.match(/time=([\d.]+)\s*ms/i);
            if (match) ms = parseFloat(match[1]);
        }

        return { name: target.name, ms: ms > 0 ? `${Math.round(ms)}ms` : 'Falha' };
    } catch (error) {
        return { name: target.name, ms: 'Falha' };
    }
}

async function runPingCycle() {
    console.log(`[Pinger] Iniciando ciclo de pings...`);
    const results = await Promise.all(targets.map(pingHost));

    try {
        await fs.writeFile(outputFile, JSON.stringify(results, null, 2));
        console.log(`[Pinger] Dados salvos em public/pings.json`);
    } catch (err) {
        console.error(`[Pinger] Erro ao salvar arquivo:`, err);
    }
}

// Rodar imediatamente e depois a cada 10 segundos
runPingCycle();
setInterval(runPingCycle, 10000);
