import React from 'react';
import { Trash, Loader2, AlertTriangle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useDeleteAccount } from '@/hooks/use-delete-account';

const DeleteAccountDialog: React.FC = () => {
  const { deleteAccount, isPending } = useDeleteAccount();

  const handleDelete = () => {
    deleteAccount();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          className="w-full justify-start mt-4"
          disabled={isPending}
        >
          <Trash className="mr-2 h-4 w-4" /> Delete Account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center text-destructive">
            <AlertTriangle className="h-6 w-6 mr-2" /> Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action is permanent and cannot be undone. All your data, including playlists and tracks, will be immediately and permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete} 
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            disabled={isPending}
          >
            {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
                <Trash className="h-4 w-4 mr-2" />
            )}
            {isPending ? "Deleting..." : "Yes, Delete My Account"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAccountDialog;