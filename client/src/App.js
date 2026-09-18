import { useState, useEffect, useRef } from 'react';
import './App.css';

const SKILL_DESCRIPTIONS = {
  combat_reflexes: "🛡️ Когда зомби появляются на игровом поле в зоне с этим выжившим или в соседней с ним зоне, он может немедленно совершить против них дополнительное боевое действие.",
  destiny: "✨ Выживший может использовать это умение раз в ход, когда берёт карту вещи. Он может сбросить взятую карту и вместо неё взять другую.",
  hoard: "🎒 Выживший способен нести 2 дополнительные карты вещей.",
  hold_your_nose: "👃 Выживший берёт карту вещи всякий раз, когда последний зомби в его зоне уничтожается.",
  home_defender: "🏠 Этот выживший не ограничен дальностью 0–1 при определении прямой видимости через зоны внутри здания.",
  lifesaver: "❤️ Выживший может использовать это умение без затраты действия, но не более 1 раза в свой ход.",
  low_profile: "👻 На этого выжившего не действуют попадания в своих при стрельбе по зоне, где он находится.",
  night_fighter: "🌙 Дистанционные атаки выжившего, совершаемые в ночное время, имеют точность 5+.",
  sidestep: "💨 Когда зомби появляются на игровом поле в зоне с этим выжившим, выживший может немедленно передвинуться без затраты действия.",
  starts_with_2_ap: "⚡ Этот выживший начинает партию с 2 очками адреналина.",
  starts_with_repair_kit: "🔧 Вы начинаете игру с предметом 'Ремонтный набор'.",
  starts_with_ammo: "🔫 Вы начинаете с картой боеприпасов.",
  steady_hand: "🎯 Можете игнорировать других выживших при промахе, используя дистанционное оружие.",
  webbing: "🎽 Выживший может использовать любую вещь из своего инвентаря так, будто она находится у него в ячейке руки."
};

const BONUS_ACTION_DESCRIPTION = "🎁 Получите дополнительное бонусное действие для текущей миссии.";
const API_BASE_URL = '/api';

// 📖 МИССИИ БАЗОВОЙ КОРОБКИ
const MISSIONS = [
  { id: 'm00', num: 'M0', name: 'Жизнь во время зомбицида (Обучение)', difficulty: 'Обучение', time: '30 мин', source: 'base' },
  { id: 'm01', num: 'M1', name: 'Городские кварталы', difficulty: 'Средне', time: '45 мин', source: 'base' },
  { id: 'm02', num: 'M2', name: 'Сматываем удочки', difficulty: 'Сложно', time: '60 мин', source: 'base' },
  { id: 'm03', num: 'M3', name: '24 часа зомбигорода', difficulty: 'Средне', time: '90 мин', source: 'base' },
  { id: 'm04', num: 'M4', name: 'Гнать и стрелять', difficulty: 'Сложно', time: '90 мин', source: 'base' },
  { id: 'm05', num: 'M5', name: 'Центр угрозы', difficulty: 'Сложно', time: '90 мин', source: 'base' },
  { id: 'm06', num: 'M6', name: 'Побег', difficulty: 'Сложно', time: '90 мин', source: 'base' },
  { id: 'm07', num: 'M7', name: 'Грайндахаус', difficulty: 'Сложно', time: '45 мин', source: 'base' },
  { id: 'm08', num: 'M8', name: 'Зомби-полиция', difficulty: 'Сложно', time: '30 мин', source: 'base' },
  { id: 'm09', num: 'M9', name: 'Кто сильнее, тот прав', difficulty: 'Средне', time: '60 мин', source: 'base' },
  { id: 'm10', num: 'M10', name: 'Маленький город', difficulty: 'Легко', time: '30 мин', source: 'base' },
  { id: 'm11', num: 'M11', name: '«Канава»', difficulty: 'Средне', time: '30 мин', source: 'base' },
  { id: 'm12', num: 'M12', name: 'Автокатастрофа', difficulty: 'Средне', time: '60 мин', source: 'base' },
  { id: 'm13', num: 'M13', name: 'Горящие улицы', difficulty: 'Средне', time: '45 мин', source: 'base' },
  { id: 'm14', num: 'M14', name: 'Завтрак у Джесси', difficulty: 'Средне', time: '45 мин', source: 'base' },
  { id: 'm15', num: 'M15', name: 'Вместе мы сила', difficulty: 'Средне', time: '45 мин', source: 'base' },
  { id: 'm16', num: 'M16', name: 'Скромный приют', difficulty: 'Средне', time: '45 мин', source: 'base' },
  { id: 'm17', num: 'M17', name: '«Скверна»', difficulty: 'Сложно', time: '60 мин', source: 'base' },
  { id: 'm18', num: 'M18', name: 'Конец пути', difficulty: 'Сложно', time: '60 мин', source: 'base' },
  { id: 'm19', num: 'M19', name: 'Лучшие друзья навсегда', difficulty: 'Сложно', time: '45 мин', source: 'base' },
  { id: 'm20', num: 'M20', name: 'Фестиваль зомби', difficulty: 'Сложно', time: '45 мин', source: 'base' },
  { id: 'm21', num: 'M21', name: 'Сверхмощность', difficulty: 'Сложно', time: '60 мин', source: 'base' },
  { id: 'm22', num: 'M22', name: 'Сделать погромче', difficulty: 'Сложно', time: '45 мин', source: 'base' },
  { id: 'm23', num: 'M23', name: 'Улица Милосердия', difficulty: 'Средне', time: '45 мин', source: 'base' },
  { id: 'm24', num: 'M24', name: 'Сматываемся!', difficulty: 'Сложно', time: '60 мин', source: 'base' },
  { id: 'm25', num: 'M25', name: 'Суперкоктейль Неда', difficulty: 'Сложно', time: '90 мин', source: 'base' },
];

