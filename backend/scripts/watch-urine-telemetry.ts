/**
 * Watch urine-related telemetry items and log changes to a file
 * Run with: npx tsx scripts/watch-urine-telemetry.ts
 * Output: scripts/urine-telemetry.log
 */

import {
  LightstreamerClient,
  Subscription,
  ItemUpdate,
} from 'lightstreamer-client-node';
import { appendFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const LS_SERVER = 'https://push.lightstreamer.com';
const LS_ADAPTER_SET = 'ISSLIVE';

// The two items we care about
const ITEMS = [
  'NODE3000004', // Urine Processor State
  'NODE3000005', // Urine Tank [%]
];

const FIELDS = ['TimeStamp', 'Value', 'Status.Class', 'Status.Indicator'];

const LOG_FILE = join(__dirname, 'urine-telemetry.log');

// Track last values to detect changes
const lastValues: Record<string, string | null> = {};

function log(message: string): void {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}`;
  console.log(line);
  appendFileSync(LOG_FILE, line + '\n');
}

function connect(): Promise<LightstreamerClient> {
  return new Promise((resolve, reject) => {
    const client = new LightstreamerClient(LS_SERVER, LS_ADAPTER_SET);

    client.addListener({
      onStatusChange(status: string) {
        log(`Connection: ${status}`);
        if (status.startsWith('CONNECTED')) {
          resolve(client);
        }
      },
      onServerError(code: number, message: string) {
        log(`Server error ${code}: ${message}`);
        reject(new Error(`Server error ${code}: ${message}`));
      },
    });

    client.connect();
    setTimeout(() => reject(new Error('Connection timeout')), 10000);
  });
}

function subscribe(client: LightstreamerClient): Subscription {
  const subscription = new Subscription('MERGE', ITEMS, FIELDS);
  subscription.setRequestedSnapshot('yes');

  subscription.addListener({
    onSubscription() {
      log(`Subscribed to: ${ITEMS.join(', ')}`);
    },
    onItemUpdate(update: ItemUpdate) {
      const item = update.getItemName();
      const value = update.getValue('Value');
      const nasaTimestamp = update.getValue('TimeStamp');
      const status = update.getValue('Status.Class');

      const lastValue = lastValues[item];
      const isChange = lastValue !== value;
      lastValues[item] = value;

      // Log the label for readability
      const label = item === 'NODE3000004' ? 'Processor State' : 'Tank Level';

      if (isChange) {
        log(`CHANGE ${label} (${item}): ${lastValue ?? 'null'} -> ${value} [nasa_ts=${nasaTimestamp}, status=${status}]`);
      } else {
        // Still log updates even if value didn't change, but mark differently
        log(`UPDATE ${label} (${item}): ${value} (unchanged) [nasa_ts=${nasaTimestamp}]`);
      }
    },
    onItemLostUpdates(itemName: string, lostUpdates: number) {
      log(`WARN: Lost ${lostUpdates} updates for ${itemName}`);
    },
  });

  client.subscribe(subscription);
  return subscription;
}

async function main() {
  const durationMs = 2 * 24 * 60 * 60 * 1000; // 2 days
  const durationMin = durationMs / 60000;

  // Initialize log file
  writeFileSync(LOG_FILE, `Urine Telemetry Watch - Started ${new Date().toISOString()}\n`);
  writeFileSync(LOG_FILE, `Duration: ${durationMin} minutes\n`);
  writeFileSync(LOG_FILE, `Items: ${ITEMS.join(', ')}\n`);
  writeFileSync(LOG_FILE, '='.repeat(80) + '\n');

  console.log(`Logging to: ${LOG_FILE}`);
  console.log(`Will run for ${durationMin} minutes. Press Ctrl+C to stop early.`);
  console.log();

  try {
    const client = await connect();
    const subscription = subscribe(client);

    await new Promise((resolve) => setTimeout(resolve, durationMs));

    log('Duration complete, disconnecting...');
    client.unsubscribe(subscription);
    client.disconnect();
    process.exit(0);
  } catch (error) {
    log(`ERROR: ${error}`);
    process.exit(1);
  }
}

main();
