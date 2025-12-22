import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#10b981',        // Emerald (attacks, success)
        secondary: '#f59e0b',      // Amber (stars, highlights)
        background: '#0f172a',     // Slate-900 (main bg)
        surface: '#1e293b',        // Slate-800 (cards, panels)
        border: '#334155',         // Slate-700 (subtle borders)
        text: '#e2e8f0',           // Slate-200 (primary text)
        textMuted: '#94a3b8',      // Slate-400 (secondary text)
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Inter', 'system-ui', 'sans-serif'],
      },
      transitionDuration: {
        '150': '150ms',
      },
    },
  },
  plugins: [],
};

export default config;
