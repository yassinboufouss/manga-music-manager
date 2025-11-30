import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth';
import { Track, Playlist } from '@/context/MusicPlayerContext';

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

// Updated DbPlaylist type (metadata only)
interface DbPlaylist {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
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

// --- Data Fetching Functions ---

const fetchUserPlaylists = async (userId: string): Promise<DbPlaylist[]> => {
  // 1. Fetch existing playlists
  let { data: playlists, error } = await supabase
    .from('playlists')
    .select('id, user_id, name, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  // 2. If no playlists exist, create a default one
  if (!playlists || playlists.length === 0) {
    const { data: newPlaylist, error: insertError } = await supabase
      .from('playlists')
      .insert([{ user_id: userId, name: 'My Tracks' }])
      .select('id, user_id, name, created_at')
      .single();

    if (insertError) throw insertError;
    playlists = [newPlaylist];
  }
  
  return playlists as DbPlaylist[];
};

const fetchTracksForPlaylist = async (playlistId: string): Promise<Track[]> => {
    const { data: tracks, error: tracksError } = await supabase
        .from('tracks')
        .select('*')
        .eq('playlist_id', playlistId)
        .order('order_index', { ascending: true });

    if (tracksError) throw tracksError;

    return tracks.map(transformTrack);
};

export const usePlaylistData = (selectedPlaylistId: string | null, currentPlaylist: Playlist | null) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  // Query 1: Fetch all playlists metadata
  const playlistsQuery = useQuery({
    queryKey: ['playlists', userId],
    queryFn: () => fetchUserPlaylists(userId!),
    enabled: !!userId,
  });
  
  // Query 2: Fetch tracks for the selected playlist
  const tracksQuery = useQuery({
    queryKey: ['tracks', selectedPlaylistId],
    queryFn: () => fetchTracksForPlaylist(selectedPlaylistId!),
    // Only enable if a playlist is selected
    enabled: !!selectedPlaylistId, 
  });
  
  // --- Mutations ---
  
  const addTrackMutation = useMutation({
    mutationFn: async (track: Omit<Track, 'dbId' | 'orderIndex'>) => {
      if (!selectedPlaylistId || !currentPlaylist) throw new Error("Playlist not selected or loaded.");
      
      const playlistId = selectedPlaylistId;
      
      // Determine the next order index based on the current state (passed from context)
      const currentTracks = currentPlaylist.tracks;
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
      queryClient.invalidateQueries({ queryKey: ['tracks', selectedPlaylistId] });
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
      queryClient.invalidateQueries({ queryKey: ['tracks', selectedPlaylistId] });
    },
  });
  
  const deleteAllTracksMutation = useMutation({
    mutationFn: async (playlistId: string) => {
      const { error } = await supabase
        .from('tracks')
        .delete()
        .eq('playlist_id', playlistId);
        
      if (error) throw error;
      return playlistId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks', selectedPlaylistId] });
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
      queryClient.invalidateQueries({ queryKey: ['tracks', selectedPlaylistId] });
    },
  });
  
  const updatePlaylistNameMutation = useMutation({
    mutationFn: async ({ playlistId, newName }: { playlistId: string; newName: string }) => {
      const { data, error } = await supabase
        .from('playlists')
        .update({ name: newName })
        .eq('id', playlistId)
        .select('id, name')
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists', userId] });
    },
  });
  
  const createPlaylistMutation = useMutation({
    mutationFn: async (name: string) => {
        if (!userId) throw new Error("User not authenticated.");
        
        const { data, error } = await supabase
            .from('playlists')
            .insert([{ user_id: userId, name: name }])
            .select('id, name')
            .single();
            
        if (error) throw error;
        return data;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['playlists', userId] });
    }
  });

  return {
    playlists: playlistsQuery.data || null,
    tracks: tracksQuery.data || null,
    isLoadingPlaylists: playlistsQuery.isLoading,
    isLoadingTracks: tracksQuery.isLoading,
    isError: playlistsQuery.isError || tracksQuery.isError,
    error: playlistsQuery.error || tracksQuery.error,
    
    addTrackMutation,
    deleteTrackMutation,
    deleteAllTracksMutation,
    updateTrackOrderMutation,
    updatePlaylistNameMutation,
    createPlaylistMutation,
  };
};