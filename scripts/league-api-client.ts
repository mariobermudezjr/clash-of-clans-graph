import { config } from 'dotenv';
import { CoCLeagueGroupResponse, CoCLeagueWarResponse } from '../lib/league-types';
import { COC_API_BASE_URL, getEncodedClanTag } from '../lib/constants';

// Load environment variables
config({ path: '.env.local' });

const API_TOKEN = process.env.COC_API_TOKEN;
const CLAN_TAG = process.env.CLAN_TAG || '#2YGUQGY90';

if (!API_TOKEN) {
  throw new Error('COC_API_TOKEN is not set in .env.local file');
}

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

/**
 * Sleep for a specified number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch league group data for current CWL season
 * Endpoint: /clans/{clanTag}/currentwar/leaguegroup
 */
export async function fetchLeagueGroup(clanTag: string = CLAN_TAG): Promise<CoCLeagueGroupResponse | null> {
  const encodedTag = getEncodedClanTag(clanTag);
  const url = `${COC_API_BASE_URL}/clans/${encodedTag}/currentwar/leaguegroup`;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Accept': 'application/json',
        },
      });

      // Handle different HTTP status codes
      if (response.status === 200) {
        const data: CoCLeagueGroupResponse = await response.json();
        return data;
      }

      if (response.status === 404) {
        console.log('Clan not in CWL or war log is private');
        return null;
      }

      if (response.status === 403) {
        console.error('Access forbidden - check your API token');
        throw new Error('API token is invalid or expired');
      }

      if (response.status === 503) {
        console.warn('Service temporarily unavailable, retrying...');
        lastError = new Error('Service unavailable');

        // Wait before retrying (exponential backoff)
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
        await sleep(delay);
        continue;
      }

      // Unexpected status code
      const errorText = await response.text();
      throw new Error(`Unexpected status ${response.status}: ${errorText}`);

    } catch (error) {
      lastError = error as Error;

      // If it's not a retry-able error, throw immediately
      if (error instanceof Error && error.message.includes('invalid or expired')) {
        throw error;
      }

      // Log the attempt
      console.error(`Attempt ${attempt + 1}/${MAX_RETRIES} failed:`, error);

      // If this was the last attempt, we'll throw after the loop
      if (attempt < MAX_RETRIES - 1) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
        console.log(`Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  // All retries failed
  console.error(`Failed to fetch league group after ${MAX_RETRIES} attempts`);
  throw lastError || new Error('Unknown error occurred');
}

/**
 * Fetch individual CWL war by war tag
 * Endpoint: /clanwarleagues/wars/{warTag}
 */
export async function fetchLeagueWar(warTag: string): Promise<CoCLeagueWarResponse | null> {
  // Remove # if present, then encode properly
  const cleanTag = warTag.replace('#', '');
  const encodedTag = encodeURIComponent(`#${cleanTag}`);
  const url = `${COC_API_BASE_URL}/clanwarleagues/wars/${encodedTag}`;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Accept': 'application/json',
        },
      });

      if (response.status === 200) {
        const data: CoCLeagueWarResponse = await response.json();
        return data;
      }

      if (response.status === 404) {
        console.warn(`CWL war ${warTag} not found`);
        return null;
      }

      if (response.status === 403) {
        console.error('Access forbidden - check your API token');
        throw new Error('API token is invalid or expired');
      }

      if (response.status === 503) {
        console.warn(`Service temporarily unavailable for war ${warTag}, retrying...`);
        lastError = new Error('Service unavailable');

        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
        await sleep(delay);
        continue;
      }

      const errorText = await response.text();
      throw new Error(`Unexpected status ${response.status}: ${errorText}`);

    } catch (error) {
      lastError = error as Error;

      if (error instanceof Error && error.message.includes('invalid or expired')) {
        throw error;
      }

      console.error(`Attempt ${attempt + 1}/${MAX_RETRIES} for war ${warTag}:`, error);

      if (attempt < MAX_RETRIES - 1) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
        await sleep(delay);
      }
    }
  }

  console.error(`Failed to fetch war ${warTag} after ${MAX_RETRIES} attempts`);
  throw lastError || new Error('Unknown error occurred');
}

/**
 * Fetch all wars for our clan from a league group
 * Returns array of wars with their round numbers
 */
export async function fetchAllLeagueWars(
  leagueGroup: CoCLeagueGroupResponse,
  clanTag: string = CLAN_TAG
): Promise<Array<{ war: CoCLeagueWarResponse; roundNumber: number }>> {
  const ourClan = leagueGroup.clans.find(c => c.tag === clanTag);

  if (!ourClan) {
    throw new Error(`Clan ${clanTag} not found in league group`);
  }

  const warResults: Array<{ war: CoCLeagueWarResponse; roundNumber: number }> = [];
  let successCount = 0;
  let failCount = 0;

  console.log(`Fetching wars from ${leagueGroup.rounds.length} rounds...`);

  // Iterate through all rounds
  for (let roundIndex = 0; roundIndex < leagueGroup.rounds.length; roundIndex++) {
    const round = leagueGroup.rounds[roundIndex];

    // Find war tags involving our clan
    for (const warTag of round.warTags) {
      // Skip empty/placeholder tags
      if (!warTag || warTag === '#0') {
        continue;
      }

      try {
        console.log(`Fetching war ${warTag} from round ${roundIndex + 1}...`);
        const warData = await fetchLeagueWar(warTag);

        if (!warData) {
          console.warn(`Could not fetch war ${warTag}, skipping...`);
          failCount++;
          continue;
        }

        // Check if this war involves our clan
        if (warData.clan.tag === clanTag || warData.opponent.tag === clanTag) {
          warResults.push({
            war: warData,
            roundNumber: roundIndex + 1, // 1-indexed
          });
          successCount++;
          console.log(`✓ Successfully fetched war vs ${warData.clan.tag === clanTag ? warData.opponent.name : warData.clan.name}`);

          // Add small delay between requests to avoid rate limiting
          await sleep(200);
        }
      } catch (error) {
        console.error(`Failed to fetch war ${warTag}:`, error);
        failCount++;
        // Continue with other wars even if one fails
      }
    }
  }

  console.log(`\nFetch summary: ${successCount} succeeded, ${failCount} failed`);

  if (warResults.length === 0) {
    console.warn('No wars fetched successfully');
  }

  return warResults;
}

/**
 * Test the league API connection
 */
export async function testLeagueAPIConnection(): Promise<boolean> {
  try {
    console.log('Testing CWL API connection...');
    const data = await fetchLeagueGroup();

    if (data === null) {
      console.log('API connection successful, but clan not in CWL');
      return false;
    }

    console.log('CWL API connection successful!');
    console.log(`Season: ${data.season}`);
    console.log(`State: ${data.state}`);
    console.log(`Participating clans: ${data.clans.length}`);
    return true;
  } catch (error) {
    console.error('CWL API connection test failed:', error);
    return false;
  }
}

// If this script is run directly, test the connection
if (require.main === module) {
  testLeagueAPIConnection()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
