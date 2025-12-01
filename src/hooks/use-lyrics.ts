import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePremium } from './use-premium';

interface LyricsData {
  title: string;
  artist: string;
  lyrics: string;
  source: string;
}

const EDGE_FUNCTION_NAME = 'fetch-lyrics';

const fetchLyrics = async (title: string, artist: string): Promise<LyricsData> => {
  const { data, error } = await supabase.functions.invoke(EDGE_FUNCTION_NAME, {
    body: { title, artist },
  });

  if (error) {
    throw new Error(error.message);
  }
  
  if (data && data.error) {
    throw new Error(data.error);
  }

  return data as LyricsData;
};

export const useLyrics = (title: string | null, artist: string | null) => {
  const isPremium = usePremium();

  const query = useQuery({
    queryKey: ['lyrics', title, artist],
    queryFn: () => fetchLyrics(title!, artist!),
    enabled: !!title && !!artist && isPremium, // Only enable if premium
    staleTime: Infinity, // Lyrics don't change often
  });

  return { ...query, isPremium };
};