# --- Tahap 1: Build ---
# Gunakan image Node.js versi LTS (Long Term Support) sebagai basis
FROM node:20-alpine AS build

# Set direktori kerja di dalam container
WORKDIR /app

# Salin package.json dan package-lock.json (jika ada)
COPY package.json ./
COPY package-lock.json ./

# Install dependencies. Menggunakan 'npm ci' lebih cepat dan andal untuk CI/CD
RUN npm ci

# Salin sisa file aplikasi ke dalam container
COPY . .

# Build aplikasi untuk production
RUN npm run build

# --- Tahap 2: Serve ---
# Gunakan image Nginx yang sangat ringan untuk menyajikan file statis
FROM nginx:1.25-alpine

# Salin file hasil build dari tahap 'build' ke direktori web server Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Hapus file konfigurasi Nginx default
RUN rm /etc/nginx/conf.d/default.conf

# Salin file konfigurasi Nginx kustom kita
COPY nginx.conf /etc/nginx/conf.d/

# Expose port 80 (port default Nginx)
EXPOSE 80

# Command untuk menjalankan Nginx saat container dimulai
CMD ["nginx", "-g", "daemon off;"]