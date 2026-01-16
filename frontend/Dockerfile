# --- Build stage ---
FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json and install all deps (dev included)
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build TypeScript + Vite
RUN npm run build

# --- Serve stage ---
FROM node:20-alpine

WORKDIR /app

# Copy built files
COPY --from=build /app/dist ./dist

# Install serve for static hosting
RUN npm install -g serve

# Expose port
EXPOSE 5173

# Serve the build
CMD ["serve", "-s", "dist", "-l", "5173"]
