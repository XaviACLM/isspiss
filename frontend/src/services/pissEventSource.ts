import type { PissEventSource, PissEventHandlers, PissState } from '../types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8787';

function parseDate(value: string | null): Date | null {
  return value ? new Date(value) : null;
}

class RealPissEventSource implements PissEventSource {
  private eventSource: EventSource | null = null;

  subscribe(handlers: PissEventHandlers): () => void {
    this.eventSource = new EventSource(`${BACKEND_URL}/events`);

    fetch(`${BACKEND_URL}/status`)
	  .then(res => res.json())
	  .then(data => {
		const state: PissState = {
	      isPissing: data.isPissing,
		  lastPissEnded: parseDate(data.lastPissEnded),
		  currentPissStarted: parseDate(data.currentPissStarted),
		  crew: data.crew,
		};
		handlers.onStatus(state);
	  })
	  .catch(err => console.error(`[Status] Fetch error:`,err));

    this.eventSource.addEventListener('pissStart', (event) => {
      const data = JSON.parse(event.data);
      handlers.onPissStart({
        startedAt: new Date(data.startedAt),
      });
    });

    this.eventSource.addEventListener('pissEnd', (event) => {
      const data = JSON.parse(event.data);
      handlers.onPissEnd({
        endedAt: new Date(data.endedAt),
      });
    });

    this.eventSource.addEventListener('crewUpdate', (event) => {
      const data = JSON.parse(event.data);
      handlers.onCrewUpdate({
        crew: data.crew,
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
