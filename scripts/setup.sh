#!/bin/bash

# ================================
# Indian Market Intelligence Platform
# scripts/setup.sh
# Local development setup script
# ================================

set -e

# ---- Colors ----
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "=================================================="
echo "  Indian Market Intelligence Platform - Setup"
echo "=================================================="
echo -e "${NC}"

# ================================
# 1. Check Prerequisites
# ================================
echo -e "${YELLOW}[1/7] Checking prerequisites...${NC}"

check_command() {
  if ! command -v $1 &> /dev/null; then
    echo -e "${RED}✗ $1 is not installed. Please install it and re-run.${NC}"
    exit 1
  else
    echo -e "${GREEN}✓ $1 found${NC}"
  fi
}

check_command node
check_command npm
check_command python3
check_command pip3
check_command docker
check_command docker-compose

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${RED}✗ Node.js version must be >= 18. Found: $(node -v)${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Node.js version OK: $(node -v)${NC}"

# ================================
# 2. Set Up Environment Variables
# ================================
echo -e "\n${YELLOW}[2/7] Setting up environment variables...${NC}"

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo -e "${GREEN}✓ .env created from .env.example${NC}"
  echo -e "${YELLOW}  → Please update .env with your actual API keys before running the app.${NC}"
else
  echo -e "${GREEN}✓ .env already exists, skipping...${NC}"
fi

# ================================
# 3. Install Frontend Dependencies
# ================================
echo -e "\n${YELLOW}[3/7] Installing frontend dependencies...${NC}"
cd frontend
npm install
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
cd ..

# ================================
# 4. Install Backend Dependencies
# ================================
echo -e "\n${YELLOW}[4/7] Installing backend dependencies...${NC}"
cd backend
npm install
echo -e "${GREEN}✓ Backend dependencies installed${NC}"
cd ..

# ================================
# 5. Install Python Dependencies
# ================================
echo -e "\n${YELLOW}[5/7] Installing Python dependencies...${NC}"

echo "  → AI Service..."
cd ai-service
pip3 install -r requirements.txt -q
echo -e "${GREEN}✓ AI service dependencies installed${NC}"
cd ..

echo "  → Ingestion Service..."
cd ingestion-service
pip3 install -r requirements.txt -q
echo -e "${GREEN}✓ Ingestion service dependencies installed${NC}"
cd ..

# ================================
# 6. Run Prisma Migrations
# ================================
echo -e "\n${YELLOW}[6/7] Running database migrations...${NC}"

# Wait for Postgres to be ready if Docker is running
if docker ps | grep -q imip_postgres; then
  echo "  → Postgres container detected, running migrations..."
  cd backend
  npx prisma migrate dev --name init
  echo -e "${GREEN}✓ Prisma migrations applied${NC}"
  cd ..
else
  echo -e "${YELLOW}  → Postgres not running. Start Docker first, then run:${NC}"
  echo -e "     cd backend && npx prisma migrate dev"
fi

# ================================
# 7. Done
# ================================
echo -e "\n${BLUE}"
echo "=================================================="
echo "  Setup Complete!"
echo "=================================================="
echo -e "${NC}"

echo -e "👉 To start the full stack with Docker:"
echo -e "   ${GREEN}npm run docker:up${NC}"
echo ""
echo -e "👉 To start frontend + backend locally:"
echo -e "   ${GREEN}npm run dev${NC}"
echo ""
echo -e "👉 Services will be available at:"
echo -e "   Frontend   →  ${GREEN}http://localhost:5173${NC}"
echo -e "   Backend    →  ${GREEN}http://localhost:5000${NC}"
echo -e "   AI Service →  ${GREEN}http://localhost:8000${NC}"
echo -e "   Nginx      →  ${GREEN}http://localhost:80${NC}"
echo ""
echo -e "${YELLOW}⚠️  Remember to fill in your API keys in .env before starting!${NC}"
echo ""
