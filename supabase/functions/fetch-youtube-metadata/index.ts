// @ts-nocheck
/// <reference types="https://deno.land/std@0.190.0/http/server.ts" />
/// <reference types="https://esm.sh/@supabase/supabase-js@2.45.0" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

// Utility to format duration from ISO 8601 (PT#M#S) to M:SS
function formatDuration(isoDuration: string): string {
  const matches = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!matches) return '0:00';

  const hours = parseInt(matches[1] || '0', 10);
  const minutes = parseInt(matches[2] || '0', 10);
  const seconds = parseInt(matches[3] || '0', 10);

  // Calculate total seconds
  const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
  
  // Convert total seconds to M:SS format
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  
  return `${m}:${String(s).padStart(2, '0')}`;
}

// Simple attempt to extract artist from title
function extractArtist(title: string): string {
    const separators = [' - ', ' | ', ' (', ' [', ' ft. ', ' feat. '];
    for (const sep of separators) {
        const parts = title.split(sep);
        if (parts.length > 1) {
            // Assume the first part is the artist
            return parts[0].trim();
        }
    }
    return 'Unknown Artist';
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { youtubeId } = await req.json();

    if (!youtubeId) {
      return new Response(JSON.stringify({ error: 'Missing youtubeId' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Fetch API Key from Supabase Secrets
    const YOUTUBE_API_KEY = Deno.env.get('youtube_api_key');
    if (!YOUTUBE_API_KEY) {
        console.error("youtube_api_key secret not set.");
        return new Response(JSON.stringify({ error: 'Server configuration error: YouTube API Key missing.' }), {
            status: 500,
            headers: corsHeaders,
        });
    }

    const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${youtubeId}&key=${YOUTUBE_API_KEY}&part=snippet,contentDetails`;

    const response = await fetch(youtubeApiUrl);
    const data = await response.json();
    
    if (!response.ok) {
        console.error('YouTube API HTTP Error:', response.status, data);
        return new Response(JSON.stringify({ 
            error: `YouTube API HTTP Error: ${response.status}. Check logs for details.`,
            details: data.error || 'Unknown API error'
        }), {
            status: response.status,
            headers: corsHeaders,
        });
    }

    if (data.error) {
        console.error('YouTube API Error (in response body):', data.error);
        return new Response(JSON.stringify({ error: `YouTube API Error: ${data.error.message || 'Check API Key and quotas.'}` }), {
            status: 400,
            headers: corsHeaders,
        });
    }

    if (data.items && data.items.length > 0) {
      const item = data.items[0];
      const title = item.snippet.title;
      const durationIso = item.contentDetails.duration;
      
      const metadata = {
        title: title,
        artist: extractArtist(title),
        duration: formatDuration(durationIso),
      };

      return new Response(JSON.stringify(metadata), {
        status: 200,
        headers: corsHeaders,
      });
    } else {
      return new Response(JSON.stringify({ error: 'Video not found or invalid ID.' }), {
        status: 404,
        headers: corsHeaders,
      });
    }
  } catch (error) {
    console.error('Edge Function Runtime Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error.' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});