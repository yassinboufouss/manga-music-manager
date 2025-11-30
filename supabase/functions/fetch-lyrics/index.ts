// @ts-nocheck
/// <reference types="https://deno.land/std@0.190.0/http/server.ts" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

// NOTE: To implement real lyrics fetching, you would integrate a third-party lyrics API here (e.g., Musixmatch, Genius, etc.)
// This implementation returns a placeholder response if no API key is configured.

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
    
    const LYRICS_API_KEY = Deno.env.get('lyrics_api_key');
    
    if (LYRICS_API_KEY) {
        // --- REAL API INTEGRATION TEMPLATE ---
        console.log(`Using real API key to fetch lyrics for: ${title} by ${artist}`);
        
        // Replace this block with your actual API call logic
        // Example using a hypothetical API:
        /*
        const searchUrl = `https://api.lyrics.com/search?q=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}&apikey=${LYRICS_API_KEY}`;
        const apiResponse = await fetch(searchUrl);
        const apiData = await apiResponse.json();
        
        if (apiData.lyrics) {
            return new Response(JSON.stringify({
                title,
                artist,
                lyrics: apiData.lyrics,
                source: "Real Lyrics API",
            }), { status: 200, headers: corsHeaders });
        }
        */
        
        // Fallback to mock data if real API integration is not complete or fails
        console.warn("Real API key found, but API integration template is commented out. Falling back to mock data.");
    } else {
        console.warn("lyrics_api_key secret not set. Returning mock lyrics.");
    }

    // --- Mock Data Fallback ---
    // Mock delay for demonstration
    await new Promise(resolve => setTimeout(resolve, 500));

    const lyricsData = {
        title,
        artist,
        lyrics: MOCK_LYRICS,
        source: LYRICS_API_KEY ? "Mock Data (API integration pending)" : "Mock Data (No API Key)",
    };

    return new Response(JSON.stringify(lyricsData), {
      status: 200,
      headers: corsHeaders,
    });

  } catch (error) {
    console.error('Edge Function Runtime Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error.' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});