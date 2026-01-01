import { promises as fs } from 'fs';
import path from 'path';
import { LeagueWar, LeagueWarGroup, LeagueWarStorageData } from './league-types';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'leaguewars.json');

/**
 * Initialize the league wars storage file if it doesn't exist
 */
export async function initializeLeagueStorage(): Promise<void> {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(DATA_FILE_PATH);
    await fs.mkdir(dataDir, { recursive: true });

    // Check if file exists
    await fs.access(DATA_FILE_PATH);
  } catch {
    // File doesn't exist, create it
    const initialData: LeagueWarStorageData = {
      version: 1,
      lastUpdated: new Date().toISOString(),
      seasons: [],
    };
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(initialData, null, 2));
    console.log('Initialized league wars storage file at:', DATA_FILE_PATH);
  }
}

/**
 * Read all league war seasons from storage
 */
export async function getLeagueSeasons(): Promise<LeagueWarGroup[]> {
  try {
    const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const storageData: LeagueWarStorageData = JSON.parse(data);
    return storageData.seasons;
  } catch (error) {
    console.error('Error reading league wars from storage:', error);
    return [];
  }
}

/**
 * Get a specific season's data
 */
export async function getLeagueSeason(season: string): Promise<LeagueWarGroup | null> {
  const seasons = await getLeagueSeasons();
  return seasons.find(s => s.season === season) || null;
}

/**
 * Get all league wars across all seasons (flattened)
 */
export async function getAllLeagueWars(): Promise<LeagueWar[]> {
  const seasons = await getLeagueSeasons();
  return seasons.flatMap(season => season.wars);
}

/**
 * Save or update a league war group for a season
 * - If season doesn't exist: creates new season entry
 * - If season exists: merges/updates wars for that season
 */
export async function saveLeagueGroup(leagueGroup: LeagueWarGroup): Promise<boolean> {
  try {
    await initializeLeagueStorage();

    const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const storageData: LeagueWarStorageData = JSON.parse(data);

    // Find existing season
    const existingSeasonIndex = storageData.seasons.findIndex(
      s => s.season === leagueGroup.season
    );

    if (existingSeasonIndex >= 0) {
      // Update existing season - merge wars by ID
      const existingSeason = storageData.seasons[existingSeasonIndex];

      // Add new wars or update existing ones
      leagueGroup.wars.forEach(newWar => {
        const existingWarIndex = existingSeason.wars.findIndex(w => w.id === newWar.id);
        if (existingWarIndex >= 0) {
          // Update existing war
          existingSeason.wars[existingWarIndex] = newWar;
          console.log(`Updated league war ${newWar.id} in season ${leagueGroup.season}`);
        } else {
          // Add new war
          existingSeason.wars.push(newWar);
          console.log(`Added new league war ${newWar.id} to season ${leagueGroup.season}`);
        }
      });

      // Update season metadata
      existingSeason.state = leagueGroup.state;
      existingSeason.collectedAt = leagueGroup.collectedAt;
      existingSeason.participatingClans = leagueGroup.participatingClans;

      // Sort wars by round number
      existingSeason.wars.sort((a, b) => a.roundNumber - b.roundNumber);

      storageData.seasons[existingSeasonIndex] = existingSeason;
    } else {
      // Add new season
      storageData.seasons.push(leagueGroup);
      console.log(`Added new league season ${leagueGroup.season}`);
    }

    storageData.lastUpdated = new Date().toISOString();

    // Sort seasons by season string (newest first)
    storageData.seasons.sort((a, b) => b.season.localeCompare(a.season));

    // Write back to file
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(storageData, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving league group to storage:', error);
    throw error;
  }
}

/**
 * Get storage statistics
 */
export async function getLeagueStorageStats(): Promise<{
  totalSeasons: number;
  totalWars: number;
  lastUpdated: string;
}> {
  try {
    const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const storageData: LeagueWarStorageData = JSON.parse(data);
    const totalWars = storageData.seasons.reduce(
      (sum, season) => sum + season.wars.length,
      0
    );
    return {
      totalSeasons: storageData.seasons.length,
      totalWars,
      lastUpdated: storageData.lastUpdated,
    };
  } catch (error) {
    return {
      totalSeasons: 0,
      totalWars: 0,
      lastUpdated: 'Never',
    };
  }
}

/**
 * Get the most recent season
 */
export async function getLatestLeagueSeason(): Promise<LeagueWarGroup | null> {
  const seasons = await getLeagueSeasons();
  if (seasons.length === 0) {
    return null;
  }
  return seasons[0]; // Already sorted by season (newest first)
}
