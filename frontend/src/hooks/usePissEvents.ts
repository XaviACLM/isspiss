import { useState, useEffect, useRef } from 'react';
import type { PissState, PissEventSource } from '../types';
import { createMockEventSource } from '../services/mockEventSource';
import { createPissEventSource } from '../services/pissEventSource';

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

export function usePissEvents(): PissState | null {
  const [state, setState] = useState<PissState | null>(null);
  const sourceRef = useRef<PissEventSource | null>(null);

  useEffect(() => {
    const source = useMock ? createMockEventSource() : createPissEventSource();
    sourceRef.current = source;

    const unsubscribe = source.subscribe({
      onStatus: (newState) => {
        setState(newState);
      },
      onPissStart: (data) => {
        setState((prev) => {
		  if (prev === null) {return null;}
		  return {
            ...prev,
            isPissing: true,
            currentPissStarted: data.startedAt,
		  }
        });
      },
      onPissEnd: (data) => {
        setState((prev) => {
		  if (prev === null) {return null;}
		  return {
            ...prev,
            isPissing: false,
            lastPissEnded: data.endedAt,
            currentPissStarted: null,
		  }
        });
      },
      onCrewUpdate: (data) => {
        setState((prev) => {
		  if (prev === null) {return null;}
		  return {
            ...prev,
            crew: data.crew,
		  }
        });
      },
    });

    return unsubscribe;
  }, []);

  return state;
}
