import { config } from 'dotenv';
import { fetchLeagueGroup, fetchAllLeagueWars } from './league-api-client';
import { transformLeagueGroup, shouldCollectLeagueWars } from '../lib/league-data-transformer';
import { saveLeagueGroup, getLeagueStorageStats, initializeLeagueStorage } from '../lib/league-storage';
import { CoCLeagueGroupResponse } from '../lib/league-types';

config({ path: '.env.local' });

/**
 * Main CWL collection function
 */
export async function collectLeagueWarData(): Promise<{
  state: CoCLeagueGroupResponse['state'] | null;
  season: string | null;
  collected: boolean;
  warsCollected: number;
}> {
  try {
    console.log('='.repeat(60));
    console.log('Starting CWL data collection...');
    console.log('Time:', new Date().toISOString());

    // Initialize storage
    await initializeLeagueStorage();

    // Fetch league group
    console.log('Fetching CWL league group from API...');
    const leagueGroup = await fetchLeagueGroup();

    if (!leagueGroup) {
      console.log('Clan is not currently in CWL');
      return { state: null, season: null, collected: false, warsCollected: 0 };
    }

    console.log(`CWL State: ${leagueGroup.state}`);
    console.log(`Season: ${leagueGroup.season}`);
    console.log(`Total rounds: ${leagueGroup.rounds.length}`);
    console.log(`Participating clans: ${leagueGroup.clans.length}`);

    if (!shouldCollectLeagueWars(leagueGroup.state)) {
      console.log('Not collecting - clan not in war');
      return {
        state: leagueGroup.state,
        season: leagueGroup.season,
        collected: false,
        warsCollected: 0,
      };
    }

    // Fetch all wars for our clan
    console.log('\nFetching individual CWL wars...');
    const wars = await fetchAllLeagueWars(leagueGroup);

    if (wars.length === 0) {
      console.log('No wars found for our clan in this CWL season');
      return {
        state: leagueGroup.state,
        season: leagueGroup.season,
        collected: false,
        warsCollected: 0,
      };
    }

    console.log(`\nSuccessfully fetched ${wars.length} CWL wars`);

    // Transform the data
    console.log('\nTransforming CWL data...');
    const transformedGroup = transformLeagueGroup(leagueGroup, wars);

    console.log('\nLeague group details:');
    console.log(`  Season: ${transformedGroup.season}`);
    console.log(`  State: ${transformedGroup.state}`);
    console.log(`  Wars collected: ${transformedGroup.wars.length}`);
    console.log(`  Participating clans: ${transformedGroup.participatingClans.length}`);

    // Display wars summary
    console.log('\nWars summary:');
    transformedGroup.wars.forEach(war => {
      const result = war.clanStats.totalStars > war.opponentStats.totalStars ? 'WIN' :
                     war.clanStats.totalStars < war.opponentStats.totalStars ? 'LOSS' : 'TIE';
      console.log(`  Round ${war.roundNumber}: vs ${war.opponentName} - ${result} (${war.clanStats.totalStars}-${war.opponentStats.totalStars}) [${war.state}]`);
    });

    // Save the league group
    console.log('\nSaving to storage...');
    await saveLeagueGroup(transformedGroup);

    // Print storage stats
    const stats = await getLeagueStorageStats();
    console.log(`\nStorage statistics:`);
    console.log(`  Total CWL seasons: ${stats.totalSeasons}`);
    console.log(`  Total CWL wars: ${stats.totalWars}`);
    console.log(`  Last updated: ${stats.lastUpdated}`);

    return {
      state: leagueGroup.state,
      season: leagueGroup.season,
      collected: true,
      warsCollected: transformedGroup.wars.length,
    };

  } catch (error) {
    console.error('Error during CWL data collection:', error);
    throw error;
  } finally {
    console.log('='.repeat(60));
  }
}

// If this script is run directly, execute collection
if (require.main === module) {
  collectLeagueWarData()
    .then((result) => {
      console.log('\nCWL collection completed');
      console.log(`State: ${result.state}`);
      console.log(`Season: ${result.season}`);
      console.log(`Collected: ${result.collected}`);
      console.log(`Wars collected: ${result.warsCollected}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
