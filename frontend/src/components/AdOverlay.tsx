import { useMemo } from 'react';

// Dynamically import all GIFs from public/ads at build time
//const adGlob = import.meta.glob('/public/ads/*.gif', { eager: true, query: '?url', import: 'default' });
//const AD_GIFS = Object.keys(adGlob).map(path => path.replace('/public', ''));
const adGlob = import.meta.glob('/ads/*.gif', { eager: true, query: '?url', import: 'default' });
const AD_GIFS = Object.keys(adGlob);

// How many times each unique GIF appears
const COPIES_PER_GIF = 2;

interface AdPlacement {
  src: string;
  left: number;
  top: number;
  zIndex: number;
}

interface AdOverlayProps {
  children: React.ReactNode;
}

export function AdOverlay({ children }: AdOverlayProps) {
  // Generate chaotic random placements for ads
  const adPlacements = useMemo((): AdPlacement[] => {
    const placements: AdPlacement[] = [];
    for (let copy = 0; copy < COPIES_PER_GIF; copy++) {
      for (const src of AD_GIFS) {
        placements.push({
          src,
          left: Math.random() * 100,
          top: Math.random() * 100,
          zIndex: Math.floor(Math.random() * 50),
        });
      }
    }
    return placements;
  }, []);

  return (
    <div className="fixed inset-0 z-40 overflow-hidden">
      {/* Chaotic ad background */}
      {adPlacements.map((ad, i) => (
        <img
          key={i}
          src={ad.src}
          alt=""
          className="absolute"
          style={{
            left: `${ad.left}%`,
            top: `${ad.top}%`,
            zIndex: ad.zIndex,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {/* Main content with semi-transparent background */}
      <div
        className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none"
        style={{ zIndex: 60 }}
      >
        <div
          className="bg-[#faf8f5]/70 backdrop-blur-sm p-12 shadow-xl font-serif
                     w-full max-w-lg h-64 flex items-center justify-center
                     md:h-72 md:max-w-xl lg:h-80 lg:max-w-2xl pointer-events-auto"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
