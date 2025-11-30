import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { useAuth } from '@/integrations/supabase/auth';

const EDGE_FUNCTION_NAME = 'user-management';

interface AdminActionPayload {
  action: 'ban' | 'unban';
  targetUserId: string;
}

const performAdminAction = async ({ action, targetUserId }: AdminActionPayload) => {
  const { data, error } = await supabase.functions.invoke(EDGE_FUNCTION_NAME, {
    body: { action, targetUserId },
  });

  if (error) {
    throw new Error(error.message);
  }
  
  if (data && data.error) {
    throw new Error(data.error);
  }

  return data;
};

export const useAdminActions = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const adminActionMutation = useMutation({
    mutationFn: performAdminAction,
    onSuccess: (data, variables) => {
      // Invalidate the admin profiles list to reflect the change immediately
      queryClient.invalidateQueries({ queryKey: ['adminProfiles'] });
      
      const actionVerb = variables.action === 'ban' ? 'banned' : 'unbanned';
      showSuccess(`User ${actionVerb} successfully.`);
    },
    onError: (error, variables) => {
      const actionVerb = variables.action === 'ban' ? 'ban' : 'unban';
      console.error(`Error performing admin action (${actionVerb}):`, error);
      showError(`Failed to ${actionVerb} user: ${error.message}`);
    },
  });
  
  const banUser = (targetUserId: string) => {
      if (user?.id === targetUserId) {
          showError("You cannot ban yourself.");
          return;
      }
      adminActionMutation.mutate({ action: 'ban', targetUserId });
  };
  
  const unbanUser = (targetUserId: string) => {
      adminActionMutation.mutate({ action: 'unban', targetUserId });
  };

  return {
    banUser,
    unbanUser,
    isPending: adminActionMutation.isPending,
  };
};