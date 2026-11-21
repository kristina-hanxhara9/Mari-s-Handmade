import { useEffect, useRef } from 'react';

/**
 * Muted looping video that only downloads when it is about to scroll into view,
 * and pauses while it is off screen so scrolling stays smooth.
 */
export const LazyVideo = ({ src, poster, className = '' }: { src: string; poster?: string; className?: string }) => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!video.src) video.src = src;
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: '300px 0px' }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [src]);

  return (
    <video
      ref={ref}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      className={className}
    />
  );
};
