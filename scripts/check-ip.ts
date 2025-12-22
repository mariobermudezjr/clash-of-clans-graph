import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const API_TOKEN = process.env.COC_API_TOKEN;

/**
 * Get current public IP address
 */
async function getCurrentIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Failed to get current IP:', error);
    throw error;
  }
}

/**
 * Extract IP from API token (tokens contain the whitelisted IP)
 */
function getTokenIP(): string | null {
  if (!API_TOKEN) {
    return null;
  }

  try {
    // JWT tokens have 3 parts separated by dots
    const parts = API_TOKEN.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (second part)
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

    // Extract IP from limits.cidrs array
    if (payload.limits && Array.isArray(payload.limits)) {
      const clientLimit = payload.limits.find((limit: any) => limit.type === 'client');
      if (clientLimit && clientLimit.cidrs && clientLimit.cidrs.length > 0) {
        return clientLimit.cidrs[0];
      }
    }

    return null;
  } catch (error) {
    console.error('Failed to parse token:', error);
    return null;
  }
}

/**
 * Check if current IP matches token IP
 */
async function checkIPMatch() {
  console.log('Checking IP address...\n');

  const currentIP = await getCurrentIP();
  console.log(`Current IP: ${currentIP}`);

  const tokenIP = getTokenIP();
  if (!tokenIP) {
    console.log('Token IP: Unable to extract from token');
    console.log('\n⚠️  Cannot determine if IP has changed');
    return;
  }

  console.log(`Token IP:  ${tokenIP}`);

  if (currentIP === tokenIP) {
    console.log('\n✅ IP addresses match - API token is valid');
  } else {
    console.log('\n❌ IP addresses DO NOT match - API token needs updating');
    console.log('\nTo fix this:');
    console.log('1. Go to https://developer.clashofclans.com/');
    console.log('2. Either:');
    console.log('   a) Create a new key with IP:', currentIP);
    console.log('   b) Edit existing key and update IP to:', currentIP);
    console.log('3. Update .env.local with the new/updated token');
    console.log('4. Restart the scheduler');
  }
}

// Run the check
checkIPMatch()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
