import { useMemo } from 'react';
import { PlaceholderAd } from './PlaceholderAd';

interface AdColumnProps {
  side: 'left' | 'right';
}

export function AdColumn({ side }: AdColumnProps) {
  // Generate a random number of ads (5-8) with random sizes
  const ads = useMemo(() => {
    const count = Math.floor(Math.random() * 4) + 5;
    return Array.from({ length: count }, (_, i) => (
      <PlaceholderAd key={`${side}-${i}`} />
    ));
  }, [side]);

  return (
    <div className="hidden lg:flex flex-col gap-3 items-center py-8 w-56 shrink-0">
      {ads}
    </div>
  );
}
