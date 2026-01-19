export interface CrewMember {
  name: string;
  agency: string;
}

export interface PissState {
  isPissing: boolean;
  lastPissEnded: Date | null;
  currentPissStarted: Date | null;
  crew: CrewMember[];
}

export interface PissStartEvent {
  startedAt: Date;
}

export interface PissEndEvent {
  endedAt: Date;
}

export interface CrewUpdateEvent {
  crew: CrewMember[];
}

export interface PissEventHandlers {
  onStatus: (state: PissState) => void;
  onPissStart: (data: PissStartEvent) => void;
  onPissEnd: (data: PissEndEvent) => void;
  onCrewUpdate: (data: CrewUpdateEvent) => void;
}

export interface PissEventSource {
  subscribe(handlers: PissEventHandlers): () => void;
}
