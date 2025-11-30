import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RenamePlaylistSchema, RenamePlaylistFormValues } from '@/lib/schemas';
import { useMusicPlayer } from '@/context/MusicPlayerContext';
import { usePlaylistData } from '@/hooks/use-playlist-data';
import { showSuccess, showError } from '@/utils/toast';

const RenamePlaylistDialog: React.FC = () => {
  const { currentPlaylist } = useMusicPlayer();
  const { updatePlaylistNameMutation } = usePlaylistData();
  const [open, setOpen] = useState(false);

  const form = useForm<RenamePlaylistFormValues>({
    resolver: zodResolver(RenamePlaylistSchema),
    defaultValues: {
      name: currentPlaylist?.name || "My Tracks",
    },
    mode: "onChange",
  });
  
  // Update default value when currentPlaylist changes
  React.useEffect(() => {
      if (currentPlaylist) {
          form.reset({ name: currentPlaylist.name });
      }
  }, [currentPlaylist, form]);

  const onSubmit = useCallback(async (data: RenamePlaylistFormValues) => {
    if (!currentPlaylist) return;
    
    try {
      await updatePlaylistNameMutation.mutateAsync({
        playlistId: currentPlaylist.id,
        newName: data.name,
      });
      
      showSuccess(`Playlist renamed to "${data.name}"!`);
      setOpen(false);
    } catch (error) {
      console.error("Error renaming playlist:", error);
      showError("Failed to rename playlist.");
    }
  }, [currentPlaylist, updatePlaylistNameMutation]);

  if (!currentPlaylist) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-muted-foreground hover:text-primary ml-2"
            aria-label="Rename Playlist"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rename Playlist</DialogTitle>
          <DialogDescription>
            Enter a new name for your playlist.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Playlist Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Awesome Playlist" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
                <Button 
                    type="submit" 
                    disabled={updatePlaylistNameMutation.isPending || !form.formState.isValid}
                >
                  {updatePlaylistNameMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : "Save Changes"}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default RenamePlaylistDialog;