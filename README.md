# Clash of Clans War Graph

A Next.js application that visualizes Clash of Clans war statistics and analytics.

## Features

- Real-time war data tracking
- Interactive charts and graphs
- Member performance analytics
- War history visualization
- Responsive design with Tailwind CSS

## Prerequisites

- Node.js 20.x or later
- Clash of Clans API token from [developer.clashofclans.com](https://developer.clashofclans.com/)
- Your clan tag

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd clash-of-clans-war-graph
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Clash of Clans API token

**Important:** The Clash of Clans API requires IP whitelisting. Since this project uses local data collection with Vercel hosting, you'll create a token with your local IP.

1. **Find your IP address:**
   ```bash
   curl https://api.ipify.org
   ```

2. **Create API token:**
   - Go to [developer.clashofclans.com](https://developer.clashofclans.com/#/account)
   - Login with your Supercell ID
   - Click "Create New Key"
   - Name: `Local Development`
   - IP Address: Use the IP from step 1
   - Copy the generated token

3. **Create `.env.local` file:**
   ```bash
   cp .env.example .env.local
   ```

4. **Edit `.env.local` and add your credentials:**
   ```
   COC_API_TOKEN=your_api_token_here
   CLAN_TAG=your_clan_tag_here
   ```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run collect` - Collect war data
- `npm run scheduler` - Run data collection scheduler
- `./scripts/update-and-deploy.sh` - Collect data and push to GitHub (triggers Vercel deployment)

## Data Collection Workflow

This project uses a **hybrid deployment model**:
- **Frontend:** Hosted on Vercel (free, auto-deploys from GitHub)
- **Data Collection:** Runs locally on your computer (requires IP-whitelisted API token)

### Updating War Data

When you want to update war statistics:

```bash
# Simple one-command update
./scripts/update-and-deploy.sh
```

This script will:
1. Collect latest war data from the Clash of Clans API
2. Save it to `data/wars.json`
3. Commit and push to GitHub
4. Trigger automatic Vercel deployment (~30 seconds)

### Manual Data Update

If you prefer manual control:

```bash
# 1. Collect data
npm run collect

# 2. Commit and push
git add data/wars.json
git commit -m "Update war data"
git push
```

### Automated Scheduling (Optional)

To automatically collect data on a schedule:

**macOS/Linux (using cron):**
```bash
# Edit crontab
crontab -e

# Add this line to run every 6 hours:
0 */6 * * * cd /path/to/clash-of-clans-war-graph && ./scripts/update-and-deploy.sh
```

**Windows (using Task Scheduler):**
- Create a scheduled task that runs `npm run collect` followed by git commands

## Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

#### Step-by-step Vercel deployment:

1. **Ensure code is on GitHub** (you've already done this!)

2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository: `mariobermudezjr/clash-of-clans-graph`
   - Vercel will automatically detect Next.js

3. **Deploy:**
   - Click "Deploy" (no environment variables needed!)
   - Vercel will build and deploy your application
   - Your app will be live at `https://clash-of-clans-graph.vercel.app`

**Note:** Since data collection runs locally, you don't need to configure API credentials on Vercel. The `data/wars.json` file is committed to git and automatically deployed.

#### Automatic deployments:
- Every push to `main` branch triggers a production deployment
- Pull requests create preview deployments automatically
- GitHub Actions CI runs on all pushes and PRs

### GitHub Actions CI/CD

The project includes automated CI/CD workflows:

- **CI Pipeline** (`.github/workflows/ci.yml`):
  - Runs on push to `main` and `develop` branches
  - Runs on all pull requests
  - Executes: dependency installation, linting, and build
  - No secrets required (data collection is local)

## Tech Stack

- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **API:** Clash of Clans API
- **Deployment:** Vercel
- **CI/CD:** GitHub Actions

## Project Structure

```
clash-of-clans-war-graph/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── graphs/           # Chart components
│   ├── layout/           # Layout components
│   └── ui/               # UI components
├── lib/                   # Utilities and contexts
├── scripts/               # Data collection scripts
├── data/                  # Data storage
├── .github/workflows/     # GitHub Actions
└── public/               # Static assets
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
