interface MoreAdsButtonProps {
  onClick: () => void;
}

export function MoreAdsButton({ onClick }: MoreAdsButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 lg:bottom-4 right-4 text-xs text-gray-400 hover:text-gray-600
                 bg-white/80 hover:bg-white px-3 py-2 rounded border border-gray-200
                 transition-colors cursor-pointer z-40"
    >
      Excuse me, could I get some more ads?
    </button>
  );
}
