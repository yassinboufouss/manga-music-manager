import { useAuth } from '@/integrations/supabase/auth';

export const useAdmin = () => {
  const { user } = useAuth();
  
  // Check if user exists and if the is_admin property is true
  return user?.is_admin === true;
};