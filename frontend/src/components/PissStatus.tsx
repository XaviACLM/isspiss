import { useState, useEffect } from 'react';
import type { PissState } from '../types';

interface PissStatusProps {
  state: PissState;
  excessiveAdsMode?: boolean;
}

interface TimeFormat {
  phrase: string;
  usesNotForTheLast: boolean;
}

function formatTimeSince(date: Date | null): TimeFormat {
  if (!date) return { phrase: 'unknown', usesNotForTheLast: true };

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return {
      phrase: diffDays === 1 ? 'day' : `${diffDays} days`,
      usesNotForTheLast: true,
    };
  }
  if (diffHours > 0) {
    return {
      phrase: diffHours === 1 ? 'hour' : `${diffHours} hours`,
      usesNotForTheLast: true,
    };
  }
  if (diffMinutes > 0) {
    if (diffMinutes === 1) {
      return { phrase: 'minute', usesNotForTheLast: true };
    }
    if (diffMinutes === 2) {
      return { phrase: 'couple minutes', usesNotForTheLast: true };
    }
    return { phrase: `${diffMinutes} minutes`, usesNotForTheLast: true };
  }
  if (diffSeconds < 5) {
    return { phrase: 'anymore', usesNotForTheLast: false };
  }
  return {
    phrase: `${diffSeconds} seconds`,
    usesNotForTheLast: true,
  };
}

interface DurationFormat {
  text: string;
  elapsedSeconds: number;
}

function formatDuration(date: Date | null): DurationFormat {
  if (!date) return { text: '0 seconds', elapsedSeconds: 0 };

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) {
    return {
      text: `${diffSeconds} second${diffSeconds !== 1 ? 's' : ''}`,
      elapsedSeconds: diffSeconds,
    };
  }

  const minutes = Math.floor(diffSeconds / 60);
  const seconds = diffSeconds % 60;
  return {
    text: `${minutes}:${seconds.toString().padStart(2, '0')}`,
    elapsedSeconds: diffSeconds,
  };
}

function getGrowthScale(startTime: Date | null): number {
  if (!startTime) return 1;

  const now = new Date();
  const diffSeconds = (now.getTime() - startTime.getTime()) / 1000;

  // Grow from scale 1 to 2.5 over 60 seconds, then stay at 2.5
  const scale = 1 + Math.min(diffSeconds / 40, 1.5);
  return scale;
}

export function PissStatus({ state, excessiveAdsMode = false }: PissStatusProps) {
  const [, forceUpdate] = useState(0);

  // Update the display every 100ms for smooth growth animation
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate((n) => n + 1);
    }, state.isPissing ? 10 : 1000);
    return () => clearInterval(interval);
  }, [state.isPissing]);

  const timeSince = formatTimeSince(state.lastPissEnded);
  const duration = formatDuration(state.currentPissStarted);
  const growthScale = getGrowthScale(state.currentPissStarted);
  const showDuration = duration.elapsedSeconds >= 10;

  // Show loading state before SSE data arrives
  const isLoading = state.tankLevel === 0 && !state.isPissing;

  return (
    <div className="text-left relative">
      <p
        className={`text-3xl italic tracking-tight transition-all duration-300 lg:-translate-x-10 text-gray-400`}
      >
	    {"> Is anyone currently pissing on the ISS?"}
      </p>
      <div className="mt-4">
        {isLoading ? (
          <p className="text-3xl font-normal text-gray-900 lg:translate-x-10">
            Wait, let me check.
          </p>
        ) : state.isPissing ? (
          <div
            className="transition-transform duration-100 ease-out flex items-baseline gap-2 lg:translate-x-10"
            style={{
              transform: `scale(${growthScale})`,
              transformOrigin: 'bottom left',
            }}
          >
            <p className="text-5xl font-bold text-gray-900">
              Yes.
            </p>
            {showDuration && (
              <p className="text-3xl text-gray-600">
                ({duration.text}...)
              </p>
            )}
          </div>
        ) : (
          <p className="text-3xl font-normal text-gray-900 lg:translate-x-10">
            {timeSince.usesNotForTheLast
              ? `Not for the last ${timeSince.phrase}`
              : `Not ${timeSince.phrase}`}.
          </p>
        )}
      </div>

      {!excessiveAdsMode && state.crew.length > 0 && (
        <div className="mt-12 text-sm text-gray-500 lg:text-right">
          <p className="mb-1 italic">Currently aboard:</p>
          <ul>
            {state.crew.map((member) => (
              <li key={member.name}>
				{""} {member.name} ({member.agency})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
