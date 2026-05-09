# Use Node image
FROM node:20-alpine

# Set working dir
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install deps
RUN npm install

# Copy rest of code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 5000

# Start app
CMD ["npm", "start"]