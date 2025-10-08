#!/bin/bash

# Deployment Helper Script for Reachinbox
# This script helps prepare your application for deployment

echo "╔══════════════════════════════════════════════════════════╗"
echo "║                                                          ║"
echo "║   Reachinbox Deployment Helper                          ║"
echo "║                                                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if git is initialized
if [ ! -d .git ]; then
    echo -e "${YELLOW}⚠ Git not initialized. Initializing...${NC}"
    git init
    echo -e "${GREEN}✓ Git initialized${NC}"
fi

# Check if remote exists
if ! git remote | grep -q origin; then
    echo -e "${YELLOW}⚠ No remote repository found.${NC}"
    echo ""
    echo "Please create a GitHub repository and add it as remote:"
    echo "  git remote add origin https://github.com/yourusername/reachinbox.git"
    echo ""
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠ You have uncommitted changes${NC}"
    echo ""
    read -p "Do you want to commit all changes? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        read -p "Enter commit message: " commit_msg
        git commit -m "$commit_msg"
        echo -e "${GREEN}✓ Changes committed${NC}"
    else
        echo -e "${RED}✗ Please commit your changes before deploying${NC}"
        exit 1
    fi
fi

# Check for .env files
echo ""
echo "Checking environment configuration..."

if [ ! -f backend/.env ]; then
    echo -e "${RED}✗ backend/.env not found${NC}"
    echo "  Copy backend/.env.example to backend/.env and fill in your credentials"
    exit 1
else
    echo -e "${GREEN}✓ backend/.env exists${NC}"
fi

if [ ! -f frontend/.env.production ]; then
    echo -e "${YELLOW}⚠ frontend/.env.production not found${NC}"
    echo "  Creating default production config..."
    echo "VITE_API_URL=https://reachinbox-backend.onrender.com" > frontend/.env.production
    echo -e "${GREEN}✓ Created frontend/.env.production${NC}"
    echo -e "${YELLOW}  Remember to update this with your actual Render URL!${NC}"
fi

# Push to GitHub
echo ""
read -p "Push to GitHub? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push origin main
    echo -e "${GREEN}✓ Pushed to GitHub${NC}"
fi

# Display next steps
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Next Steps:                                             ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "1. Setup Qdrant Cloud (Free):"
echo "   https://cloud.qdrant.io"
echo ""
echo "2. Setup Bonsai Elasticsearch (Free):"
echo "   https://bonsai.io"
echo ""
echo "3. Deploy Backend to Render:"
echo "   https://render.com"
echo "   - Connect your GitHub repo"
echo "   - Add environment variables from backend/.env"
echo ""
echo "4. Deploy Frontend to Vercel:"
echo "   https://vercel.com"
echo "   - Connect your GitHub repo"
echo "   - Set root directory: frontend"
echo "   - Add env: VITE_API_URL=<your-render-url>"
echo ""
echo "📖 See DEPLOYMENT_CHECKLIST.md for detailed steps"
echo ""
