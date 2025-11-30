import React, { useRef, useEffect, useCallback, forwardRef } from 'react';
import { ListMusic, Play, Loader2 } from 'lucide-react';
import { useMusicPlayer, Track } from '@/context/MusicPlayerContext';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSidebar } from '@/context/SidebarContext';
import { useIsMobile } from '@/hooks/use-mobile';
import AddTrackDialog from './AddTrackDialog';
import DeleteTrackDialog from './DeleteTrackDialog';

interface TrackItemProps {
  track: Track;
}

const TrackItem = forwardRef<HTMLDivElement, TrackItemProps>(({ track }, ref) => {
  const { currentTrack, setCurrentTrack, setIsPlaying, isPlaying } = useMusicPlayer();
  const { setIsSidebarOpen } = useSidebar();
  const isMobile = useIsMobile();
  
  // Use dbId for comparison if available, otherwise fall back to YouTube ID
  const isActive = currentTrack?.dbId === track.dbId || (!currentTrack?.dbId && currentTrack?.id === track.id);

  const handleTrackClick = () => {
    setCurrentTrack(track);
    setIsPlaying(true);
    
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors group relative",
        isActive 
          ? "bg-primary/10 text-primary font-semibold" // Subtle background, bright text
          : "hover:bg-secondary/50 text-foreground" // Subtle hover
      )}
      onClick={handleTrackClick}
    >
      <div className="flex items-center space-x-3 overflow-hidden flex-1 min-w-0">
        {isActive && isPlaying ? (
          <Play className="h-4 w-4 fill-primary text-primary flex-shrink-0" />
        ) : (
          <ListMusic className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
        <div className="truncate flex-1">
          <p className="text-sm truncate">{track.title}</p>
          <p className={cn("text-xs truncate", isActive ? "text-primary/80" : "text-muted-foreground")}>{track.artist}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 flex-shrink-0">
        <span className={cn("text-xs ml-4", isActive ? "text-primary/80" : "text-muted-foreground")}>
          {track.duration}
        </span>
        
        {/* Delete Button - only show if track has a dbId (i.e., it's persisted) */}
        {track.dbId && <DeleteTrackDialog track={track} />}
      </div>
    </div>
  );
});

TrackItem.displayName = "TrackItem";

const PlaylistSidebar = () => {
  const { currentPlaylist, currentTrack, isLoadingData } = useMusicPlayer();
  
  // Ref for the ScrollArea container
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  // Map to store refs for individual track items
  const trackRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Helper function to set refs dynamically
  const setTrackRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) {
      trackRefs.current.set(id, el);
    } else {
      trackRefs.current.delete(id);
    }
  }, []);

  // Effect to scroll to the current track when it changes
  useEffect(() => {
    if (currentTrack && scrollAreaRef.current) {
      // Use dbId if available, otherwise fall back to YouTube ID
      const trackIdKey = currentTrack.dbId || currentTrack.id;
      const trackElement = trackRefs.current.get(trackIdKey);
      
      if (trackElement) {
        trackElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
        });
      }
    }
  }, [currentTrack]);
  
  if (isLoadingData) {
      return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-background text-foreground p-4 border-r border-border">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm mt-2 text-muted-foreground">Loading...</p>
          </div>
      );
  }
  
  if (!currentPlaylist) {
      // Should not happen if AuthProvider is working, but good fallback
      return (
          <div className="w-full h-full flex flex-col bg-background text-foreground p-4 border-r border-border">
              <h2 className="text-2xl font-bold mb-6 text-primary">Dyad Music</h2>
              <p className="text-sm text-muted-foreground">Please log in to view your playlist.</p>
          </div>
      );
  }


  return (
    <div className="w-full h-full flex flex-col bg-background text-foreground p-4 border-r border-border">
      <h2 className="text-2xl font-bold mb-6 text-primary">Dyad Music</h2>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-foreground">Playlists</h3>
        <div className="p-3 rounded-lg bg-secondary text-secondary-foreground font-medium">
            {currentPlaylist.name}
        </div>
      </div>
      
      <div className="mb-4">
        <AddTrackDialog />
      </div>

      <h3 className="text-lg font-semibold mb-2 mt-4 text-foreground">Tracks ({currentPlaylist.tracks.length})</h3>

      <ScrollArea className="flex-grow h-0" ref={scrollAreaRef as React.RefObject<HTMLDivElement>}>
        <div className="space-y-1 pr-4">
          {currentPlaylist.tracks.map((track) => (
            <TrackItem 
              key={track.dbId || track.id} // Use dbId as primary key
              track={track} 
              ref={(el) => setTrackRef(track.dbId || track.id, el)}
            />
          ))}
          {currentPlaylist.tracks.length === 0 && (
              <p className="text-sm text-muted-foreground p-3">No tracks found. Add one above!</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PlaylistSidebar;