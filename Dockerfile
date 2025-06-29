# Dockerfile
FROM node:18-alpine

WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm ci --only=production && npm cache clean --force

# ソースコードをコピー
COPY . .

# 開発依存関係をインストールしてビルド
RUN npm install && \
    chmod +x node_modules/.bin/* && \
    npm run build:docker

# ポート設定
EXPOSE 4000

# アプリ起動
CMD ["npm", "start"]