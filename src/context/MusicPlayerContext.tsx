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
  playlists: Omit<Playlist, 'tracks'>[] | null; // List of all playlists (metadata only)
  currentPlaylist: Playlist | null;
  currentTrack: Track | null;
  setCurrentTrack: (track: Track) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  
  selectedPlaylistId: string | null;
  setSelectedPlaylistId: (id: string) => void;
  createPlaylist: (name: string) => Promise<void>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  
  addTrackToPlaylist: (track: Omit<Track, 'dbId' | 'orderIndex'>) => Promise<void>;
  deleteTrack: (trackDbId: string) => Promise<void>;
  deleteAllTracks: () => Promise<void>;
  updateTrackOrder: (tracks: Track[]) => Promise<void>;
  isLoadingData: boolean;
  
  // New playback controls
  isLooping: boolean;
  setIsLooping: React.Dispatch<React.SetStateAction<boolean>>; // Fixed type
  isAutoplayEnabled: boolean;
  setIsAutoplayEnabled: React.Dispatch<React.SetStateAction<boolean>>; // Fixed type
  playNext: () => void;
  playPrevious: () => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

// 3. Provider Component
interface MusicPlayerProviderProps {
  children: ReactNode;
}

export const MusicPlayerProvider = ({ children }: MusicPlayerProviderProps) => {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false); // New state
  const [isAutoplayEnabled, setIsAutoplayEnabled] = useState(true); // New state
  
  // We need a temporary state for currentPlaylist to pass to the hook for mutations
  const [currentPlaylistState, setCurrentPlaylistState] = useState<Playlist | null>(null);

  const { 
      playlists, 
      tracks, 
      isLoadingPlaylists, 
      isLoadingTracks, 
      isError, 
      error,
      addTrackMutation, 
      deleteTrackMutation, 
      deleteAllTracksMutation, 
      updateTrackOrderMutation,
      createPlaylistMutation,
      deletePlaylistMutation,
  } = usePlaylistData(selectedPlaylistId, currentPlaylistState); // Pass selected ID and current state to hook
  
  const isLoadingData = isLoadingPlaylists || isLoadingTracks;
  
  // Combine playlist metadata and tracks into the current playlist object
  const currentPlaylistMetadata = playlists?.find(p => p.id === selectedPlaylistId);
  const currentPlaylist: Playlist | null = currentPlaylistMetadata && tracks
    ? {
        id: currentPlaylistMetadata.id,
        name: currentPlaylistMetadata.name,
        tracks: tracks,
      }
    : null;
    
  // --- Playback Navigation Logic ---
  
  const playNext = React.useCallback(() => {
    if (!currentTrack || !currentPlaylist || currentPlaylist.tracks.length === 0) return;
    
    // Use dbId for reliable identification if available, otherwise fall back to YouTube ID
    const currentId = currentTrack.dbId || currentTrack.id;
    const currentIndex = currentPlaylist.tracks.findIndex(t => (t.dbId || t.id) === currentId);
    
    const nextIndex = (currentIndex + 1) % currentPlaylist.tracks.length;
    
    // If we are at the end of the playlist and autoplay is disabled, stop playback
    if (!isAutoplayEnabled && currentIndex === currentPlaylist.tracks.length - 1) {
        setCurrentTrack(currentPlaylist.tracks[currentIndex]); // Stay on the last track
        setIsPlaying(false);
        return;
    }
    
    setCurrentTrack(currentPlaylist.tracks[nextIndex]);
    setIsPlaying(true); 
  }, [currentTrack, currentPlaylist, isAutoplayEnabled]);

  const playPrevious = React.useCallback(() => {
    if (!currentTrack || !currentPlaylist || currentPlaylist.tracks.length === 0) return;
    
    const currentId = currentTrack.dbId || currentTrack.id;
    const currentIndex = currentPlaylist.tracks.findIndex(t => (t.dbId || t.id) === currentId);
    
    let previousIndex = currentIndex - 1;
    if (previousIndex < 0) {
      previousIndex = currentPlaylist.tracks.length - 1;
    }
    setCurrentTrack(currentPlaylist.tracks[previousIndex]);
    setIsPlaying(true); 
  }, [currentTrack, currentPlaylist]);


  // Effect 1: Initialize selectedPlaylistId when playlists load
  useEffect(() => {
      if (playlists && playlists.length > 0 && !selectedPlaylistId) {
          // Select the first playlist by default
          setSelectedPlaylistId(playlists[0].id);
      } else if (playlists && playlists.length === 0 && selectedPlaylistId) {
          // If all playlists were deleted, clear selection
          setSelectedPlaylistId(null);
      }
  }, [playlists, selectedPlaylistId]);

  // Effect 2: Sync currentPlaylist and manage currentTrack state
  useEffect(() => {
    setCurrentPlaylistState(currentPlaylist);
    
    if (currentPlaylist) {
      const currentTrackStillExists = currentTrack && currentPlaylist.tracks.some(t => t.dbId === currentTrack.dbId);

      if (!currentTrackStillExists) {
          // If the current track was deleted, or we switched playlists, select the first track
          const nextTrack = currentPlaylist.tracks[0] || null;
          setCurrentTrack(nextTrack);
          if (!nextTrack) {
              setIsPlaying(false);
          }
      }
      
      // If no track was selected initially, select the first one
      if (!currentTrack && currentPlaylist.tracks.length > 0) {
        setCurrentTrack(currentPlaylist.tracks[0]);
      }
    } else if (selectedPlaylistId && !isLoadingTracks) {
        // If a playlist is selected but tracks are null (e.g., empty playlist), ensure currentTrack is null
        setCurrentTrack(null);
        setIsPlaying(false);
    }
  }, [currentPlaylist, currentTrack, selectedPlaylistId, isLoadingTracks]);


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
  
  const deleteAllTracks = async () => {
      if (!selectedPlaylistId) return;
      
      try {
          await deleteAllTracksMutation.mutateAsync(selectedPlaylistId);
          showSuccess("Playlist cleared successfully!");
      } catch (error) {
          console.error("Error clearing playlist:", error);
          showError("Failed to clear playlist.");
          throw error;
      }
  };
  
  const updateTrackOrder = async (tracks: Track[]) => {
      const updates = tracks.map((track, index) => ({
          dbId: track.dbId!,
          orderIndex: index + 1,
      }));
      
      try {
          await updateTrackOrderMutation.mutateAsync(updates);
      } catch (error) {
          console.error("Error updating track order:", error);
          showError("Failed to save new playlist order.");
          throw error;
      }
  };
  
  const createPlaylist = async (name: string) => {
      try {
          const newPlaylist = await createPlaylistMutation.mutateAsync(name);
          showSuccess(`Playlist "${name}" created!`);
          // Automatically select the new playlist
          setSelectedPlaylistId(newPlaylist.id);
      } catch (error) {
          console.error("Error creating playlist:", error);
          showError("Failed to create new playlist.");
          throw error;
      }
  }
  
  const deletePlaylist = async (playlistId: string) => {
      try {
          await deletePlaylistMutation.mutateAsync(playlistId);
          showSuccess("Playlist deleted successfully!");
          
          // After deletion, automatically select the first remaining playlist
          const remainingPlaylists = playlists?.filter(p => p.id !== playlistId) || [];
          if (remainingPlaylists.length > 0) {
              setSelectedPlaylistId(remainingPlaylists[0].id);
          } else {
              setSelectedPlaylistId(null);
          }
      } catch (error) {
          console.error("Error deleting playlist:", error);
          showError("Failed to delete playlist.");
          throw error;
      }
  }

  const value = {
    playlists: playlists || null,
    selectedPlaylistId,
    setSelectedPlaylistId,
    createPlaylist,
    deletePlaylist,
    
    currentPlaylist,
    currentTrack,
    setCurrentTrack,
    isPlaying,
    setIsPlaying,
    addTrackToPlaylist,
    deleteTrack,
    deleteAllTracks,
    updateTrackOrder,
    isLoadingData,
    
    // New playback controls
    isLooping,
    setIsLooping,
    isAutoplayEnabled,
    setIsAutoplayEnabled,
    playNext,
    playPrevious,
  };
  
  if (isError) {
      return <div className="p-8 text-center text-destructive">Error loading playlist data: {error?.message}</div>;
  }

  if (isLoadingData && !currentPlaylist && !playlists) {
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