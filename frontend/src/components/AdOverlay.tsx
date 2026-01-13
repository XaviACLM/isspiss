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

      {/* Main content with semi-transparent background */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className="bg-[#faf8f5]/80 backdrop-blur-sm p-12 shadow-xl font-serif
                     w-full max-w-lg h-64 flex items-center justify-center
                     md:h-72 md:max-w-xl lg:h-80 lg:max-w-2xl"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
