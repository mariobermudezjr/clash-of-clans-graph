import { config } from 'dotenv';
import { fetchCurrentWar } from './api-client';
import { transformWarData, shouldCollectWar } from '../lib/data-transformer';
import { saveWar, getStorageStats, initializeStorage } from '../lib/storage';
import { CoCWarResponse } from '../lib/types';

// Load environment variables
config({ path: '.env.local' });

/**
 * Main collection function
 * Returns the war state and end time (for scheduling purposes)
 */
export async function collectWarData(): Promise<{
  state: CoCWarResponse['state'] | null;
  endTime: string | null;
  collected: boolean;
}> {
  try {
    console.log('='.repeat(60));
    console.log('Starting war data collection...');
    console.log('Time:', new Date().toISOString());

    // Initialize storage if needed
    await initializeStorage();

    // Fetch current war
    console.log('Fetching current war data from API...');
    const warData = await fetchCurrentWar();

    if (!warData) {
      console.log('No war data available (clan not found or war log private)');
      return { state: null, endTime: null, collected: false };
    }

    console.log(`War state: ${warData.state}`);

    // Handle different war states
    if (warData.state === 'notInWar') {
      console.log('Clan is not currently in war');
      return { state: 'notInWar', endTime: null, collected: false };
    }

    if (warData.state === 'preparation') {
      console.log('War is in preparation phase');
      console.log(`War starts at: ${warData.startTime}`);
      console.log(`War ends at: ${warData.endTime}`);
      return { state: 'preparation', endTime: warData.endTime, collected: false };
    }

    // War is in progress or has ended - collect it
    if (shouldCollectWar(warData.state)) {
      if (warData.state === 'inWar') {
        console.log('War is in progress, collecting current stats...');
      } else {
        console.log('War has ended, collecting final data...');
      }

      // Transform the data
      const war = transformWarData(warData);

      console.log('War details:');
      console.log(`  ID: ${war.id}`);
      console.log(`  State: ${war.state}`);
      console.log(`  Opponent: ${war.opponentName}`);
      console.log(`  Team size: ${war.teamSize}`);
      console.log(`  Our stats: ${war.clanStats.attacksUsed}/${war.clanStats.attacksAvailable} attacks, ${war.clanStats.totalStars} stars`);

      // Save the war (creates new or updates existing)
      await saveWar(war);

      // Print storage stats
      const stats = await getStorageStats();
      console.log(`Total wars in storage: ${stats.totalWars}`);
      console.log(`Last updated: ${stats.lastUpdated}`);

      return { state: warData.state, endTime: war.endTime, collected: true };
    }

    console.log(`Unexpected war state: ${warData.state}`);
    return { state: warData.state, endTime: null, collected: false };

  } catch (error) {
    console.error('Error during war data collection:', error);
    throw error;
  } finally {
    console.log('='.repeat(60));
  }
}

// If this script is run directly, execute collection
if (require.main === module) {
  collectWarData()
    .then((result) => {
      console.log('Collection completed');
      console.log(`State: ${result.state}`);
      console.log(`Collected: ${result.collected}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
