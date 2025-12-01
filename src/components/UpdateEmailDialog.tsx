import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/integrations/supabase/auth';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

// Schema for email update
const UpdateEmailSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

type UpdateEmailFormValues = z.infer<typeof UpdateEmailSchema>;

const UpdateEmailDialog: React.FC = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const form = useForm<UpdateEmailFormValues>({
    resolver: zodResolver(UpdateEmailSchema),
    defaultValues: {
      email: user?.email || "",
    },
    mode: "onChange",
  });
  
  // Reset form value when dialog opens/closes or user changes
  React.useEffect(() => {
      if (user) {
          form.reset({ email: user.email || "" });
      }
  }, [user, open, form]);

  const onSubmit = async (data: UpdateEmailFormValues) => {
    if (data.email === user?.email) {
        showError("The new email address is the same as the current one.");
        return;
    }
    
    try {
      const { error } = await supabase.auth.updateUser({ email: data.email });

      if (error) {
        throw error;
      }
      
      showSuccess("Email update link sent! Please check your new email address to confirm the change.");
      setOpen(false);
    } catch (error) {
      console.error("Error updating email:", error);
      showError(`Failed to update email: ${error instanceof Error ? error.message : "An unknown error occurred."}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <Mail className="mr-2 h-4 w-4" /> Update Email
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Email Address</DialogTitle>
          <DialogDescription>
            Enter your new email address. A confirmation link will be sent to verify the change.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Email</FormLabel>
                  <FormControl>
                    <Input placeholder="new.email@example.com" {...field} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
                <Button 
                    type="submit" 
                    disabled={form.formState.isSubmitting || !form.formState.isValid}
                >
                  {form.formState.isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : "Send Confirmation Link"}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateEmailDialog;