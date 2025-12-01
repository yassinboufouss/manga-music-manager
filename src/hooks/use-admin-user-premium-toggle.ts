import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

interface TogglePayload {
  userId: string;
  currentStatus: boolean;
}

const togglePremiumStatus = async ({ userId, currentStatus }: TogglePayload) => {
  const newStatus = !currentStatus;
  
  // Admin RLS policy allows this update
  const { error } = await supabase
    .from('profiles')
    .update({ is_premium: newStatus })
    .eq('id', userId);

  if (error) throw error;
  return newStatus;
};

export const useAdminUserPremiumToggle = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: togglePremiumStatus,
    onSuccess: (newStatus, variables) => {
      // Invalidate the admin profiles list to reflect the change immediately
      queryClient.invalidateQueries({ queryKey: ['adminProfiles'] });
      
      const statusText = newStatus ? "Premium" : "Standard";
      showSuccess(`User ${variables.userId.substring(0, 8)}... status updated to ${statusText}.`);
    },
    onError: (error) => {
      console.error("Error toggling user premium status:", error);
      showError("Failed to update user premium status.");
    }
  });

  return {
    togglePremium: mutation.mutate,
    isPending: mutation.isPending,
    pendingTargetId: mutation.isPending ? mutation.variables?.userId : null,
  };
};