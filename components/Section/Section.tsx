
import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  variant?: 'transparent' | 'soft' | 'card';
  className?: string;
  id?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  backgroundElement?: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({ 
  children, 
  variant = 'transparent', 
  className = '', 
  id,
  backgroundImage,
  backgroundSize = 'cover',
  backgroundPosition = 'center',
  backgroundRepeat = 'no-repeat',
  backgroundElement
}) => {
  const toneClass = `tone-${variant}`;

  // Consistent section spacing
  const style: React.CSSProperties = {
    paddingTop: '100px',
    paddingBottom: '100px',
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
    backgroundSize: backgroundImage ? backgroundSize : undefined,
    backgroundPosition: backgroundImage ? backgroundPosition : undefined,
    backgroundRepeat: backgroundImage ? backgroundRepeat : undefined,
  };

  return (
    <section 
      id={id} 
      className={`section-container ${toneClass} ${className}`}
      style={style}
    >
      {backgroundElement && (
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          {backgroundElement}
        </div>
      )}
      <div className="section-inner relative z-10">
        {children}
      </div>
    </section>
  );
};
