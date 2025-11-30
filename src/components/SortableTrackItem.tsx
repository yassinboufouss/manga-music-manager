import React, { forwardRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Menu } from 'lucide-react';
import { Track } from '@/context/MusicPlayerContext';
import { Button } from './ui/button';
import TrackListItem from './TrackListItem';

interface SortableTrackItemProps {
  track: Track;
}

const SortableTrackItem = forwardRef<HTMLDivElement, SortableTrackItemProps>(({ track }, ref) => {
  
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
  };
  
  const dragHandle = (
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
  );

  return (
    <TrackListItem
      ref={setNodeRef}
      track={track}
      dragHandle={dragHandle}
      isDragging={isDragging}
      className="cursor-grab"
      style={style}
    />
  );
});

SortableTrackItem.displayName = "SortableTrackItem";

export default SortableTrackItem;