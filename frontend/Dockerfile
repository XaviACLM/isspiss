# --- Build stage ---
FROM node:20-slim

WORKDIR /app

# Copy package.json and install all deps (dev included)
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build TypeScript + Vite
RUN npm run build

# COPY /app/dist ./dist

# Install serve for static hosting
RUN npm install -g serve

# Expose port
EXPOSE 5173

# Serve the build
CMD ["serve", "-s", "dist", "-l", "5173"]
