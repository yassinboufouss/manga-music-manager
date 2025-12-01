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

const uploadAvatarAndSaveUrl = async (userId: string, file: File) => {
  const fileExt = file.name.split('.').pop();
  // Use the user ID as the folder name to enforce RLS, and a timestamp for unique file naming
  const filePath = `${userId}/${Date.now()}.${fileExt}`; 
  
  // 1. Upload file to storage
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) throw uploadError;
  
  // 2. Get public URL
  const { data: publicUrlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);
    
  const avatarUrl = publicUrlData.publicUrl;

  // 3. Update profile table
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId);

  if (updateError) throw updateError;
  
  return avatarUrl;
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
  
  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => uploadAvatarAndSaveUrl(userId!, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      showSuccess("Avatar uploaded successfully!");
    },
    onError: (error) => {
      console.error("Error uploading avatar:", error);
      showError("Failed to upload avatar.");
    }
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isUpdating: updateProfileMutation.isPending,
    isUploadingAvatar: uploadAvatarMutation.isPending,
    updateProfile: updateProfileMutation.mutate,
    uploadAvatar: uploadAvatarMutation.mutate,
  };
};