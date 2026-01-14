import { useState, useEffect } from 'react';
import { MockPissEventSource } from '../services/mockEventSource';

export function DebugPanel() {
  const [mock, setMock] = useState<MockPissEventSource | null>(null);
  const [isPissing, setIsPissing] = useState(false);

  useEffect(() => {
    const unsubscribe = MockPissEventSource.onInstanceCreated((instance) => {
      setMock(instance);
      setIsPissing(instance.getState().isPissing);
    });
    return unsubscribe;
  }, []);

  const handleTogglePiss = (): void => {
    if (!mock) return;

    if (isPissing) {
      mock.triggerPissEnd();
      setIsPissing(false);
    } else {
      mock.triggerPissStart();
      setIsPissing(true);
    }
  };

  if (!mock) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-gray-800 text-white p-3 rounded-lg shadow-lg text-sm">
      <div className="font-bold mb-2 text-gray-400">Debug</div>
      <button
        onClick={handleTogglePiss}
        className={`px-3 py-1 rounded font-medium ${
          isPissing
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {isPissing ? 'Stop Pissing' : 'Start Pissing'}
      </button>
    </div>
  );
}
