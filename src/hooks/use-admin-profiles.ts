import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from './use-admin';

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  updated_at: string;
  email: string; // Added email field
  banned_until: string | null; // Added banned_until field
  created_at: string; // Added created_at field
}

const fetchAllProfiles = async (): Promise<Profile[]> => {
  // Admins can read all profiles due to RLS policy
  const { data, error } = await supabase
    .from('user_details_view') // Querying the new view
    .select('id, first_name, last_name, avatar_url, is_admin, updated_at, email, banned_until, created_at')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data as Profile[];
};

export const useAdminProfiles = () => {
  const isAdmin = useAdmin();

  const query = useQuery({
    queryKey: ['adminProfiles'],
    queryFn: fetchAllProfiles,
    enabled: isAdmin, // Only fetch if the current user is an admin
  });

  return query;
};