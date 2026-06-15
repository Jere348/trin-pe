# 1. Usamos una imagen de Node.js como base
FROM node:20-alphine

# 2. Creamos la carpeta de trabajo dentro del contenedor
WORKDIR /app

# 3. Copiamos los archivos de dependencias
COPY package*.json ./

# 4. Instalamos las dependencias
RUN npm install

# 5. Copiamos el resto del código
COPY . .

# 6. Exponemos el puerto que usa React
EXPOSE 3000

# 7. Comando para arrancar la app
CMD ["npm", "start"]