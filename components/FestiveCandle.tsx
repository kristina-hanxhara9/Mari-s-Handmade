import { useId } from 'react';

/** Small pillar candle with a flickering flame, tinted to a festive card's colour. */
export const FestiveCandle = ({ accent, className = '' }: { accent: string; className?: string }) => {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 80 150" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={`glow-${id}`}>
          <stop offset="0%" stopColor="#FFE9A8" stopOpacity="0.9" />
          <stop offset="45%" stopColor="#FFD27A" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FFD27A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`body-${id}`} x1="0" x2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="55%" stopColor="#FBF7F2" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <circle className="candle-glow" cx="40" cy="40" r="36" fill={`url(#glow-${id})`} />
      <circle className="candle-ember" cx="38" cy="26" r="1.4" fill="#FFC861" />
      <circle className="candle-ember" cx="43" cy="24" r="1.1" fill="#FFC861" style={{ animationDelay: '1.4s' }} />
      <g className="candle-flame">
        <path d="M40 22 C48 34 50 45 40 55 C30 45 32 34 40 22Z" fill="#F4A24A" />
        <path d="M40 34 C44 41 45 47 40 53 C35 47 36 41 40 34Z" fill="#FFF4C2" />
      </g>
      <line x1="40" y1="53" x2="40" y2="64" stroke="#3A3A3A" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="20" y="63" width="40" height="87" rx="5" fill={`url(#body-${id})`} />
      <ellipse cx="40" cy="64" rx="20" ry="4" fill="#FFFFFF" />
      <path d="M26 64 q2 9 4 0 M46 64 q2 12 4 0" fill="#FFFFFF" />
      <rect x="20" y="100" width="40" height="7" fill={accent} opacity="0.45" />
    </svg>
  );
};
