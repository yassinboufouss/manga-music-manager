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
  order_index: number; // Added for reordering
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
  orderIndex: dbTrack.order_index, // Added
});

// Helper function to transform context track to DB insert object
const transformTrackToDb = (track: Omit<Track, 'dbId' | 'orderIndex'>, playlistId: string, orderIndex: number) => ({
  playlist_id: playlistId,
  youtube_id: track.id,
  title: track.title,
  artist: track.artist,
  duration: track.duration,
  order_index: orderIndex, // Include order index on insert
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
    .order('order_index', { ascending: true }); // Order by the new index

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
    mutationFn: async (track: Omit<Track, 'dbId' | 'orderIndex'>) => {
      if (!playlistQuery.data) throw new Error("Playlist data not loaded.");
      
      const playlistId = playlistQuery.data.id;
      
      // Determine the next order index (max current index + 1, or 1 if empty)
      const currentTracks = playlistQuery.data.tracks;
      const maxOrderIndex = currentTracks.reduce((max, t) => Math.max(max, t.orderIndex || 0), 0);
      const newOrderIndex = maxOrderIndex + 1;
      
      const trackToInsert = transformTrackToDb(track, playlistId, newOrderIndex);
      
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
  
  const updateTrackOrderMutation = useMutation({
    mutationFn: async (updates: { dbId: string; orderIndex: number }[]) => {
      // Perform a batch update for all tracks whose order changed
      const updatePromises = updates.map(update => 
        supabase
          .from('tracks')
          .update({ order_index: update.orderIndex })
          .eq('id', update.dbId)
      );
      
      const results = await Promise.all(updatePromises);
      
      const errors = results.map(r => r.error).filter(Boolean);
      if (errors.length > 0) {
        throw new Error(`Failed to update track order: ${errors[0]?.message}`);
      }
      return updates;
    },
    onSuccess: () => {
      // Invalidate the playlist query to refetch the updated track list
      queryClient.invalidateQueries({ queryKey: ['playlist', userId] });
    },
  });
  
  const updatePlaylistNameMutation = useMutation({
    mutationFn: async ({ playlistId, newName }: { playlistId: string; newName: string }) => {
      const { data, error } = await supabase
        .from('playlists')
        .update({ name: newName })
        .eq('id', playlistId)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist', userId] });
    },
  });

  return {
    playlistQuery,
    addTrackMutation,
    deleteTrackMutation,
    updateTrackOrderMutation,
    updatePlaylistNameMutation,
  };
};