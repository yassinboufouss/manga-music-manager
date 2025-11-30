import React, { useState } from 'react';
import { LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

const LogoutButton: React.FC = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        showError(`Logout failed: ${error.message}`);
        console.error("Logout error:", error);
      } else {
        showSuccess("Successfully logged out.");
      }
    } catch (e) {
      showError("An unexpected error occurred during logout.");
      console.error("Unexpected logout error:", e);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Button 
      variant="ghost" 
      className="w-full justify-start text-muted-foreground hover:text-foreground"
      onClick={handleLogout}
      disabled={isLoggingOut}
    >
      {isLoggingOut ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="mr-2 h-4 w-4" />
      )}
      {isLoggingOut ? "Logging out..." : "Log Out"}
    </Button>
  );
};

export default LogoutButton;