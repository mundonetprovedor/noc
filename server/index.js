import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DB_FILE = path.join(__dirname, 'database.json');
const SECRET_KEY = process.env.JWT_SECRET || 'noc-mundonet-secret-key-2025';

app.use(cors());
app.use(express.json({ type: ['application/json', 'application/json-rpc'] }));

// Log de requisições para debug
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Inicializar banco de dados se não existir
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [] }, null, 2));
}

// Helper para ler/escrever no "banco" com segurança
const readDB = () => {
    try {
        if (!fs.existsSync(DB_FILE) || fs.statSync(DB_FILE).size === 0) {
            const initialData = { users: [] };
            fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
            return initialData;
        }
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (e) {
        console.error('Erro ao ler banco de dados, resetando...', e);
        const initialData = { users: [] };
        fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
        return initialData;
    }
};
const writeDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

/**
 * Endpoint de Cadastro
 */
app.post('/api/register', async (req, res) => {
    try {
        const { email, password, full_name } = req.body;
        const db = readDB();

        if (db.users.find(u => u.email === email)) {
            return res.status(400).json({ error: 'Usuário já existe' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: Date.now().toString(),
            email,
            password: hashedPassword,
            full_name,
            created_at: new Date().toISOString()
        };

        db.users.push(newUser);
        writeDB(db);

        res.status(201).json({ message: 'Usuário criado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

/**
 * Endpoint de Login
 */
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const db = readDB();

        const user = db.users.find(u => u.email === email);
        if (!user) {
            return res.status(400).json({ error: 'Usuário não encontrado' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Senha incorreta' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.full_name },
            SECRET_KEY,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.full_name
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

/**
 * Proxy Zabbix
 * Resolve problemas de CORS e Mixed Content (HTTPS -> HTTP) em produção
 */
app.post('/api/zabbix', async (req, res) => {
    try {
        const zabbixUrl = process.env.VITE_ZABBIX_URL;
        if (!zabbixUrl) {
            return res.status(500).json({ error: 'Zabbix URL não configurada no servidor' });
        }

        const payload = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

        const response = await axios.post(zabbixUrl, payload, {
            headers: { 'Content-Type': 'application/json-rpc' }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Erro no Proxy Zabbix:', error.message);
        res.status(500).json({ error: 'Zabbix Proxy Error', details: error.message });
    }
});

// Servir arquivos estáticos do frontend (após a build)

const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

/**
 * Validar Token
 */
app.get('/api/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Não autorizado' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        res.json({ user: decoded });
    } catch (err) {
        res.status(401).json({ error: 'Token inválido' });
    }
});

// Fallback para React Router (deve ser a última rota)
app.use((req, res) => {
    if (!req.path.startsWith('/api/')) {
        res.sendFile(path.join(distPath, 'index.html'));
    } else {
        res.status(404).json({ error: 'API endpoint not found' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\x1b[32m%s\x1b[0m`, `✓ Servidor NOC rodando na porta ${PORT}`);
});
