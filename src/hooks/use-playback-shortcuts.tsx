import { useEffect } from 'react';
import { useMusicPlayer } from '@/context/MusicPlayerContext';

interface PlaybackControls {
  togglePlayPause: () => void;
  playNext: () => void;
  playPrevious: () => void;
}

export function usePlaybackShortcuts({ togglePlayPause, playNext, playPrevious }: PlaybackControls) {
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentTrack, togglePlayPause, playNext, playPrevious]);
}