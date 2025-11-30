import React, { useRef, useEffect, useCallback, useState } from 'react';
import { ListMusic, Play, Loader2 } from 'lucide-react';
import { useMusicPlayer, Track } from '@/context/MusicPlayerContext';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSidebar } from '@/context/SidebarContext';
import AddTrackDialog from './AddTrackDialog';
import SortableTrackItem from './SortableTrackItem';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { reorderArray } from '@/lib/dnd-utils';
import RenamePlaylistDialog from './RenamePlaylistDialog';

const PlaylistSidebar = () => {
  const { currentPlaylist, currentTrack, isLoadingData, updateTrackOrder } = useMusicPlayer();
  
  // Local state for optimistic UI updates during drag
  const [tracks, setTracks] = useState<Track[]>(currentPlaylist?.tracks || []);
  
  // Sync local state when playlist data changes (after fetch/mutation)
  useEffect(() => {
    if (currentPlaylist?.tracks) {
      setTracks(currentPlaylist.tracks);
    }
  }, [currentPlaylist?.tracks]);

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
      const trackIdKey = currentTrack.dbId;
      if (trackIdKey) {
        const trackElement = trackRefs.current.get(trackIdKey);
        
        if (trackElement) {
          trackElement.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
          });
        }
      }
    }
  }, [currentTrack]);
  
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const activeId = active.id as string;
      const overId = over?.id as string;
      
      const newTracks = reorderArray(tracks, activeId, overId, (t) => t.dbId!);
      
      // 1. Optimistic UI update
      setTracks(newTracks);
      
      // 2. Persist order to database
      try {
        await updateTrackOrder(newTracks);
      } catch (e) {
        // If persistence fails, revert to the last known good state (fetched data)
        setTracks(currentPlaylist?.tracks || []);
      }
    }
  };
  
  if (isLoadingData) {
      return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-background text-foreground p-4 border-r border-border">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm mt-2 text-muted-foreground">Loading...</p>
          </div>
      );
  }
  
  if (!currentPlaylist) {
      return (
          <div className="w-full h-full flex flex-col bg-background text-foreground p-4 border-r border-border">
              <h2 className="text-2xl font-bold mb-6 text-primary">Dyad Music</h2>
              <p className="text-sm text-muted-foreground">Please log in to view your playlist.</p>
          </div>
      );
  }

  const sortableIds = tracks.map(t => t.dbId!);

  return (
    <div className="w-full h-full flex flex-col bg-background text-foreground p-4 border-r border-border">
      <h2 className="text-2xl font-bold mb-6 text-primary">Dyad Music</h2>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-foreground">Playlists</h3>
        <div className="flex items-center p-3 rounded-lg bg-secondary text-secondary-foreground font-medium">
            <span className="flex-1 truncate">{currentPlaylist.name}</span>
            <RenamePlaylistDialog />
        </div>
      </div>
      
      <div className="mb-4">
        <AddTrackDialog />
      </div>

      <h3 className="text-lg font-semibold mb-2 mt-4 text-foreground">Tracks ({tracks.length})</h3>

      <ScrollArea className="flex-grow h-0" ref={scrollAreaRef as React.RefObject<HTMLDivElement>}>
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortableIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1 pr-4">
              {tracks.map((track) => (
                <SortableTrackItem 
                  key={track.dbId} 
                  track={track} 
                  ref={(el) => setTrackRef(track.dbId!, el)}
                />
              ))}
              {tracks.length === 0 && (
                  <p className="text-sm text-muted-foreground p-3">No tracks found. Add one above!</p>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </ScrollArea>
    </div>
  );
};

export default PlaylistSidebar;