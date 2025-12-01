import { useAuth } from '@/integrations/supabase/auth';

export const usePremium = () => {
  const { user } = useAuth();
  
  // Check if user exists and if the is_premium property is true
  return user?.is_premium === true;
};