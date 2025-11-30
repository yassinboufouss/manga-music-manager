import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { AddTrackSchema, AddTrackFormValues } from '@/lib/schemas';
import { useMusicPlayer } from '@/context/MusicPlayerContext';
import { showSuccess, showError } from '@/utils/toast';

const AddTrackDialog: React.FC = () => {
  const { addTrackToPlaylist } = useMusicPlayer();
  const [open, setOpen] = useState(false);

  const form = useForm<AddTrackFormValues>({
    resolver: zodResolver(AddTrackSchema),
    defaultValues: {
      youtubeId: "",
      title: "",
      artist: "",
      duration: "0:00",
    },
  });

  const onSubmit = (data: AddTrackFormValues) => {
    try {
      const newTrack = {
        id: data.youtubeId,
        title: data.title,
        artist: data.artist,
        duration: data.duration,
      };
      
      addTrackToPlaylist(newTrack);
      showSuccess(`Track "${data.title}" added to playlist!`);
      
      form.reset();
      setOpen(false);
    } catch (error) {
      showError("Failed to add track.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="w-full justify-start">
          <Plus className="mr-2 h-4 w-4" /> Add New Track
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New YouTube Track</DialogTitle>
          <DialogDescription>
            Enter the details for the track you want to add to the playlist.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField
              control={form.control}
              name="youtubeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>YouTube Video ID (11 chars)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., jfKfPfyJRdk" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Song Title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="artist"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Artist</FormLabel>
                  <FormControl>
                    <Input placeholder="Artist Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (M:SS)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 3:45 or 1:00:00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Adding..." : "Add Track"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTrackDialog;