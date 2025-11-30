import React, { useState } from 'react';
import { Trash, Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useMusicPlayer } from '@/context/MusicPlayerContext';

const ClearPlaylistDialog: React.FC = () => {
  const { currentPlaylist, deleteAllTracks } = useMusicPlayer();
  const [isClearing, setIsClearing] = useState(false);

  const handleClear = async () => {
    if (!currentPlaylist) return;
    
    setIsClearing(true);
    try {
      await deleteAllTracks();
    } catch (e) {
      // Error handled in context
    } finally {
      setIsClearing(false);
    }
  };

  // Disable if playlist is empty or not loaded
  const isDisabled = !currentPlaylist || currentPlaylist.tracks.length === 0;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
          disabled={isDisabled}
        >
          <Trash className="mr-2 h-4 w-4" /> Clear Playlist
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Clear Playlist Confirmation</AlertDialogTitle>
          <AlertDialogDescription>
            This action will permanently remove ALL {currentPlaylist?.tracks.length || 0} tracks from your playlist "{currentPlaylist?.name}". This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isClearing}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleClear} 
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            disabled={isClearing}
          >
            {isClearing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
                <Trash className="h-4 w-4 mr-2" />
            )}
            {isClearing ? "Clearing..." : "Yes, Clear Playlist"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ClearPlaylistDialog;