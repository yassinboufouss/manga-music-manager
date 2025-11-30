import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth';
import { showError, showSuccess } from '@/utils/toast';
import { ProfileFormValues } from '@/lib/schemas';

interface DbProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

const fetchProfile = async (userId: string): Promise<DbProfile> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, avatar_url')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

const updateProfile = async (userId: string, updates: ProfileFormValues) => {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) throw error;
};

export const useProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const profileQuery = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => fetchProfile(userId!),
    enabled: !!userId,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (updates: ProfileFormValues) => updateProfile(userId!, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      showSuccess("Profile updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
      showError("Failed to update profile.");
    }
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isUpdating: updateProfileMutation.isPending,
    updateProfile: updateProfileMutation.mutate,
  };
};