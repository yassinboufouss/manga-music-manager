import React from 'react';
import { ListMusic, Check } from 'lucide-react';
import { useMusicPlayer } from '@/context/MusicPlayerContext';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import CreatePlaylistDialog from './CreatePlaylistDialog';

const PlaylistSelector: React.FC = () => {
  const { playlists, selectedPlaylistId, setSelectedPlaylistId } = useMusicPlayer();

  if (!playlists || playlists.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">No playlists found.</p>
        <CreatePlaylistDialog />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">Playlists</h3>
      
      <ScrollArea className="h-[150px] pr-4">
        <div className="space-y-1">
          {playlists.map((playlist) => {
            const isSelected = playlist.id === selectedPlaylistId;
            return (
              <div
                key={playlist.id}
                className={cn(
                  "flex items-center p-3 rounded-lg cursor-pointer transition-colors",
                  isSelected 
                    ? "bg-primary text-primary-foreground font-medium hover:bg-primary/90"
                    : "bg-secondary/50 text-secondary-foreground hover:bg-secondary/80"
                )}
                onClick={() => setSelectedPlaylistId(playlist.id)}
              >
                {isSelected ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <ListMusic className="h-4 w-4 mr-2" />
                )}
                <span className="flex-1 truncate">{playlist.name}</span>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      
      <CreatePlaylistDialog />
    </div>
  );
};

export default PlaylistSelector;