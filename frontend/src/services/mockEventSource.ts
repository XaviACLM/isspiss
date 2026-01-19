import type {
  PissEventSource,
  PissEventHandlers,
  PissState,
} from '../types';

type MockEventSourceListener = (mock: MockPissEventSource) => void;

class MockPissEventSource implements PissEventSource {
  private handlers: PissEventHandlers | null = null;
  private state: PissState = {
    isPissing: false,
    lastPissEnded: new Date(Date.now() - 1000 * 60 * 17), // 17 minutes ago
    currentPissStarted: null,
    crew: [
      { name: 'Test Astronaut', agency: 'NASA' },
      { name: 'Mock Cosmonaut', agency: 'Roscosmos' },
      { name: 'Debug Taikonaut', agency: 'CNSA' },
    ],
  };

  private static listeners: MockEventSourceListener[] = [];
  private static currentInstance: MockPissEventSource | null = null;

  static onInstanceCreated(listener: MockEventSourceListener): () => void {
    // Call immediately if instance already exists
    if (this.currentInstance) {
      listener(this.currentInstance);
    }
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  subscribe(handlers: PissEventHandlers): () => void {
    this.handlers = handlers;

    // Send initial status
    handlers.onStatus({ ...this.state });

    // Store instance and notify listeners
    MockPissEventSource.currentInstance = this;
    MockPissEventSource.listeners.forEach((l) => l(this));

    return () => {
      this.handlers = null;
    };
  }

  // Debug controls - called from DebugPanel
  triggerPissStart(): void {
    if (!this.handlers || this.state.isPissing) return;

    this.state.isPissing = true;
    this.state.currentPissStarted = new Date();

    this.handlers.onPissStart({
      startedAt: this.state.currentPissStarted,
    });
  }

  triggerPissEnd(): void {
    if (!this.handlers || !this.state.isPissing) return;

    this.state.isPissing = false;
    this.state.lastPissEnded = new Date();

    this.handlers.onPissEnd({
      endedAt: this.state.lastPissEnded,
    });

    this.state.currentPissStarted = null;
  }

  getState(): PissState {
    return { ...this.state };
  }
}

export function createMockEventSource(): PissEventSource {
  return new MockPissEventSource();
}

export { MockPissEventSource };
