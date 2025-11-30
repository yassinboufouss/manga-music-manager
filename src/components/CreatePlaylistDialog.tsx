import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RenamePlaylistSchema, RenamePlaylistFormValues } from '@/lib/schemas';
import { useMusicPlayer } from '@/context/MusicPlayerContext';

const CreatePlaylistDialog: React.FC = () => {
  const { createPlaylist } = useMusicPlayer();
  const [open, setOpen] = useState(false);

  const form = useForm<RenamePlaylistFormValues>({
    resolver: zodResolver(RenamePlaylistSchema),
    defaultValues: {
      name: "New Playlist",
    },
    mode: "onChange",
  });

  const onSubmit = useCallback(async (data: RenamePlaylistFormValues) => {
    try {
      await createPlaylist(data.name);
      form.reset({ name: "New Playlist" });
      setOpen(false);
    } catch (error) {
      // Error handled in context
    }
  }, [createPlaylist, form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <Plus className="mr-2 h-4 w-4" /> Create New Playlist
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Playlist</DialogTitle>
          <DialogDescription>
            Enter a name for your new music collection.
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
                    disabled={form.formState.isSubmitting || !form.formState.isValid}
                >
                  {form.formState.isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : "Create Playlist"}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePlaylistDialog;