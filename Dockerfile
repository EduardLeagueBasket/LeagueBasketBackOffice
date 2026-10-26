# Paso 1: Compilar la aplicación
FROM node:20-alpine AS build
WORKDIR /app

# Declarar el argumento que vendrá desde Cloud Run
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

COPY package*.json ./
RUN npm ci

COPY . .
ENV CI=false
RUN npm run build

# Paso 2: Servir los archivos estáticos con Nginx
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

RUN echo 'server { \
    listen 8080; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]