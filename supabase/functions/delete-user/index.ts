// @ts-nocheck
/// <reference types="https://deno.land/std@0.190.0/http/server.ts" />
/// <reference types="https://esm.sh/@supabase/supabase-js@2.45.0" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

// Initialize Supabase client with the Service Role Key for admin actions
const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Function to verify JWT and get user ID
async function getUserIdFromToken(req: Request): Promise<string | null> {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.replace('Bearer ', '');
    
    try {
        // Use the Supabase client to get claims, which verifies the token
        const { data, error } = await supabaseAdmin.auth.getUser(token);
        
        if (error) {
            console.error("JWT verification failed:", error.message);
            return null;
        }
        
        return data.user.id;
    } catch (e) {
        console.error("Error verifying token:", e);
        return null;
    }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestingUserId = await getUserIdFromToken(req);
  if (!requestingUserId) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Invalid or missing token.' }), { status: 401, headers: corsHeaders });
  }

  try {
    // The user requesting the deletion is the user being deleted
    const targetUserId = requestingUserId;

    // Use the Admin client to delete the user
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);

    if (deleteError) {
      console.error('Supabase Admin Delete Error:', deleteError);
      return new Response(JSON.stringify({ error: `Failed to delete user: ${deleteError.message}` }), { status: 500, headers: corsHeaders });
    }
    
    // Note: Supabase RLS and CASCADE deletes should handle associated profile/playlist data.

    return new Response(JSON.stringify({ success: true, message: 'User deleted successfully.' }), {
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