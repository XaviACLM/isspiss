import { useMemo } from 'react';
import { PlaceholderAd } from './PlaceholderAd';

interface AdOverlayProps {
  children: React.ReactNode;
}

export function AdOverlay({ children }: AdOverlayProps) {
  // Generate a grid of ads to fill the background
  const backgroundAds = useMemo(() => {
    // Create enough ads to fill a large screen
    const ads: React.ReactNode[] = [];
    for (let i = 0; i < 60; i++) {
      ads.push(
        <PlaceholderAd
          key={i}
          width={Math.floor(Math.random() * 150) + 100}
          height={Math.floor(Math.random() * 100) + 60}
        />
      );
    }
    return ads;
  }, []);

  return (
    <div className="fixed inset-0 z-40 overflow-hidden">
      {/* Ad-filled background */}
      <div className="absolute inset-0 flex flex-wrap gap-2 p-2 content-start overflow-hidden">
        {backgroundAds}
      </div>

      {/* Main content with semi-opaque background */}
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-8 shadow-xl max-w-xl">
          {children}
        </div>
      </div>
    </div>
  );
}
