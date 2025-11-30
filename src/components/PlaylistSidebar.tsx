import React from 'react';
import { ListMusic, Play } from 'lucide-react';
import { useMusicPlayer, Track } from '@/context/MusicPlayerContext';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const TrackItem: React.FC<{ track: Track }> = ({ track }) => {
  const { currentTrack, setCurrentTrack, setIsPlaying, isPlaying } = useMusicPlayer();
  const isActive = currentTrack?.id === track.id;

  const handleTrackClick = () => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors",
        isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
      )}
      onClick={handleTrackClick}
    >
      <div className="flex items-center space-x-3 overflow-hidden">
        {isActive && isPlaying ? (
          <Play className="h-4 w-4 fill-sidebar-primary text-sidebar-primary" />
        ) : (
          <ListMusic className="h-4 w-4 text-muted-foreground" />
        )}
        <div className="truncate">
          <p className="text-sm truncate">{track.title}</p>
          <p className={cn("text-xs truncate", isActive ? "text-sidebar-primary" : "text-muted-foreground")}>{track.artist}</p>
        </div>
      </div>
      <span className={cn("text-xs ml-4", isActive ? "text-sidebar-primary" : "text-muted-foreground")}>
        {track.duration}
      </span>
    </div>
  );
};

const PlaylistSidebar = () => {
  const { currentPlaylist } = useMusicPlayer();

  return (
    <div className="w-full h-full flex flex-col bg-sidebar text-sidebar-foreground p-4 border-r border-sidebar-border">
      <h2 className="text-xl font-bold mb-6 text-sidebar-primary-foreground">Dyad Music</h2>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-sidebar-primary-foreground mb-2">Playlists</h3>
        <div className="p-3 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground font-medium">
            {currentPlaylist.name}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-sidebar-primary-foreground mb-2 mt-4">Tracks</h3>

      <ScrollArea className="flex-grow h-0">
        <div className="space-y-1 pr-4">
          {currentPlaylist.tracks.map((track) => (
            <TrackItem key={track.id} track={track} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PlaylistSidebar;