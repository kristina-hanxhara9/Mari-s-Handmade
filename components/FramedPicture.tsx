import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

/**
 * Ivory picture frames drawn to the exact size of the picture:
 *  - "pearl":  rounded arch lined with pearls (same pearls as the cameo cards)
 *  - "ogee":   curved, bell-shaped top with a thin gold inner line
 *  - "ornate": the ogee frame with a carved ornament at the top
 *  - "cameo":  wide rounded panel with a raised, wavy top edge and a pearl row
 *  - "video":  the cameo shape with a thin blue frame and no pearls
 * The frame is an SVG drawn over the picture; the picture is clipped to the frame's opening.
 */
export type FrameStyle = 'pearl' | 'ogee' | 'ornate' | 'cameo' | 'video';

type Box = { x: number; y: number; w: number; h: number };

const f = (n: number) => n.toFixed(1);

/** Arch: half-ellipse top, straight sides, softly rounded bottom corners. */
function archPath({ x, y, w, h }: Box, bottomRadius: number) {
  const rx = w / 2;
  const ry = Math.min(w * 0.5, h * 0.45);
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

/** Cameo: rounded panel whose top edge rises into a gentle raised middle. */
function cameoPath({ x, y, w, h }: Box, radius: number) {
  const bump = Math.min(h * 0.07, w * 0.045);
  const r = Math.min(radius, h / 4, w / 6);
  const X = (u: number) => f(x + u * w);
  return [
    `M${f(x)},${f(y + bump + r)}`,
    `Q${f(x)},${f(y + bump)} ${f(x + r)},${f(y + bump)}`,
    `L${X(0.2)},${f(y + bump)}`,
    `C${X(0.27)},${f(y + bump)} ${X(0.27)},${f(y)} ${X(0.34)},${f(y)}`,
    `L${X(0.66)},${f(y)}`,
    `C${X(0.73)},${f(y)} ${X(0.73)},${f(y + bump)} ${X(0.8)},${f(y + bump)}`,
    `L${f(x + w - r)},${f(y + bump)}`,
    `Q${f(x + w)},${f(y + bump)} ${f(x + w)},${f(y + bump + r)}`,
    `L${f(x + w)},${f(y + h - r)}`,
    `Q${f(x + w)},${f(y + h)} ${f(x + w - r)},${f(y + h)}`,
    `L${f(x + r)},${f(y + h)}`,
    `Q${f(x)},${f(y + h)} ${f(x)},${f(y + h - r)}`,
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
  const isVideo = frame === 'video';
  const isCameo = frame === 'cameo';
  const isArch = frame === 'pearl';
  const isPearl = isArch || isCameo; // frames lined with pearls
  const thickness = isVideo
    ? 4
    : isCameo
    ? Math.max(11, Math.min(15, w * 0.035))
    : isArch
      ? Math.max(10, Math.min(15, w * 0.04))
      : Math.max(11, Math.min(16, w * 0.045));
  // Cream border between the frame and the photo, so the photo sits further in.
  const gap = isVideo ? 0 : isCameo ? Math.max(8, Math.min(12, w * 0.028)) : Math.max(6, Math.min(14, w * 0.035));
  const shape = isCameo || isVideo ? cameoPath : isArch ? archPath : ogeePath;
  const outerR = isVideo ? 24 : isCameo ? thickness * 2.6 : thickness * 1.6;
  const innerR = isVideo ? 20 : isCameo ? thickness * 1.8 : thickness * 0.8;
  const photoR = Math.max(4, innerR - gap * 0.5);
  const outerBox: Box = { x: 0, y: 0, w, h };
  const innerBox = inset(outerBox, thickness);
  const photoBox = inset(innerBox, gap);
  const outer = ready ? shape(outerBox, outerR) : '';
  const inner = ready ? shape(innerBox, innerR) : '';
  const photo = ready ? shape(photoBox, photoR) : '';
  const innerClip = ready ? shape({ ...innerBox, x: 0, y: 0 }, innerR) : '';
  const photoClip = ready ? shape({ ...photoBox, x: 0, y: 0 }, photoR) : '';
  const pearlLine = ready && isPearl ? shape(inset(outerBox, thickness / 2), (outerR + innerR) / 2) : '';
  const goldLine = ready && (frame === 'ogee' || frame === 'ornate') ? shape(inset(outerBox, thickness + 4), thickness * 0.6) : '';
  const pearl = isPearl ? Math.max(3.5, Math.min(5.5, Math.max(w * 0.013, thickness * 0.36))) : 6;
  const pearlStep = pearl * 1.55;
  const frameFill = isVideo ? `url(#blue-${id})` : `url(#ivory-${id})`;

  return (
    <div ref={ref} className={`relative ${frame === 'ornate' ? 'mt-6' : ''} ${className}`}>
      {/* Cream border inside the frame */}
      {gap > 0 && (
        <div
          className="absolute bg-[#FBF6F1]"
          style={{ inset: thickness, clipPath: ready ? `path('${innerClip}')` : undefined }}
        />
      )}
      {/* The picture, clipped to the opening */}
      <div
        className={`absolute overflow-hidden ${pictureClassName}`}
        style={{
          inset: thickness + gap,
          clipPath: ready ? `path('${photoClip}')` : undefined,
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
            <linearGradient id={`blue-${id}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(74,144,164,0.6)" />
              <stop offset="50%" stopColor="rgba(168,208,219,0.55)" />
              <stop offset="100%" stopColor="rgba(74,144,164,0.55)" />
            </linearGradient>
            <clipPath id={`open-${id}`}>
              <path d={inner} />
            </clipPath>
            <filter id={`soft-${id}`} x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>

          {/* Shadow cast by the frame inside the opening */}
          <path d={inner} fill="none" stroke={isVideo ? 'rgba(40,30,20,0.12)' : gap > 0 ? 'rgba(40,30,20,0.14)' : 'rgba(40,30,20,0.28)'} strokeWidth={10} filter={`url(#soft-${id})`} clipPath={`url(#open-${id})`} />
          {gap > 0 && <path d={photo} fill="none" stroke="rgba(150,115,85,0.28)" strokeWidth={1} />}

          {/* Frame body */}
          <path d={`${outer} ${inner}`} fillRule="evenodd" fill={frameFill} />
          {!isVideo && (
            <>
              <path d={outer} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={1.5} />
              <path d={outer} fill="none" stroke="rgba(150,120,90,0.18)" strokeWidth={1} transform="translate(0.6 0.8)" />
              <path d={inner} fill="none" stroke="rgba(130,100,70,0.35)" strokeWidth={1.2} />
              <path d={inner} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={1} transform="translate(-0.8 -0.8)" />
            </>
          )}

          {isPearl && (
            <g strokeLinecap="round" fill="none">
              <path d={pearlLine} stroke="rgba(140,105,75,0.45)" strokeWidth={pearl + 1} strokeDasharray={`0 ${pearlStep}`} transform="translate(0.5 0.9)" />
              <path d={pearlLine} stroke="#EADBC8" strokeWidth={pearl} strokeDasharray={`0 ${pearlStep}`} />
              <path d={pearlLine} stroke="#FFFFFF" strokeWidth={pearl * 0.42} strokeDasharray={`0 ${pearlStep}`} transform={`translate(${-pearl * 0.18} ${-pearl * 0.2})`} />
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
