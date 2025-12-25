#!/bin/bash

# Auto-sync script for Raspberry Pi
# Collects war data and pushes to git if changes detected

set -e

# Load user environment (needed for cron)
if [ -f "$HOME/.bashrc" ]; then
    source "$HOME/.bashrc" 2>/dev/null || true
fi

# Ensure PATH includes common node locations
export PATH="$HOME/.local/bin:/usr/local/bin:/usr/bin:$PATH"

# Add nvm node path if nvm is available
if command -v nvm &> /dev/null; then
    export PATH="$HOME/.nvm/versions/node/$(nvm current)/bin:$PATH"
fi

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_FILE="$PROJECT_DIR/logs/auto-sync.log"
DATA_FILE="$PROJECT_DIR/data/wars.json"

# Create logs directory if it doesn't exist
mkdir -p "$PROJECT_DIR/logs"

# Function to log with timestamp
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "========================================="
log "Starting auto-sync process"
log "========================================="

# Navigate to project directory
cd "$PROJECT_DIR"

# Pull latest changes first to avoid conflicts
log "Pulling latest changes from remote..."
if git pull origin main; then
    log "Successfully pulled latest changes"
else
    log "WARNING: Git pull failed or had conflicts"
fi

# Run the collector
log "Running war data collector..."
if npm run collect 2>&1 | tee -a "$LOG_FILE"; then
    log "Data collection completed successfully"
else
    log "ERROR: Data collection failed"
    exit 1
fi

# Check if wars.json has changed
if git diff --quiet "$DATA_FILE"; then
    log "No changes detected in wars.json - skipping commit"
    log "Auto-sync completed (no changes)"
    exit 0
fi

log "Changes detected in wars.json"

# Stage the changes
log "Staging changes..."
git add "$DATA_FILE"

# Get war stats for commit message
TOTAL_WARS=$(jq '.wars | length' "$DATA_FILE" 2>/dev/null || echo "unknown")
LAST_UPDATED=$(jq -r '.lastUpdated' "$DATA_FILE" 2>/dev/null || date -Iseconds)

# Create commit
COMMIT_MSG="Update war data - $TOTAL_WARS total wars

Data collected at: $LAST_UPDATED

🤖 Auto-synced from Raspberry Pi"

log "Creating commit..."
if git commit -m "$COMMIT_MSG"; then
    log "Commit created successfully"
else
    log "ERROR: Commit failed"
    exit 1
fi

# Push to remote
log "Pushing to remote repository..."
if git push origin main; then
    log "Successfully pushed to remote"
    log "✅ Auto-sync completed successfully"
else
    log "ERROR: Git push failed"
    exit 1
fi

log "========================================="
