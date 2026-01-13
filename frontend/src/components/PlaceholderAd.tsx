interface PlaceholderAdProps {
  width?: number;
  height?: number;
  className?: string;
}

// Generate a random pastel-ish gray color for variety
function randomGray(): string {
  const value = Math.floor(Math.random() * 40) + 200; // 200-240 range
  return `rgb(${value}, ${value}, ${value})`;
}

export function PlaceholderAd({ width, height, className = '' }: PlaceholderAdProps) {
  const w = width ?? Math.floor(Math.random() * 100) + 120; // 120-220px
  const h = height ?? Math.floor(Math.random() * 80) + 60;  // 60-140px
  const bg = randomGray();

  return (
    <div
      className={`flex items-center justify-center text-gray-400 text-xs border border-gray-300 ${className}`}
      style={{ width: `${w}px`, height: `${h}px`, backgroundColor: bg }}
    >
      AD
    </div>
  );
}
