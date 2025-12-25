#!/bin/bash

# Verification script for Raspberry Pi setup
# Run this to check if everything is configured correctly

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo "========================================="
echo "Raspberry Pi Setup Verification"
echo "========================================="
echo ""

# Check Node.js
echo "✓ Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "  Node.js version: $NODE_VERSION"

    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$MAJOR_VERSION" -ge 18 ]; then
        echo "  ✅ Node.js version is compatible"
    else
        echo "  ⚠️  Node.js version is too old (need 18+)"
    fi
else
    echo "  ❌ Node.js not found"
    exit 1
fi
echo ""

# Check npm
echo "✓ Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "  npm version: $NPM_VERSION"
    echo "  ✅ npm is installed"
else
    echo "  ❌ npm not found"
    exit 1
fi
echo ""

# Check dependencies
echo "✓ Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "  ✅ node_modules directory exists"

    if [ -f "node_modules/.bin/tsx" ]; then
        echo "  ✅ tsx is installed"
    else
        echo "  ❌ tsx not found - run: npm install"
        exit 1
    fi
else
    echo "  ❌ node_modules not found - run: npm install"
    exit 1
fi
echo ""

# Check environment variables
echo "✓ Checking environment variables..."
if [ -f ".env.local" ]; then
    echo "  ✅ .env.local file exists"

    if grep -q "COC_API_TOKEN=" .env.local; then
        echo "  ✅ COC_API_TOKEN is configured"
    else
        echo "  ⚠️  COC_API_TOKEN not found in .env.local"
    fi

    if grep -q "CLAN_TAG=" .env.local; then
        echo "  ✅ CLAN_TAG is configured"
    else
        echo "  ⚠️  CLAN_TAG not found in .env.local"
    fi
else
    echo "  ❌ .env.local file not found"
    echo "  Create it with your CoC API credentials"
    exit 1
fi
echo ""

# Check git configuration
echo "✓ Checking git configuration..."
if command -v git &> /dev/null; then
    echo "  ✅ git is installed"

    GIT_USER=$(git config user.name || echo "")
    GIT_EMAIL=$(git config user.email || echo "")

    if [ -n "$GIT_USER" ]; then
        echo "  ✅ git user.name: $GIT_USER"
    else
        echo "  ⚠️  git user.name not configured"
    fi

    if [ -n "$GIT_EMAIL" ]; then
        echo "  ✅ git user.email: $GIT_EMAIL"
    else
        echo "  ⚠️  git user.email not configured"
    fi

    GIT_REMOTE=$(git remote get-url origin || echo "")
    if [ -n "$GIT_REMOTE" ]; then
        echo "  ✅ git remote origin: $GIT_REMOTE"
    else
        echo "  ⚠️  git remote origin not configured"
    fi
else
    echo "  ❌ git not found"
    exit 1
fi
echo ""

# Check data directory
echo "✓ Checking data directory..."
if [ -d "data" ]; then
    echo "  ✅ data directory exists"

    if [ -f "data/wars.json" ]; then
        WAR_COUNT=$(cat data/wars.json | grep -o '"wars"' | wc -l || echo "0")
        echo "  ✅ wars.json exists"

        if command -v jq &> /dev/null; then
            TOTAL_WARS=$(jq '.wars | length' data/wars.json)
            echo "  ✅ Total wars stored: $TOTAL_WARS"
        fi
    else
        echo "  ℹ️  wars.json doesn't exist yet (will be created on first run)"
    fi
else
    echo "  ℹ️  data directory doesn't exist yet (will be created on first run)"
fi
echo ""

# Check logs directory
echo "✓ Checking logs directory..."
if [ -d "logs" ]; then
    echo "  ✅ logs directory exists"
else
    echo "  ℹ️  logs directory doesn't exist yet (will be created on first run)"
    mkdir -p logs
    echo "  ✅ Created logs directory"
fi
echo ""

# Check auto-sync script
echo "✓ Checking auto-sync script..."
if [ -f "scripts/auto-sync.sh" ]; then
    echo "  ✅ auto-sync.sh exists"

    if [ -x "scripts/auto-sync.sh" ]; then
        echo "  ✅ auto-sync.sh is executable"
    else
        echo "  ⚠️  auto-sync.sh is not executable - run: chmod +x scripts/auto-sync.sh"
    fi
else
    echo "  ❌ auto-sync.sh not found"
    exit 1
fi
echo ""

# Check jq (optional but recommended)
echo "✓ Checking optional dependencies..."
if command -v jq &> /dev/null; then
    echo "  ✅ jq is installed (for JSON parsing in auto-sync script)"
else
    echo "  ⚠️  jq not installed (recommended) - install: sudo apt install jq"
fi
echo ""

# Check cron
echo "✓ Checking cron..."
if command -v crontab &> /dev/null; then
    echo "  ✅ cron is available"

    CRON_JOBS=$(crontab -l 2>/dev/null | grep -c "auto-sync.sh" || echo "0")
    if [ "$CRON_JOBS" -gt 0 ]; then
        echo "  ✅ Auto-sync cron job is configured"
        echo ""
        echo "  Current cron jobs:"
        crontab -l | grep "auto-sync.sh"
    else
        echo "  ⚠️  No cron job configured yet"
        echo "  Run: crontab -e"
        echo "  Add: 0 */6 * * * cd $PROJECT_DIR && ./scripts/auto-sync.sh >> logs/cron.log 2>&1"
    fi
else
    echo "  ⚠️  cron not found"
fi
echo ""

# Test data collection
echo "✓ Testing data collection..."
echo "  Running: npm run collect"
echo "  (This will attempt to fetch data from CoC API)"
echo ""

if npm run collect; then
    echo ""
    echo "  ✅ Data collection test successful"
else
    echo ""
    echo "  ❌ Data collection failed"
    echo "  Check your API token and clan tag in .env.local"
    exit 1
fi

echo ""
echo "========================================="
echo "✅ Verification Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Set up cron job (see RASPBERRY_PI_SETUP.md)"
echo "2. Test auto-sync: ./scripts/auto-sync.sh"
echo "3. Monitor logs: tail -f logs/auto-sync.log"
echo ""
