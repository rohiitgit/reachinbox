#!/bin/bash

# Reachinbox Startup Script
# This script starts all services in the correct order

set -e

echo "╔══════════════════════════════════════════════════════════╗"
echo "║                                                          ║"
echo "║         Reachinbox Email Onebox - Startup               ║"
echo "║                                                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker"
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose not found. Please install Docker Compose"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Check .env file
if [ ! -f "backend/.env" ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp backend/.env.example backend/.env
    echo "📝 Please edit backend/.env with your credentials before continuing"
    echo "   Press Enter when ready..."
    read
fi

# Start Docker services
echo "🐳 Starting Docker services (Elasticsearch & Qdrant)..."
docker compose up -d

echo "⏳ Waiting for Elasticsearch to be ready (30 seconds)..."
sleep 30

# Check Elasticsearch
echo "🔍 Checking Elasticsearch..."
if curl -s http://localhost:9200 > /dev/null; then
    echo "✅ Elasticsearch is running"
else
    echo "❌ Elasticsearch is not responding. Check docker-compose logs elasticsearch"
    exit 1
fi

# Check Qdrant
echo "🔍 Checking Qdrant..."
if curl -s http://localhost:6333 > /dev/null; then
    echo "✅ Qdrant is running"
else
    echo "❌ Qdrant is not responding. Check docker-compose logs qdrant"
    exit 1
fi

echo ""
echo "✅ All services started successfully!"
echo ""
echo "Next steps:"
echo "1. Open TWO new terminal windows"
echo "2. In terminal 1, run: cd backend && npm install && npm run dev"
echo "3. In terminal 2, run: cd frontend && npm install && npm run dev"
echo "4. Open browser: http://localhost:5173"
echo ""
echo "To stop services, run: docker compose down"
echo ""
