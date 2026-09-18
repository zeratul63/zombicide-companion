// server/config.js
const path = require('path');
const fs = require('fs');

// Загружаем переменные окружения
require('dotenv').config();

// === НАСТРОЙКА ХРАНИЛИЩА ===
const STORAGE_TYPE = process.env.STORAGE_TYPE || 'local';

// Конфиг для локального хранилища
const LOCAL_CONFIG = {
    type: 'local',
    savesDir: path.join(__dirname, 'saves'),
    init: () => {
        if (!fs.existsSync(LOCAL_CONFIG.savesDir)) {
            fs.mkdirSync(LOCAL_CONFIG.savesDir, { recursive: true });
            console.log(`📁 Локальная папка создана: ${LOCAL_CONFIG.savesDir}`);
        }
    }
};

// Конфиг для Яндекс Бакета
const YANDEX_CONFIG = {
    type: 'yandex',
    endpoint: process.env.YANDEX_ENDPOINT || 'https://storage.yandexcloud.net',
    region: process.env.YANDEX_REGION || 'ru-central1',
    bucket: process.env.YANDEX_BUCKET_NAME,
    accessKey: process.env.YANDEX_ACCESS_KEY,
    secretKey: process.env.YANDEX_SECRET_KEY,
    isValid: () => {
        return !!(YANDEX_CONFIG.accessKey && YANDEX_CONFIG.secretKey && YANDEX_CONFIG.bucket);
    },
    init: () => {
        if (!YANDEX_CONFIG.isValid()) {
            console.warn('⚠️ Яндекс Бакет не настроен');
            return false;
        }
        console.log(`☁️ Яндекс Бакет готов: ${YANDEX_CONFIG.bucket}`);
        return true;
    }
};

// Выбор активного хранилища
const getStorageConfig = () => {
    if (STORAGE_TYPE === 'yandex' && YANDEX_CONFIG.isValid()) {
        return YANDEX_CONFIG;
    }
    return LOCAL_CONFIG;
};

const activeConfig = getStorageConfig();
if (activeConfig.init) {
    activeConfig.init();
}

console.log(`💾 Активное хранилище: ${activeConfig.type.toUpperCase()}`);

module.exports = {
    STORAGE_TYPE,
    LOCAL_CONFIG,
    YANDEX_CONFIG,
    getStorageConfig,
    activeConfig
};