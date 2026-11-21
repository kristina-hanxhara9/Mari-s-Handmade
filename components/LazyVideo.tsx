import { useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';

/**
 * Muted looping video that only downloads when it is about to scroll into view,
 * and pauses while it is off screen so scrolling stays smooth.
 *
 * Safari only lets a video start on its own when the `muted` attribute is present
 * in the page, and React does not write that attribute, so it is set by hand here.
 * If the phone still refuses (for example in Low Power Mode), a play button appears.
 */
export const LazyVideo = ({ src, poster, className = '' }: { src: string; poster?: string; className?: string }) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');

    const tryPlay = () => {
      video.play().then(() => setBlocked(false)).catch(() => setBlocked(true));
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!video.getAttribute('src')) {
            video.src = src;
            video.load();
          }
          tryPlay();
        } else if (!video.paused) {
          video.pause();
        }
      },
      { rootMargin: '300px 0px' }
    );
    observer.observe(video);
    video.addEventListener('canplay', tryPlay);
    return () => {
      observer.disconnect();
      video.removeEventListener('canplay', tryPlay);
    };
  }, [src]);

  const playByHand = () => {
    const video = ref.current;
    if (!video) return;
    if (!video.getAttribute('src')) video.src = src;
    video.play().then(() => setBlocked(false)).catch(() => {});
  };

  return (
    <>
      <video
        ref={ref}
        poster={poster}
        muted
        autoPlay
        loop
        playsInline
        preload="none"
        disablePictureInPicture
        className={className}
      />
      {blocked && (
        <button
          type="button"
          onClick={playByHand}
          aria-label="Play video"
          className="absolute inset-0 flex items-center justify-center bg-black/10"
        >
          <span className="w-14 h-14 rounded-full bg-white/85 shadow-lg flex items-center justify-center">
            <Play className="w-6 h-6 text-mari-ink ml-1" fill="currentColor" />
          </span>
        </button>
      )}
    </>
  );
};
