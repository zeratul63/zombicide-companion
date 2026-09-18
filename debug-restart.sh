#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🧟 ZOMBI CIDE COMPANION - ОТЛАДКА И ПЕРЕЗАПУСК${NC}"
echo -e "${YELLOW}==================================================${NC}\n"

cd /opt/Zombicide2ndEdition

# 1. Полная остановка
echo -e "${YELLOW}[1/5] Остановка контейнеров...${NC}"
docker-compose down 2>/dev/null || true
sudo fuser -k 3001/tcp 2>/dev/null || true
sleep 3

# 2. Создание резервных копий
echo -e "${YELLOW}[2/5] Создание резервных копий...${NC}"
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp server/server.js "$BACKUP_DIR/server.js.bak" 2>/dev/null || true
cp client/src/App.js "$BACKUP_DIR/App.js.bak" 2>/dev/null || true
cp client/src/index.js "$BACKUP_DIR/index.js.bak" 2>/dev/null || true
echo -e "${GREEN}✅ Резервные копии сохранены в $BACKUP_DIR${NC}"

# 3. Восстановление гарантированно рабочих файлов
echo -e "${YELLOW}[3/5] Восстановление рабочих файлов...${NC}"

# Создаем гарантированно рабочий server.js
cat > server/server.js << 'SERVERJS'
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const SAVE_DIR = process.env.SAVE_DIR || path.join(__dirname, 'saves');

if (!fs.existsSync(SAVE_DIR)) {
  fs.mkdirSync(SAVE_DIR, { recursive: true });
  console.log(`✅ Создана папка сохранений: ${SAVE_DIR}`);
}

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const CLIENT_BUILD_PATH = path.join(__dirname, '../client/build');
app.use(express.static(CLIENT_BUILD_PATH));

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    saveDir: SAVE_DIR,
    saveCount: fs.readdirSync(SAVE_DIR).length,
    mode: 'production'
  });
});

app.get('/api/characters', (req, res) => {
  const characters = [
    { id: 'fh_karl', name: 'Карл', source: 'Fort Hendrix', ability: 'Может ломать двери без проверки' },
    { id: 'fh_michelle', name: 'Мишель', source: 'Fort Hendrix', ability: 'Игнорирует урон от химических луж' },
    { id: 'fh_marian', name: 'Мэриан', source: 'Fort Hendrix', ability: 'Начинает с 2 очками действия' },
    { id: 'fh_riley', name: 'Райли', source: 'Fort Hendrix', ability: 'Его атаки дальнего боя наносят +1 урон' },
    { id: 'fh_javier', name: 'Хавьер', source: 'Fort Hendrix', ability: 'Может подбирать предметы на расстоянии 1 плитки' },
    { id: 'fh_wayne', name: 'Уэйн', source: 'Fort Hendrix', ability: 'Может нести +1 предмет' },
    { id: 'base_tiger_sam', name: 'Тайгер Сэм', source: 'Базовая коробка', ability: 'Боевые рефлексы' },
    { id: 'base_lou', name: 'Лу', source: 'Базовая коробка', ability: 'Судьба' },
    { id: 'base_wanda', name: 'Ванда', source: 'Базовая коробка', ability: 'Жадность' },
    { id: 'base_ostarra', name: 'Остара', source: 'Базовая коробка', ability: 'Держи нос вверх' },
    { id: 'base_doug', name: 'Дуг', source: 'Базовая коробка', ability: 'Защитник дома' },
    { id: 'base_amy', name: 'Эми', source: 'Базовая коробка', ability: 'Спасатель' },
    { id: 'toxic_preston', name: 'Престон', source: 'The Toxic City', ability: 'Санитар' },
    { id: 'toxic_mark', name: 'Марк', source: 'The Toxic City', ability: 'Снаряжение' },
    { id: 'toxic_pati', name: 'Патиша', source: 'The Toxic City', ability: 'Санитар' },
    { id: 'toxic_shamsia', name: 'Шамсия', source: 'The Toxic City', ability: 'Опытный снайпер' },
    { id: 'toxic_rino', name: 'Рино', source: 'The Toxic City', ability: 'Инженер' },
    { id: 'toxic_yuka', name: 'Юка', source: 'The Toxic City', ability: 'Санитар' },
    { id: 'toxic_amado', name: 'Амадо', source: 'The Toxic City', ability: 'Инженер' },
    { id: 'toxic_ben', name: 'Бен', source: 'The Toxic City', ability: 'Инженер' },
    { id: 'toxic_kiki', name: 'Кики', source: 'The Toxic City', ability: 'Снайпер' },
    { id: 'toxic_henry', name: 'Генри', source: 'The Toxic City', ability: 'Инженер' },
    { id: 'toxic_zheng', name: 'Чжэн', source: 'The Toxic City', ability: 'Снайпер' },
    { id: 'toxic_kelen', name: 'Келен', source: 'The Toxic City', ability: 'Санитар' }
  ];
  res.json(characters);
});

