import React from 'react';
import { Trash, Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useMusicPlayer, Track } from '@/context/MusicPlayerContext';

interface DeleteTrackDialogProps {
  track: Track;
}

const DeleteTrackDialog: React.FC<DeleteTrackDialogProps> = ({ track }) => {
  const { deleteTrack } = useMusicPlayer();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!track.dbId) return;
    
    setIsDeleting(true);
    try {
      await deleteTrack(track.dbId);
    } catch (e) {
      // Error handled in context
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()} // Prevent track selection when clicking delete button
        >
          <Trash className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will permanently remove the track "{track.title}" by {track.artist} from your playlist.
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
            {isDeleting ? "Removing..." : "Remove Track"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteTrackDialog;