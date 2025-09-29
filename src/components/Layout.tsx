import React from 'react';
import { MainNavbar } from './MainNavbar';

interface LayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showNavbar = true 
}) => {
  return (
    <div className="min-h-screen">
      {showNavbar && <MainNavbar />}
      <main className="relative">
        {children}
      </main>
    </div>
  );
};