import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Loader2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { AddTrackSchema, AddTrackFormValues } from '@/lib/schemas';
import { useMusicPlayer } from '@/context/MusicPlayerContext';
import { showError, showSuccess } from '@/utils/toast';
import { useYoutubeMetadata } from '@/hooks/use-youtube-metadata';
import { cn } from '@/lib/utils';
import { useCooldown } from '@/hooks/use-cooldown'; // Import the new hook
import { formatTime } from '@/utils/time'; // Import formatTime

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
  const { data: metadata, isLoading: isFetchingMetadata, error: metadataError, fetchMetadata, resetMetadata } = useYoutubeMetadata();
  const [open, setOpen] = useState(false);
  
  // Cooldown setup (30 seconds)
  const { isCooldownActive, remainingTime, startCooldown } = useCooldown(30);
  
  // Ref to track if the track change was user-initiated (to prevent toast on initial load)
  const lastProcessedIdRef = useRef<string | null>(null); 

  const form = useForm<AddTrackFormValues>({
    resolver: zodResolver(AddTrackSchema),
    defaultValues: {
      youtubeId: "",
      title: "",
      artist: null,
      duration: null,
    },
  });
  
  const youtubeIdValue = form.watch("youtubeId");
  const titleValue = form.watch("title");

  const onSubmit = useCallback(async (data: AddTrackFormValues) => {
    // Ensure artist and duration have fallback values if not provided/fetched
    const trackData = {
      id: data.youtubeId,
      title: data.title,
      artist: data.artist || "Unknown Artist",
      duration: data.duration || "0:00",
    };
    
    try {
      await addTrackToPlaylist(trackData);
      
      // Success: Start cooldown
      startCooldown();
      
      // Clear the ref, reset form, reset metadata state, and close
      lastProcessedIdRef.current = null;
      form.reset();
      resetMetadata(); 
      setOpen(false);
    } catch (error) {
      // Failure: Clear the ref to allow manual retry if the user fixes the input/error
      lastProcessedIdRef.current = null;
      console.error(error);
    }
  }, [addTrackToPlaylist, form, resetMetadata, startCooldown]);


  // Effect to fetch metadata when a valid ID is present
  useEffect(() => {
    if (youtubeIdValue && youtubeIdValue.length === 11 && !isFetchingMetadata) {
      // Clear the processed ref when a new ID is being fetched
      lastProcessedIdRef.current = null;
      fetchMetadata(youtubeIdValue);
    }
  }, [youtubeIdValue, fetchMetadata, isFetchingMetadata]);
  
  // Effect to populate form and trigger automatic submission when metadata arrives
  useEffect(() => {
    // Check if metadata is present AND if the current youtubeId has NOT been processed yet
    if (metadata && youtubeIdValue && lastProcessedIdRef.current !== youtubeIdValue) {
      
      // Set the ref immediately to prevent re-triggering on subsequent renders
      lastProcessedIdRef.current = youtubeIdValue; 
      
      // 1. Populate fields
      form.setValue("title", metadata.title, { shouldValidate: true });
      form.setValue("artist", metadata.artist, { shouldValidate: true });
      form.setValue("duration", metadata.duration, { shouldValidate: true });
      
      // 2. Attempt automatic submission
      form.trigger().then(isValid => {
          if (isValid) {
              // Call the submission handler directly, wrapped by RHF's handleSubmit
              form.handleSubmit(onSubmit)();
          } else {
              showError("Fetched metadata failed validation. Please check fields manually.");
              // If validation fails, clear the ref so the user can fix fields and retry manually
              lastProcessedIdRef.current = null; 
          }
      });
    }
  }, [metadata, form, onSubmit, youtubeIdValue]);
  
  // Effect to show error if metadata fetching fails
  useEffect(() => {
      if (metadataError) {
          showError(`Metadata fetch failed: ${metadataError}. Please enter track details manually.`);
          // If fetch fails, clear the ref to allow retry
          lastProcessedIdRef.current = null;
          // Reset metadata-dependent fields to allow manual input
          form.setValue("title", "");
          form.setValue("artist", null);
          form.setValue("duration", null);
      }
  }, [metadataError, form]);
  
  // Effect to reset the processed ID and metadata when the dialog closes
  useEffect(() => {
      if (!open) {
          lastProcessedIdRef.current = null;
          resetMetadata(); // <-- Reset metadata state on close
          form.reset({ // Reset form fields to default on close
              youtubeId: "",
              title: "",
              artist: null,
              duration: null,
          });
      }
  }, [open, resetMetadata, form]);


  const handleIdInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const extractedId = extractYoutubeId(input);
    
    if (extractedId) {
      form.setValue("youtubeId", extractedId, { shouldValidate: true });
    } else {
      form.setValue("youtubeId", input, { shouldValidate: true });
    }
  }, [form]);

  const cooldownButtonText = isCooldownActive 
    ? `Cooldown: ${formatTime(remainingTime)}` 
    : "Add New Track";
    
  // Determine if manual submission is possible: 
  // 1. Not submitting/fetching
  // 2. Not on cooldown
  // 3. Form is valid (at least ID and Title are required by schema)
  const canManuallySubmit = !form.formState.isSubmitting && !isFetchingMetadata && !isCooldownActive && form.formState.isValid;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="secondary" 
          className="w-full justify-start"
          disabled={isCooldownActive}
        >
          {isCooldownActive ? (
            <Clock className="mr-2 h-4 w-4 animate-pulse" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          {cooldownButtonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New YouTube Track</DialogTitle>
          <DialogDescription>
            Paste a YouTube URL or ID. If metadata fetching fails, you can enter details manually.
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
                    <div className="relative">
                        <Input 
                          placeholder="e.g., https://youtu.be/ID or just the ID" 
                          {...field} 
                          onChange={handleIdInputChange} // Use custom handler
                          value={field.value} // Keep controlled
                          className={cn(isFetchingMetadata && "pr-10")}
                        />
                        {isFetchingMetadata && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary" />
                        )}
                    </div>
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
                    <Input placeholder="Song Title" {...field} disabled={form.formState.isSubmitting} />
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
                  <FormLabel>Artist (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Artist Name" {...field} disabled={form.formState.isSubmitting} value={field.value || ""} />
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
                  <FormLabel>Duration (M:SS) (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 3:45" {...field} disabled={form.formState.isSubmitting} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
                type="submit" 
                className="w-full" 
                // Allow submission if we can manually submit (i.e., ID and Title are present)
                disabled={!canManuallySubmit}
            >
              {form.formState.isSubmitting ? "Adding..." : "Add Track"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTrackDialog;