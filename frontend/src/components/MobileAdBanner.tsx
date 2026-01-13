import { PlaceholderAd } from './PlaceholderAd';

export function MobileAdBanner() {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-100 border-t border-gray-300 p-2 flex justify-center z-30">
      <PlaceholderAd width={320} height={50} />
    </div>
  );
}
