import React from 'react';
import { useMusicPlayer } from '@/context/MusicPlayerContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import CreatePlaylistDialog from './CreatePlaylistDialog';
import PlaylistListItem from './PlaylistListItem';

const PlaylistSelector: React.FC = () => {
  const { playlists, selectedPlaylistId } = useMusicPlayer();

  if (!playlists || playlists.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">No playlists found.</p>
        <CreatePlaylistDialog />
      </div>
    );
  }
  
  const totalPlaylists = playlists.length;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">Playlists</h3>
      
      <ScrollArea className="h-[150px] pr-4">
        <div className="space-y-1">
          {playlists.map((playlist) => {
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
          })}
        </div>
      </ScrollArea>
      
      <CreatePlaylistDialog />
    </div>
  );
};

export default PlaylistSelector;