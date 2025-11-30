import React, { createContext, useContext, useState, ReactNode } from 'react';

// 1. Define types
export interface Track {
  id: string; // YouTube video ID
  title: string;
  artist: string;
  duration: string; // e.g., "3:45"
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
}

// 2. Mock Data (using YouTube video IDs)
const MOCK_PLAYLIST: Playlist = {
  id: 'mock-1',
  name: 'Chill Vibes',
  tracks: [
    { id: 'jfKfPfyJRdk', title: 'Lofi Study Beats', artist: 'Lofi Girl', duration: '1:00:00' },
    { id: '5qap5aO4i9A', title: 'The Less I Know The Better', artist: 'Tame Impala', duration: '3:36' },
    { id: 'eYDI8rf5F_M', title: 'Riptide', artist: 'Vance Joy', duration: '3:24' },
    { id: 'kJQP7kiw5Fk', title: 'Shape of You', artist: 'Ed Sheeran', duration: '3:53' },
    { id: 'kXYiU_JCYtU', title: 'Blinding Lights', artist: 'The Weeknd', duration: '3:20' },
  ],
};

// 3. Define Context State
interface MusicPlayerContextType {
  currentPlaylist: Playlist;
  currentTrack: Track | null;
  setCurrentTrack: (track: Track) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

// 4. Provider Component
interface MusicPlayerProviderProps {
  children: ReactNode;
}

export const MusicPlayerProvider = ({ children }: MusicPlayerProviderProps) => {
  const [currentPlaylist] = useState<Playlist>(MOCK_PLAYLIST);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(MOCK_PLAYLIST.tracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);

  const value = {
    currentPlaylist,
    currentTrack,
    setCurrentTrack,
    isPlaying,
    setIsPlaying,
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
    </MusicPlayerContext.Provider>
  );
};

// 5. Custom Hook
export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};