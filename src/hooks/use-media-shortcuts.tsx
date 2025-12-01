import { useEffect } from 'react';
import { useMusicPlayer } from '@/context/MusicPlayerContext';

interface MediaControls {
  togglePlayPause: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seek: (time: number) => void;
  changeVolume: (delta: number) => void;
}

const SEEK_STEP = 5; // 5 seconds
const VOLUME_STEP = 5; // 5%

export function useMediaShortcuts({ togglePlayPause, playNext, playPrevious, seek, changeVolume }: MediaControls) {
  const { currentTrack } = useMusicPlayer();

  useEffect(() => {
    if (!currentTrack) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent shortcuts from firing if the user is typing in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key) {
        case ' ': // Spacebar for Play/Pause
          event.preventDefault(); // Prevent scrolling
          togglePlayPause();
          break;
        case 'ArrowRight': // Right arrow for Skip Next
          playNext();
          break;
        case 'ArrowLeft': // Left arrow for Skip Previous
          playPrevious();
          break;
        case 'j': // J key for Seek Backward
        case 'J':
          seek(-SEEK_STEP);
          break;
        case 'l': // L key for Seek Forward
        case 'L':
          seek(SEEK_STEP);
          break;
        case 'ArrowUp': // Up arrow for Volume Up
          event.preventDefault(); // Prevent scrolling
          changeVolume(VOLUME_STEP);
          break;
        case 'ArrowDown': // Down arrow for Volume Down
          event.preventDefault(); // Prevent scrolling
          changeVolume(-VOLUME_STEP);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentTrack, togglePlayPause, playNext, playPrevious, seek, changeVolume]);
}