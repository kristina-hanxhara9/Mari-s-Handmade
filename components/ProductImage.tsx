import { useState, type ReactNode } from 'react';
import { Flame } from 'lucide-react';
import { FramedPicture, type FrameStyle } from './FramedPicture';

/**
 * Product photo in one of the site's ivory frames (see FramedPicture).
 * Products without a photo, or with a broken one, get the same "coming soon" arch,
 * so every card in a grid looks alike.
 */
export const ProductImage = ({
  src,
  alt,
  label,
  frame = 'pearl',
  children,
}: {
  src?: string;
  alt: string;
  label?: string;
  frame?: FrameStyle;
  children?: ReactNode;
}) => {
  const [failed, setFailed] = useState(false);
  const showPhoto = !!src && !failed;

  return (
    <FramedPicture
      frame={frame}
      className="w-full aspect-[3/4] transition-transform duration-700 group-hover:-translate-y-2"
      pictureClassName="bg-gradient-to-b from-[#FCFBF9] via-[#F9ECEC] to-[#F4DCDC]"
    >
          {showPhoto ? (
            <>
              <img
                src={src}
                alt={alt}
                loading="lazy"
                onError={() => setFailed(true)}
                className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
              />
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/10 via-transparent to-white/10" aria-hidden="true" />
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-6" role="img" aria-label={`${alt}: photo coming soon`}>
              <div className="w-16 h-16 rounded-full border border-mari-gold/40 bg-white/60 flex items-center justify-center">
                <Flame className="w-7 h-7 text-mari-gold/80" strokeWidth={1.25} aria-hidden="true" />
              </div>
              <p className="font-display italic text-lg text-mari-ink/70">Photo coming soon</p>
            </div>
          )}
          {label && (
            <span className={`absolute top-6 md:top-8 inset-x-0 text-center text-[8px] md:text-[9px] font-bold uppercase tracking-[0.4em] ${showPhoto ? 'text-white/85 drop-shadow-md' : 'text-mari-gold/80'}`}>
              {label}
            </span>
          )}
          {children}
    </FramedPicture>
  );
};
