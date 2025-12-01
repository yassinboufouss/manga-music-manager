import React, { useRef, useCallback } from 'react';
import YouTube, { YouTubePlayer } from 'react-youtube';
import { Loader2 } from 'lucide-react';
import { useMusicPlayer } from '@/context/MusicPlayerContext';
import { cn } from '@/lib/utils';
import { showSuccess, showError } from '@/utils/toast';
import { useMediaShortcuts } from '@/hooks/use-media-shortcuts';
import PlaybackControls from './player/PlaybackControls';
import ProgressSlider from './player/ProgressSlider';
import RightControls from './player/RightControls';
import { usePremium } from '@/hooks/use-premium'; // Import usePremium

const MusicPlayer = () => {
  const { 
    currentTrack, 
    isPlaying, 
    setIsPlaying, 
    currentPlaylist, 
    isLoadingData,
    isLooping,
    setIsLooping,
    isAutoplayEnabled,
    setIsAutoplayEnabled,
    playNext,
    playPrevious,
    playbackRate,
    setPlaybackRate,
    isShuffling, 
    setIsShuffling,
  } = useMusicPlayer();
  
  const isPremium = usePremium(); // Get premium status
  
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [volume, setVolume] = React.useState(50);
  const [isMuted, setIsMuted] = React.useState(false);
  
  // State for progress
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const intervalRef = useRef<number | null>(null); 
  
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
  
  const handleRateChange = useCallback((value: string) => {
    const newRate = parseFloat(value);
    if (!isNaN(newRate)) {
        setPlaybackRate(newRate);
    }
  }, [setPlaybackRate]);

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
  
  // Handle shuffle toggle (now just toggles the persistent state)
  const handleShuffleToggle = () => {
      if (!isPremium) {
          showError("Shuffle is a premium feature. Upgrade to unlock!");
          return;
      }
      if ((currentPlaylist?.tracks.length || 0) < 2) {
          showError("Cannot shuffle: Playlist is empty or too short.");
          return;
      }
      setIsShuffling(prev => !prev);
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
  
  const isPlaylistShort = (currentPlaylist?.tracks.length || 0) < 2;

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
      <div className="flex items-center w-[25%] sm:w-1/4 min-w-[100px] max-w-[25%] sm:max-w-none">
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
      <div className="flex flex-col items-center w-[50%] sm:w-1/2 max-w-xs sm:max-w-lg mx-2">
        
        <PlaybackControls 
            isPlaying={isPlaying}
            isLoading={isLoading}
            isLooping={isLooping}
            isAutoplayEnabled={isAutoplayEnabled}
            isShuffling={isShuffling}
            isPlaylistShort={isPlaylistShort}
            isPremium={isPremium} // Pass premium status
            togglePlayPause={togglePlayPause}
            playNext={playNext}
            playPrevious={playPrevious}
            handleLoopToggle={handleLoopToggle}
            handleAutoplayToggle={handleAutoplayToggle}
            handleShuffle={handleShuffleToggle}
        />
        
        <ProgressSlider 
            currentTime={currentTime}
            duration={duration}
            isLoading={isLoading}
            handleSeek={handleSeek}
        />
      </div>

      {/* Volume Control, Playback Rate, and Lyrics (Right) */}
      <RightControls 
        currentTrackId={currentTrack.id}
        volume={volume}
        isMuted={isMuted}
        playbackRate={playbackRate}
        toggleMute={toggleMute}
        handleVolumeChange={handleVolumeChange}
        handleRateChange={handleRateChange}
      />
    </div>
  );
};

export default MusicPlayer;