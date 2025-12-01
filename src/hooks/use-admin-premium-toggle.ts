import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth';
import { showError, showSuccess } from '@/utils/toast';

const togglePremiumStatus = async (userId: string, currentStatus: boolean) => {
  const newStatus = !currentStatus;
  
  // RLS policy on profiles allows users to update their own profile
  const { error } = await supabase
    .from('profiles')
    .update({ is_premium: newStatus })
    .eq('id', userId);

  if (error) throw error;
  return newStatus;
};

export const useAdminPremiumToggle = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;
  const currentStatus = user?.is_premium || false;

  const mutation = useMutation({
    mutationFn: () => togglePremiumStatus(userId!, currentStatus),
    onSuccess: (newStatus) => {
      // Invalidate profile query to force AuthProvider to refetch profile details
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      
      const statusText = newStatus ? "Premium" : "Standard";
      showSuccess(`Your account status is now: ${statusText}.`);
    },
    onError: (error) => {
      console.error("Error toggling premium status:", error);
      showError("Failed to update premium status.");
    }
  });

  return {
    togglePremium: mutation.mutate,
    isPending: mutation.isPending,
    currentStatus,
  };
};