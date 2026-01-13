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
    tankLevel: 42,
    lastPissEnded: new Date(Date.now() - 1000 * 60 * 17), // 17 minutes ago
    currentPissStarted: null,
  };

  private static listeners: MockEventSourceListener[] = [];

  static onInstanceCreated(listener: MockEventSourceListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  subscribe(handlers: PissEventHandlers): () => void {
    this.handlers = handlers;

    // Send initial status
    handlers.onStatus({ ...this.state });

    // Notify listeners that an instance is ready
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
      tankLevel: this.state.tankLevel,
      startedAt: this.state.currentPissStarted,
    });
  }

  triggerPissEnd(): void {
    if (!this.handlers || !this.state.isPissing) return;

    const deltaPercent = Math.floor(Math.random() * 3) + 1; // 1-3%
    this.state.tankLevel += deltaPercent;
    this.state.isPissing = false;
    this.state.lastPissEnded = new Date();

    this.handlers.onPissEnd({
      tankLevel: this.state.tankLevel,
      endedAt: this.state.lastPissEnded,
      deltaPercent,
    });

    this.state.currentPissStarted = null;
  }

  triggerTankUpdate(level: number): void {
    if (!this.handlers) return;

    this.state.tankLevel = level;
    this.handlers.onTankUpdate({ tankLevel: level });
  }

  getState(): PissState {
    return { ...this.state };
  }
}

export function createMockEventSource(): PissEventSource {
  return new MockPissEventSource();
}

export { MockPissEventSource };
