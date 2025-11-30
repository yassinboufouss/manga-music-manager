import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useMusicPlayer, Track } from '@/context/MusicPlayerContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import SortableTrackItem from './SortableTrackItem';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { reorderArray } from '@/lib/dnd-utils';

const TrackList: React.FC = () => {
  const { 
    currentPlaylist, 
    currentTrack, 
    isLoadingData, 
    updateTrackOrder, 
    selectedPlaylistId 
  } = useMusicPlayer();
  
  // Local state for optimistic UI updates during drag
  const [tracks, setTracks] = useState<Track[]>(currentPlaylist?.tracks || []);
  
  // Sync local state when playlist data changes (after fetch/mutation or playlist switch)
  useEffect(() => {
    // Only update local tracks if the currentPlaylist is loaded and tracks are different
    if (currentPlaylist?.tracks) {
      setTracks(currentPlaylist.tracks);
    } else if (selectedPlaylistId && !currentPlaylist) {
      // If a playlist is selected but tracks haven't loaded yet (or it's empty), clear local tracks
      setTracks([]);
    }
  }, [currentPlaylist, selectedPlaylistId]);

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
  
  const sortableIds = tracks.map(t => t.dbId!);

  return (
    <>
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
              {tracks.length === 0 && !isLoadingData && (
                  <p className="text-sm text-muted-foreground p-3">No tracks found. Add one above!</p>
              )}
              {isLoadingData && tracks.length === 0 && (
                  <div className="flex items-center justify-center p-3">
                      <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
                      <span className="text-sm text-muted-foreground">Loading tracks...</span>
                  </div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </ScrollArea>
    </>
  );
};

export default TrackList;