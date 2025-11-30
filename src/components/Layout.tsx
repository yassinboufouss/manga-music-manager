import React, { ReactNode } from 'react';
import PlaylistSidebar from './PlaylistSidebar';
import MusicPlayer from './MusicPlayer';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Main Content Area (Sidebar + Page Content) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 h-full">
          <PlaylistSidebar />
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-20 bg-background">
          {children}
        </main>
      </div>

      {/* Persistent Player Bar */}
      <MusicPlayer />
    </div>
  );
};

export default Layout;