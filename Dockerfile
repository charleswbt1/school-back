FROM node:20-bookworm

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libgtk-3-0 \
    libnss3 \
    libgbm1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

COPY . .

ENV CHROME_BIN=/usr/bin/chromium
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PORT=8080

EXPOSE 8080

CMD ["npm", "start"]