import React from 'react';
import { ListMusic, Check } from 'lucide-react';
import { useMusicPlayer, Playlist } from '@/context/MusicPlayerContext';
import { cn } from '@/lib/utils';
import DeletePlaylistDialog from './DeletePlaylistDialog';

interface PlaylistListItemProps {
  playlist: Omit<Playlist, 'tracks'>;
  isSelected: boolean;
  isLastPlaylist: boolean;
}

const PlaylistListItem: React.FC<PlaylistListItemProps> = ({ playlist, isSelected, isLastPlaylist }) => {
  const { setSelectedPlaylistId } = useMusicPlayer();

  const handleSelect = () => {
    setSelectedPlaylistId(playlist.id);
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between p-1 rounded-lg cursor-pointer transition-all duration-200 group",
        isSelected 
          ? "bg-primary text-primary-foreground font-medium hover:bg-primary/90 shadow-md"
          : "bg-secondary/50 text-secondary-foreground hover:bg-secondary/80 hover:scale-[1.01] transform"
      )}
      onClick={handleSelect}
    >
      <div className="flex items-center flex-1 min-w-0 p-2">
        {isSelected ? (
          <Check className="h-4 w-4 mr-2 flex-shrink-0" />
        ) : (
          <ListMusic className="h-4 w-4 mr-2 flex-shrink-0" />
        )}
        <span className="flex-1 truncate">{playlist.name}</span>
      </div>
      
      {/* Delete button - hidden if selected, as PlaylistHeaderActions provides a prominent delete button for the active playlist. */}
      {!isSelected && (
        <div className="ml-2 flex-shrink-0 pr-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <DeletePlaylistDialog 
            playlistId={playlist.id} 
            playlistName={playlist.name} 
            isLastPlaylist={isLastPlaylist}
          />
        </div>
      )}
    </div>
  );
};

export default PlaylistListItem;