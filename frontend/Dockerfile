FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source files
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Run Vite dev server, bound to all network interfaces so it's accessible from host
CMD ["npm", "run", "dev", "--", "--host"]
