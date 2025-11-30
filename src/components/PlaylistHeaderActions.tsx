import React from 'react';
import { useMusicPlayer } from '@/context/MusicPlayerContext';
import RenamePlaylistDialog from './RenamePlaylistDialog';
import DeletePlaylistDialog from './DeletePlaylistDialog';

const PlaylistHeaderActions: React.FC = () => {
  const { currentPlaylist, playlists } = useMusicPlayer();

  if (!currentPlaylist) return null;
  
  const isLastPlaylist = playlists?.length === 1;

  return (
    <div className="flex items-center space-x-1">
      <RenamePlaylistDialog />
      
      <DeletePlaylistDialog 
        playlistId={currentPlaylist.id} 
        playlistName={currentPlaylist.name} 
        isLastPlaylist={isLastPlaylist}
      />
    </div>
  );
};

export default PlaylistHeaderActions;