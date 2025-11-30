import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './client';
import { Loader2 } from 'lucide-react';

// Extend the User type to include profile data and ban status
interface AppUser extends User {
  is_admin: boolean;
  is_banned: boolean; // New field
}

interface AuthContextType {
  session: Session | null;
  user: AppUser | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to check if the user is currently banned
const checkBanStatus = (bannedUntil: string | null): boolean => {
    if (!bannedUntil) return false;
    const banDate = new Date(bannedUntil);
    // Check if the ban date is in the future
    return banDate.getTime() > Date.now();
};

// Helper function to fetch profile data
const fetchUserProfile = async (user: User): Promise<AppUser> => {
    // Fetch profile data (is_admin) and banned_until from the view
    const { data, error } = await supabase
        .from('user_details_view')
        .select('is_admin, banned_until')
        .eq('id', user.id)
        .single();

    if (error) {
        console.error("Error fetching profile:", error);
        // Return user with default status if fetch fails
        return { ...user, is_admin: false, is_banned: false };
    }
    
    const isBanned = checkBanStatus(data.banned_until);
    
    return { 
        ...user, 
        is_admin: data.is_admin, 
        is_banned: isBanned 
    };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleSession = async (session: Session | null) => {
    setSession(session);
    if (session?.user) {
        const appUser = await fetchUserProfile(session.user);
        setUser(appUser);
    } else {
        setUser(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Handle sign out immediately
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        setIsLoading(false);
      } else {
        handleSession(session);
      }
    });

    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ session, user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};