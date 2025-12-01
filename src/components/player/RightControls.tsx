import React from 'react';
import { Volume2, VolumeX, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LyricsSheet from '../LyricsSheet';

const PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

interface RightControlsProps {
  currentTrackId: string | null;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  toggleMute: () => void;
  handleVolumeChange: (newVolume: number[]) => void;
  handleRateChange: (value: string) => void;
}

const RightControls: React.FC<RightControlsProps> = ({
  currentTrackId,
  volume,
  isMuted,
  playbackRate,
  toggleMute,
  handleVolumeChange,
  handleRateChange,
}) => {
  return (
    <div className="flex items-center w-[25%] sm:w-1/4 justify-end space-x-1 sm:space-x-4 min-w-[80px] max-w-[25%] sm:max-w-none">
      
      {/* YouTube Link Button */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-foreground hover:text-primary"
        disabled={!currentTrackId}
        aria-label="Open YouTube Video"
        asChild
      >
        <a 
          href={`https://www.youtube.com/watch?v=${currentTrackId}`} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <Youtube className="h-5 w-5" />
        </a>
      </Button>
      
      {/* Lyrics Button */}
      <LyricsSheet />
      
      {/* Mute Button (Mobile only) */}
      <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleMute} 
          className="h-8 w-8 text-foreground hover:text-primary sm:hidden"
          aria-label="Toggle Mute"
      >
          {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </Button>
      
      {/* Desktop Controls Group (Rate Selector + Volume Slider) */}
      <div className="hidden sm:flex items-center space-x-4">
          {/* Playback Rate Selector */}
          <Select value={playbackRate.toString()} onValueChange={handleRateChange}>
              <SelectTrigger className="w-[80px] h-8 text-xs text-white">
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
          
          {/* Volume Slider + Mute Button */}
          <div className="flex items-center space-x-2 min-w-[100px]">
              <Button variant="ghost" size="icon" onClick={toggleMute} className="h-8 w-8 hover:bg-transparent text-foreground hover:text-primary">
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

export default RightControls;