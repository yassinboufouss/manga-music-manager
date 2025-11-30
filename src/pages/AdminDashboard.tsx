import React from 'react';
import { useAdmin } from '@/hooks/use-admin';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

const AdminDashboard: React.FC = () => {
  const isAdmin = useAdmin();
  
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
      
      <Alert className="max-w-4xl">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Welcome, Administrator!</AlertTitle>
        <AlertDescription>
          This is the administrative control panel. Future features for user management and system configuration will appear here.
        </AlertDescription>
      </Alert>
      
      {/* Placeholder for future admin tools */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ... */}
      </div>
    </div>
  );
};

export default AdminDashboard;