import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useMusicPlayer } from '@/context/MusicPlayerContext';
import AddTrackDialog from './AddTrackDialog';
import ClearPlaylistDialog from './ClearPlaylistDialog';
import PlaylistSelector from './PlaylistSelector';
import PlaylistHeaderActions from './PlaylistHeaderActions';
import TrackList from './TrackList';
import { Input } from '@/components/ui/input';

const PlaylistSidebar = () => {
  const { currentPlaylist, isLoadingData, selectedPlaylistId } = useMusicPlayer();
  const [searchTerm, setSearchTerm] = useState('');
  
  if (isLoadingData && !currentPlaylist) {
      return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-background text-foreground p-4 border-r border-border">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm mt-2 text-muted-foreground">Loading...</p>
          </div>
      );
  }
  
  if (!selectedPlaylistId) {
      // This state should ideally be brief, handled by the context initializing the first playlist
      return (
          <div className="w-full h-full flex flex-col bg-background text-foreground p-4 border-r border-border">
              <h2 className="text-2xl font-bold mb-6 text-primary">Dyad Music</h2>
              <PlaylistSelector />
          </div>
      );
  }

  return (
    <div className="w-full h-full flex flex-col bg-background text-foreground p-4 border-r border-border">
      
      <div className="mb-4">
        <PlaylistSelector />
      </div>
      
      {/* Current Playlist Info and Actions */}
      <div className="mb-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-foreground truncate">
                {currentPlaylist?.name || "Loading Playlist..."}
            </h3>
            {currentPlaylist && <PlaylistHeaderActions />}
        </div>
        <AddTrackDialog />
      </div>
      
      {/* Search Input */}
      {currentPlaylist && currentPlaylist.tracks.length > 0 && (
        <div className="mb-4">
          <Input 
            placeholder="Search tracks..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
      )}

      {/* Tracks List (Scrollable Area) */}
      <div className="flex-grow overflow-y-auto">
        <TrackList searchTerm={searchTerm} />
      </div>
      
      <div className="mt-4 pt-4 border-t border-border space-y-2">
        <ClearPlaylistDialog />
      </div>
    </div>
  );
};

export default PlaylistSidebar;