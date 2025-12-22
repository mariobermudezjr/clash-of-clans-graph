import { config } from 'dotenv';
import { CoCWarResponse } from '../lib/types';
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
 * Fetch current war data from Clash of Clans API with retry logic
 */
export async function fetchCurrentWar(clanTag: string = CLAN_TAG): Promise<CoCWarResponse | null> {
  const encodedTag = getEncodedClanTag(clanTag);
  const url = `${COC_API_BASE_URL}/clans/${encodedTag}/currentwar`;

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
        const data: CoCWarResponse = await response.json();
        return data;
      }

      if (response.status === 404) {
        console.error('Clan not found or war log is private');
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
  console.error(`Failed to fetch war data after ${MAX_RETRIES} attempts`);
  throw lastError || new Error('Unknown error occurred');
}

/**
 * Test the API connection
 */
export async function testAPIConnection(): Promise<boolean> {
  try {
    console.log('Testing API connection...');
    const data = await fetchCurrentWar();

    if (data === null) {
      console.log('API connection successful, but clan not found or war log private');
      return false;
    }

    console.log('API connection successful!');
    console.log(`Current war state: ${data.state}`);
    return true;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
}

// If this script is run directly, test the connection
if (require.main === module) {
  testAPIConnection()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