// 🎖️ МИССИИ FORT HENDRIX
const FORT_HENDRIX_MISSIONS = [
  { id: 'fh01', num: 'FH1', name: 'Встреча храбрецов', difficulty: 'Средне', time: '60 мин', source: 'fort_hendrix' },
  { id: 'fh02', num: 'FH2', name: 'Цифровые улики', difficulty: 'Средне', time: '60 мин', source: 'fort_hendrix' },
  { id: 'fh03', num: 'FH3', name: 'Передай привет Линде', difficulty: 'Средне', time: '90 мин', source: 'fort_hendrix' },
  { id: 'fh04', num: 'FH4', name: 'Секретная лаборатория', difficulty: 'Средне', time: '60 мин', source: 'fort_hendrix' },
  { id: 'fh05', num: 'FH5', name: 'Патогенный рай', difficulty: 'Средне', time: '45 мин', source: 'fort_hendrix' },
  { id: 'fh06', num: 'FH6', name: 'Зона Ромеро', difficulty: 'Средне', time: '120 мин', source: 'fort_hendrix' },
  { id: 'fh07', num: 'FH7', name: 'Штаб', difficulty: 'Средне', time: '120 мин', source: 'fort_hendrix' },
  { id: 'fh08', num: 'FH8', name: 'Теперь ты в армии', difficulty: 'Сложно', time: '60 мин', source: 'fort_hendrix' },
  { id: 'fh09', num: 'FH9', name: 'Ящик Пандоры', difficulty: 'Сложно', time: '60 мин', source: 'fort_hendrix' },
  { id: 'fh10', num: 'FH10', name: 'Пурпурная дымка', difficulty: 'Сложно', time: '90 мин', source: 'fort_hendrix' },
];

const ALL_MISSIONS = [...MISSIONS, ...FORT_HENDRIX_MISSIONS];

const MISSION_STATUS = {
  locked: { label: '🔒', title: 'Не начата', color: '#555' },
  available: { label: '📖', title: 'Доступна', color: '#4A90D9' },
  in_progress: { label: '⚔️', title: 'В процессе', color: '#f5a623' },
  completed: { label: '✅', title: 'Пройдена', color: '#7ec850' },
  failed: { label: '💀', title: 'Провалена', color: '#d0021b' },
};

