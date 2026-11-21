import { useState, type ReactNode } from 'react';
import { Flame } from 'lucide-react';

/**
 * Product photo in the site's arch frame (teal-blue gradient, like the video frame).
 * Products without a photo, or with a broken one, get the same "coming soon" arch,
 * so every card in a grid looks alike.
 */
export const ProductImage = ({
  src,
  alt,
  label,
  children,
}: {
  src?: string;
  alt: string;
  label?: string;
  children?: ReactNode;
}) => {
  const [failed, setFailed] = useState(false);
  const showPhoto = !!src && !failed;

  return (
    <div
      className="relative arch-top p-[4px] md:p-[5px] shadow-[0_30px_60px_-28px_rgba(74,144,164,0.55)] transition-all duration-700 group-hover:-translate-y-2 group-hover:shadow-[0_40px_70px_-28px_rgba(74,144,164,0.7)]"
      style={{ background: 'linear-gradient(135deg, rgba(74,144,164,0.55), rgba(168,208,219,0.45), rgba(74,144,164,0.45))' }}
    >
      <div className="arch-top p-[6px] md:p-[8px] bg-[#FCFBF9]/85">
        <div className="relative aspect-[3/4] arch-top overflow-hidden ring-1 ring-mari-teal/30 bg-gradient-to-b from-[#FCFBF9] via-[#F9ECEC] to-[#F4DCDC]">
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
        </div>
      </div>
    </div>
  );
};
