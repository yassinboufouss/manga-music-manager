import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

const EDGE_FUNCTION_NAME = 'delete-user';

const deleteAccount = async () => {
  // The Edge Function uses the JWT from the request header to identify the user to delete.
  const { data, error } = await supabase.functions.invoke(EDGE_FUNCTION_NAME, {});

  if (error) {
    throw new Error(error.message);
  }
  
  if (data && data.error) {
    throw new Error(data.error);
  }

  return data;
};

export const useDeleteAccount = () => {
  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      // The user is automatically signed out by Supabase after deletion, 
      // which triggers the AuthProvider to redirect to /login.
      showSuccess("Your account has been permanently deleted.");
    },
    onError: (error) => {
      console.error("Error deleting account:", error);
      showError(`Failed to delete account: ${error.message}`);
    },
  });

  return {
    deleteAccount: deleteMutation.mutate,
    isPending: deleteMutation.isPending,
  };
};