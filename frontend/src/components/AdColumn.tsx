import { useState, useEffect } from 'react';
import { PlaceholderAd } from './PlaceholderAd';

const AD_WIDTH = 300;
const AD_HEIGHT = 250;
const MIN_GAP = 24; // Minimum spacing between ads and edges

function calculateAdCount(viewportHeight: number): number {
  // With justify-evenly, N ads have N+1 equal gaps
  // N * AD_HEIGHT + (N+1) * MIN_GAP <= viewportHeight
  // Solving: N <= (viewportHeight - MIN_GAP) / (AD_HEIGHT + MIN_GAP)
  const count = Math.floor((viewportHeight - MIN_GAP) / (AD_HEIGHT + MIN_GAP));
  return Math.max(1, count); // At least 1 ad
}

interface AdColumnProps {
  side: 'left' | 'right';
}

export function AdColumn({ side }: AdColumnProps) {
  const [adCount, setAdCount] = useState(() => calculateAdCount(window.innerHeight));

  useEffect(() => {
    function handleResize() {
      setAdCount(calculateAdCount(window.innerHeight));
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="hidden lg:flex flex-col justify-evenly items-center w-80 shrink-0 h-screen bg-gray-100/60 border-x border-gray-300">
      {Array.from({ length: adCount }, (_, i) => (
        <PlaceholderAd
          key={`${side}-${i}`}
          width={AD_WIDTH}
          height={AD_HEIGHT}
          className="shrink-0"
        />
      ))}
    </div>
  );
}
