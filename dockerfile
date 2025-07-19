# Build aşaması
FROM node:22 as build

WORKDIR /app

# Bağımlılık dosyalarını kopyala
COPY package.json package-lock.json* ./

# Bağımlılıkları yükle
RUN npm ci

# Kaynak kodlarını kopyala
COPY . .

# Ortam değişkenlerini .env dosyasına yaz
ARG VITE_BACKEND_URL
ARG VITE_APP_NAME
ARG VITE_APP_ENV
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_FIREBASE_MEASUREMENT_ID

RUN echo "VITE_BACKEND_URL=$VITE_BACKEND_URL" > .env && \
    echo "VITE_APP_NAME=$VITE_APP_NAME" >> .env && \
    echo "VITE_APP_ENV=$VITE_APP_ENV" >> .env && \
    echo "VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY" >> .env && \
    echo "VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN" >> .env && \
    echo "VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID" >> .env && \
    echo "VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET" >> .env && \
    echo "VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID" >> .env && \
    echo "VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID" >> .env && \
    echo "VITE_FIREBASE_MEASUREMENT_ID=$VITE_FIREBASE_MEASUREMENT_ID" >> .env

# Uygulamayı derle
RUN npm run build

# Çalıştırma aşaması
FROM node:22

WORKDIR /app

# Static server yükle
RUN npm install -g serve

# Derlenmiş çıktıyı kopyala
COPY --from=build /app/dist /app

# Portu aç
EXPOSE 8080

# Başlat
CMD ["serve", "-s", ".", "-l", "8080"]