app.get('/api/saves', (req, res) => {
  try {
    const files = fs.readdirSync(SAVE_DIR);
    const saves = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(SAVE_DIR, file);
        const stats = fs.statSync(filePath);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return {
          id: file.replace('.json', ''),
          name: data.name || `Сохранение от ${new Date(stats.mtime).toLocaleString('ru-RU')}`,
          timestamp: stats.mtime.toISOString(),
          lastPlayed: data.lastPlayed || stats.mtime.toISOString(),
          autoSave: data.autoSave || false,
          playersCount: data.playerProfiles?.length || 0
        };
      })
      .sort((a, b) => new Date(b.lastPlayed) - new Date(a.lastPlayed));
    res.json(saves);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/saves/:id', (req, res) => {
  try {
    const filePath = path.join(SAVE_DIR, `${req.params.id}.json`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Сохранение не найдено' });
    }
    
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const updatedData = {
      ...data,
      lastPlayed: new Date().toISOString()
    };
    
    fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2));
    res.json(updatedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/saves', (req, res) => {
  try {
    const { playerProfiles, charactersProgress, name } = req.body;
    if (!playerProfiles || !charactersProgress) {
      return res.status(400).json({ error: 'Отсутствуют необходимые данные' });
    }
    const saveId = req.body.id || `save_${uuidv4().split('-')[0]}`;
    const filePath = path.join(SAVE_DIR, `${saveId}.json`);
    const saveData = {
      id: saveId,
      name: name || `Сохранение от ${new Date().toLocaleString('ru-RU')}`,
      timestamp: new Date().toISOString(),
      lastPlayed: new Date().toISOString(),
      autoSave: req.body.autoSave || false,
      playerProfiles,
      charactersProgress,
      version: '1.0.0'
    };
    fs.writeFileSync(filePath, JSON.stringify(saveData, null, 2));
    res.json({ id: saveId, timestamp: saveData.timestamp });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/saves/:id', (req, res) => {
  try {
    const filePath = path.join(SAVE_DIR, `${req.params.id}.json`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Сохранение не найдено' });
    }
    fs.unlinkSync(filePath);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auto-save', (req, res) => {
  try {
    const { playerProfiles, charactersProgress } = req.body;
    if (!playerProfiles || !charactersProgress) {
      return res.status(400).json({ error: 'Отсутствуют необходимые данные' });
    }
    const autoSaveId = `auto_${new Date().toISOString().replace(/[:.]/g, '-')}_${Math.random().toString(36).substr(2, 5)}`;
    const filePath = path.join(SAVE_DIR, `${autoSaveId}.json`);
    const saveData = {
      id: autoSaveId,
      name: `Автосохранение от ${new Date().toLocaleString('ru-RU')}`,
      timestamp: new Date().toISOString(),
      lastPlayed: new Date().toISOString(),
      autoSave: true,
      playerProfiles,
      charactersProgress,
      version: '1.0.0'
    };
    fs.writeFileSync(filePath, JSON.stringify(saveData, null, 2));
    res.json({ success: true, id: autoSaveId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('*', (req, res) => {
  const indexPath = path.join(CLIENT_BUILD_PATH, 'index.html');
  if (!fs.existsSync(indexPath)) {
    return res.status(500).send('❌ index.html не найден! Выполните: cd client && npm run build');
  }
  res.sendFile(indexPath);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 ZOMBI CIDE COMPANION SERVER');
  console.log('='.repeat(60));
  console.log(`✅ Сервер запущен на http://0.0.0.0:${PORT}`);
  console.log(`📁 Папка сохранений: ${SAVE_DIR}`);
  console.log(`📦 Режим: Production`);
  console.log(`⏰ Запущено: ${new Date().toLocaleString('ru-RU')}`);
  console.log('='.repeat(60) + '\n');
});
SERVERJS

# Создаем гарантированно рабочий index.js
cat > client/src/index.js << 'IDXJS'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
IDXJS

echo -e "${GREEN}✅ Файлы восстановлены${NC}"

# 4. Пересборка проекта
echo -e "${YELLOW}[4/5] Пересборка проекта...${NC}"
docker-compose build --no-cache

# 5. Запуск в режиме отладки
echo -e "${YELLOW}[5/5] Запуск в режиме отладки (логи в реальном времени)...${NC}"
echo -e "${GREEN}==============================================${NC}"
echo -e "${GREEN}Нажмите Ctrl+C для остановки${NC}"
echo -e "${GREEN}==============================================${NC}"
sleep 2
docker-compose up
