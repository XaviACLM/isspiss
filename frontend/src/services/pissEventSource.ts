import type { PissEventSource, PissEventHandlers, PissState } from '../types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8787';

function parseDate(value: string | null): Date | null {
  return value ? new Date(value) : null;
}

class RealPissEventSource implements PissEventSource {
  private eventSource: EventSource | null = null;

  subscribe(handlers: PissEventHandlers): () => void {
    this.eventSource = new EventSource(`${BACKEND_URL}/events`);

    this.eventSource.addEventListener('status', (event) => {
      const data = JSON.parse(event.data);
      const state: PissState = {
        isPissing: data.isPissing,
        tankLevel: data.tankLevel,
        lastPissEnded: parseDate(data.lastPissEnded),
        currentPissStarted: parseDate(data.currentPissStarted),
        crew: data.crew ?? [],
      };
      handlers.onStatus(state);
    });

    this.eventSource.addEventListener('pissStart', (event) => {
      const data = JSON.parse(event.data);
      handlers.onPissStart({
        tankLevel: data.tankLevel,
        startedAt: new Date(data.startedAt),
      });
    });

    this.eventSource.addEventListener('pissEnd', (event) => {
      const data = JSON.parse(event.data);
      handlers.onPissEnd({
        tankLevel: data.tankLevel,
        endedAt: new Date(data.endedAt),
        deltaPercent: data.deltaPercent,
      });
    });

    this.eventSource.addEventListener('tankUpdate', (event) => {
      const data = JSON.parse(event.data);
      handlers.onTankUpdate({
        tankLevel: data.tankLevel,
      });
    });

    this.eventSource.addEventListener('crewUpdate', (event) => {
      const data = JSON.parse(event.data);
      handlers.onCrewUpdate({
        crew: data.crew ?? [],
      });
    });

    this.eventSource.onerror = () => {
      console.error('[SSE] Connection error, will retry...');
    };

    return () => {
      this.eventSource?.close();
      this.eventSource = null;
    };
  }
}

export function createPissEventSource(): PissEventSource {
  return new RealPissEventSource();
}
