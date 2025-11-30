import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ProfileForm from '@/components/ProfileForm';
import { cn } from '@/lib/utils';

const ProfilePage: React.FC = () => {
  // Calculate height dynamically: 100vh - Player (80px) - Header (64px)
  const mainContentHeightClass = "min-h-[calc(100vh-80px-64px)]";

  return (
    <div className={cn("p-8 flex justify-center", mainContentHeightClass)}>
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">User Profile</CardTitle>
          <CardDescription>Manage your personal information.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;