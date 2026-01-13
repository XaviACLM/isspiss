import { useState, useEffect } from 'react';
import type { PissState } from '../types';

interface PissStatusProps {
  state: PissState;
}

function formatTimeSince(date: Date | null): string {
  if (!date) return 'unknown';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return diffDays === 1 ? '1 day' : `${diffDays} days`;
  }
  if (diffHours > 0) {
    return diffHours === 1 ? '1 hour' : `${diffHours} hours`;
  }
  if (diffMinutes > 0) {
    return diffMinutes === 1 ? '1 minute' : `${diffMinutes} minutes`;
  }
  return 'less than a minute';
}

function formatDuration(date: Date | null): string {
  if (!date) return '0 seconds';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) {
    return `${diffSeconds} second${diffSeconds !== 1 ? 's' : ''}`;
  }

  const minutes = Math.floor(diffSeconds / 60);
  const seconds = diffSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function getGrowthScale(startTime: Date | null): number {
  if (!startTime) return 1;

  const now = new Date();
  const diffSeconds = (now.getTime() - startTime.getTime()) / 1000;

  // Grow from scale 1 to 2.5 over 60 seconds, then stay at 2.5
  const scale = 1 + Math.min(diffSeconds / 40, 1.5);
  return scale;
}

export function PissStatus({ state }: PissStatusProps) {
  const [, forceUpdate] = useState(0);

  // Update the display every 100ms for smooth growth animation
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate((n) => n + 1);
    }, state.isPissing ? 100 : 1000);
    return () => clearInterval(interval);
  }, [state.isPissing]);

  const timeSinceLastPiss = formatTimeSince(state.lastPissEnded);
  const pissDuration = formatDuration(state.currentPissStarted);
  const growthScale = getGrowthScale(state.currentPissStarted);

  return (
    <div className="text-left relative">
      <p
        className={`text-lg font-light tracking-tight transition-all duration-300 ${
          state.isPissing ? 'text-gray-400' : 'text-gray-500'
        }`}
      >
        Is anyone currently pissing on the ISS?
      </p>

      <div className="mt-4">
        {state.isPissing ? (
          <div
            className="transition-transform duration-100 ease-out"
            style={{
              transform: `scale(${growthScale})`,
              transformOrigin: 'bottom left',
              marginTop: `-${(growthScale - 1) * 30}px`,
            }}
          >
            <p className="text-5xl font-bold text-amber-500">
              Yes
            </p>
            <p className="text-lg text-amber-400/80 mt-1">
              ({pissDuration}...)
            </p>
          </div>
        ) : (
          <p className="text-2xl font-normal text-gray-700">
            Not for the last {timeSinceLastPiss}
          </p>
        )}
      </div>
    </div>
  );
}
