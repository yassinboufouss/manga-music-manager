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

export const RenamePlaylistSchema = z.object({
  name: z.string().min(1, {
    message: "Playlist name cannot be empty.",
  }).max(100, {
    message: "Playlist name is too long.",
  }),
});

export type RenamePlaylistFormValues = z.infer<typeof RenamePlaylistSchema>;

export const ProfileSchema = z.object({
  first_name: z.string().max(50, "First name is too long.").optional().nullable(),
  last_name: z.string().max(50, "Last name is too long.").optional().nullable(),
});

export type ProfileFormValues = z.infer<typeof ProfileSchema>;

export const UpdatePasswordSchema = z.object({
  password: z.string().min(6, {
    message: "Password must be at least 6 characters long.",
  }),
});

export type UpdatePasswordFormValues = z.infer<typeof UpdatePasswordSchema>;