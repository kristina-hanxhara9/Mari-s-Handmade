import { useEffect, useRef, useState } from 'react';

const SPARKS = [
  { left: '38%', delay: '0s', dur: '5.5s', size: 5 },
  { left: '46%', delay: '1.2s', dur: '6.5s', size: 4 },
  { left: '53%', delay: '2.6s', dur: '5s', size: 6 },
  { left: '60%', delay: '0.7s', dur: '7s', size: 4 },
  { left: '43%', delay: '3.4s', dur: '6s', size: 3 },
  { left: '57%', delay: '4.1s', dur: '5.8s', size: 5 },
  { left: '50%', delay: '1.9s', dur: '7.5s', size: 3 },
];

/**
 * Soft, glowing candle flame drawn with gradients, used behind the reviews.
 * It only animates transforms and opacity (cheap for the browser) and pauses off screen.
 */
export const CandleGlow = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`candle-glow absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center ${visible ? '' : 'is-paused'}`}
    >
      <div className="cg-body relative w-[240px] h-[340px] md:w-[320px] md:h-[440px]">
        {/* warm halo */}
        <div className="cg-halo absolute -inset-[45%] rounded-full" />
        {/* flame layers: outer teal and pink, warm middle, bright core */}
        <div className="cg-flame cg-outer absolute inset-x-[14%] top-[6%] bottom-[8%]" />
        <div className="cg-flame cg-mid absolute inset-x-[26%] top-[24%] bottom-[12%]" />
        <div className="cg-flame cg-core absolute inset-x-[37%] top-[46%] bottom-[16%]" />
        {/* rising sparks */}
        {SPARKS.map((s, i) => (
          <span
            key={i}
            className="cg-spark absolute bottom-[30%] rounded-full"
            style={{ left: s.left, width: s.size, height: s.size, animationDelay: s.delay, animationDuration: s.dur }}
          />
        ))}
      </div>
    </div>
  );
};
