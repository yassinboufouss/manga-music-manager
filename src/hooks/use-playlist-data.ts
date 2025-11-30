import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth';
import { Track } from '@/context/MusicPlayerContext';

// Define DB types
interface DbTrack {
  id: string; // UUID from DB
  playlist_id: string;
  youtube_id: string;
  title: string;
  artist: string;
  duration: string;
  created_at: string;
}

interface DbPlaylist {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  tracks: DbTrack[];
}

// Helper function to transform DB track to context track
const transformTrack = (dbTrack: DbTrack): Track => ({
  dbId: dbTrack.id, // Store DB ID for updates/deletes
  id: dbTrack.youtube_id, // YouTube ID
  title: dbTrack.title,
  artist: dbTrack.artist,
  duration: dbTrack.duration,
});

// Helper function to transform context track to DB insert object
const transformTrackToDb = (track: Omit<Track, 'dbId'>, playlistId: string) => ({
  playlist_id: playlistId,
  youtube_id: track.id,
  title: track.title,
  artist: track.artist,
  duration: track.duration,
});

// --- Data Fetching ---

const fetchUserPlaylist = async (userId: string) => {
  // 1. Try to fetch the user's default playlist (e.g., named 'My Tracks')
  let { data: playlist, error: playlistError } = await supabase
    .from('playlists')
    .select('*')
    .eq('user_id', userId)
    .limit(1)
    .single();

  if (playlistError && playlistError.code !== 'PGRST116') { // PGRST116 means 'no rows found'
    throw playlistError;
  }

  let playlistId: string;

  // 2. If no playlist exists, create one
  if (!playlist) {
    const { data: newPlaylist, error: insertError } = await supabase
      .from('playlists')
      .insert([{ user_id: userId, name: 'My Tracks' }])
      .select()
      .single();

    if (insertError) throw insertError;
    playlist = newPlaylist;
  }
  
  playlistId = playlist.id;

  // 3. Fetch tracks associated with the playlist
  const { data: tracks, error: tracksError } = await supabase
    .from('tracks')
    .select('*')
    .eq('playlist_id', playlistId)
    .order('created_at', { ascending: true });

  if (tracksError) throw tracksError;

  return {
    ...playlist,
    tracks: tracks.map(transformTrack),
  };
};

export const usePlaylistData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const playlistQuery = useQuery({
    queryKey: ['playlist', userId],
    queryFn: () => fetchUserPlaylist(userId!),
    enabled: !!userId,
  });
  
  // --- Mutations ---
  
  const addTrackMutation = useMutation({
    mutationFn: async (track: Omit<Track, 'dbId'>) => {
      if (!playlistQuery.data) throw new Error("Playlist data not loaded.");
      
      const playlistId = playlistQuery.data.id;
      const trackToInsert = transformTrackToDb(track, playlistId);
      
      const { data, error } = await supabase
        .from('tracks')
        .insert(trackToInsert)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate the playlist query to refetch the updated track list
      queryClient.invalidateQueries({ queryKey: ['playlist', userId] });
    },
  });
  
  const deleteTrackMutation = useMutation({
    mutationFn: async (trackDbId: string) => {
      const { error } = await supabase
        .from('tracks')
        .delete()
        .eq('id', trackDbId);
        
      if (error) throw error;
      return trackDbId;
    },
    onSuccess: () => {
      // Invalidate the playlist query to refetch the updated track list
      queryClient.invalidateQueries({ queryKey: ['playlist', userId] });
    },
  });

  return {
    playlistQuery,
    addTrackMutation,
    deleteTrackMutation,
  };
};