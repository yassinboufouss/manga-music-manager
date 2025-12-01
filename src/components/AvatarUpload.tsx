import React, { useRef, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, User } from 'lucide-react';
import { useProfile } from '@/hooks/use-profile';
import { useAuth } from '@/integrations/supabase/auth';
import { cn } from '@/lib/utils';

const AvatarUpload: React.FC = () => {
  const { profile, isLoading, isUploadingAvatar, uploadAvatar } = useProfile();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Basic file validation (e.g., size and type)
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("File size must be less than 5MB.");
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        alert("Only JPEG, PNG, and WebP formats are supported.");
        return;
      }
      
      uploadAvatar(file);
    }
  }, [uploadAvatar]);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  const userInitials = (profile?.first_name?.[0] || user?.email?.[0] || 'U').toUpperCase();
  const avatarUrl = profile?.avatar_url;

  return (
    <div className="flex flex-col items-center space-y-4 mb-6">
      <div className="relative group">
        <Avatar className="h-24 w-24 border-4 border-primary/50 shadow-lg">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt="User Avatar" className="object-cover" />
          ) : (
            <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
              {userInitials}
            </AvatarFallback>
          )}
        </Avatar>
        
        {/* Overlay for upload button */}
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className={cn(
            "absolute inset-0 h-full w-full rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300",
            isUploadingAvatar && "opacity-100 cursor-not-allowed"
          )}
          onClick={handleButtonClick}
          disabled={isUploadingAvatar || isLoading}
          aria-label="Change Avatar"
        >
          {isUploadingAvatar ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <Camera className="h-6 w-6" />
          )}
        </Button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/jpeg,image/png,image/webp"
        disabled={isUploadingAvatar || isLoading}
      />
      
      <p className="text-xs text-muted-foreground">Max 5MB (JPEG, PNG, WebP)</p>
    </div>
  );
};

export default AvatarUpload;