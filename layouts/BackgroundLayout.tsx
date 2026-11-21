
import React from 'react';
import { useAdminStore } from '../store';

interface BackgroundLayoutProps {
  children: React.ReactNode;
}

export const BackgroundLayout: React.FC<BackgroundLayoutProps> = ({ children }) => {
  const { siteConfig } = useAdminStore();

  return (
    <div className="bg-layout-wrapper">
      <div className="bg-layout-photo" style={{ backgroundImage: `url(${siteConfig.heroBackground})` }} aria-hidden="true" />
      <div className="bg-layout-overlay" aria-hidden="true" />
      <div className="bg-layout-grain" aria-hidden="true" />
      <div className="bg-layout-content">
        {children}
      </div>
    </div>
  );
};
