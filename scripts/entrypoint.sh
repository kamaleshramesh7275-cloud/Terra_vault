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

# Start FastAPI backend in background
echo "1. Starting FastAPI Backend on 127.0.0.1:8000..."
cd /app/backend
uvicorn main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# Start Next.js frontend in background
echo "2. Starting Next.js Frontend on 127.0.0.1:3000..."
cd /app/frontend
PORT=3000 HOSTNAME=127.0.0.1 node server.js &
FRONTEND_PID=$!

# Start Nginx in foreground
echo "3. Starting Nginx Reverse Proxy on 0.0.0.0:${PORT}..."
nginx -g "daemon off;"
