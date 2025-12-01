import React, { useRef, useCallback } from 'react';
import YouTube, { YouTubePlayer } from 'react-youtube';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Loader2, Repeat, ListMusic, Youtube, Shuffle } from 'lucide-react';
import { useMusicPlayer } from '@/context/MusicPlayerContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { formatTime } from '@/utils/time';
import { showSuccess } from '@/utils/toast';
import { useMediaShortcuts } from '@/hooks/use-media-shortcuts';
import { Toggle } from '@/components/ui/toggle';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LyricsSheet from './LyricsSheet'; // Import LyricsSheet

const PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const MusicPlayer = () => {
  const { 
    currentTrack, 
    isPlaying, 
    setIsPlaying, 
    currentPlaylist, 
    setCurrentTrack, 
    isLoadingData,
    isLooping,
    setIsLooping,
    isAutoplayEnabled,
    setIsAutoplayEnabled,
    playNext,
    playPrevious,
    playbackRate,
    setPlaybackRate,
    shufflePlaylist, 
    isShuffling, 
    setIsShuffling, 
  } = useMusicPlayer();
  
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [volume, setVolume] = React.useState(50);
  const [isMuted, setIsMuted] = React.useState(false);
  
  // State for progress
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const intervalRef = useRef<number | null>(null); // FIX 1: Initialized useRef with null
  
  // State for loading/buffering
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Ref to track if the track change was user-initiated (to prevent toast on initial load)
  const isInitialLoad = useRef(true);

  const opts = {
    height: '0', // Hide the video player
    width: '0', // Hide the video player
    playerVars: {
      autoplay: 1, // Autoplay when track changes
      controls: 0,
      disablekb: 1,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
      iv_load_policy: 3,
    },
  };

  const updateTime = useCallback(() => {
    if (playerRef.current) {
      const time = playerRef.current.getCurrentTime();
      setCurrentTime(time);
    }
  }, []);
  
  const togglePlayPause = useCallback(() => {
    if (!playerRef.current || isLoading) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  }, [isPlaying, isLoading, setIsPlaying]);
  
  const seek = useCallback((delta: number) => {
    if (!playerRef.current || duration === 0) return;
    
    const newTime = Math.max(0, Math.min(duration, currentTime + delta));
    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
  }, [currentTime, duration]);
  
  const changeVolume = useCallback((delta: number) => {
    if (!playerRef.current) return;
    
    const currentVolume = playerRef.current.getVolume();
    const newVolume = Math.max(0, Math.min(100, currentVolume + delta));
    
    playerRef.current.setVolume(newVolume);
    setVolume(newVolume);
    
    if (newVolume > 0 && isMuted) {
        setIsMuted(false);
    } else if (newVolume === 0 && !isMuted) {
        setIsMuted(true);
    }
  }, [isMuted]);

  // Integrate keyboard shortcuts
  useMediaShortcuts({ 
      togglePlayPause, 
      playNext, 
      playPrevious, 
      seek, 
      changeVolume 
  });


  React.useEffect(() => {
    if (isPlaying) {
      // Start interval to update time every second
      intervalRef.current = window.setInterval(updateTime, 1000);
    } else {
      // Clear interval when paused
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // Cleanup on unmount or dependency change
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, updateTime]);
  
  // Set loading state and show toast when track changes
  React.useEffect(() => {
      if (currentTrack) {
          setIsLoading(true);
          // Only show toast if it's not the very first load of the app
          if (!isInitialLoad.current) {
              showSuccess(`Now playing: ${currentTrack.title} by ${currentTrack.artist}`);
          }
          isInitialLoad.current = false;
      }
  }, [currentTrack]);
  
  // Effect to update playback rate on the player instance
  React.useEffect(() => {
      if (playerRef.current) {
          playerRef.current.setPlaybackRate(playbackRate);
      }
  }, [playbackRate]);


  const onReady = (event: { target: YouTubePlayer }) => {
    playerRef.current = event.target;
    playerRef.current.setVolume(volume);
    playerRef.current.setPlaybackRate(playbackRate); // Set initial rate
    
    // Reset time and get duration when a new track loads
    setCurrentTime(0);
    
    const d = playerRef.current.getDuration();
    setDuration(d);
    
    // If we are supposed to be playing, start playback immediately upon ready
    if (isPlaying) {
        playerRef.current.playVideo();
    }
  };
  
  const onStateChange = (event: { data: number }) => {
    // YouTube Player State: -1=Unstarted, 0=Ended, 1=Playing, 2=Paused, 3=Buffering, 5=Cued
    const state = event.data;
    
    if (state === 1) { // Playing
      setIsPlaying(true);
      setIsLoading(false); 
    } else if (state === 2) { // Paused
      setIsPlaying(false);
      setIsLoading(false);
    } else if (state === 3 || state === 5 || state === -1) { // Buffering, Cued, Unstarted
      setIsLoading(true);
    } else if (state === 0) { // Ended
      setIsPlaying(false);
      setIsLoading(false);
      
      if (isLooping) {
          // If looping, restart the current track
          playerRef.current?.seekTo(0, true);
          playerRef.current?.playVideo();
          setIsPlaying(true);
      } else {
          // Otherwise, play the next track (which respects isAutoplayEnabled)
          playNext();
      }
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const newVol = newVolume[0];
    setVolume(newVol);
    if (playerRef.current) {
      playerRef.current.setVolume(newVol);
      if (newVol === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) return;

    if (isMuted) {
      const targetVolume = volume > 0 ? volume : 50;
      playerRef.current.setVolume(targetVolume);
      setIsMuted(false);
      if (volume === 0) setVolume(50);
    } else {
      playerRef.current.setVolume(0);
      setIsMuted(true);
    }
  };
  
  const handleSeek = (value: number[]) => {
    const seekTime = value[0];
    setCurrentTime(seekTime); // Optimistic update
    if (playerRef.current) {
      playerRef.current.seekTo(seekTime, true);
    }
  };
  
  const handleLoopToggle = () => {
      setIsLooping(prev => !prev);
  };
  
  const handleAutoplayToggle = () => {
      setIsAutoplayEnabled(prev => !prev);
  };
  
  const handleRateChange = (value: string) => {
      setPlaybackRate(parseFloat(value));
  };
  
  const handleShuffle = async () => {
      setIsShuffling(true); // FIX 2: Use setIsShuffling setter
      await shufflePlaylist();
      setIsShuffling(false); // FIX 3: Use setIsShuffling setter
  };

  if (isLoadingData) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 flex items-center justify-center h-20 z-50">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        <p className="text-muted-foreground">Loading playlist...</p>
      </div>
    );
  }
  
  if (!currentTrack) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 flex items-center justify-center h-20 z-50">
        <p className="text-muted-foreground">No track selected. Add a track to start playing.</p>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 flex items-center justify-between h-20 z-50 sm:px-6">
      
      {/* Hidden YouTube Player */}
      <div className={cn("absolute opacity-0 pointer-events-none")}>
        {/* Key forces remount/reload when videoId changes */}
        <YouTube
          key={currentTrack.id} 
          videoId={currentTrack.id}
          opts={opts}
          onReady={onReady}
          onStateChange={onStateChange}
        />
      </div>

      {/* Track Info (Left) */}
      <div className="flex items-center w-1/3 sm:w-1/4 min-w-[150px] max-w-[30%] sm:max-w-none">
        <img 
          src={`https://img.youtube.com/vi/${currentTrack.id}/mqdefault.jpg`} 
          alt={currentTrack.title} 
          className="w-10 h-10 sm:w-12 sm:h-12 rounded mr-2 sm:mr-3 object-cover flex-shrink-0"
        />
        <div className='overflow-hidden'>
          <p className="text-xs sm:text-sm font-medium truncate text-white">{currentTrack.title}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
        </div>
      </div>

      {/* Controls and Progress (Center) */}
      <div className="flex flex-col items-center w-1/3 sm:w-1/2 max-w-xs sm:max-w-lg mx-2">
        <div className="flex space-x-2 sm:space-x-4 mb-1 items-center">
          
          {/* Shuffle Button (New) */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleShuffle} 
            className={cn(
                "h-7 w-7 sm:h-8 sm:w-8 text-foreground hover:text-primary",
                isShuffling && "animate-pulse"
            )}
            disabled={isShuffling || (currentPlaylist?.tracks.length || 0) < 2}
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
        {/* Progress Bar */}
        <div className="w-full flex items-center space-x-1 sm:space-x-2 text-[10px] sm:text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <Slider 
            value={[currentTime]} 
            onValueChange={handleSeek} 
            max={duration} 
            step={1} 
            className="w-full cursor-pointer" 
            disabled={duration === 0 || isLoading}
          />
          <span className="hidden sm:inline">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume Control, Playback Rate, and Lyrics (Right) */}
      <div className="flex items-center w-1/3 sm:w-1/4 justify-end space-x-2 sm:space-x-4 min-w-[100px] max-w-[30%] sm:max-w-none">
        
        {/* YouTube Link Button (New) */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 sm:h-10 sm:w-10 text-foreground hover:text-primary"
          disabled={!currentTrack}
          aria-label="Open YouTube Video"
          asChild
        >
          <a 
            href={`https://www.youtube.com/watch?v=${currentTrack.id}`} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Youtube className="h-5 w-5" />
          </a>
        </Button>
        
        {/* Lyrics Button (Visible on all screens) */}
        <LyricsSheet />
        
        {/* Playback Rate Selector (Hidden on mobile) */}
        <Select value={playbackRate.toString()} onValueChange={handleRateChange}>
            <SelectTrigger className="w-[60px] sm:w-[80px] h-7 sm:h-8 text-[10px] sm:text-xs hidden sm:flex text-white">
                <SelectValue placeholder="1x" />
            </SelectTrigger>
            <SelectContent>
                {PLAYBACK_RATES.map(rate => (
                    <SelectItem key={rate} value={rate.toString()}>
                        {rate}x
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
        
        {/* Volume Control (Hidden on mobile) */}
        <div className="items-center space-x-2 min-w-[100px] hidden sm:flex">
            <Button variant="ghost" size="icon" onClick={toggleMute} className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-transparent text-foreground hover:text-primary">
              {isMuted || volume === 0 ? <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" /> : <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />}
            </Button>
            <Slider 
              value={[isMuted ? 0 : volume]} 
              onValueChange={handleVolumeChange} 
              max={100} 
              step={1} 
              className="w-[100px] cursor-pointer" 
            />
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;