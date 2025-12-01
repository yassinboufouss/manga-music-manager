import React, { ReactNode } from 'react';
import PlaylistSidebar from './PlaylistSidebar';
import MusicPlayer from './MusicPlayer';
import { useSidebar } from '@/context/SidebarContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import Header from './Header';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "react-resizable-panels";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isSidebarOpen, setIsSidebarOpen, toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();

  // Calculate height dynamically: 100vh - Player (80px)
  const mainAreaHeightClass = "flex-1 overflow-hidden"; 

  const renderDesktopLayout = () => (
    <ResizablePanelGroup direction="horizontal" className={mainAreaHeightClass}>
      {/* Sidebar Panel */}
      <ResizablePanel 
        defaultSize={20} 
        minSize={10} 
        collapsedSize={0}
        collapsible={true}
        onCollapse={() => setIsSidebarOpen(false)}
        onExpand={() => setIsSidebarOpen(true)}
      >
        <aside className="h-full bg-background border-r border-border">
          <PlaylistSidebar />
        </aside>
      </ResizablePanel>
      
      {/* Handle */}
      <ResizableHandle withHandle className="w-2 bg-border hover:bg-primary/50 transition-colors" />
      
      {/* Main Content Panel */}
      <ResizablePanel minSize={50}>
        <main className="h-full overflow-y-auto pb-20 bg-background relative">
          <Header />
          {children}
        </main>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
  
  const renderMobileLayout = () => (
    <div className={cn("flex flex-1 overflow-hidden", mainAreaHeightClass)}>
        {/* Sidebar (Mobile Overlay) */}
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
  );


  return (
    <div className="flex flex-col h-screen overflow-hidden">
      
      {/* Main Content Area (Sidebar + Page Content) */}
      {isMobile ? renderMobileLayout() : renderDesktopLayout()}

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