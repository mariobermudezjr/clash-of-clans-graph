import cron from 'node-cron';
import { scheduleJob, Job } from 'node-schedule';
import { collectWarData } from './collector';
import { parseCoCTimestamp, formatDate } from '../lib/date-utils';

// Track scheduled jobs
let dynamicJob: Job | null = null;

/**
 * Schedule a one-time collection after war ends
 */
async function scheduleSmartCollection() {
  try {
    const result = await collectWarData();

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

      // Schedule new collection
      dynamicJob = scheduleJob(collectionTime, async () => {
        console.log('Executing scheduled collection near war end...');
        await collectWarData();
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

      dynamicJob = scheduleJob(collectionTime, async () => {
        console.log('Executing scheduled collection near war end...');
        await collectWarData();
      });

      console.log(`✅ Scheduled collection for: ${formatDate(collectionTime)}`);
      console.log(`   (1 minute before war ends at ${formatDate(endTime)})`);
    }
  } catch (error) {
    console.error('Error during smart collection scheduling:', error);
  }
}

/**
 * Start the scheduler
 */
export function startScheduler() {
  console.log('Starting Clash of Clans War Data Scheduler...');
  console.log('');

  // Daily check at 9 AM
  console.log('Setting up daily check at 9:00 AM...');
  cron.schedule('0 9 * * *', async () => {
    console.log('\n' + '='.repeat(60));
    console.log('DAILY SCHEDULED CHECK');
    console.log('='.repeat(60));
    await scheduleSmartCollection();
  });

  // Also run immediately on startup
  console.log('Running initial collection...');
  scheduleSmartCollection();

  // Keep the process alive
  console.log('');
  console.log('Scheduler is running. Press Ctrl+C to stop.');
  console.log('Daily checks: Every day at 9:00 AM');
  console.log('Smart scheduling: Automatically schedules after war detection');
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
