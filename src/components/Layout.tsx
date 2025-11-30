import React, { ReactNode } from 'react';
import PlaylistSidebar from './PlaylistSidebar';
import MusicPlayer from './MusicPlayer';
import { useSidebar } from '@/context/SidebarContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Main Content Area (Sidebar + Page Content) */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar */}
        <aside 
          className={cn(
            "flex-shrink-0 h-full transition-all duration-300 ease-in-out bg-background border-r border-border",
            isSidebarOpen ? "w-64" : "w-0",
            isMobile && isSidebarOpen ? "absolute inset-y-0 left-0 z-40" : "relative"
          )}
        >
          {isSidebarOpen && <PlaylistSidebar />}
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-20 bg-background relative">
          
          {/* Header */}
          <Header />
          
          {/* Page Content */}
          {children}
        </main>
      </div>

      {/* Persistent Player Bar */}
      <MusicPlayer />
      
      {/* Overlay for mobile when sidebar is open */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30" 
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default Layout;