# TicketForge Bytecode-Protected Docker Container
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY platform/frontend/package*.json ./
RUN npm install
COPY platform/frontend ./
RUN npm run build

FROM node:18-alpine AS production
WORKDIR /app

# Copy Backend Dependencies & V8 Bytecode (.jsc) Binaries
COPY platform/backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install --only=production

# Copy Bytecode Binaries ONLY (No raw JS source code)
COPY platform/backend/*.jsc ./
COPY platform/backend/services/**/*.jsc ./services/
COPY platform/backend/config/*.jsc ./config/
COPY platform/backend/index.js ./index.js
COPY platform/backend/build-blackbox.js ./build-blackbox.js

# Copy Static Web Assets into Web Root
COPY --from=frontend-builder /app/frontend/build /app/backend/public

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

# Run in automated cloud mode
CMD ["node", "index.js", "--mode", "cloud", "--port", "5000"]
