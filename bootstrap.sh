#!/usr/bin/env bash
# ==============================================================================
# SportsData NFL API Dashboard - Automated Bootstrap & Environment Setup Script
# ==============================================================================
# Usage:
#   chmod +x bootstrap.sh
#   ./bootstrap.sh [dev|build|start|clean|check]
# ==============================================================================

set -e

# ANSI Color Codes
BOLD="\033[1m"
GREEN="\033[38;5;46m"
CYAN="\033[38;5;51m"
AMBER="\033[38;5;214m"
RED="\033[38;5;196m"
BLUE="\033[38;5;39m"
NC="\033[0m" # No Color

COMMAND=${1:-dev}

echo -e "${AMBER}${BOLD}======================================================${NC}"
echo -e "${AMBER}${BOLD}  🏈 SportsData NFL API Dashboard Bootstrap Script   ${NC}"
echo -e "${AMBER}${BOLD}======================================================${NC}"

# Step 1: Verify Node.js environment
check_prerequisites() {
  echo -e "\n${CYAN}🔍 Checking prerequisites...${NC}"
  
  if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js (v18+ recommended).${NC}"
    exit 1
  fi

  NODE_VERSION=$(node -v)
  echo -e "${GREEN}✓ Node.js version:${NC} ${NODE_VERSION}"

  if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm.${NC}"
    exit 1
  fi
  NPM_VERSION=$(npm -v)
  echo -e "${GREEN}✓ npm version:${NC} ${NPM_VERSION}"
}

# Step 2: Environment File Setup
setup_env() {
  echo -e "\n${CYAN}⚙️  Configuring environment variables...${NC}"
  if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
      cp .env.example .env
      echo -e "${GREEN}✓ Created .env from .env.example${NC}"
    else
      cat <<EOF > .env
# SportsData NFL Dashboard Environment Config
PORT=3000
GEMINI_API_KEY=
SPORTSDATA_API_KEY=
OLLAMA_HOST=http://localhost:11434
EOF
      echo -e "${GREEN}✓ Created new default .env file${NC}"
    fi
  else
    echo -e "${BLUE}ℹ️  Existing .env found. Keeping current config.${NC}"
  fi
}

# Step 3: Dependency Installation
install_dependencies() {
  echo -e "\n${CYAN}📦 Installing project dependencies...${NC}"
  if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✓ Dependencies installed successfully.${NC}"
  else
    echo -e "${BLUE}ℹ️  node_modules directory found. Skipping full install (run './bootstrap.sh clean' to reinstall).${NC}"
  fi
}

# Step 4: Validate TypeScript & Linter
run_lint() {
  echo -e "\n${CYAN}🔎 Validating TypeScript types & syntax...${NC}"
  npm run lint
  echo -e "${GREEN}✓ TypeScript compilation check passed.${NC}"
}

# Execution Handlers
case "$COMMAND" in
  dev)
    check_prerequisites
    setup_env
    install_dependencies
    run_lint
    echo -e "\n${GREEN}${BOLD}🚀 Starting Development Server on http://localhost:3000...${NC}"
    npm run dev
    ;;

  build)
    check_prerequisites
    setup_env
    install_dependencies
    run_lint
    echo -e "\n${CYAN}🔨 Building production bundle (Vite + esbuild)...${NC}"
    npm run build
    echo -e "${GREEN}${BOLD}✓ Production build completed in dist/${NC}"
    ;;

  start)
    if [ ! -f "dist/server.cjs" ]; then
      echo -e "${AMBER}⚠️  dist/server.cjs not found. Building first...${NC}"
      npm run build
    fi
    echo -e "\n${GREEN}${BOLD}🌟 Starting Production Server on port 3000...${NC}"
    npm run start
    ;;

  clean)
    echo -e "\n${AMBER}🧹 Cleaning dist and node_modules...${NC}"
    rm -rf dist node_modules package-lock.json
    echo -e "${GREEN}✓ Clean completed. Run './bootstrap.sh dev' to reinitialize.${NC}"
    ;;

  check)
    check_prerequisites
    run_lint
    echo -e "\n${GREEN}✓ All checks passed successfully!${NC}"
    ;;

  *)
    echo -e "${RED}Unknown command: $COMMAND${NC}"
    echo -e "Available commands: ${BOLD}dev | build | start | clean | check${NC}"
    exit 1
    ;;
esac
