FROM node:18-alpine

WORKDIR /app

# Копируем package.json
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Устанавливаем зависимости сервера (с зеркалом)
RUN cd server && npm install --omit=dev --no-audit --no-fund --registry=https://registry.npmmirror.com

# Устанавливаем зависимости клиента (с зеркалом)
RUN cd client && npm install --no-audit --no-fund --registry=https://registry.npmmirror.com

# Копируем исходники
COPY server ./server
COPY client ./client

# Сборка клиента
RUN cd client && DISABLE_ESLINT_PLUGIN=true npm run build

# Копируем сборку в статику сервера
RUN mkdir -p server/public && cp -r client/build/* server/public/

EXPOSE 3001 3002

WORKDIR /app/server
CMD ["node", "server.js"]