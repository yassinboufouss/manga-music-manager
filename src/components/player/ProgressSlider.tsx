import React from 'react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { formatTime } from '@/utils/time';

interface ProgressSliderProps {
  currentTime: number;
  duration: number;
  isLoading: boolean;
  handleSeek: (value: number[]) => void;
}

const ProgressSlider: React.FC<ProgressSliderProps> = ({
  currentTime,
  duration,
  isLoading,
  handleSeek,
}) => {
  return (
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
  );
};

export default ProgressSlider;