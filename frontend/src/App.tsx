import { useState, useEffect } from 'react';
import { usePissEvents } from './hooks/usePissEvents';
import { PissStatus } from './components/PissStatus';
import { DebugPanel } from './components/DebugPanel';
import { AdColumn } from './components/AdColumn';
import { MobileAdBanner } from './components/MobileAdBanner';
import { MoreAdsButton } from './components/MoreAdsButton';
import { AdOverlay } from './components/AdOverlay';

type AdMode = 'normal' | 'transitioning' | 'excessive';

function App() {
  const pissState = usePissEvents();
  const [adMode, setAdMode] = useState<AdMode>('normal');

  const handleMoreAds = () => {
    setAdMode('transitioning');
  };

  // Handle the "Sure thing!" flash transition
  useEffect(() => {
    if (adMode === 'transitioning') {
      const timer = setTimeout(() => {
        setAdMode('excessive');
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [adMode]);

  // "Sure thing!" flash screen
  if (adMode === 'transitioning') {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center font-serif">
        <p className="text-2xl text-gray-600 animate-pulse">Sure thing!</p>
      </div>
    );
  }

  const mainContent = <PissStatus state={pissState} />;

  // Excessive ads mode
  if (adMode === 'excessive') {
    return (
      <>
        <AdOverlay>{mainContent}</AdOverlay>
        <DebugPanel />
      </>
    );
  }

  // Normal mode with side ad columns (desktop) and bottom banner (mobile)
  return (
    <div className="min-h-screen bg-[#faf8f5] flex pb-16 lg:pb-0 font-serif">
      <AdColumn side="left" />

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-xl">
          {mainContent}
        </div>
      </main>

      <AdColumn side="right" />

      <MobileAdBanner />
      <MoreAdsButton onClick={handleMoreAds} />
      <DebugPanel />
    </div>
  );
}

export default App;
