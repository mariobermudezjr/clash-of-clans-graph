import cron from 'node-cron';
import { scheduleJob, Job } from 'node-schedule';
import { collectWarData } from './collector';
import { collectLeagueWarData } from './league-collector';
import { gitSync } from './git-sync';
import { parseCoCTimestamp, formatDate } from '../lib/date-utils';

// Track scheduled jobs
let dynamicJob: Job | null = null;

/**
 * Collect data and sync to git if anything changed
 */
async function collectAndSync() {
  try {
    console.log('\n--- Regular Wars ---');
    await collectWarData();
  } catch (error) {
    console.error('Error during regular war collection:', error);
  }

  try {
    console.log('\n--- CWL Wars ---');
    await collectLeagueWarData();
  } catch (error) {
    console.error('Error during CWL collection:', error);
  }

  try {
    console.log('\n--- Git Sync ---');
    const pushed = await gitSync();
    if (pushed) {
      console.log('✅ Data synced and pushed — Vercel deploy will trigger automatically');
    }
  } catch (error) {
    console.error('Error during git sync:', error);
  }
}

/**
 * Schedule a one-time collection after war ends
 */
async function scheduleSmartCollection() {
  try {
    const result = await collectWarData();

    // Sync immediately if we collected something
    if (result.collected) {
      try {
        const pushed = await gitSync();
        if (pushed) {
          console.log('✅ War data synced and pushed');
        }
      } catch (error) {
        console.error('Error during git sync:', error);
      }
    }

    // If war is in progress, schedule collection for right before it ends
    if (result.state === 'inWar' && result.endTime) {
      const endTime = parseCoCTimestamp(result.endTime);

      // Validate the parsed date
      if (isNaN(endTime.getTime())) {
        console.error('Failed to parse war end time:', result.endTime);
        return;
      }

      // Schedule collection 1 minute before war ends to catch "warEnded" state
      const collectionTime = new Date(endTime.getTime() - 1 * 60 * 1000);

      // Cancel existing dynamic job if any
      if (dynamicJob) {
        dynamicJob.cancel();
        console.log('Cancelled previous dynamic collection job');
      }

      // Schedule new collection + sync
      dynamicJob = scheduleJob(collectionTime, async () => {
        console.log('Executing scheduled collection near war end...');
        await collectAndSync();
      });

      console.log(`✅ Scheduled collection for: ${formatDate(collectionTime)}`);
      console.log(`   (1 minute before war ends at ${formatDate(endTime)})`);
    }

    // If war is in preparation, schedule for right before war ends
    if (result.state === 'preparation' && result.endTime) {
      const endTime = parseCoCTimestamp(result.endTime);

      // Validate the parsed date
      if (isNaN(endTime.getTime())) {
        console.error('Failed to parse war end time:', result.endTime);
        return;
      }

      // Schedule collection 1 minute before war ends to catch "warEnded" state
      const collectionTime = new Date(endTime.getTime() - 1 * 60 * 1000);

      if (dynamicJob) {
        dynamicJob.cancel();
      }

      // Schedule new collection + sync
      dynamicJob = scheduleJob(collectionTime, async () => {
        console.log('Executing scheduled collection near war end...');
        await collectAndSync();
      });

      console.log(`✅ Scheduled collection for: ${formatDate(collectionTime)}`);
      console.log(`   (1 minute before war ends at ${formatDate(endTime)})`);
    }
  } catch (error) {
    console.error('Error during smart collection scheduling:', error);
  }
}

/**
 * Schedule CWL collection - runs on days 1-8 of each month, every 6 hours
 */
async function scheduleCWLCollection() {
  try {
    console.log('Running CWL collection check...');
    const result = await collectLeagueWarData();
    if (result.collected) {
      try {
        const pushed = await gitSync();
        if (pushed) {
          console.log('✅ CWL data synced and pushed');
        }
      } catch (error) {
        console.error('Error during git sync:', error);
      }
    }
  } catch (error) {
    console.error('Error during CWL collection:', error);
  }
}

/**
 * Start the scheduler
 */
export function startScheduler() {
  console.log('Starting Clash of Clans War Data Scheduler...');
  console.log('');

  // Daily check at 9 AM for regular wars
  console.log('Setting up daily check at 9:00 AM for regular wars...');
  cron.schedule('0 9 * * *', async () => {
    console.log('\n' + '='.repeat(60));
    console.log('DAILY SCHEDULED CHECK - REGULAR WARS');
    console.log('='.repeat(60));
    await scheduleSmartCollection();
  });

  // CWL collection: Every 6 hours on days 1-8 of each month
  // Cron pattern: "0 */6 1-8 * *" = At minute 0 past every 6th hour on days 1-8
  console.log('Setting up CWL check: Every 6 hours on days 1-8 of each month...');
  cron.schedule('0 */6 1-8 * *', async () => {
    console.log('\n' + '='.repeat(60));
    console.log('CWL SCHEDULED CHECK');
    console.log('='.repeat(60));
    await scheduleCWLCollection();
  });

  // Run initial collect + sync on startup
  console.log('Running initial collection and sync...');
  collectAndSync().then(() => {
    // After initial sync, set up smart scheduling for war-end timing
    scheduleSmartCollection();
  });

  // Keep the process alive
  console.log('');
  console.log('Scheduler is running. Press Ctrl+C to stop.');
  console.log('Regular wars: Daily checks at 9:00 AM + smart scheduling');
  console.log('CWL: Every 6 hours on days 1-8 of each month');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down scheduler...');
  if (dynamicJob) {
    dynamicJob.cancel();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\nShutting down scheduler...');
  if (dynamicJob) {
    dynamicJob.cancel();
  }
  process.exit(0);
});

// If this script is run directly, start the scheduler
if (require.main === module) {
  startScheduler();
}
