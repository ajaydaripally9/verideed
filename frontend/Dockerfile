FROM node:22-alpine

WORKDIR /app

# Install dependencies first for caching
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy application files
COPY . .

# Expose port
EXPOSE 5173

# Run Vite dev server bound to host interface
CMD ["npm", "run", "dev", "--", "--host"]
