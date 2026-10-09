# One image for the whole portal: the built site and the API, served by the same
# process (backend/server.js + SERVE_FRONTEND). The existing backend/Dockerfile
# still builds an API-only image if you prefer to host the site elsewhere.
FROM node:20-alpine AS site

WORKDIR /build
COPY frontend/package*.json ./
RUN npm ci || npm install
COPY frontend/ ./
RUN npm run build

FROM node:20

WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev
COPY backend/ ./backend/
COPY --from=site /build/dist ./frontend/dist

ENV NODE_ENV=production \
    PORT=4000 \
    SERVE_FRONTEND=/app/frontend/dist \
    MONGODB_URI=mongodb://mongo:27017

EXPOSE 4000

# /api/health answers 503 the moment MongoDB stops answering, so an orchestrator
# can use it as a real readiness signal.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:4000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "backend/server.js"]
