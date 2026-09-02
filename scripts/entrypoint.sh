#!/bin/bash
set -e

# Default PORT if not provided
PORT="${PORT:-10000}"

echo "================================================="
echo "   Starting Terra_vault Unified Service          "
echo "   Port: ${PORT}                                 "
echo "================================================="

# Generate nginx configuration from template
envsubst '${PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# 1. Start FastAPI backend in background
echo "1. Starting FastAPI Backend on 127.0.0.1:8000..."
cd /app/backend
PYTHONUNBUFFERED=1 uvicorn main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# 2. Start Next.js frontend in background
echo "2. Starting Next.js Frontend on 127.0.0.1:3000..."
cd /app/frontend
PORT=3000 HOSTNAME=0.0.0.0 node server.js &
FRONTEND_PID=$!

# 3. Wait for upstream services to be ready before starting Nginx
echo "3. Waiting for services to initialize..."
for i in $(seq 1 45); do
  BACKEND_UP=0
  FRONTEND_UP=0
  
  if curl -s -f http://127.0.0.1:8000/health > /dev/null 2>&1; then
    BACKEND_UP=1
  fi
  
  if curl -s -f http://127.0.0.1:3000 > /dev/null 2>&1; then
    FRONTEND_UP=1
  fi

  if [ $BACKEND_UP -eq 1 ] && [ $FRONTEND_UP -eq 1 ]; then
    echo "✓ Both FastAPI Backend (8000) and Next.js Frontend (3000) are READY!"
    break
  fi

  echo "  Waiting for services to warm up... ($i/45s) [Backend: $BACKEND_UP, Frontend: $FRONTEND_UP]"
  sleep 1
done

# 4. Start Nginx in foreground
echo "4. Starting Nginx Reverse Proxy on 0.0.0.0:${PORT}..."
exec nginx -g "daemon off;"
