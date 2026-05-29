# Estágio de Build
FROM node:20-slim AS build

WORKDIR /app

# Argumentos de Build (Vite precisa disso no npm run build)
ARG VITE_ZABBIX_URL
ARG VITE_ZABBIX_USER
ARG VITE_ZABBIX_PASS

ENV VITE_ZABBIX_URL=$VITE_ZABBIX_URL
ENV VITE_ZABBIX_USER=$VITE_ZABBIX_USER
ENV VITE_ZABBIX_PASS=$VITE_ZABBIX_PASS

# Copia os arquivos de dependências
COPY package*.json ./
RUN npm install

# Copia o restante dos arquivos
COPY . .

# Gera a build de produção
RUN npm run build

# Estágio de Produção (Node Server)
FROM node:20-slim

WORKDIR /app

# Copia dependências para permitir cache
COPY package*.json ./
RUN npm install --production

# Copia a build do frontend e o código do servidor
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server

# Configura a porta para o Easypanel (geralmente porta 80 ou 3000)
ENV PORT=80
EXPOSE 80

CMD ["node", "server/index.js"]
