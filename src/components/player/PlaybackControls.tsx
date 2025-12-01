import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Loader2, Repeat, ListMusic, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';

interface PlaybackControlsProps {
  isPlaying: boolean;
  isLoading: boolean;
  isLooping: boolean;
  isAutoplayEnabled: boolean;
  isShuffling: boolean;
  isPlaylistShort: boolean;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrevious: () => void;
  handleLoopToggle: () => void;
  handleAutoplayToggle: () => void;
  handleShuffle: () => Promise<void>;
}

const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  isLoading,
  isLooping,
  isAutoplayEnabled,
  isShuffling,
  isPlaylistShort,
  togglePlayPause,
  playNext,
  playPrevious,
  handleLoopToggle,
  handleAutoplayToggle,
  handleShuffle,
}) => {
  return (
    <div className="flex space-x-2 sm:space-x-4 mb-1 items-center">
      
      {/* Shuffle Button */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleShuffle} 
        className={cn(
            "h-7 w-7 sm:h-8 sm:w-8 text-foreground hover:text-primary",
            isShuffling && "animate-pulse"
        )}
        disabled={isShuffling || isPlaylistShort}
        aria-label="Shuffle Playlist"
      >
        {isShuffling ? (
            <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
            <Shuffle className="h-4 w-4" />
        )}
      </Button>
      
      {/* Loop Toggle (Hidden on small mobile) */}
      <Toggle 
        pressed={isLooping} 
        onPressedChange={handleLoopToggle} 
        variant="outline" 
        size="sm"
        className={cn("h-7 w-7 sm:h-8 sm:w-8 hidden sm:flex", isLooping ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-muted-foreground hover:bg-secondary")}
        aria-label="Toggle loop"
      >
        <Repeat className="h-4 w-4" />
      </Toggle>
      
      <Button variant="ghost" size="icon" onClick={playPrevious} className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-transparent text-foreground hover:text-primary">
        <SkipBack className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>
      
      <Button 
        variant="secondary" 
        size="icon" 
        className="rounded-full h-8 w-8 sm:h-10 sm:w-10 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50" 
        onClick={togglePlayPause}
        disabled={isLoading}
      >
        {isLoading ? (
            <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
        ) : isPlaying ? (
            <Pause className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
        ) : (
            <Play className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
        )}
      </Button>
      
      <Button variant="ghost" size="icon" onClick={playNext} className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-transparent text-foreground hover:text-primary">
        <SkipForward className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>
      
      {/* Autoplay Toggle (Hidden on small mobile) */}
      <Toggle 
        pressed={isAutoplayEnabled} 
        onPressedChange={handleAutoplayToggle} 
        variant="outline" 
        size="sm"
        className={cn("h-7 w-7 sm:h-8 sm:w-8 hidden sm:flex", isAutoplayEnabled ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-muted-foreground hover:bg-secondary")}
        aria-label="Toggle autoplay"
      >
        <ListMusic className="h-4 w-4" />
      </Toggle>
      
    </div>
  );
};

export default PlaybackControls;