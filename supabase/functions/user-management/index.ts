// @ts-nocheck
/// <reference types="https://deno.land/std@0.190.0/http/server.ts" />
/// <reference types="https://esm.sh/@supabase/supabase-js@2.45.0" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import * as jose from 'https://deno.land/x/jose@v5.2.4/index.ts';

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

// Function to check if the requesting user is an admin
async function isUserAdmin(userId: string): Promise<boolean> {
    const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();

    if (error || !data) {
        console.error("Error checking admin status:", error?.message);
        return false;
    }
    return data.is_admin === true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const adminUserId = await getUserIdFromToken(req);
  if (!adminUserId) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Invalid or missing token.' }), { status: 401, headers: corsHeaders });
  }
  
  const isAdmin = await isUserAdmin(adminUserId);
  if (!isAdmin) {
    return new Response(JSON.stringify({ error: 'Forbidden: User is not an administrator.' }), { status: 403, headers: corsHeaders });
  }

  try {
    const { action, targetUserId } = await req.json();

    if (!targetUserId || !['ban', 'unban'].includes(action)) {
      return new Response(JSON.stringify({ error: 'Missing targetUserId or invalid action.' }), { status: 400, headers: corsHeaders });
    }
    
    // Prevent admin from banning themselves
    if (targetUserId === adminUserId) {
        return new Response(JSON.stringify({ error: 'Cannot perform action on self.' }), { status: 400, headers: corsHeaders });
    }

    let updateData: { banned_until: string | null } = { banned_until: null };
    let message = '';

    if (action === 'ban') {
      // Set banned_until far in the future (e.g., 100 years)
      const banDate = new Date();
      banDate.setFullYear(banDate.getFullYear() + 100);
      updateData = { banned_until: banDate.toISOString() };
      message = 'User banned successfully.';
    } else if (action === 'unban') {
      updateData = { banned_until: null };
      message = 'User unbanned successfully.';
    }

    const { data: userData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      targetUserId,
      updateData
    );

    if (updateError) {
      console.error(`Supabase Admin Update Error (${action}):`, updateError);
      return new Response(JSON.stringify({ error: `Failed to update user: ${updateError.message}` }), { status: 500, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ success: true, message, user: userData.user }), {
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