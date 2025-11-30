import React, { useState } from 'react';
import { Trash, Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useMusicPlayer } from '@/context/MusicPlayerContext';

interface DeletePlaylistDialogProps {
  playlistId: string;
  playlistName: string;
  isLastPlaylist: boolean;
}

const DeletePlaylistDialog: React.FC<DeletePlaylistDialogProps> = ({ playlistId, playlistName, isLastPlaylist }) => {
  const { deletePlaylist } = useMusicPlayer();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePlaylist(playlistId);
    } catch (e) {
      // Error handled in context
    } finally {
      setIsDeleting(false);
    }
  };
  
  const description = isLastPlaylist
    ? `This is your last playlist. Deleting it will automatically create a new default playlist named 'My Tracks'. This action cannot be undone.`
    : `This action will permanently delete the playlist "${playlistName}" and all its tracks. This cannot be undone.`;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 text-muted-foreground hover:text-destructive"
          aria-label={`Delete playlist ${playlistName}`}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete} 
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            disabled={isDeleting}
          >
            {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
                <Trash className="h-4 w-4 mr-2" />
            )}
            {isDeleting ? "Deleting..." : "Yes, Delete Playlist"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeletePlaylistDialog;