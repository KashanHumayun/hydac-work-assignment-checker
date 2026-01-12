# Production build stage
FROM node:18-slim AS builder

# Build Frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Build Backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./

# Final stage
FROM node:18-slim

WORKDIR /app

# Copy backend dependencies and source
COPY --from=builder /app/backend /app/backend

# Copy frontend build artifacts to backend/public or separate static server
# For simplicity, we'll serve frontend from the backend in production or assume a separate service
# Let's copy it to a static folder the backend can serve
COPY --from=builder /app/frontend/public /app/backend/public
COPY --from=builder /app/frontend/dist /app/backend/public

WORKDIR /app/backend

# Create rules directory and meta.json if not exists
RUN mkdir -p data/rules/versions

EXPOSE 4000

ENV NODE_ENV=production
ENV PORT=4000

CMD ["npm", "start"]
