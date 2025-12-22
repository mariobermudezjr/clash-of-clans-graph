import { promises as fs } from 'fs';
import path from 'path';
import { War, WarStorageData } from './types';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'wars.json');

/**
 * Initialize the storage file if it doesn't exist
 */
export async function initializeStorage(): Promise<void> {
  try {
    await fs.access(DATA_FILE_PATH);
  } catch {
    // File doesn't exist, create it
    const initialData: WarStorageData = {
      version: 1,
      lastUpdated: new Date().toISOString(),
      wars: [],
    };
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(initialData, null, 2));
    console.log('Initialized storage file at:', DATA_FILE_PATH);
  }
}

/**
 * Read all wars from storage
 */
export async function getWars(): Promise<War[]> {
  try {
    const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const storageData: WarStorageData = JSON.parse(data);
    return storageData.wars;
  } catch (error) {
    console.error('Error reading wars from storage:', error);
    return [];
  }
}

/**
 * Save or update a war in storage
 * - If war doesn't exist: creates new entry
 * - If war exists: updates with new data (for in-progress wars)
 */
export async function saveWar(war: War): Promise<boolean> {
  try {
    await initializeStorage();

    const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const storageData: WarStorageData = JSON.parse(data);

    // Check if war already exists
    const existingIndex = storageData.wars.findIndex(w => w.id === war.id);

    if (existingIndex >= 0) {
      // Update existing war (in-progress war getting updated with final results)
      const oldState = storageData.wars[existingIndex].state;
      storageData.wars[existingIndex] = war;
      console.log(`War ${war.id} updated (${oldState} → ${war.state})`);
    } else {
      // Add new war
      storageData.wars.push(war);
      console.log(`War ${war.id} saved successfully`);
    }

    storageData.lastUpdated = new Date().toISOString();

    // Sort wars by end time (newest first)
    storageData.wars.sort((a, b) =>
      new Date(b.endTime).getTime() - new Date(a.endTime).getTime()
    );

    // Write back to file
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(storageData, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving war to storage:', error);
    throw error;
  }
}

/**
 * Get the most recent war
 */
export async function getLatestWar(): Promise<War | null> {
  const wars = await getWars();
  if (wars.length === 0) {
    return null;
  }
  return wars[0]; // Already sorted by end time (newest first)
}

/**
 * Delete a war by ID
 */
export async function deleteWar(warId: string): Promise<boolean> {
  try {
    const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const storageData: WarStorageData = JSON.parse(data);

    const initialLength = storageData.wars.length;
    storageData.wars = storageData.wars.filter(w => w.id !== warId);

    if (storageData.wars.length === initialLength) {
      console.log(`War ${warId} not found`);
      return false;
    }

    storageData.lastUpdated = new Date().toISOString();
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(storageData, null, 2));
    console.log(`War ${warId} deleted successfully`);
    return true;
  } catch (error) {
    console.error('Error deleting war from storage:', error);
    return false;
  }
}

/**
 * Get storage statistics
 */
export async function getStorageStats(): Promise<{ totalWars: number; lastUpdated: string }> {
  try {
    const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const storageData: WarStorageData = JSON.parse(data);
    return {
      totalWars: storageData.wars.length,
      lastUpdated: storageData.lastUpdated,
    };
  } catch (error) {
    return {
      totalWars: 0,
      lastUpdated: 'Never',
    };
  }
}
