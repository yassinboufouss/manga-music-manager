import React, { forwardRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ListMusic, Play, Menu } from 'lucide-react';
import { useMusicPlayer, Track } from '@/context/MusicPlayerContext';
import { useSidebar } from '@/context/SidebarContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import DeleteTrackDialog from './DeleteTrackDialog';
import { Button } from './ui/button';

interface SortableTrackItemProps {
  track: Track;
}

const SortableTrackItem = forwardRef<HTMLDivElement, SortableTrackItemProps>(({ track }, ref) => {
  const { currentTrack, setCurrentTrack, setIsPlaying, isPlaying } = useMusicPlayer();
  const { setIsSidebarOpen } = useSidebar();
  const isMobile = useIsMobile();
  
  // Use dbId for comparison
  const isActive = currentTrack?.dbId === track.dbId;

  const handleTrackClick = () => {
    setCurrentTrack(track);
    setIsPlaying(true);
    
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: track.dbId! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center justify-between p-1 rounded-lg transition-colors group relative cursor-grab",
        isActive 
          ? "bg-primary/10 text-primary font-semibold ring-2 ring-primary/50"
          : "hover:bg-secondary/50 text-foreground",
        isDragging && "shadow-xl"
      )}
      onClick={handleTrackClick}
    >
      {/* Drag Handle */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-muted-foreground hover:text-primary cursor-grab flex-shrink-0"
        {...listeners}
        {...attributes}
        onClick={(e) => e.stopPropagation()}
      >
        <Menu className="h-4 w-4" />
      </Button>
      
      {/* Track Info */}
      <div className="flex items-center space-x-3 overflow-hidden flex-1 min-w-0 p-2">
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
      
      {/* Duration and Delete */}
      <div className="flex items-center space-x-2 flex-shrink-0 pr-2">
        <span className={cn("text-xs ml-4", isActive ? "text-primary/80" : "text-muted-foreground")}>
          {track.duration}
        </span>
        
        {/* Delete Button */}
        {track.dbId && <DeleteTrackDialog track={track} />}
      </div>
    </div>
  );
});

SortableTrackItem.displayName = "SortableTrackItem";

export default SortableTrackItem;