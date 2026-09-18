// server/server.js
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// КОНФИГУРАЦИЯ
// ============================================
const PORT = process.env.PORT || 3001;
const WS_PORT = process.env.WS_PORT || 3002;
const DATA_DIR = path.join(__dirname, 'saves');
const CLIENT_BUILD_DIR = path.join(__dirname, 'public');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log(`📁 Создана директория: ${DATA_DIR}`);
}

const app = express();
const httpServer = createServer(app);

app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(CLIENT_BUILD_DIR));

// ============================================
// ФУНКЦИИ ХРАНИЛИЩА (ЧИСТЫЙ FS)
// ============================================

const saveGameLocal = (gameId, data) => {
    const filePath = path.join(DATA_DIR, `${gameId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return { success: true, path: filePath };
};

const loadGameLocal = (gameId) => {
    const filePath = path.join(DATA_DIR, `${gameId}.json`);
    if (!fs.existsSync(filePath)) throw new Error('Файл не найден');
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const getSavesListLocal = () => {
    const files = fs.readdirSync(DATA_DIR);
    return files
        .filter(file => file.endsWith('.json') && file !== 'characters.json')
        .map(file => ({
            id: file.replace('.json', ''),
            date: fs.statSync(path.join(DATA_DIR, file)).mtime
        }));
};

const deleteGameLocal = (gameId) => {
    const filePath = path.join(DATA_DIR, `${gameId}.json`);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
    }
    return false;
};

// ============================================
// API МАРШРУТЫ
// ============================================

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        port: PORT,
        wsPort: WS_PORT,
        storage: 'filesystem',
        dataDir: DATA_DIR,
        uptime: process.uptime()
    });
});

// Сохранение игры
app.post('/api/save', (req, res) => {
    try {
        const { gameId, data } = req.body;
        if (!gameId || !data) {
            return res.status(400).json({ error: 'gameId и data обязательны' });
        }
        const result = saveGameLocal(gameId, data);
        console.log(`✅ Игра ${gameId} сохранена`);
        res.json(result);
    } catch (error) {
        console.error('❌ Ошибка сохранения:', error);
        res.status(500).json({ error: error.message });
    }
});

// Загрузка игры
app.get('/api/load/:gameId', (req, res) => {
    try {
        const data = loadGameLocal(req.params.gameId);
        res.json({ success: true, data });
    } catch (error) {
        console.error('❌ Ошибка загрузки:', error);
        res.status(404).json({ error: error.message });
    }
});

// Список сохранений
app.get('/api/saves', (req, res) => {
    try {
        const saves = getSavesListLocal();
        res.json({ success: true, saves });
    } catch (error) {
        console.error('❌ Ошибка списка:', error);
        res.status(500).json({ error: error.message });
    }
});

// Удаление сохранения
app.delete('/api/saves/:gameId', (req, res) => {
    try {
        const result = deleteGameLocal(req.params.gameId);
        if (result) {
            res.json({ success: true, message: `Игра ${req.params.gameId} удалена` });
        } else {
            res.status(404).json({ error: 'Игра не найдена' });
        }
    } catch (error) {
        console.error('❌ Ошибка удаления:', error);
        res.status(500).json({ error: error.message });
    }
});

// Список персонажей
app.get('/api/characters', (req, res) => {
    try {
        const charactersPath = path.join(DATA_DIR, 'characters.json');
        if (!fs.existsSync(charactersPath)) {
            const defaultCharacters = [
                { id: 'karl', name: 'Карл', source: 'Fort Hendrix', avatar: '🧔' },
                { id: 'michelle', name: 'Мишель', source: 'Fort Hendrix', avatar: '👩' },
                { id: 'marian', name: 'Мэриан', source: 'Fort Hendrix', avatar: '👩' },
                { id: 'riley', name: 'Райли', source: 'Fort Hendrix', avatar: '🧑' },
                { id: 'havier', name: 'Хавьер', source: 'Fort Hendrix', avatar: '🧔' },
                { id: 'wayne', name: 'Уэйн', source: 'Fort Hendrix', avatar: '🧔' },
                { id: 'tiger-sam', name: 'Тайгер Сэм', source: 'Базовая коробка', avatar: '🐯' },
                { id: 'lu', name: 'Лу', source: 'Базовая коробка', avatar: '🧑' },
                { id: 'banda', name: 'Ванда', source: 'Базовая коробка', avatar: '👩' },
                { id: 'ostara', name: 'Остара', source: 'Базовая коробка', avatar: '👩' },
                { id: 'dug', name: 'Дуг', source: 'Базовая коробка', avatar: '🧔' },
                { id: 'emi', name: 'Эми', source: 'Базовая коробка', avatar: '👩' },
                { id: 'elli', name: 'Элли', source: 'Базовая коробка', avatar: '👩' },
                { id: 'odin', name: 'Один', source: 'Базовая коробка', avatar: '🧔' },
                { id: 'ned', name: 'Нед', source: 'Базовая коробка', avatar: '🧔' },
                { id: 'josh', name: 'Джош', source: 'Базовая коробка', avatar: '🧑' },
                { id: 'banny-dji', name: 'Банни Джи', source: 'Базовая коробка', avatar: '👩' },
                { id: 'lili', name: 'Лили', source: 'Базовая коробка', avatar: '👩' },
                { id: 'glenn', name: 'Гленн', source: 'Хроники выживших', avatar: '🧔' },
                { id: 'amado', name: 'Амадо', source: 'Хроники выживших', avatar: '🧔' },
                { id: 'shamsya', name: 'Шамсия', source: 'Хроники выживших', avatar: '👩' },
                { id: 'preston', name: 'Престон', source: 'Хроники выживших', avatar: '🧔' },
                { id: 'erin', name: 'Эрин', source: 'Хроники выживших', avatar: '👩' },
                { id: 'ben', name: 'Бен', source: 'Хроники выживших', avatar: '🧔' },
                { id: 'rino', name: 'Рино', source: 'Хроники выживших', avatar: '🧑' },
                { id: 'mark', name: 'Марк', source: 'Хроники выживших', avatar: '🧔' },
                { id: 'helen', name: 'Хелен', source: 'Хроники выживших', avatar: '👩' },
                { id: 'kiki', name: 'Кики', source: 'Хроники выживших', avatar: '👩' },
                { id: 'yuka', name: 'Юка', source: 'Хроники выживших', avatar: '👩' },
                { id: 'latisha', name: 'Латиша', source: 'Хроники выживших', avatar: '👩' }
            ];
            fs.writeFileSync(charactersPath, JSON.stringify(defaultCharacters, null, 2));
            console.log('📝 Создан characters.json');
        }
        const characters = JSON.parse(fs.readFileSync(charactersPath, 'utf8'));
        res.json(characters);
    } catch (error) {
        console.error('❌ Ошибка персонажей:', error);
        res.status(500).json({ error: 'Failed to load characters' });
    }
});

// ============================================
// СОСТОЯНИЕ СЕРВЕРА
// ============================================

app.get('/api/server-state', (req, res) => {
    try {
        const statePath = path.join(DATA_DIR, 'server-state.json');
        if (!fs.existsSync(statePath)) {
            return res.json({
                playerProfiles: [],
                characters: {},
                noteItems: {},
                missionStates: {},
                lastPlayed: new Date().toISOString(),
                version: Date.now(),
                timestamp: new Date().toISOString()
            });
        }
        const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
        res.json(state);
    } catch (error) {
        console.error('❌ Ошибка загрузки состояния:', error);
        res.status(500).json({ error: 'Failed to load server state' });
    }
});

app.post('/api/server-state', (req, res) => {
    try {
        const data = req.body;
        const statePath = path.join(DATA_DIR, 'server-state.json');
        
        const newState = {
            playerProfiles: data.playerProfiles || [],
            characters: data.characters || {},
            noteItems: data.noteItems || {},
            missionStates: data.missionStates || {},
            lastPlayed: new Date().toISOString(),
            timestamp: new Date().toISOString(),
            version: Date.now()
        };
        
        fs.writeFileSync(statePath, JSON.stringify(newState, null, 2));
        
        console.log('✅ Состояние сохранено:', {
            players: newState.playerProfiles.length,
            characters: Object.keys(newState.characters).length,
            missions: Object.keys(newState.missionStates).length,
            path: statePath
        });
        
        res.json({
            success: true,
            timestamp: newState.timestamp,
            version: newState.version,
            players: newState.playerProfiles.length,
            characters: Object.keys(newState.characters).length,
            path: statePath
        });
        
        broadcastToClients({
            type: 'DATA_UPDATED',
            data: newState,
            updatedBy: data.userId || 'unknown'
        });
    } catch (error) {
        console.error('❌ Ошибка сохранения состояния:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// WEBSOCKET СЕРВЕР
// ============================================

const wss = new WebSocketServer({ port: WS_PORT, host: '0.0.0.0' });
const clients = new Set();

function broadcastToClients(message, excludeWs = null) {
    const messageStr = JSON.stringify(message);
    clients.forEach(client => {
        if (client !== excludeWs && client.readyState === 1) {
            client.send(messageStr);
        }
    });
}

wss.on('connection', (ws) => {
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`🔌 WebSocket клиент: ${clientId}`);
    clients.add(ws);
    
    // Отправляем текущее состояние при подключении
    try {
        const statePath = path.join(DATA_DIR, 'server-state.json');
        if (fs.existsSync(statePath)) {
            const currentState = JSON.parse(fs.readFileSync(statePath, 'utf8'));
            ws.send(JSON.stringify({ type: 'INIT_STATE', data: currentState }));
        }
    } catch (e) {
        console.error('❌ Ошибка отправки INIT_STATE:', e);
    }
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log(`📩 Получено от ${clientId}: ${data.type}`);
            
            if (data.type === 'DATA_UPDATE') {
                const statePath = path.join(DATA_DIR, 'server-state.json');
                const newState = {
                    playerProfiles: data.playerProfiles || [],
                    characters: data.characters || {},
                    noteItems: data.noteItems || {},
                    missionStates: data.missionStates || {},
                    lastPlayed: new Date().toISOString(),
                    timestamp: new Date().toISOString(),
                    version: Date.now()
                };
                fs.writeFileSync(statePath, JSON.stringify(newState, null, 2));
                broadcastToClients({
                    type: 'DATA_UPDATED',
                    data: newState,
                    updatedBy: data.userId || clientId
                }, ws);
                console.log('✅ WebSocket: данные сохранены');
            }
        } catch (error) {
            console.error('❌ Ошибка WebSocket:', error);
        }
    });

    ws.on('close', () => {
        console.log(`🔌 Клиент отключен: ${clientId}`);
        clients.delete(ws);
    });
    
    ws.on('error', (error) => {
        console.error(`❌ Ошибка WebSocket ${clientId}:`, error);
        clients.delete(ws);
    });
});

console.log(`✅ WebSocket сервер на ws://0.0.0.0:${WS_PORT}`);

// ============================================
// SPA РОУТИНГ (ПОСЛЕДНИМ!)
// ============================================

app.get('*', (req, res) => {
    const indexPath = path.join(CLIENT_BUILD_DIR, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).json({
            error: 'Not Found',
            message: 'Client build not found.',
            path: CLIENT_BUILD_DIR
        });
    }
});

// ============================================
// ЗАПУСК
// ============================================

httpServer.listen(PORT, '0.0.0.0', () => {
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║         🧟 ZOMBI CIDE SERVER STARTED 🧟              ║');
    console.log('╠═══════════════════════════════════════════════════════╣');
    console.log(`║  HTTP API:    http://0.0.0.0:${PORT}                   ║`);
    console.log(`║  WebSocket:   ws://0.0.0.0:${WS_PORT}                  ║`);
    console.log(`║  Data Dir:    ${DATA_DIR}                            ║`);
    console.log(`║  Build Dir:   ${CLIENT_BUILD_DIR}                    ║`);
    console.log('╠═══════════════════════════════════════════════════════╣');
    console.log('║  Storage:     FILESYSTEM                            ║');
    console.log('╚═══════════════════════════════════════════════════════╝');
});

// ============================================
// ГРЕЙСФУЛ ШАУТДАУН
// ============================================

process.on('SIGTERM', () => {
    console.log('📴 SIGTERM получен. Завершаю работу...');
    clients.forEach(client => client.close());
    httpServer.close(() => process.exit(0));
});

process.on('SIGINT', () => {
    console.log('📴 SIGINT получен (Ctrl+C). Завершаю работу...');
    clients.forEach(client => client.close());
    httpServer.close(() => process.exit(0));
});