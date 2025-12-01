import React from 'react';
import { Menu, Shield, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/context/SidebarContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/integrations/supabase/auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import LogoutButton from './LogoutButton';
import { useAdmin } from '@/hooks/use-admin';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const { toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const isAdmin = useAdmin();
  
  const userInitials = user?.email ? user.email.substring(0, 2).toUpperCase() : 'U';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-background/90 backdrop-blur-sm border-b border-border">
      
      <div className="flex items-center space-x-4">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Toggle Sidebar" className="text-white">
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <Link to="/app" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="Manga Music Logo" className="h-8 w-8 rounded-full" />
          <h1 className="text-xl font-semibold text-white">Manga Music</h1>
        </Link>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              {/* Placeholder for avatar image */}
              <AvatarFallback className="bg-primary text-primary-foreground">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.email}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.id.substring(0, 8)}...
              </p>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/profile" className="flex items-center w-full">
              <User className="mr-2 h-4 w-4" />
              Profile Settings
            </Link>
          </DropdownMenuItem>
          
          {isAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/admin" className="flex items-center w-full">
                  <Shield className="mr-2 h-4 w-4" />
                  Admin Dashboard
                </Link>
              </DropdownMenuItem>
            </>
          )}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <LogoutButton />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default Header;