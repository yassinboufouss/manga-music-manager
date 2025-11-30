import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/integrations/supabase/auth';
import Layout from './Layout';

const ProtectedRoute: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // Loading state is handled inside AuthProvider, but this prevents flicker
    return null; 
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Check for ban status and redirect if banned
  if (user.is_banned) {
      return <Navigate to="/banned" replace />;
  }

  // Render the Layout component around the Outlet for all protected pages
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default ProtectedRoute;