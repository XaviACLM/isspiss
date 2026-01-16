FROM node:20-slim

WORKDIR /app


# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the source code
COPY . .

# Build TypeScript if needed
RUN npm run build || echo "No build script, skipping"

# Expose port
EXPOSE 8787

# Start server
# CMD ["npm", "run", "start"]
