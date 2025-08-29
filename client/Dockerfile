# Stage 1 — Build the React Vite app
FROM node:20 AS builder

WORKDIR /app

# Copy package.json and lock files
COPY package*.json ./
COPY vite.config.* ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .
COPY .env .env 
# Build the app (production build goes to /dist)
RUN npm run build


# Stage 2 — Serve with Nginx
FROM nginx:alpine

# Copy build output from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config (optional, good for SPA routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
