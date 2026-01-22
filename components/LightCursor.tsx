
import React, { useEffect, useRef, useState } from 'react';

/**
 * Simple custom cursor that emits a soft light and pulses on click/press.
 * It does not capture pointer events; it only follows the mouse/touch.
 */
export const LightCursor = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      const point = 'touches' in e ? e.touches[0] : (e as MouseEvent);
      const targetX = point.clientX;
      const targetY = point.clientY;
      setVisible(true);

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(() => {
        setPos({ x: targetX, y: targetY });
      });
    };

    const handleDown = () => {
      setActive(true);
      window.setTimeout(() => setActive(false), 180);
    };

    const handleLeave = () => setVisible(false);

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('mousedown', handleDown);
    window.addEventListener('touchstart', handleDown);
    window.addEventListener('mouseleave', handleLeave);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('touchstart', handleDown);
      window.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] hidden md:block">
      <div
        className="absolute rounded-full bg-[#ffedc2]/40 backdrop-blur-[1px] shadow-[0_0_35px_rgba(255,199,90,0.45)] transition-transform duration-150 ease-out mix-blend-screen"
        style={{
          width: 48,
          height: 48,
          transform: `translate3d(${pos.x - 24}px, ${pos.y - 24}px, 0) scale(${active ? 1.2 : 1})`,
          opacity: 0.7,
        }}
      />
      <div
        className="absolute rounded-full bg-[#ffd76a]/90 shadow-[0_0_25px_rgba(255,199,90,0.8)] transition-transform duration-150 ease-out mix-blend-screen"
        style={{
          width: 14,
          height: 14,
          transform: `translate3d(${pos.x - 7}px, ${pos.y - 7}px, 0) scale(${active ? 1.4 : 1})`,
          opacity: 0.9,
        }}
      />
    </div>
  );
};
