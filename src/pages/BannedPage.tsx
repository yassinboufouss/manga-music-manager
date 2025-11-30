import React from 'react';
import { ShieldAlert, Mail } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const BannedPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg p-8 space-y-6 bg-card rounded-xl shadow-2xl border border-destructive">
        <Alert variant="destructive">
          <ShieldAlert className="h-6 w-6" />
          <AlertTitle className="text-2xl font-bold">Account Suspended</AlertTitle>
          <AlertDescription className="text-base mt-2">
            <p>Your account has been suspended due to a violation of our terms of service.</p>
            <p className="mt-4">
              If you believe this is an error or require more information, please contact our support team.
            </p>
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-col space-y-4">
          <Button asChild className="w-full">
            <a href="mailto:support@example.com">
              <Mail className="mr-2 h-4 w-4" /> Contact Support
            </a>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link to="/login">
              Go to Login Page
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BannedPage;