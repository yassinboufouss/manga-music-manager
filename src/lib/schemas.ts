import * as z from "zod";

export const AddTrackSchema = z.object({
  youtubeId: z.string().min(11, {
    message: "YouTube ID must be 11 characters long.",
  }).max(11, {
    message: "YouTube ID must be 11 characters long.",
  }).regex(/^[a-zA-Z0-9_-]{11}$/, {
    message: "Invalid YouTube ID format.",
  }),
  title: z.string().min(1, {
    message: "Title is required.",
  }),
  artist: z.string().min(1, {
    message: "Artist name is required.",
  }),
  duration: z.string().regex(/^\d+:\d{2}$/, {
    message: "Duration must be in M:SS format (e.g., 3:45).",
  }),
});

export type AddTrackFormValues = z.infer<typeof AddTrackSchema>;