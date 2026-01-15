/**
 * Test script to explore NASA ISS telemetry via Lightstreamer
 * Run with: npx tsx scripts/test-nasa-telemetry.ts
 */

import {
  LightstreamerClient,
  Subscription,
  ItemUpdate,
} from 'lightstreamer-client-node';

// NASA ISS Live Lightstreamer config
const LS_SERVER = 'https://push.lightstreamer.com';
const LS_ADAPTER_SET = 'ISSLIVE';

// Known ISS telemetry items related to water/waste systems
// Node 3 (Tranquility) houses the Water Recovery System and toilet
// These are educated guesses based on NASA's telemetry naming conventions
const ITEMS_TO_TRY = [
  // Water Recovery System / Urine Processor Assembly items
  'NODE3000005', // Often water-related
  'NODE3000006',
  'NODE3000007',
  'NODE3000008',
  'NODE3000009',
  'NODE3000010',
  'NODE3000011',
  'NODE3000012',
  // Try a range of Node 3 items
  ...Array.from({ length: 50 }, (_, i) => `NODE3000${String(i + 1).padStart(3, '0')}`),
];

// Fields to request (standard ISS telemetry fields)
const FIELDS = ['TimeStamp', 'Value', 'Status.Class', 'Status.Indicator'];

function connect(): Promise<LightstreamerClient> {
  return new Promise((resolve, reject) => {
    const client = new LightstreamerClient(LS_SERVER, LS_ADAPTER_SET);

    client.addListener({
      onStatusChange(status: string) {
        console.log(`[Connection] Status: ${status}`);
        if (status.startsWith('CONNECTED')) {
          resolve(client);
        }
      },
      onServerError(code: number, message: string) {
        console.error(`[Connection] Server error ${code}: ${message}`);
        reject(new Error(`Server error ${code}: ${message}`));
      },
    });

    console.log(`[Connection] Connecting to ${LS_SERVER}...`);
    client.connect();

    // Timeout after 10 seconds
    setTimeout(() => reject(new Error('Connection timeout')), 10000);
  });
}

function subscribeToItems(
  client: LightstreamerClient,
  items: string[]
): Subscription {
  const subscription = new Subscription('MERGE', items, FIELDS);
  subscription.setRequestedSnapshot('yes');

  subscription.addListener({
    onSubscription() {
      console.log(`[Subscription] Subscribed to ${items.length} items`);
    },
    onUnsubscription() {
      console.log('[Subscription] Unsubscribed');
    },
    onSubscriptionError(code: number, message: string) {
      console.error(`[Subscription] Error ${code}: ${message}`);
    },
    onItemUpdate(update: ItemUpdate) {
      const itemName = update.getItemName();
      const value = update.getValue('Value');
      const timestamp = update.getValue('TimeStamp');
      const statusClass = update.getValue('Status.Class');

      // Only log items that have actual values
      if (value !== null) {
        console.log(
          `[Data] ${itemName}: ${value} (status: ${statusClass}, time: ${timestamp})`
        );
      }
    },
    onItemLostUpdates(itemName: string, lostUpdates: number) {
      console.warn(`[Data] Lost ${lostUpdates} updates for ${itemName}`);
    },
  });

  client.subscribe(subscription);
  return subscription;
}

async function main() {
  console.log('='.repeat(60));
  console.log('NASA ISS Telemetry Explorer');
  console.log('Looking for urine tank / water recovery system data...');
  console.log('='.repeat(60));
  console.log();

  try {
    const client = await connect();
    console.log();
    console.log('Connected! Subscribing to telemetry items...');
    console.log();

    // Subscribe to items in batches to avoid overwhelming
    const subscription = subscribeToItems(client, ITEMS_TO_TRY);

    // Run for 30 seconds then disconnect
    console.log('Listening for 30 seconds...');
    console.log('(Watch for items with changing values - those are live!)');
    console.log();

    await new Promise((resolve) => setTimeout(resolve, 30000));

    console.log();
    console.log('Disconnecting...');
    client.unsubscribe(subscription);
    client.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
