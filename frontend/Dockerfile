# Stage 1: Build the React application
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2: Serve the static files using Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Default fallback port if not set by Railway
ENV PORT=80

# Create templates directory for Nginx environment variable substitution
RUN mkdir -p /etc/nginx/templates

# Nginx configuration template listening on dynamic $PORT
RUN echo 'server { \
    listen ${PORT}; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/templates/default.conf.template

# Limit Nginx to 1 worker process to prevent OOM on high-core hosts
RUN sed -i 's/worker_processes.*/worker_processes 1;/g' /etc/nginx/nginx.conf

CMD ["nginx", "-g", "daemon off;"]
