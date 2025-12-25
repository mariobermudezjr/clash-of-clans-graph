# Raspberry Pi Auto-Sync Setup Guide

This guide will help you set up automated data collection and git synchronization on your Raspberry Pi 4B.

## Prerequisites

- Raspberry Pi 4B with 64-bit Raspberry Pi OS
- Node.js 18+ installed
- Git configured
- Project cloned to Raspberry Pi

## 1. Install Dependencies

```bash
cd /path/to/clash-of-clans-war-graph
npm install
```

## 2. Configure Environment Variables

Make sure your `.env.local` file exists with your CoC API credentials:

```bash
# Copy from your local machine or create new
nano .env.local
```

Add:
```
COC_API_TOKEN=your_token_here
CLAN_TAG=#your_clan_tag
```

## 3. Set Up Git Authentication

Choose **one** of these methods:

### Option A: SSH Key (Recommended)

```bash
# Generate SSH key on Pi
ssh-keygen -t ed25519 -C "raspberry-pi-coc-collector"

# Copy public key
cat ~/.ssh/id_ed25519.pub
```

1. Copy the output
2. Go to GitHub → Settings → SSH and GPG keys → New SSH key
3. Paste the key and save

```bash
# Update remote to use SSH
git remote set-url origin git@github.com:YOUR_USERNAME/clash-of-clans-war-graph.git
```

### Option B: Personal Access Token

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope
3. Copy the token

```bash
# Configure git to use token
git remote set-url origin https://YOUR_USERNAME:YOUR_TOKEN@github.com/YOUR_USERNAME/clash-of-clans-war-graph.git

# Store credentials (optional)
git config --global credential.helper store
```

## 4. Configure Git User

```bash
git config user.name "Raspberry Pi Collector"
git config user.email "your-email@example.com"
```

## 5. Make Auto-Sync Script Executable

```bash
chmod +x scripts/auto-sync.sh
```

## 6. Test the Script

```bash
# Test data collection
npm run collect

# Test auto-sync (will commit and push if there are changes)
./scripts/auto-sync.sh

# Check the log
tail -f logs/auto-sync.log
```

## 7. Set Up Cron Job for Scheduled Execution

### Option A: Multiple Times Per Day (Recommended)

```bash
# Edit crontab
crontab -e
```

Add these lines for collection every 6 hours:

```bash
# Auto-sync war data every 6 hours
0 */6 * * * cd /home/pi/clash-of-clans-war-graph && ./scripts/auto-sync.sh >> logs/cron.log 2>&1

# Or more frequent during war times (every 2 hours):
0 */2 * * * cd /home/pi/clash-of-clans-war-graph && ./scripts/auto-sync.sh >> logs/cron.log 2>&1
```

### Option B: Specific Times

```bash
# Run at 6 AM, 12 PM, 6 PM, and 12 AM
0 6,12,18,0 * * * cd /home/pi/clash-of-clans-war-graph && ./scripts/auto-sync.sh >> logs/cron.log 2>&1
```

### Option C: Match War Schedule

If your clan wars typically end at specific times:

```bash
# Example: 9 AM and 9 PM daily
0 9,21 * * * cd /home/pi/clash-of-clans-war-graph && ./scripts/auto-sync.sh >> logs/cron.log 2>&1
```

**Important:** Replace `/home/pi/clash-of-clans-war-graph` with your actual project path.

## 8. Alternative: Use Systemd Timer (Advanced)

For more control, create a systemd service:

```bash
# Create service file
sudo nano /etc/systemd/system/coc-sync.service
```

Add:
```ini
[Unit]
Description=Clash of Clans War Data Sync
After=network.target

[Service]
Type=oneshot
User=pi
WorkingDirectory=/home/pi/clash-of-clans-war-graph
ExecStart=/home/pi/clash-of-clans-war-graph/scripts/auto-sync.sh
StandardOutput=append:/home/pi/clash-of-clans-war-graph/logs/auto-sync.log
StandardError=append:/home/pi/clash-of-clans-war-graph/logs/auto-sync.log

[Install]
WantedBy=multi-user.target
```

Create timer:
```bash
sudo nano /etc/systemd/system/coc-sync.timer
```

Add:
```ini
[Unit]
Description=Clash of Clans War Data Sync Timer
Requires=coc-sync.service

[Timer]
OnCalendar=*-*-* 06,12,18,00:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable coc-sync.timer
sudo systemctl start coc-sync.timer

# Check status
sudo systemctl status coc-sync.timer
sudo systemctl list-timers
```

## 9. Set Up CI/CD (Platform Specific)

### For Vercel:
- Your repository is already connected
- Every push to `main` triggers automatic deployment
- No additional configuration needed

### For Netlify:
- Repository should be connected in Netlify dashboard
- Build command: `npm run build`
- Publish directory: `.next` or `out`
- Deploys automatically on push to main

### For GitHub Pages:
Add `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./out
```

## 10. Monitoring

### View Logs
```bash
# Auto-sync logs
tail -f logs/auto-sync.log

# Cron logs
tail -f logs/cron.log

# Follow live
tail -f logs/*.log
```

### Check Cron Jobs
```bash
crontab -l
```

### Manual Trigger
```bash
cd /path/to/clash-of-clans-war-graph
./scripts/auto-sync.sh
```

## 11. Keep Raspberry Pi Running

### Prevent Sleep
```bash
# Edit power settings
sudo nano /etc/systemd/logind.conf
```

Add:
```
HandleLidSwitch=ignore
```

### Run on Boot
If using systemd timer, it's already configured. For cron, no additional setup needed.

### Use Screen/Tmux for Long-Running Processes
```bash
# Install screen
sudo apt install screen

# Start session
screen -S coc-collector

# Run scheduler (optional - only if you want real-time collection)
npm run scheduler

# Detach: Ctrl+A then D
# Reattach: screen -r coc-collector
```

## Troubleshooting

### Script fails with "tsx not found"
```bash
npm install
ls node_modules/.bin/tsx
```

### Git push fails with authentication error
- Check SSH key is added to GitHub
- Or verify Personal Access Token is correct
- Test: `ssh -T git@github.com` (for SSH method)

### Cron job not running
```bash
# Check cron service
sudo systemctl status cron

# Check cron logs
grep CRON /var/log/syslog
```

### Data not updating on website
- Check CI/CD logs in your hosting platform
- Verify `data/wars.json` was pushed to GitHub
- Check if build succeeded

### jq command not found
```bash
sudo apt install jq
```

## Notes

- The auto-sync script only commits if `data/wars.json` actually changed
- Logs are stored in `logs/auto-sync.log` for debugging
- The script pulls before collecting to avoid conflicts
- Each commit includes war count and timestamp
