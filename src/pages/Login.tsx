import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth';
import { Navigate } from 'react-router-dom';

const Login = () => {
  const { user, isLoading } = useAuth();

  if (!isLoading && user) {
    // Redirect authenticated users to the home page
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center text-foreground">Sign In to Dyad Music</h1>
        <Auth
          supabaseClient={supabase}
          providers={[]}
          appearance={{
            theme: ThemeSupa,
            variables: {
                default: {
                    colors: {
                        brand: 'hsl(var(--primary))',
                        brandAccent: 'hsl(var(--primary-foreground))',
                    },
                },
            },
          }}
          theme="dark"
          redirectTo={window.location.origin + '/'}
        />
      </div>
    </div>
  );
};

export default Login;