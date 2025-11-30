import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useMusicPlayer, Track } from '@/context/MusicPlayerContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import SortableTrackItem from './SortableTrackItem';
import TrackListItem from './TrackListItem';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { reorderArray } from '@/lib/dnd-utils';

interface TrackListProps {
  searchTerm: string;
}

const TrackList: React.FC<TrackListProps> = ({ searchTerm }) => {
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

  // --- Filtering Logic ---
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const isSearchActive = normalizedSearchTerm.length > 0;
  
  const filteredTracks = useMemo(() => {
    if (!isSearchActive) {
      return tracks;
    }
    return tracks.filter(track => 
      track.title.toLowerCase().includes(normalizedSearchTerm) ||
      track.artist.toLowerCase().includes(normalizedSearchTerm)
    );
  }, [tracks, normalizedSearchTerm, isSearchActive]);
  
  // --- Drag and Drop / Scroll Logic ---
  
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

  // Effect to scroll to the current track when it changes (only if not searching)
  useEffect(() => {
    if (currentTrack && scrollAreaRef.current && !isSearchActive) {
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
  }, [currentTrack, isSearchActive]);
  
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const activeId = active.id as string;
      const overId = over?.id as string;
      
      // Reorder the *full* tracks array
      const newTracks = reorderArray(tracks, activeId, overId, (t) => t.dbId!);
      
      // 1. Optimistic UI update (update the full list)
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
  const tracksToDisplay = isSearchActive ? filteredTracks : tracks;

  const renderTrackList = () => {
    if (isSearchActive) {
      if (filteredTracks.length === 0) {
        return <p className="text-sm text-muted-foreground p-3">No tracks match "{searchTerm}".</p>;
      }
      
      // Render filtered list using TrackListItem (non-sortable)
      return (
        <div className="space-y-1 pr-4">
          {filteredTracks.map((track) => (
            <TrackListItem 
              key={track.dbId} 
              track={track} 
              ref={(el) => setTrackRef(track.dbId!, el)}
              className="cursor-pointer"
            />
          ))}
        </div>
      );
    }
    
    // Render full list with DND context using SortableTrackItem
    return (
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
          </div>
        </SortableContext>
      </DndContext>
    );
  };

  return (
    <>
      <h3 className="text-lg font-semibold mb-2 mt-4 text-foreground">
        Tracks ({tracksToDisplay.length})
      </h3>
      <ScrollArea className="flex-grow h-0" ref={scrollAreaRef as React.RefObject<HTMLDivElement>}>
        
        {tracks.length === 0 && !isLoadingData && !isSearchActive && (
            <p className="text-sm text-muted-foreground p-3">No tracks found. Add one above!</p>
        )}
        {isLoadingData && tracks.length === 0 && (
            <div className="flex items-center justify-center p-3">
                <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
                <span className="text-sm text-muted-foreground">Loading tracks...</span>
            </div>
        )}
        
        {/* Render the appropriate list based on search state */}
        {!isLoadingData && renderTrackList()}
        
      </ScrollArea>
    </>
  );
};

export default TrackList;