import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface YoutubeMetadata {
  title: string;
  artist: string;
  duration: string;
}

interface FetchState {
  data: YoutubeMetadata | null;
  isLoading: boolean;
  error: string | null;
}

const EDGE_FUNCTION_NAME = 'fetch-youtube-metadata';

export const useYoutubeMetadata = () => {
  const [state, setState] = useState<FetchState>({
    data: null,
    isLoading: false,
    error: null,
  });

  const fetchMetadata = useCallback(async (youtubeId: string) => {
    if (!youtubeId || youtubeId.length !== 11) {
      setState({ data: null, isLoading: false, error: null });
      return;
    }
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase.functions.invoke(EDGE_FUNCTION_NAME, {
        body: { youtubeId },
      });

      if (error) {
        throw new Error(error.message);
      }
      
      if (data && data.error) {
          throw new Error(data.error);
      }

      setState({
        data: data as YoutubeMetadata,
        isLoading: false,
        error: null,
      });
      return data as YoutubeMetadata;

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to fetch metadata.";
      setState({
        data: null,
        isLoading: false,
        error: errorMessage,
      });
      return null;
    }
  }, []);

  return {
    ...state,
    fetchMetadata,
  };
};