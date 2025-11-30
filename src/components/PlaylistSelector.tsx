import React, { useMemo } from 'react';
import { useMusicPlayer } from '@/context/MusicPlayerContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import CreatePlaylistDialog from './CreatePlaylistDialog';
import PlaylistListItem from './PlaylistListItem';

interface PlaylistSelectorProps {
  searchTerm: string;
}

const PlaylistSelector: React.FC<PlaylistSelectorProps> = ({ searchTerm }) => {
  const { playlists, selectedPlaylistId } = useMusicPlayer();

  // Filtering logic
  const filteredPlaylists = useMemo(() => {
    if (!playlists) return [];
    if (!searchTerm) return playlists;

    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    
    return playlists.filter(playlist => 
      playlist.name.toLowerCase().includes(normalizedSearchTerm)
    );
  }, [playlists, searchTerm]);


  if (!playlists || playlists.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">No playlists found.</p>
        <CreatePlaylistDialog />
      </div>
    );
  }
  
  const totalPlaylists = playlists.length;
  const playlistsToDisplay = filteredPlaylists;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-white">Playlists</h3>
      
      <ScrollArea className="h-[150px] pr-4">
        <div className="space-y-1">
          {playlistsToDisplay.length === 0 ? (
            <p className="text-sm text-muted-foreground p-2">No playlists match "{searchTerm}".</p>
          ) : (
            playlistsToDisplay.map((playlist) => {
              const isSelected = playlist.id === selectedPlaylistId;
              const isLastPlaylist = totalPlaylists === 1;
              
              return (
                <PlaylistListItem
                  key={playlist.id}
                  playlist={playlist}
                  isSelected={isSelected}
                  isLastPlaylist={isLastPlaylist}
                />
              );
            })
          )}
        </div>
      </ScrollArea>
      
      <CreatePlaylistDialog />
    </div>
  );
};

export default PlaylistSelector;