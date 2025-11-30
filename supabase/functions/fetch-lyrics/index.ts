// @ts-nocheck
/// <reference types="https://deno.land/std@0.190.0/http/server.ts" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

// NOTE: To implement real lyrics fetching, you would integrate a third-party lyrics API here (e.g., Musixmatch, Genius, etc.)
// This implementation returns a placeholder response.

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
    
    console.log(`Attempting to fetch lyrics for: ${title} by ${artist}`);

    // --- Placeholder Logic ---
    // In a real application, you would call an external API here.
    // Example: const lyricsResponse = await fetch('https://lyrics-api.com/search?q=' + encodeURIComponent(title + ' ' + artist));
    
    // Mock delay for demonstration
    await new Promise(resolve => setTimeout(resolve, 500));

    const lyricsData = {
        title,
        artist,
        lyrics: MOCK_LYRICS,
        source: "Mock Data Source (Integrate a real API here)",
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