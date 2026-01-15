import { useState, useEffect, useRef } from 'react';
import type { PissState, PissEventSource } from '../types';
import { createMockEventSource } from '../services/mockEventSource';
import { createPissEventSource } from '../services/pissEventSource';

const initialState: PissState = {
  isPissing: false,
  tankLevel: 0,
  lastPissEnded: null,
  currentPissStarted: null,
};

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

export function usePissEvents(): PissState {
  const [state, setState] = useState<PissState>(initialState);
  const sourceRef = useRef<PissEventSource | null>(null);

  useEffect(() => {
    const source = useMock ? createMockEventSource() : createPissEventSource();
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
