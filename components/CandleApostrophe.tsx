import { useId } from 'react';

/** A tiny candle flame used as the apostrophe in "Mari's". Screen readers still hear an apostrophe. */
export const CandleApostrophe = () => {
  const id = useId().replace(/:/g, '');
  return (
    <>
      <span className="sr-only">'</span>
      <span
        aria-hidden="true"
        className="inline-block relative align-top"
        style={{ width: '0.22em', height: '0.5em', margin: '0 0.04em 0 -0.05em', transform: 'translateY(0.02em) rotate(6deg)' }}
      >
        <svg viewBox="0 0 10 20" className="absolute inset-0 w-full h-full overflow-visible">
          <defs>
            <radialGradient id={`glow-${id}`} cx="50%" cy="62%" r="50%">
              <stop offset="0%" stopColor="#FFD27A" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#FFD27A" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`outer-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F6B24E" stopOpacity="0.85" />
              <stop offset="55%" stopColor="#EE8F35" />
              <stop offset="100%" stopColor="#D9772C" />
            </linearGradient>
            <linearGradient id={`inner-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFE7A3" />
              <stop offset="100%" stopColor="#FFF6DA" />
            </linearGradient>
          </defs>
          {/* soft halo */}
          <ellipse className="logo-glow" cx="5" cy="12" rx="9" ry="11" fill={`url(#glow-${id})`} />
          <g className="logo-flame">
            {/* outer flame with a gently curling tip */}
            <path
              d="M5.6 0.4C6.3 3.4 9 6.9 9 11.6 9 15.9 7.2 18.8 5 18.8S1 15.9 1 12C1 8.4 3.4 6.4 4.6 3.6 5 2.6 5.4 1.5 5.6 0.4Z"
              fill={`url(#outer-${id})`}
            />
            {/* bright middle */}
            <path
              d="M5.3 5.6C6.2 7.9 7.5 10.2 7.5 13.1 7.5 15.8 6.4 17.5 5 17.5S2.5 15.8 2.5 13.4C2.5 10.7 4.4 8.6 5.3 5.6Z"
              fill={`url(#inner-${id})`}
            />
            {/* white-hot core and a hint of blue at the base */}
            <ellipse cx="5" cy="14.6" rx="1.35" ry="2.3" fill="#FFFFFF" opacity="0.95" />
            <ellipse cx="5" cy="17.6" rx="1.6" ry="0.75" fill="#9CC3E0" opacity="0.5" />
          </g>
        </svg>
      </span>
    </>
  );
};
