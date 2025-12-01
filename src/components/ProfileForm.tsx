import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ProfileSchema, ProfileFormValues } from '@/lib/schemas';
import { useProfile } from '@/hooks/use-profile';
import { useAuth } from '@/integrations/supabase/auth';
import AvatarUpload from './AvatarUpload';
import UpdateEmailDialog from './UpdateEmailDialog'; // Import new component

const ProfileForm: React.FC = () => {
  const { profile, isLoading, isUpdating, updateProfile } = useProfile();
  const { user } = useAuth();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
    },
    mode: "onChange",
  });
  
  // Populate form fields when profile data loads
  useEffect(() => {
    if (profile) {
      form.reset({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
      });
    }
  }, [profile, form]);

  const onSubmit = (data: ProfileFormValues) => {
    // Ensure empty strings are treated as null for Supabase update
    const updates = {
        first_name: data.first_name || null,
        last_name: data.last_name || null,
    };
    updateProfile(updates);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        <span className="text-muted-foreground">Loading profile...</span>
      </div>
    );
  }
  
  if (!profile) {
      return <p className="text-destructive">Failed to load profile data.</p>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        <AvatarUpload />
        
        {/* Email Display and Update Button */}
        <div className="space-y-2">
            <FormLabel>Email</FormLabel>
            <Input value={user?.email || "N/A"} disabled className="bg-muted/50" />
            <UpdateEmailDialog />
        </div>
        
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your first name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your last name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
            type="submit" 
            className="w-full" 
            disabled={isUpdating || !form.formState.isDirty || !form.formState.isValid}
        >
          {isUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
              <Save className="h-4 w-4 mr-2" />
          )}
          {isUpdating ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  );
};

export default ProfileForm;