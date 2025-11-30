import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { usePlaylistData } from '@/hooks/use-playlist-data';
import { showSuccess, showError } from '@/utils/toast';
import { Loader2 } from 'lucide-react';

// 1. Define types
export interface Track {
  dbId?: string; // Database UUID (optional for new tracks before insertion)
  id: string; // YouTube video ID
  title: string;
  artist: string;
  duration: string; // e.g., "3:45"
  orderIndex: number; // Added for reordering
}

export interface Playlist {
  id: string; // Database UUID
  name: string;
  tracks: Track[];
}

// 2. Define Context State
interface MusicPlayerContextType {
  currentPlaylist: Playlist | null;
  currentTrack: Track | null;
  setCurrentTrack: (track: Track) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  addTrackToPlaylist: (track: Omit<Track, 'dbId' | 'orderIndex'>) => Promise<void>;
  deleteTrack: (trackDbId: string) => Promise<void>;
  updateTrackOrder: (tracks: Track[]) => Promise<void>;
  isLoadingData: boolean;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

// 3. Provider Component
interface MusicPlayerProviderProps {
  children: ReactNode;
}

export const MusicPlayerProvider = ({ children }: MusicPlayerProviderProps) => {
  const { playlistQuery, addTrackMutation, deleteTrackMutation, updateTrackOrderMutation } = usePlaylistData();
  
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const isLoadingData = playlistQuery.isLoading || playlistQuery.isFetching;

  // Sync data from query result to local state
  useEffect(() => {
    if (playlistQuery.data) {
      const newPlaylist = playlistQuery.data;
      setCurrentPlaylist(newPlaylist);
      
      const currentTrackStillExists = currentTrack && newPlaylist.tracks.some(t => t.dbId === currentTrack.dbId);

      if (!currentTrackStillExists) {
          // If the current track was deleted or never set, select the first track if available
          const nextTrack = newPlaylist.tracks[0] || null;
          setCurrentTrack(nextTrack);
          if (!nextTrack) {
              setIsPlaying(false);
          }
      }
      
      // If no track was selected initially, select the first one
      if (!currentTrack && newPlaylist.tracks.length > 0) {
        setCurrentTrack(newPlaylist.tracks[0]);
      }
    }
  }, [playlistQuery.data, currentTrack]);


  const addTrackToPlaylist = async (track: Omit<Track, 'dbId' | 'orderIndex'>) => {
    try {
      await addTrackMutation.mutateAsync(track);
      showSuccess(`Track "${track.title}" added successfully!`);
    } catch (error) {
      console.error("Error adding track:", error);
      showError("Failed to add track to playlist.");
      throw error;
    }
  };
  
  const deleteTrack = async (trackDbId: string) => {
    try {
      await deleteTrackMutation.mutateAsync(trackDbId);
      showSuccess("Track removed successfully!");
    } catch (error) {
      console.error("Error deleting track:", error);
      showError("Failed to remove track from playlist.");
      throw error;
    }
  };
  
  const updateTrackOrder = async (tracks: Track[]) => {
      const updates = tracks.map((track, index) => ({
          dbId: track.dbId!,
          orderIndex: index + 1, // Use 1-based indexing for order
      }));
      
      try {
          await updateTrackOrderMutation.mutateAsync(updates);
          // No success toast here, as it might fire too often during dragging.
      } catch (error) {
          console.error("Error updating track order:", error);
          showError("Failed to save new playlist order.");
          throw error;
      }
  };

  const value = {
    currentPlaylist,
    currentTrack,
    setCurrentTrack,
    isPlaying,
    setIsPlaying,
    addTrackToPlaylist,
    deleteTrack,
    updateTrackOrder,
    isLoadingData,
  };
  
  if (playlistQuery.isError) {
      return <div className="p-8 text-center text-destructive">Error loading playlist data: {playlistQuery.error.message}</div>;
  }

  if (isLoadingData && !currentPlaylist) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
    </MusicPlayerContext.Provider>
  );
};

// 4. Custom Hook
export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};