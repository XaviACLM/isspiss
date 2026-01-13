export interface PissState {
  isPissing: boolean;
  tankLevel: number; // 0-100, 1% resolution
  lastPissEnded: Date | null;
  currentPissStarted: Date | null;
}

export interface PissStartEvent {
  tankLevel: number;
  startedAt: Date;
}

export interface PissEndEvent {
  tankLevel: number;
  endedAt: Date;
  deltaPercent: number;
}

export interface TankUpdateEvent {
  tankLevel: number;
}

export interface PissEventHandlers {
  onStatus: (state: PissState) => void;
  onPissStart: (data: PissStartEvent) => void;
  onPissEnd: (data: PissEndEvent) => void;
  onTankUpdate: (data: TankUpdateEvent) => void;
}

export interface PissEventSource {
  subscribe(handlers: PissEventHandlers): () => void;
}
