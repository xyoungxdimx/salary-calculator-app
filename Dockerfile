# --- Tahap 1: Build Aplikasi React ---
# Gunakan image Node.js versi 20 yang ringan
FROM node:20-alpine AS build

# Set direktori kerja di dalam container
WORKDIR /app

# Salin hanya package.json untuk memanfaatkan cache Docker
COPY package.json ./

# Install semua dependensi. 'npm install' akan membuat package-lock.json jika tidak ada.
RUN npm install

# Salin sisa file aplikasi
COPY . .

# Jalankan skrip 'build' dari package.json untuk membuat versi produksi
RUN npm run build

# --- Tahap 2: Sajikan Aplikasi dengan Nginx ---
# Gunakan image Nginx yang sangat ringan
FROM nginx:1.25-alpine

# Salin file hasil build dari tahap sebelumnya ke direktori web server Nginx
# 'vite build' menghasilkan folder 'dist'
COPY --from=build /app/dist /usr/share/nginx/html

# Hapus konfigurasi default Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Salin file konfigurasi Nginx kustom kita
COPY nginx.conf /etc/nginx/conf.d/

# Expose port 80
EXPOSE 80

# Command untuk menjalankan Nginx
CMD ["nginx", "-g", "daemon off;"]