function App() {
  const [loading, setLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState('checking');
  const [playerProfiles, setPlayerProfiles] = useState([]);
  const [activePlayer, setActivePlayer] = useState(0);
  const [characters, setCharacters] = useState([]);
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const [characterFilter, setCharacterFilter] = useState('all');
  const [showCharacterSelection, setShowCharacterSelection] = useState(true);
  const [characterStates, setCharacterStates] = useState({});
  const [noteItems, setNoteItems] = useState({});
  const [lastSaveTime, setLastSaveTime] = useState(null);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [ws, setWs] = useState(null);
  const [currentVersion, setCurrentVersion] = useState(Date.now());
  const [userId, setUserId] = useState(() => {
    return localStorage.getItem('userId') || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  });

  const [missionStates, setMissionStates] = useState({});
  const [showMissions, setShowMissions] = useState(false);
  const [missionFilter, setMissionFilter] = useState('all');

  // ==========================================
  // ТОСТ-УВЕДОМЛЕНИЯ
  // ==========================================
  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    const colors = {
      success: 'linear-gradient(135deg, #7ec850, #6ab840)',
      error: 'linear-gradient(135deg, #d0021b, #b00118)',
      warning: 'linear-gradient(135deg, #f5a623, #e67e22)',
      info: 'linear-gradient(135deg, #4A90D9, #357abd)'
    };
    toast.style.cssText = `
      position: fixed; bottom: 24px; right: 24px;
      padding: 14px 24px; border-radius: 10px;
      color: #0d0d0d; font-weight: 600; font-size: 14px;
      z-index: 9999; animation: slideIn 0.35s ease;
      background: ${colors[type] || colors.info};
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      max-width: 380px;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  // ==========================================
  // WEBSOCKET — БЕЗ ОБРАБОТКИ КОНФЛИКТА
  // ==========================================
  useEffect(() => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.hostname}:3002`;
    const socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      console.log('✅ WebSocket подключен');
      setWs(socket);
    };
    
    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'INIT_STATE' || message.type === 'DATA_UPDATED') {
          handleServerStateUpdate(message.data);
        }
      } catch (error) {
        console.error('❌ WebSocket ошибка:', error);
      }
    };
    
    socket.onclose = () => {
      console.log('🔌 WebSocket отключен');
      setWs(null);
      setTimeout(() => setWs(null), 3000);
    };
    
    return () => {
      if (socket.readyState === WebSocket.OPEN) socket.close();
    };
  }, []);

  const handleServerStateUpdate = (data) => {
    setPlayerProfiles(data.playerProfiles || []);
    setCharacterStates(data.characters || {});
    setMissionStates(data.missionStates || {});
    if (data.noteItems) {
      const fixed = {};
      Object.keys(data.noteItems).forEach(id => {
        fixed[id] = typeof data.noteItems[id] === 'object'
          ? { items: data.noteItems[id].items || '', achievements: data.noteItems[id].achievements || '' }
          : { items: data.noteItems[id], achievements: '' };
      });
      setNoteItems(fixed);
    }
    setLastSaveTime(data.lastPlayed ? new Date(data.lastPlayed).toLocaleString('ru-RU') : null);
    setCurrentVersion(data.version || currentVersion);
  };

  // ==========================================
  // СОХРАНЕНИЕ — БЕЗ 409
  // ==========================================
  const saveToServer = async (showAlert = true) => {
    if (serverStatus !== 'online') {
      if (showAlert) showToast('⚠️ Сервер недоступен', 'error');
      return false;
    }
    setSaveStatus('saving');
    const data = { 
      playerProfiles, 
      characters: characterStates, 
      noteItems, 
      missionStates, 
      lastPlayed: new Date().toISOString(), 
      version: Date.now(), 
      userId 
    };
    
    try {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'DATA_UPDATE', ...data }));
      }
      const response = await fetch(`${API_BASE_URL}/server-state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(10000)
      });
      if (response.ok) {
        const result = await response.json();
        setLastSaveTime(new Date(result.timestamp).toLocaleString('ru-RU'));
        setCurrentVersion(result.version);
        setSaveStatus('success');
        if (showAlert) showToast('✅ Данные сохранены!', 'success');
        setTimeout(() => setSaveStatus('idle'), 2000);
        return true;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Ошибка сохранения:', error);
      setSaveStatus('error');
      if (showAlert) showToast('⚠️ Ошибка сохранения', 'error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      return false;
    }
  };

  const handleManualSave = () => saveToServer(true);

  // ==========================================
  // ЭКСПОРТ / ИМПОРТ
  // ==========================================
  const exportCampaign = () => {
    const data = { playerProfiles, characterStates, noteItems, missionStates, version: currentVersion, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zombicide_campaign_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('✅ Кампания экспортирована!', 'success');
  };

  const importCampaign = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.playerProfiles || !data.characterStates) throw new Error('Неверный формат');
        setPlayerProfiles(data.playerProfiles);
        setCharacterStates(data.characterStates);
        setNoteItems(data.noteItems || {});
        setMissionStates(data.missionStates || {});
        setCurrentVersion(data.version || Date.now());
        showToast('✅ Кампания импортирована!', 'success');
      } catch (error) {
        showToast('❌ Ошибка импорта: ' + error.message, 'error');
      }
    };
    reader.readAsText(file);
  };

  // ==========================================
  // ПРОВЕРКА СЕРВЕРА
  // ==========================================
  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(3000) });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const charsRes = await fetch(`${API_BASE_URL}/characters`, { signal: AbortSignal.timeout(3000) });
        if (charsRes.ok) {
          const chars = await charsRes.json();
          setCharacters(chars.filter(c => c.id && c.name && c.source));
          setServerStatus('online');
        } else {
          setServerStatus('online');
        }
      } catch (error) {
        console.error('❌ Сервер недоступен:', error);
        setServerStatus('offline');
      } finally {
        setLoading(false);
      }
    };
    checkServer();
    const interval = setInterval(() => {
      if (serverStatus === 'offline') checkServer();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // ==========================================
  // ЗАГРУЗКА ДАННЫХ
  // ==========================================
  useEffect(() => {
    const loadData = async () => {
      try {
        if (serverStatus === 'online') {
          const response = await fetch(`${API_BASE_URL}/server-state`);
          if (response.ok) {
            const data = await response.json();
            setPlayerProfiles(data.playerProfiles || []);
            setCharacterStates(data.characters || {});
            setMissionStates(data.missionStates || {});
            if (data.noteItems) {
              const fixed = {};
              Object.keys(data.noteItems).forEach(id => {
                fixed[id] = typeof data.noteItems[id] === 'object'
                  ? { items: data.noteItems[id].items || '', achievements: data.noteItems[id].achievements || '' }
                  : { items: data.noteItems[id], achievements: '' };
              });
              setNoteItems(fixed);
            }
            setLastSaveTime(data.lastPlayed ? new Date(data.lastPlayed).toLocaleString('ru-RU') : null);
            setCurrentVersion(data.version || Date.now());
            return;
          }
        }
        const savedData = localStorage.getItem('zombicide-save');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          setPlayerProfiles(parsed.playerProfiles || []);
          setCharacterStates(parsed.characterStates || {});
          setMissionStates(parsed.missionStates || {});
          setLastSaveTime(parsed.lastSaveTime || null);
        }
        const savedNotes = localStorage.getItem('zombicide-notes');
        if (savedNotes) {
          const parsed = JSON.parse(savedNotes);
          const fixed = {};
          Object.keys(parsed).forEach(id => {
            fixed[id] = typeof parsed[id] === 'object'
              ? { items: parsed[id].items || '', achievements: parsed[id].achievements || '' }
              : { items: parsed[id], achievements: '' };
          });
          setNoteItems(fixed);
        }
      } catch (error) {
        console.error('Ошибка загрузки:', error);
      }
    };
    loadData();
  }, [serverStatus]);

  // ==========================================
  // СОХРАНЕНИЕ В localStorage
  // ==========================================
  useEffect(() => {
    try {
      localStorage.setItem('zombicide-save', JSON.stringify({ 
        playerProfiles, 
        characterStates, 
        missionStates,
        lastSaveTime: new Date().toLocaleString('ru-RU') 
      }));
    } catch (e) { console.error(e); }
  }, [playerProfiles, characterStates, missionStates]);

  useEffect(() => {
    try {
      localStorage.setItem('zombicide-notes', JSON.stringify(noteItems));
    } catch (e) { console.error(e); }
  }, [noteItems]);

  // ==========================================
  // УПРАВЛЕНИЕ ПЕРСОНАЖАМИ
  // ==========================================
  const getCharacterState = (charId) => characterStates[charId] || {
    xp: 0, skills: [],
    bonusActions: { 2: 'locked', 5: 'locked', 8: 'locked', 11: 'locked', 14: 'locked', 17: 'locked', 20: 'locked' },
    levelChoices: { 2: null, 5: null, 8: null, 11: null, 14: null, 17: null, 20: null }
  };

  const updateCharacterState = (charId, updates) => {
    setCharacterStates(prev => ({ ...prev, [charId]: { ...getCharacterState(charId), ...updates } }));
  };

  const handleXpChange = (charId, value) => {
    const newValue = Math.min(20, Math.max(0, parseInt(value) || 0));
    const oldState = getCharacterState(charId);
    const oldXp = oldState.xp || 0;
    const levels = [2, 5, 8, 11, 14, 17, 20];
    const newBonusActions = { ...oldState.bonusActions };
    levels.forEach(level => {
      if (oldXp < level && newValue >= level && newBonusActions[level] === 'locked') {
        newBonusActions[level] = 'available';
      }
    });
    updateCharacterState(charId, { xp: newValue, bonusActions: newBonusActions });
  };

  const allSkills = {
    combat_reflexes: "Боевые рефлексы",
    destiny: "Судьба",
    hoard: "Запасливый",
    hold_your_nose: "Зажми нос",
    home_defender: "Защитник дома",
    lifesaver: "Спасатель",
    low_profile: "Незаметный",
    night_fighter: "Ночной боец",
    sidestep: "Отступление",
    starts_with_2_ap: "Начинает с 2 ОА",
    starts_with_repair_kit: "Ремонтный набор",
    starts_with_ammo: "Боеприпасы",
    steady_hand: "Твёрдая рука",
    webbing: "Разгрузочный жилет"
  };

  const handleChooseSkill = (charId, level, skillKey) => {
    if (!allSkills[skillKey]) {
      showToast(`❌ Навык "${skillKey}" не найден`, 'error');
      return;
    }
    const currentState = getCharacterState(charId);
    const newSkills = [...(currentState.skills || []), skillKey];
    const newLevelChoices = { ...currentState.levelChoices, [level]: `skill:${skillKey}` };
    updateCharacterState(charId, { skills: newSkills, levelChoices: newLevelChoices });
    showToast(`✅ Выбран навык: ${allSkills[skillKey]}`, 'success');
  };

  const handleChooseBonus = (charId, level) => {
    const currentState = getCharacterState(charId);
    const newLevelChoices = { ...currentState.levelChoices, [level]: 'bonus' };
    updateCharacterState(charId, { levelChoices: newLevelChoices });
    showToast(`✅ Бонусное действие для уровня ${level}`, 'success');
  };

  const handleSpendBonusAction = (charId, level) => {
    const currentState = getCharacterState(charId);
    if (currentState.bonusActions[level] === 'available') {
      const newBonusActions = { ...currentState.bonusActions, [level]: 'spent' };
      updateCharacterState(charId, { bonusActions: newBonusActions });
      showToast(`✅ Бонусное действие уровня ${level} использовано`, 'success');
    }
  };

  const handleResetMission = (charId) => {
    if (!window.confirm('Сбросить миссию?')) return;
    const currentState = getCharacterState(charId);
    const xp = currentState.xp;
    const levelChoices = currentState.levelChoices || {};
    const levels = [2, 5, 8, 11, 14, 17, 20];
    const newBonusActions = {};
    levels.forEach(level => {
      if (levelChoices[level]?.startsWith('skill:')) {
        newBonusActions[level] = 'locked';
      } else if (xp >= level) {
        newBonusActions[level] = 'available';
      } else {
        newBonusActions[level] = 'locked';
      }
    });
    updateCharacterState(charId, { bonusActions: newBonusActions });
    showToast('🔄 Миссия сброшена', 'info');
  };

  const handleClearCharacter = (charId) => {
    if (!window.confirm('Удалить персонажа? Весь его опыт, умения и заметки будут удалены.')) return;
    
    const newCharacterStates = { ...characterStates };
    delete newCharacterStates[charId];
    
    const newProfiles = playerProfiles.map((p, i) => 
      i === activePlayer 
        ? { ...p, characterIds: p.characterIds.filter(id => id !== charId) }
        : p
    );
    
    const newNoteItems = { ...noteItems };
    delete newNoteItems[charId];
    
    setCharacterStates(newCharacterStates);
    setPlayerProfiles(newProfiles);
    setNoteItems(newNoteItems);
    setSelectedCharacters(prev => prev.filter(c => c.id !== charId));
    
    const data = {
      playerProfiles: newProfiles,
      characters: newCharacterStates,
      noteItems: newNoteItems,
      missionStates,
      lastPlayed: new Date().toISOString(),
      version: Date.now(),
      userId
    };
    
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'DATA_UPDATE', ...data }));
    }
    fetch(`${API_BASE_URL}/server-state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(err => console.error('Ошибка сохранения:', err));
    
    showToast('🗑️ Персонаж и все его данные удалены', 'info');
  };

  const handleResetAllCampaigns = () => {
    const firstConfirm = window.confirm(
      '⚠️ ВНИМАНИЕ! Это действие удалит ВСЕ блокноты у ВСЕХ игроков!\n\n' +
      'Будут удалены:\n' +
      '• Все выбранные персонажи\n' +
      '• Весь опыт (XP)\n' +
      '• Все умения и бонусные действия\n' +
      '• Все заметки и достижения\n' +
      '• Прогресс миссий\n\n' +
      'Продолжить?'
    );
    
    if (!firstConfirm) return;
    
    const secondConfirm = window.confirm(
      '🛑 ПОСЛЕДНЕЕ ПРЕДУПРЕЖДЕНИЕ!\n\n' +
      'Это действие НЕЛЬЗЯ ОТМЕНИТЬ!\n\n' +
      'Вы ТОЧНО уверены, что хотите удалить ВСЮ кампанию?'
    );
    
    if (!secondConfirm) return;
    
    const resetProfiles = playerProfiles.map(p => ({
      ...p,
      characterIds: []
    }));
    
    setPlayerProfiles(resetProfiles);
    setCharacterStates({});
    setNoteItems({});
    setMissionStates({});
    setSelectedCharacters([]);
    setActivePlayer(0);
    setShowCharacterSelection(true);
    
    const data = {
      playerProfiles: resetProfiles,
      characters: {},
      noteItems: {},
      missionStates: {},
      lastPlayed: new Date().toISOString(),
      version: Date.now(),
      userId
    };
    
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'DATA_UPDATE', ...data }));
    }
    
    fetch(`${API_BASE_URL}/server-state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(err => console.error('Ошибка сохранения:', err));
    
    showToast('💣 Вся кампания сброшена!', 'warning');
  };

  const handleConfirmSelection = () => {
    if (selectedCharacters.length === 0) return;
    
    const newProfiles = [...playerProfiles];
    const newCharacterStates = { ...characterStates };
    
    selectedCharacters.forEach(char => {
      if (!newProfiles[activePlayer].characterIds.includes(char.id)) {
        newProfiles[activePlayer].characterIds.push(char.id);
      }
      
      newCharacterStates[char.id] = {
        xp: 0,
        skills: [],
        bonusActions: { 2: 'locked', 5: 'locked', 8: 'locked', 11: 'locked', 14: 'locked', 17: 'locked', 20: 'locked' },
        levelChoices: { 2: null, 5: null, 8: null, 11: null, 14: null, 17: null, 20: null }
      };
    });
    
    setPlayerProfiles(newProfiles);
    setCharacterStates(newCharacterStates);
    setSelectedCharacters([]);
    
    const data = {
      playerProfiles: newProfiles,
      characters: newCharacterStates,
      noteItems,
      missionStates,
      lastPlayed: new Date().toISOString(),
      version: Date.now(),
      userId
    };
    
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'DATA_UPDATE', ...data }));
    }
    fetch(`${API_BASE_URL}/server-state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(err => console.error('Ошибка сохранения:', err));
    
    showToast(`✅ Добавлено ${selectedCharacters.length} персонажей (сброшены в 0)`, 'success');
  };

  const handleCharacterSelect = (character) => {
    setSelectedCharacters(prev => prev.some(c => c.id === character.id)
      ? prev.filter(c => c.id !== character.id)
      : [...prev, character]
    );
  };

  // ==========================================
  // УПРАВЛЕНИЕ МИССИЯМИ
  // ==========================================
  const getMissionState = (missionId) => missionStates[missionId] || {
    status: 'available',
    completedAt: null,
    notes: '',
    playCount: 0
  };

  const updateMissionState = (missionId, updates) => {
    setMissionStates(prev => ({
      ...prev,
      [missionId]: { ...getMissionState(missionId), ...updates }
    }));
  };

  const cycleMissionStatus = (missionId) => {
    const current = getMissionState(missionId);
    const statuses = ['available', 'in_progress', 'completed', 'failed'];
    const currentIndex = statuses.indexOf(current.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    
    updateMissionState(missionId, {
      status: nextStatus,
      completedAt: nextStatus === 'completed' ? new Date().toISOString() : current.completedAt,
      playCount: nextStatus === 'completed' ? current.playCount + 1 : current.playCount
    });
    
    showToast(`${MISSION_STATUS[nextStatus].title}: миссия обновлена`, 'info');
  };

  const resetMissionStatus = (missionId) => {
    const mission = ALL_MISSIONS.find(m => m.id === missionId);
    const currentState = getMissionState(missionId);
    
    if (currentState.status === 'available' && !currentState.completedAt && !currentState.notes) {
      showToast('ℹ️ Миссия ещё не начата', 'info');
      return;
    }
    
    const confirmed = window.confirm(
      `🔄 Сбросить прогресс миссии?\n\n` +
      `${mission.num} — «${mission.name}»\n\n` +
      `Текущий статус: ${MISSION_STATUS[currentState.status].title}\n` +
      `Игр сыграно: ${currentState.playCount}\n\n` +
      `Миссия вернётся в статус «Доступна», заметки будут удалены.`
    );
    
    if (!confirmed) return;
    
    updateMissionState(missionId, {
      status: 'available',
      completedAt: null,
      notes: '',
      playCount: 0
    });
    
    showToast(`🔄 Миссия «${mission.name}» сброшена`, 'info');
  };

  const getCompletedMissionsCount = () => {
    return Object.values(missionStates).filter(m => m.status === 'completed').length;
  };

  // ==========================================
  // ИНИЦИАЛИЗАЦИЯ
  // ==========================================
  useEffect(() => {
    if (playerProfiles.length === 0) {
      setPlayerProfiles(Array(6).fill(null).map((_, i) => ({ id: `player_${i+1}`, name: `Игрок ${i+1}`, characterIds: [] })));
    }
  }, [playerProfiles]);

  useEffect(() => {
    const current = playerProfiles[activePlayer] || { characterIds: [] };
    setShowCharacterSelection(current.characterIds.length === 0);
  }, [playerProfiles, activePlayer]);

  // ==========================================
  // РЕНДЕРИНГ
  // ==========================================
  if (loading) {
    return (
      <div className="App">
        <div className="loader-container">
          <div className="loader"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  const currentPlayer = playerProfiles[activePlayer] || { name: `Игрок ${activePlayer+1}`, characterIds: [] };
  const currentCharacters = currentPlayer.characterIds.map(id => characters.find(c => c.id === id)).filter(Boolean);
  const uniqueSources = ['all', ...new Set(characters.map(c => c.source).filter(Boolean))];
  const filteredCharacters = characterFilter === 'all' ? characters : characters.filter(c => c.source === characterFilter);

  const getSourceIcon = (source) => {
    const icons = { 'Fort Hendrix': '🛡️', 'Базовая коробка': '📦', 'Хроники выживших': '☣️' };
    return icons[source] || '👤';
  };

  const SkillTooltip = ({ description, children }) => {
    const [show, setShow] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
      const handleClickOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) setShow(false); };
      if (show) document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [show]);
    return (
      <div className="skill-tooltip-wrapper" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} ref={ref}>
        {children}
        {show && description && (
          <div className="skill-tooltip">
            <div className="skill-tooltip-content">{description}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-left">
          <h1>
            <span className="zombie-icon">🧟</span>
            <span>ZOMBICIDE</span>
          </h1>
          <span className="subtitle">2nd Edition — Блокнот выжившего</span>
        </div>
        <div className="header-right">
          <button className="btn-save" onClick={handleManualSave} disabled={saveStatus === 'saving'} title="Сохранить">
            {saveStatus === 'saving' ? '⏳' : '💾'}
          </button>
          <button className="btn-export" onClick={exportCampaign} title="Экспорт кампании">📤</button>
          <input type="file" accept=".json" onChange={importCampaign} id="importInput" style={{ display: 'none' }} />
          <button className="btn-import" onClick={() => document.getElementById('importInput').click()} title="Импорт кампании">📥</button>
          <span className="status-dot" data-status={serverStatus}></span>
        </div>
      </header>

      <div className="top-nav">
        <div className="player-tabs">
          {playerProfiles.map((p, i) => (
            <button 
              key={p.id} 
              className={`player-tab ${activePlayer === i && !showMissions ? 'active' : ''}`} 
              onClick={() => {
                setActivePlayer(i);
                setShowMissions(false);
              }}
            >
              {p.name}
            </button>
          ))}
        </div>
        
        <button 
          className={`nav-missions-btn ${showMissions ? 'active' : ''}`}
          onClick={() => setShowMissions(!showMissions)}
          title="Миссии кампании"
        >
          📖 Миссии
          <span className="missions-count">
            {getCompletedMissionsCount()}/{ALL_MISSIONS.length}
          </span>
        </button>
      </div>

      {showMissions ? (
        <div className="missions-panel">
          <div className="missions-header">
            <h3>📖 Миссии кампании</h3>
            <div className="missions-progress">
              <span className="progress-text">
                Пройдено: <strong>{getCompletedMissionsCount()}</strong> / {ALL_MISSIONS.length}
              </span>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(getCompletedMissionsCount() / ALL_MISSIONS.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="missions-filter">
            <button 
              className={`mission-filter-btn ${missionFilter === 'all' ? 'active' : ''}`}
              onClick={() => setMissionFilter('all')}
            >
              🌍 Все
              <span className="filter-count">{ALL_MISSIONS.length}</span>
            </button>
            
            <button 
              className={`mission-filter-btn ${missionFilter === 'base' ? 'active' : ''}`}
              onClick={() => setMissionFilter('base')}
            >
              📦 Базовая коробка
              <span className="filter-count">{MISSIONS.length}</span>
            </button>
            
            <button 
              className={`mission-filter-btn ${missionFilter === 'fort_hendrix' ? 'active' : ''}`}
              onClick={() => setMissionFilter('fort_hendrix')}
            >
              🎖️ Fort Hendrix
              <span className="filter-count">{FORT_HENDRIX_MISSIONS.length}</span>
            </button>
          </div>
          
          <div className="missions-grid">
            {ALL_MISSIONS
              .filter(m => missionFilter === 'all' || m.source === missionFilter)
              .map(mission => {
                const state = getMissionState(mission.id);
                const statusInfo = MISSION_STATUS[state.status];
                
                return (
                  <div 
                    key={mission.id} 
                    className={`mission-card status-${state.status}`}
                  >
                    <div className="mission-card-top">
                      <div className="mission-num-block">
                        <span className="mission-num">{mission.num}</span>
                      </div>
                      <div className="mission-card-controls">
                        <div 
                          className="mission-status-badge"
                          onClick={() => cycleMissionStatus(mission.id)}
                          title={`${statusInfo.title} — кликните для смены`}
                        >
                          {statusInfo.label}
                        </div>
                        {(state.status !== 'available' || state.completedAt || state.notes) && (
                          <button 
                            className="mission-reset-btn"
                            onClick={() => resetMissionStatus(mission.id)}
                            title="Сбросить статус миссии"
                          >
                            🔄
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="mission-body">
                      <h4 className="mission-name">{mission.name}</h4>
                      <div className="mission-meta">
                        <span className={`mission-difficulty diff-${mission.difficulty.toLowerCase()}`}>
                          {mission.difficulty}
                        </span>
                        <span className="mission-time">⏱ {mission.time}</span>
                      </div>
                    </div>
                    
                    {state.completedAt && (
                      <div className="mission-date">
                        ✅ Пройдена {new Date(state.completedAt).toLocaleDateString('ru-RU')}
                      </div>
                    )}
                    
                    <textarea
                      className="mission-notes"
                      value={state.notes}
                      onChange={(e) => updateMissionState(mission.id, { notes: e.target.value })}
                      placeholder="Заметки о миссии..."
                    />
                  </div>
                );
              })}
          </div>
        </div>
      ) : (
        <>
          <div className="player-bar">
            <input 
              type="text" 
              value={currentPlayer.name} 
              onChange={(e) => {
                const newProfiles = [...playerProfiles];
                newProfiles[activePlayer].name = e.target.value;
                setPlayerProfiles(newProfiles);
              }} 
              className="player-name-input" 
            />
            <div className="player-actions">
              <button 
                className="btn-add" 
                onClick={() => setShowCharacterSelection(!showCharacterSelection)}
                title="Добавить/скрыть персонажей"
              >
                {showCharacterSelection ? '✕' : '+'}
              </button>
              
              <button 
                className="btn-clear" 
                onClick={() => {
                  if (window.confirm('Удалить всех персонажей текущего игрока?')) {
                    const newProfiles = [...playerProfiles];
                    const removedIds = newProfiles[activePlayer].characterIds;
                    newProfiles[activePlayer].characterIds = [];
                    setPlayerProfiles(newProfiles);
                    
                    const newStates = { ...characterStates };
                    removedIds.forEach(id => delete newStates[id]);
                    setCharacterStates(newStates);
                    
                    setShowCharacterSelection(true);
                  }
                }}
                title="Удалить всех персонажей игрока"
              >
                🗑️
              </button>
              
              <button 
                className="btn-reset-all" 
                onClick={handleResetAllCampaigns}
                title="Сбросить ВСЕ кампании (все игроки)"
              >
                💣
              </button>
            </div>
          </div>

          {showCharacterSelection && (
            <div className="selection-panel">
              <div className="selection-header">
                <h3>Выбор персонажей</h3>
                <div className="filter-group">
                  {uniqueSources.map(src => (
                    <button key={src} className={`filter-btn ${characterFilter === src ? 'active' : ''}`} onClick={() => setCharacterFilter(src)}>
                      {src === 'all' ? 'Все' : src}
                    </button>
                  ))}
                </div>
              </div>
              <div className="character-grid">
                {filteredCharacters.map(char => {
                  const isSelected = selectedCharacters.some(c => c.id === char.id);
                  const assignedPlayerIndex = playerProfiles.findIndex(p => p.characterIds.includes(char.id));
                  const isAssigned = assignedPlayerIndex !== -1;
                  const assignedPlayer = isAssigned ? playerProfiles[assignedPlayerIndex] : null;
                  const isAssignedToMe = assignedPlayerIndex === activePlayer;
                  
                  return (
                    <div 
                      key={char.id} 
                      className={`char-card ${isSelected ? 'selected' : ''} ${isAssigned ? 'assigned' : ''} ${isAssignedToMe ? 'assigned-to-me' : ''}`}
                      onClick={() => !isAssigned && handleCharacterSelect(char)}
                    >
                      <div className="char-avatar">{char.avatar || '🧟'}</div>
                      <div className="char-name">{char.name}</div>
                      <div className="char-source">{getSourceIcon(char.source)} {char.source}</div>
                      {isAssigned && (
                        <div className="assigned-info">
                          <div className="assigned-badge">
                            {isAssignedToMe ? '✓ Ваш' : `👤 ${assignedPlayer.name}`}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="selection-footer">
                <button className="btn-secondary" onClick={() => setSelectedCharacters([])}>Отмена</button>
                <button className="btn-primary" disabled={selectedCharacters.length === 0} onClick={handleConfirmSelection}>
                  Добавить {selectedCharacters.length > 0 && <span className="count-badge">{selectedCharacters.length}</span>}
                </button>
              </div>
            </div>
          )}

          <div className="notebooks-grid">
            {currentCharacters.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🧟</div>
                <h3>Нет персонажей</h3>
                <p>Нажмите <strong>+</strong> чтобы добавить</p>
              </div>
            ) : (
              currentCharacters.map(char => {
                const state = getCharacterState(char.id);
                const xp = state.xp || 0;
                const skills = state.skills || [];
                const bonusActions = state.bonusActions || {};
                const levelChoices = state.levelChoices || {};
                const pendingLevels = [2, 5, 8, 11, 14, 17, 20].filter(l => xp >= l && bonusActions[l] === 'available' && !levelChoices[l]);
                const chosenSkills = [];
                let bonusCount = 0;
                Object.entries(levelChoices).forEach(([level, choice]) => {
                  if (choice?.startsWith('skill:')) {
                    const key = choice.split(':')[1];
                    if (allSkills[key]) { chosenSkills.push({ level, name: allSkills[key], key }); bonusCount++; }
                  }
                  if (choice === 'bonus') bonusCount++;
                });

                return (
                  <div key={char.id} className="notebook-card">
                    <div className="notebook-card-header">
                      <div className="char-info">
                        <span className="char-avatar-big">{char.avatar || '🧟'}</span>
                        <span className="char-name-big">{char.name}</span>
                      </div>
                      <div className="card-actions">
                        <button className="btn-reset" onClick={() => handleResetMission(char.id)}>🔄</button>
                        <button className="btn-delete" onClick={() => handleClearCharacter(char.id)}>✕</button>
                      </div>
                    </div>

                    <div className="xp-row">
                      <span className="xp-label">XP</span>
                      <input type="number" value={xp} min="0" max="20" onChange={(e) => handleXpChange(char.id, e.target.value)} className="xp-input" />
                      <div className="xp-steps">
                        {[2, 5, 8, 11, 14, 17, 20].map(l => {
                          const isPending = pendingLevels.includes(l);
                          return (
                            <span key={l} className={`xp-step ${xp >= l ? 'active' : ''} ${isPending ? 'reached' : ''}`} onClick={() => handleXpChange(char.id, l)}>
                              {l}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {pendingLevels.length > 0 && (
                      <div className="choice-panel">
                        <div className="choice-title">🎯 Уровень {pendingLevels[0]}</div>
                        <div className="choice-grid">
                          {Object.entries(allSkills).map(([key, name]) => (
                            <SkillTooltip key={key} description={SKILL_DESCRIPTIONS[key]}>
                              <button className={`choice-btn ${skills.includes(key) ? 'disabled' : ''}`} onClick={() => !skills.includes(key) && handleChooseSkill(char.id, pendingLevels[0], key)}>
                                {name}
                              </button>
                            </SkillTooltip>
                          ))}
                          <SkillTooltip description={BONUS_ACTION_DESCRIPTION}>
                            <button className="choice-btn bonus" onClick={() => handleChooseBonus(char.id, pendingLevels[0])}>
                              Бонусное действие
                            </button>
                          </SkillTooltip>
                        </div>
                      </div>
                    )}

                    <div className="skills-section">
                      <div className="section-header"><span>Умения ({chosenSkills.length})</span></div>
                      <div className="skills-list">
                        {chosenSkills.map((s, i) => (
                          <SkillTooltip key={i} description={SKILL_DESCRIPTIONS[s.key]}>
                            <span className="skill-tag">{s.name}</span>
                          </SkillTooltip>
                        ))}
                      </div>
                    </div>

                    <div className="bonus-section">
                      <div className="section-header">
                        <span>Бонусные действия ({bonusCount}/7)</span>
                      </div>
                      <div className="bonus-grid">
                        {[2, 5, 8, 11, 14, 17, 20].map(l => {
                          const isSkill = levelChoices[l]?.startsWith('skill:');
                          const status = isSkill ? 'skill-locked' : (bonusActions[l] || 'locked');
                          return (
                            <div 
                              key={l} 
                              className={`bonus-cell ${status}`} 
                              onClick={() => status === 'available' && handleSpendBonusAction(char.id, l)}
                            >
                              {status === 'spent' ? '✓' : l}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="notes-row">
                      <textarea 
                        value={noteItems[char.id]?.items || ''} 
                        onChange={(e) => {
                          setNoteItems(prev => ({ ...prev, [char.id]: { ...prev[char.id], items: e.target.value } }));
                        }} 
                        placeholder="📦 Вещи" 
                        className="notes-input" 
                      />
                      <textarea 
                        value={noteItems[char.id]?.achievements || ''} 
                        onChange={(e) => {
                          setNoteItems(prev => ({ ...prev, [char.id]: { ...prev[char.id], achievements: e.target.value } }));
                        }} 
                        placeholder="🏆 Достижения" 
                        className="notes-input" 
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      <div className="footer">
        <span>💾 {lastSaveTime || 'Нет сохранений'}</span>
        <span className={ws ? 'status-online' : 'status-offline'}>
          🔌 {ws ? 'Online' : 'Offline'}
        </span>
      </div>
    </div>
  );
}

export default App;