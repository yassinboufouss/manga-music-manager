import React, { useRef, useEffect, useCallback, forwardRef } from 'react';
import { ListMusic, Play } from 'lucide-react';
import { useMusicPlayer, Track } from '@/context/MusicPlayerContext';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSidebar } from '@/context/SidebarContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface TrackItemProps {
  track: Track;
}

const TrackItem = forwardRef<HTMLDivElement, TrackItemProps>(({ track }, ref) => {
  const { currentTrack, setCurrentTrack, setIsPlaying, isPlaying } = useMusicPlayer();
  const { setIsSidebarOpen } = useSidebar();
  const isMobile = useIsMobile();
  const isActive = currentTrack?.id === track.id;

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
        "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors",
        isActive 
          ? "bg-primary/10 text-primary font-semibold" // Subtle background, bright text
          : "hover:bg-secondary/50 text-foreground" // Subtle hover
      )}
      onClick={handleTrackClick}
    >
      <div className="flex items-center space-x-3 overflow-hidden">
        {isActive && isPlaying ? (
          <Play className="h-4 w-4 fill-primary text-primary" />
        ) : (
          <ListMusic className="h-4 w-4 text-muted-foreground" />
        )}
        <div className="truncate">
          <p className="text-sm truncate">{track.title}</p>
          <p className={cn("text-xs truncate", isActive ? "text-primary/80" : "text-muted-foreground")}>{track.artist}</p>
        </div>
      </div>
      <span className={cn("text-xs ml-4", isActive ? "text-primary/80" : "text-muted-foreground")}>
        {track.duration}
      </span>
    </div>
  );
});

TrackItem.displayName = "TrackItem";

const PlaylistSidebar = () => {
  const { currentPlaylist, currentTrack } = useMusicPlayer();
  
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
      const trackElement = trackRefs.current.get(currentTrack.id);
      
      if (trackElement) {
        // Use scrollIntoView to ensure the active track is visible
        trackElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest', // Only scrolls if the element is not fully visible
        });
      }
    }
  }, [currentTrack]);


  return (
    <div className="w-full h-full flex flex-col bg-background text-foreground p-4 border-r border-border">
      <h2 className="text-2xl font-bold mb-6 text-primary">Dyad Music</h2>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-foreground">Playlists</h3>
        <div className="p-3 rounded-lg bg-secondary text-secondary-foreground font-medium">
            {currentPlaylist.name}
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-2 mt-4 text-foreground">Tracks</h3>

      <ScrollArea className="flex-grow h-0" ref={scrollAreaRef as React.RefObject<HTMLDivElement>}>
        <div className="space-y-1 pr-4">
          {currentPlaylist.tracks.map((track) => (
            <TrackItem 
              key={track.id} 
              track={track} 
              ref={(el) => setTrackRef(track.id, el)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PlaylistSidebar;