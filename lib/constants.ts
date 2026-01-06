// API Configuration
export const COC_API_BASE_URL = 'https://api.clashofclans.com/v1';

// Clan Configuration
export const CLAN_TAG = process.env.CLAN_TAG || '#2YGUQGY90';
export const COC_API_TOKEN = process.env.COC_API_TOKEN || '';

// Encode clan tag for URL (# -> %23)
export const getEncodedClanTag = (tag: string = CLAN_TAG) => {
  return encodeURIComponent(tag);
};

// Color Palette
export const colors = {
  primary: '#10b981',        // Emerald (attacks, success)
  secondary: '#f59e0b',      // Amber (stars, highlights)
  background: '#0f172a',     // Slate-900 (main bg)
  surface: '#1e293b',        // Slate-800 (cards, panels)
  border: '#334155',         // Slate-700 (subtle borders)
  text: '#e2e8f0',           // Slate-200 (primary text)
  textMuted: '#94a3b8',      // Slate-400 (secondary text)
  success: '#10b981',        // Emerald
  warning: '#f59e0b',        // Amber
  error: '#ef4444',          // Red
};

// CWL Participation Grid Colors
export const gridColors = {
  missed: '#ef4444',         // Red - missed attack (stands out)
  notInRoster: '#1e293b',    // Dark surface - not participating
  stars0: '#78350f',         // Dark amber - 0 stars
  stars1: '#b45309',         // Amber-700 - 1 star
  stars2: '#f59e0b',         // Amber - 2 stars
  stars3: '#10b981',         // Emerald - 3 stars (perfect)
};

// Storage Keys
export const STORAGE_KEY = 'coc-war-analytics-v1';
export const DATA_FILE_PATH = 'data/wars.json';
