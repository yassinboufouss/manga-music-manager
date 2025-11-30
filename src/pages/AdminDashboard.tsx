import React from 'react';
import { useAdmin } from '@/hooks/use-admin';
import { useAdminProfiles } from '@/hooks/use-admin-profiles';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, ShieldAlert, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import UserTable from '@/components/Admin/UserTable';

const AdminDashboard: React.FC = () => {
  const isAdmin = useAdmin();
  const { data: profiles, isLoading, isError, error } = useAdminProfiles();
  
  // Calculate height dynamically: 100vh - Player (80px) - Header (64px)
  const mainContentHeightClass = "min-h-[calc(100vh-80px-64px)]";

  if (!isAdmin) {
    return (
      <div className={cn("p-8 flex items-center justify-center", mainContentHeightClass)}>
        <Alert variant="destructive" className="max-w-lg">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have administrative privileges to view this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <Alert className="max-w-4xl mb-8">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Welcome, Administrator!</AlertTitle>
        <AlertDescription>
          This panel allows you to view and manage user profiles.
        </AlertDescription>
      </Alert>
      
      <h2 className="text-2xl font-semibold mb-4">User Profiles</h2>
      
      {isLoading && (
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading user data...</span>
        </div>
      )}
      
      {isError && (
        <Alert variant="destructive" className="max-w-4xl">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Data Error</AlertTitle>
          <AlertDescription>
            Failed to load profiles: {error?.message || "Unknown error."}
          </AlertDescription>
        </Alert>
      )}
      
      {profiles && profiles.length > 0 && (
        <div className="max-w-4xl">
          <UserTable profiles={profiles} />
        </div>
      )}
      
      {profiles && profiles.length === 0 && !isLoading && (
        <p className="text-muted-foreground">No user profiles found.</p>
      )}
    </div>
  );
};

export default AdminDashboard;