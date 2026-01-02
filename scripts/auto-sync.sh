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
CWL_DATA_FILE="$PROJECT_DIR/data/leaguewars.json"

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

# Run the regular war collector
log "Running war data collector..."
if npm run collect 2>&1 | tee -a "$LOG_FILE"; then
    log "Regular war data collection completed successfully"
else
    log "ERROR: Regular war data collection failed"
    exit 1
fi

# Run the CWL collector
log "Running CWL data collector..."
if npm run collect-cwl 2>&1 | tee -a "$LOG_FILE"; then
    log "CWL data collection completed successfully"
else
    log "ERROR: CWL data collection failed"
    exit 1
fi

# Check if either wars.json or leaguewars.json has changed
WARS_CHANGED=false
CWL_CHANGED=false

if ! git diff --quiet "$DATA_FILE"; then
    WARS_CHANGED=true
    log "Changes detected in wars.json"
fi

if ! git diff --quiet "$CWL_DATA_FILE"; then
    CWL_CHANGED=true
    log "Changes detected in leaguewars.json"
fi

if [ "$WARS_CHANGED" = false ] && [ "$CWL_CHANGED" = false ]; then
    log "No changes detected in data files - skipping commit"
    log "Auto-sync completed (no changes)"
    exit 0
fi

# Stage the changes
log "Staging changes..."
if [ "$WARS_CHANGED" = true ]; then
    git add "$DATA_FILE"
fi
if [ "$CWL_CHANGED" = true ]; then
    git add "$CWL_DATA_FILE"
fi

# Get stats for commit message
COMMIT_MSG_PARTS=()

if [ "$WARS_CHANGED" = true ]; then
    TOTAL_WARS=$(jq '.wars | length' "$DATA_FILE" 2>/dev/null || echo "unknown")
    COMMIT_MSG_PARTS+=("Regular wars: $TOTAL_WARS total")
fi

if [ "$CWL_CHANGED" = true ]; then
    TOTAL_CWL_SEASONS=$(jq '.seasons | length' "$CWL_DATA_FILE" 2>/dev/null || echo "unknown")
    TOTAL_CWL_WARS=$(jq '.totalWars' "$CWL_DATA_FILE" 2>/dev/null || echo "unknown")
    COMMIT_MSG_PARTS+=("CWL: $TOTAL_CWL_SEASONS seasons, $TOTAL_CWL_WARS wars")
fi

LAST_UPDATED=$(date -Iseconds)

# Create commit message
COMMIT_MSG="Update war data

${COMMIT_MSG_PARTS[*]}
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
