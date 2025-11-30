import React, { useRef } from 'react';
import YouTube, { YouTubePlayer } from 'react-youtube';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { useMusicPlayer } from '@/context/MusicPlayerContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

const MusicPlayer = () => {
  const { currentTrack, isPlaying, setIsPlaying, currentPlaylist, setCurrentTrack } = useMusicPlayer();
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [volume, setVolume] = React.useState(50);
  const [isMuted, setIsMuted] = React.useState(false);

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

  const onReady = (event: { target: YouTubePlayer }) => {
    playerRef.current = event.target;
    playerRef.current.setVolume(volume);
    
    // If we are supposed to be playing, start playback immediately upon ready
    if (isPlaying) {
        playerRef.current.playVideo();
    }
  };
  
  const onStateChange = (event: { data: number }) => {
    // YouTube Player State: 1=Playing, 2=Paused, 0=Ended
    if (event.data === 1) {
      setIsPlaying(true);
    } else if (event.data === 2) {
      setIsPlaying(false);
    } else if (event.data === 0) {
      playNext();
    }
  };

  const togglePlayPause = () => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      playerRef.current.playVideo();
      setIsPlaying(true);
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

  const playNext = () => {
    if (!currentTrack) return;
    const currentIndex = currentPlaylist.tracks.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % currentPlaylist.tracks.length;
    setCurrentTrack(currentPlaylist.tracks[nextIndex]);
    setIsPlaying(true); 
  };

  const playPrevious = () => {
    if (!currentTrack) return;
    const currentIndex = currentPlaylist.tracks.findIndex(t => t.id === currentTrack.id);
    let previousIndex = currentIndex - 1;
    if (previousIndex < 0) {
      previousIndex = currentPlaylist.tracks.length - 1;
    }
    setCurrentTrack(currentPlaylist.tracks[previousIndex]);
    setIsPlaying(true); 
  };
  
  if (!currentTrack) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 flex items-center justify-center h-20 z-50">
        <p className="text-muted-foreground">No track selected.</p>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 flex items-center justify-between h-20 z-50 px-6">
      
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

      {/* Track Info */}
      <div className="flex items-center w-1/4 min-w-[200px]">
        <img 
          src={`https://img.youtube.com/vi/${currentTrack.id}/default.jpg`} 
          alt={currentTrack.title} 
          className="w-12 h-12 rounded mr-3 object-cover"
        />
        <div className='overflow-hidden'>
          <p className="text-sm font-medium truncate">{currentTrack.title}</p>
          <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center w-1/2 max-w-lg">
        <div className="flex space-x-4 mb-1">
          <Button variant="ghost" size="icon" onClick={playPrevious} className="hover:bg-transparent text-foreground hover:text-primary">
            <SkipBack className="h-5 w-5" />
          </Button>
          <Button variant="secondary" size="icon" className="rounded-full h-10 w-10 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={togglePlayPause}>
            {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={playNext} className="hover:bg-transparent text-foreground hover:text-primary">
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>
        {/* Simple Progress Bar Placeholder */}
        <div className="w-full flex items-center space-x-2 text-xs text-muted-foreground">
          <span>0:00</span>
          <Slider defaultValue={[0]} max={100} step={1} className="w-full cursor-pointer" disabled />
          <span>{currentTrack.duration}</span>
        </div>
      </div>

      {/* Volume Control */}
      <div className="flex items-center w-1/4 justify-end space-x-2 min-w-[150px]">
        <Button variant="ghost" size="icon" onClick={toggleMute} className="hover:bg-transparent text-foreground hover:text-primary">
          {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
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
  );
};

export default MusicPlayer;