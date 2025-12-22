#!/bin/bash

# Clash of Clans War Graph - Update and Deploy Script
# This script collects war data and pushes it to GitHub (triggering Vercel deployment)

echo "🎯 Collecting war data from Clash of Clans API..."
npm run collect

if [ $? -ne 0 ]; then
  echo "❌ Failed to collect data. Check your API token and internet connection."
  exit 1
fi

echo ""
echo "📊 Checking for changes..."
if git diff --quiet data/wars.json; then
  echo "✅ No new war data - wars.json unchanged"
  exit 0
fi

echo "✅ New data found!"
echo ""
echo "📦 Committing and pushing to GitHub..."

git add data/wars.json
git commit -m "Update war data - $(date '+%Y-%m-%d %H:%M:%S')"
git push

if [ $? -eq 0 ]; then
  echo ""
  echo "🚀 Successfully pushed to GitHub!"
  echo "📡 Vercel will automatically deploy the updated data in ~30 seconds"
  echo "🌐 Check your deployment at: https://vercel.com/dashboard"
else
  echo ""
  echo "❌ Failed to push to GitHub"
  exit 1
fi
