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

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your credentials:

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

## Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

#### Step-by-step Vercel deployment:

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect Next.js

3. **Configure environment variables in Vercel:**
   - In project settings, go to "Environment Variables"
   - Add:
     - `COC_API_TOKEN` = your API token
     - `CLAN_TAG` = your clan tag
   - Apply to Production, Preview, and Development environments

4. **Deploy:**
   - Click "Deploy"
   - Vercel will build and deploy your application
   - Your app will be live at `https://your-project.vercel.app`

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

#### Setting up GitHub Secrets:

For CI to work properly, add these secrets to your GitHub repository:

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Add the following secrets:
   - `COC_API_TOKEN` - Your Clash of Clans API token
   - `CLAN_TAG` - Your clan tag

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
