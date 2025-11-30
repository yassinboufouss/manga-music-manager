import React, { useState, useCallback } from 'react';
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

// Utility function to extract YouTube ID from various URL formats
const extractYoutubeId = (urlOrId: string): string | null => {
  // 1. Check if it's already an 11-character ID
  if (urlOrId.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) {
    return urlOrId;
  }

  // 2. Handle standard watch URL: https://www.youtube.com/watch?v=ID
  const watchRegex = /[?&]v=([a-zA-Z0-9_-]{11})/;
  let match = urlOrId.match(watchRegex);
  if (match && match[1]) return match[1];

  // 3. Handle short URL: https://youtu.be/ID
  const shortRegex = /youtu\.be\/([a-zA-Z0-9_-]{11})/;
  match = urlOrId.match(shortRegex);
  if (match && match[1]) return match[1];

  // 4. Handle embed URL: https://www.youtube.com/embed/ID
  const embedRegex = /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/;
  match = urlOrId.match(embedRegex);
  if (match && match[1]) return match[1];

  return null;
};


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
  
  const handleIdInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const extractedId = extractYoutubeId(input);
    
    if (extractedId) {
      form.setValue("youtubeId", extractedId, { shouldValidate: true });
    } else {
      form.setValue("youtubeId", input, { shouldValidate: true });
    }
  }, [form]);


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
            Paste a YouTube URL or ID. The ID will be extracted automatically.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField
              control={form.control}
              name="youtubeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>YouTube URL or Video ID</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., https://youtu.be/ID or just the ID" 
                      {...field} 
                      onChange={handleIdInputChange} // Use custom handler
                      value={field.value} // Keep controlled
                    />
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
                  <FormLabel>Title (Manual Input)</FormLabel>
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
                  <FormLabel>Artist (Manual Input)</FormLabel>
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
                  <FormLabel>Duration (M:SS, Manual Input)</FormLabel>
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