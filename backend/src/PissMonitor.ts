import {
  LightstreamerClient,
  Subscription,
} from 'lightstreamer-client-web';

interface CrewMember {
  name: string;
  agency: string;
}

interface PissState {
  isPissing: boolean;
  tankLevel: number;
  lastPissEnded: string | null;
  currentPissStarted: string | null;
  crew: CrewMember[];
}

interface Env {
  PISS_MONITOR: DurableObjectNamespace;
}

const PISS_TIMEOUT_MS = 20_000; // 20 seconds without increase = piss ended
const CREW_POLL_INTERVAL_MS = 1_200_000; // 20 minutes

export class PissMonitor implements DurableObject {
  private state: DurableObjectState;
  private pissState: PissState;
  private sseClients: Set<WritableStreamDefaultWriter>;
  private lsClient: LightstreamerClient | null = null;
  private pissTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private crewIntervalId: ReturnType<typeof setInterval> | null = null;
  private lastTankLevel: number | null = null;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.sseClients = new Set();
    this.pissState = {
      isPissing: false,
      tankLevel: 0,
      lastPissEnded: null,
      currentPissStarted: null,
      crew: [],
    };

    // Restore state from storage if available
    this.state.blockConcurrencyWhile(async () => {
      const stored = await this.state.storage.get<PissState>('pissState');
      if (stored) {
        this.pissState = stored;
        this.lastTankLevel = stored.tankLevel;
      }
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/status') {
      return Response.json(this.pissState);
    }

    if (url.pathname === '/events') {
      return this.handleSSE(request);
    }

    if (url.pathname === '/init') {
      await this.initialize();
      return new Response('Initialized');
    }

    return new Response('Not found', { status: 404 });
  }

  private async initialize(): Promise<void> {
    // Start Lightstreamer connection
    this.connectToNASA();

    // Start crew polling
    await this.fetchCrew();
    this.crewIntervalId = setInterval(() => this.fetchCrew(), CREW_POLL_INTERVAL_MS);
  }

  private connectToNASA(): void {
    this.lsClient = new LightstreamerClient(
      'https://push.lightstreamer.com',
      'ISSLIVE'
    );

    this.lsClient.addListener({
      onStatusChange: (status: string) => {
        console.log(`[Lightstreamer] Status: ${status}`);
      },
      onServerError: (code: number, message: string) => {
        console.error(`[Lightstreamer] Error ${code}: ${message}`);
      },
    });

    const subscription = new Subscription(
      'MERGE',
      ['NODE3000005'], // Urine Tank Level
      ['Value', 'TimeStamp']
    );
    subscription.setRequestedSnapshot('yes');

    subscription.addListener({
      onItemUpdate: (update) => {
        const value = update.getValue('Value');
        if (value !== null) {
          const tankLevel = parseInt(value, 10);
          this.handleTankUpdate(tankLevel);
        }
      },
    });

    this.lsClient.subscribe(subscription);
    this.lsClient.connect();
  }

  private handleTankUpdate(newLevel: number): void {
    const oldLevel = this.lastTankLevel;
    this.lastTankLevel = newLevel;
    this.pissState.tankLevel = newLevel;

    // Detect piss start: level increased
    if (oldLevel !== null && newLevel > oldLevel) {
      if (!this.pissState.isPissing) {
        // Piss just started
        this.pissState.isPissing = true;
        this.pissState.currentPissStarted = new Date().toISOString();
        this.broadcast('pissStart', {
          tankLevel: newLevel,
          startedAt: this.pissState.currentPissStarted,
        });
      }

      // Reset the timeout - piss is ongoing
      this.resetPissTimeout();
    }

    // Broadcast tank update
    this.broadcast('tankUpdate', { tankLevel: newLevel });

    // Persist state
    this.state.storage.put('pissState', this.pissState);
  }

  private resetPissTimeout(): void {
    if (this.pissTimeoutId) {
      clearTimeout(this.pissTimeoutId);
    }

    this.pissTimeoutId = setTimeout(() => {
      if (this.pissState.isPissing) {
        // Piss ended
        const endedAt = new Date().toISOString();
        const startedAt = this.pissState.currentPissStarted;

        this.pissState.isPissing = false;
        this.pissState.lastPissEnded = endedAt;
        this.pissState.currentPissStarted = null;

        this.broadcast('pissEnd', {
          tankLevel: this.pissState.tankLevel,
          endedAt,
          startedAt,
        });

        this.state.storage.put('pissState', this.pissState);
      }
    }, PISS_TIMEOUT_MS);
  }

  private async fetchCrew(): Promise<void> {
    try {
      // Step 1: Get ISS data with active expeditions
      const stationResponse = await fetch(
        'https://ll.thespacedevs.com/2.3.0/space_stations/4/'
      );
      if (!stationResponse.ok) {
        throw new Error(`Station fetch failed: ${stationResponse.status}`);
      }
      const stationData = await stationResponse.json() as {
        active_expeditions: Array<{ url: string }>;
      };
	  
	  if (stationData.active_expeditions === undefined) {
		throw new Error(`Invalid station response: missing active_expeditions field (likely throttled)`)
	  }

      // Step 2: Fetch each expedition to get crew
      const crewMembers: CrewMember[] = [];
      const seenNames = new Set<string>();

      for (const expedition of stationData.active_expeditions) {
        const expeditionResponse = await fetch(expedition.url);
        if (!expeditionResponse.ok) {
          throw new Error(`Expedition fetch failed: ${expeditionResponse.status}`);
		}

        const expeditionData = await expeditionResponse.json() as {
          crew: Array<{
            astronaut: {
              name: string;
              agency?: { abbrev?: string };
            };
          }>;
        };
	  
		if (expeditionData.crew === undefined) {
		  throw new Error(`Invalid expedition response: missing crew field (likely throttled)`)
		}

        // Step 3: Extract astronaut name and agency
        for (const member of expeditionData.crew) {
          const name = member.astronaut?.name;
          if (!name || seenNames.has(name)) continue;
          seenNames.add(name);

          let agency = member.astronaut?.agency?.abbrev ?? 'Unknown';
          // Normalize agency names
          if (agency === 'RFSA') agency = 'Roscosmos';

          crewMembers.push({ name, agency });
        }
      }

      // Update state if crew changed
      const oldCrewJson = JSON.stringify(
        [...this.pissState.crew].sort((a, b) => a.name.localeCompare(b.name))
      );
      const newCrewJson = JSON.stringify(
        [...crewMembers].sort((a, b) => a.name.localeCompare(b.name))
      );

      if (oldCrewJson !== newCrewJson) {
        this.pissState.crew = crewMembers;
        this.broadcast('crewUpdate', { crew: crewMembers });
        this.state.storage.put('pissState', this.pissState);
        console.log(`[Crew] Updated: ${crewMembers.length} astronauts`);
      }
    } catch (error) {
      console.error('[Crew] Fetch error:', error);
    }
  }

  private handleSSE(request: Request): Response {
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    // Send initial status
    const statusEvent = `event: status\ndata: ${JSON.stringify(this.pissState)}\n\n`;
    writer.write(new TextEncoder().encode(statusEvent));

    // Add to clients set
    this.sseClients.add(writer);

    // Keep alive
    const keepAlive = setInterval(() => {
      writer.write(new TextEncoder().encode(': keepalive\n\n')).catch(() => {
        clearInterval(keepAlive);
        this.sseClients.delete(writer);
      });
    }, 30000);

    // Clean up on abort
    request.signal.addEventListener('abort', () => {
      clearInterval(keepAlive);
      this.sseClients.delete(writer);
      writer.close().catch(() => {});
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }

  private broadcast(event: string, data: unknown): void {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    const encoded = new TextEncoder().encode(message);

    for (const writer of this.sseClients) {
      writer.write(encoded).catch(() => {
        this.sseClients.delete(writer);
      });
    }
  }
}
