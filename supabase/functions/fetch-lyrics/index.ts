// @ts-nocheck
/// <reference types="https://deno.land/std@0.190.0/http/server.ts" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    const { title, artist } = await req.json();

    if (!title || !artist) {
      return new Response(JSON.stringify({ error: 'Missing title or artist.' }), {
        status: 400,
        headers: corsHeaders,
      });
    }
    
    const GENIUS_ACCESS_TOKEN = Deno.env.get('genius_access_token');
    const searchQuery = `${title} ${artist}`;
    
    if (!GENIUS_ACCESS_TOKEN) {
        console.warn("genius_access_token secret not set. Returning mock lyrics.");
        
        // --- Mock Data Fallback ---
        const MOCK_LYRICS = `(Verse 1)
The sun goes down, the stars come out
And all that counts is here and now
A melody starts to play
Washing all the worries away

(Chorus)
Sing it loud, let the music guide
Where the rhythm flows and we can hide
In the sound, in the beat, in the light
Dancing through the day and night.

(Bridge)
Every note a memory
Every word a history
This is our anthem, strong and true
A song for me, a song for you.

(Outro)
Fade out...`;
        
        await new Promise(resolve => setTimeout(resolve, 500));

        const lyricsData = {
            title,
            artist,
            lyrics: MOCK_LYRICS,
            source: "Mock Data (No Genius Access Token)",
        };

        return new Response(JSON.stringify(lyricsData), {
          status: 200,
          headers: corsHeaders,
        });
    }

    // --- Genius API Search Integration ---
    console.log(`Searching Genius for: ${searchQuery}`);
    
    const geniusApiUrl = `https://api.genius.com/search?q=${encodeURIComponent(searchQuery)}`;
    
    const response = await fetch(geniusApiUrl, {
        headers: {
            'Authorization': `Bearer ${GENIUS_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
        },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        console.error('Genius API HTTP Error:', response.status, data);
        return new Response(JSON.stringify({ 
            error: `Genius API HTTP Error: ${response.status}. Check token and logs.`,
            details: data.error || 'Unknown API error'
        }), {
            status: response.status,
            headers: corsHeaders,
        });
    }

    const firstHit = data.response.hits?.[0]?.result;
    
    if (firstHit) {
        // Genius API does not provide lyrics directly in the search result.
        // It provides the URL to the song page (firstHit.url).
        // Fetching lyrics requires scraping that URL, which is complex and unreliable in an Edge Function.
        
        const lyricsData = {
            title: firstHit.title,
            artist: firstHit.artist_names,
            lyrics: `Lyrics found on Genius!
Song ID: ${firstHit.id}
URL: ${firstHit.url}

Note: Direct lyrics fetching requires a more complex setup (e.g., a dedicated scraping service or a higher-tier API key). Please visit the URL above to view the lyrics.`,
            source: `Genius Search API (Song Found)`,
        };

        return new Response(JSON.stringify(lyricsData), {
            status: 200,
            headers: corsHeaders,
        });
    } else {
        return new Response(JSON.stringify({ error: `No lyrics found on Genius for "${searchQuery}".` }), {
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