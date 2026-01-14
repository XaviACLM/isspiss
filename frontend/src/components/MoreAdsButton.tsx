interface MoreAdsButtonProps {
  onClick: () => void;
}

export function MoreAdsButton({ onClick }: MoreAdsButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 lg:bottom-auto lg:right-auto lg:top-4 lg:left-84
                 text-xs text-gray-400 hover:text-gray-600
                 bg-[#faf8f5]/80 hover:bg-[#faf8f5] px-3 py-2 border border-gray-200
                 transition-colors cursor-pointer z-40 font-serif"
    >
      Excuse me, could I have some more ads?
    </button>
  );
}
