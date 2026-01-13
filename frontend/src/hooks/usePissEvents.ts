import { useState, useEffect, useRef } from 'react';
import type { PissState, PissEventSource } from '../types';
import { createMockEventSource } from '../services/mockEventSource';

const initialState: PissState = {
  isPissing: false,
  tankLevel: 0,
  lastPissEnded: null,
  currentPissStarted: null,
};

export function usePissEvents(): PissState {
  const [state, setState] = useState<PissState>(initialState);
  const sourceRef = useRef<PissEventSource | null>(null);

  useEffect(() => {
    // For now, always use mock. Later we can swap this based on env/config.
    const source = createMockEventSource();
    sourceRef.current = source;

    const unsubscribe = source.subscribe({
      onStatus: (newState) => {
        setState(newState);
      },
      onPissStart: (data) => {
        setState((prev) => ({
          ...prev,
          isPissing: true,
          tankLevel: data.tankLevel,
          currentPissStarted: data.startedAt,
        }));
      },
      onPissEnd: (data) => {
        setState((prev) => ({
          ...prev,
          isPissing: false,
          tankLevel: data.tankLevel,
          lastPissEnded: data.endedAt,
          currentPissStarted: null,
        }));
      },
      onTankUpdate: (data) => {
        setState((prev) => ({
          ...prev,
          tankLevel: data.tankLevel,
        }));
      },
    });

    return unsubscribe;
  }, []);

  return state;
}
