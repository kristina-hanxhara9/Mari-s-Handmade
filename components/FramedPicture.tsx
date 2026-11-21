import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

/**
 * Ivory picture frames drawn to the exact size of the picture:
 *  - "pearl":  rounded arch lined with a row of pearls
 *  - "ogee":   curved, bell-shaped top with a thin gold inner line
 *  - "ornate": the ogee frame with a carved ornament at the top
 * The frame is an SVG drawn over the picture; the picture is clipped to the frame's opening.
 */
export type FrameStyle = 'pearl' | 'ogee' | 'ornate';

type Box = { x: number; y: number; w: number; h: number };

const f = (n: number) => n.toFixed(1);

/** Arch: half-ellipse top, straight sides, softly rounded bottom corners. */
function archPath({ x, y, w, h }: Box, bottomRadius: number) {
  const rx = w / 2;
  const ry = Math.min(w * 0.46, h * 0.4);
  const rb = Math.min(bottomRadius, w / 4);
  return [
    `M${f(x)},${f(y + ry)}`,
    `A${f(rx)},${f(ry)} 0 0 1 ${f(x + w)},${f(y + ry)}`,
    `L${f(x + w)},${f(y + h - rb)}`,
    `Q${f(x + w)},${f(y + h)} ${f(x + w - rb)},${f(y + h)}`,
    `L${f(x + rb)},${f(y + h)}`,
    `Q${f(x)},${f(y + h)} ${f(x)},${f(y + h - rb)}`,
    'Z',
  ].join(' ');
}

/** Ogee: rounded shoulders that dip, then rise into a central dome. */
function ogeePath({ x, y, w, h }: Box, bottomRadius: number) {
  const t = Math.min(w * 0.34, h * 0.36); // height of the decorative top
  const X = (u: number) => f(x + u * w);
  const Y = (v: number) => f(y + v * t);
  const rb = Math.min(bottomRadius, w / 4);
  return [
    `M${f(x)},${f(y + h - rb)}`,
    `L${f(x)},${Y(1)}`,
    `C${X(0)},${Y(0.5)} ${X(0.07)},${Y(0.33)} ${X(0.24)},${Y(0.31)}`,
    `C${X(0.36)},${Y(0.3)} ${X(0.37)},${Y(0)} ${X(0.5)},${Y(0)}`,
    `C${X(0.63)},${Y(0)} ${X(0.64)},${Y(0.3)} ${X(0.76)},${Y(0.31)}`,
    `C${X(0.93)},${Y(0.33)} ${X(1)},${Y(0.5)} ${X(1)},${Y(1)}`,
    `L${f(x + w)},${f(y + h - rb)}`,
    `Q${f(x + w)},${f(y + h)} ${f(x + w - rb)},${f(y + h)}`,
    `L${f(x + rb)},${f(y + h)}`,
    `Q${f(x)},${f(y + h)} ${f(x)},${f(y + h - rb)}`,
    'Z',
  ].join(' ');
}

const inset = (b: Box, d: number): Box => ({ x: b.x + d, y: b.y + d, w: b.w - 2 * d, h: b.h - 2 * d });

export const FramedPicture = ({
  frame,
  children,
  className = '',
  pictureClassName = '',
}: {
  frame: FrameStyle;
  children: ReactNode;
  /** Sizing of the whole frame, e.g. "w-full aspect-[3/4]". */
  className?: string;
  /** Background behind the picture (shows while it loads or when there is no photo). */
  pictureClassName?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const id = useId().replace(/:/g, '');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w, h } = size;
  const ready = w > 0 && h > 0;
  const isPearl = frame === 'pearl';
  const thickness = Math.max(11, Math.min(isPearl ? 22 : 16, w * (isPearl ? 0.062 : 0.045)));
  const shape = isPearl ? archPath : ogeePath;
  const outerBox: Box = { x: 0, y: 0, w, h };
  const innerBox = inset(outerBox, thickness);
  const outer = ready ? shape(outerBox, thickness * 1.6) : '';
  const inner = ready ? shape(innerBox, thickness * 0.8) : '';
  const innerClip = ready ? shape({ ...innerBox, x: 0, y: 0 }, thickness * 0.8) : '';
  const pearlLine = ready && isPearl ? shape(inset(outerBox, thickness / 2), thickness * 1.2) : '';
  const goldLine = ready && !isPearl ? shape(inset(outerBox, thickness + 4), thickness * 0.6) : '';
  const pearl = Math.max(5.5, Math.min(8.5, w * 0.024));

  return (
    <div ref={ref} className={`relative ${frame === 'ornate' ? 'mt-6' : ''} ${className}`}>
      {/* The picture, clipped to the frame's opening */}
      <div
        className={`absolute overflow-hidden ${pictureClassName}`}
        style={{
          inset: thickness,
          clipPath: ready ? `path('${innerClip}')` : undefined,
          borderRadius: ready ? undefined : '999px 999px 12px 12px',
        }}
      >
        {children}
      </div>

      {ready && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible drop-shadow-[0_18px_22px_rgba(62,86,97,0.18)]"
          viewBox={`0 0 ${w} ${h}`}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`ivory-${id}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="45%" stopColor="#F7F1EA" />
              <stop offset="100%" stopColor="#E6DACB" />
            </linearGradient>
            <clipPath id={`open-${id}`}>
              <path d={inner} />
            </clipPath>
            <filter id={`soft-${id}`} x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>

          {/* Shadow cast by the frame onto the picture */}
          <path d={inner} fill="none" stroke="rgba(40,30,20,0.28)" strokeWidth={10} filter={`url(#soft-${id})`} clipPath={`url(#open-${id})`} />

          {/* Frame body */}
          <path d={`${outer} ${inner}`} fillRule="evenodd" fill={`url(#ivory-${id})`} />
          <path d={outer} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={1.5} />
          <path d={outer} fill="none" stroke="rgba(150,120,90,0.18)" strokeWidth={1} transform="translate(0.6 0.8)" />
          <path d={inner} fill="none" stroke="rgba(130,100,70,0.35)" strokeWidth={1.2} />
          <path d={inner} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={1} transform="translate(-0.8 -0.8)" />

          {isPearl && (
            <g strokeLinecap="round" fill="none">
              <path d={pearlLine} stroke="rgba(140,105,75,0.45)" strokeWidth={pearl + 1} strokeDasharray={`0 ${pearl * 1.55}`} transform="translate(0.5 0.9)" />
              <path d={pearlLine} stroke="#EADBC8" strokeWidth={pearl} strokeDasharray={`0 ${pearl * 1.55}`} />
              <path d={pearlLine} stroke="#FFFFFF" strokeWidth={pearl * 0.42} strokeDasharray={`0 ${pearl * 1.55}`} transform={`translate(${-pearl * 0.18} ${-pearl * 0.2})`} />
            </g>
          )}

          {!isPearl && <path d={goldLine} fill="none" stroke="#C5A059" strokeOpacity={0.85} strokeWidth={1.2} />}

          {frame === 'ornate' && (
            <g transform={`translate(${w / 2} ${thickness * 0.55}) scale(${Math.max(0.75, Math.min(1.25, w / 320))})`}>
              <g fill={`url(#ivory-${id})`} stroke="rgba(130,100,70,0.35)" strokeWidth={0.8}>
                <path d="M-4,2 C-14,0 -24,-4 -27,-12 C-22,-10 -17,-11 -14,-15 C-12,-9 -8,-4 -4,2Z" />
                <path d="M4,2 C14,0 24,-4 27,-12 C22,-10 17,-11 14,-15 C12,-9 8,-4 4,2Z" />
                <path d="M0,-36 C8,-26 9,-13 0,-3 C-9,-13 -8,-26 0,-36Z" />
                <ellipse cx="0" cy="2" rx="9" ry="4" />
              </g>
              <path d="M0,-30 C3,-22 3,-13 0,-7" fill="none" stroke="rgba(130,100,70,0.3)" strokeWidth={0.8} />
            </g>
          )}
        </svg>
      )}
    </div>
  );
};
