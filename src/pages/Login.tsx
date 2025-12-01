import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth';
import { Navigate } from 'react-router-dom';

const Login = () => {
  const { user, isLoading } = useAuth();

  if (!isLoading && user) {
    // Redirect authenticated users to the main application page
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm p-8 space-y-8 bg-card rounded-xl shadow-2xl border border-border">
        <div className="flex flex-col items-center space-y-2">
          <img src="/logo.png" alt="Manga Music Logo" className="h-10 w-10 rounded-full" />
          <h1 className="text-3xl font-bold text-center text-foreground">Welcome to Manga Music</h1>
          <p className="text-sm text-muted-foreground">Sign in or create an account to continue.</p>
        </div>
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
          redirectTo={window.location.origin + '/app'}
        />
      </div>
    </div>
  );
};

export default Login;