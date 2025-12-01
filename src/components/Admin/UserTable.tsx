import React from 'react';
import { Profile } from '@/hooks/use-admin-profiles';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAdminActions } from '@/hooks/use-admin-actions';
import { useAdminUserPremiumToggle } from '@/hooks/use-admin-user-premium-toggle';
import { useAuth } from '@/integrations/supabase/auth';
import { Ban, CheckCircle, Loader2, Zap } from 'lucide-react';

interface UserTableProps {
  profiles: Profile[];
}

const UserTable: React.FC<UserTableProps> = ({ profiles }) => {
  const { banUser, unbanUser, isPending: isBanPending, pendingTargetId: pendingBanTargetId } = useAdminActions();
  const { togglePremium, isPending: isPremiumTogglePending, pendingTargetId: pendingPremiumTargetId } = useAdminUserPremiumToggle();
  const { user: currentUser } = useAuth();
  
  // Helper to check if a user is currently banned (banned_until is set)
  const isBanned = (profile: Profile) => {
    // banned_until is a timestamp. If it's set (not null) and in the future, the user is banned.
    // Since our Edge Function sets it far in the future, checking for non-null is sufficient.
    return !!profile.banned_until;
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Avatar</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email / ID</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Premium</TableHead>
            <TableHead>Joined Date</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.map((profile) => {
            const isSelf = profile.id === currentUser?.id;
            const currentlyBanned = isBanned(profile);
            const isBanProcessing = isBanPending && pendingBanTargetId === profile.id;
            const isPremiumProcessing = isPremiumTogglePending && pendingPremiumTargetId === profile.id;
            
            const banActionButton = (
                <Button 
                    variant={currentlyBanned ? "secondary" : "destructive"} 
                    size="sm"
                    onClick={() => currentlyBanned ? unbanUser(profile.id) : banUser(profile.id)}
                    disabled={isSelf || isBanProcessing || isPremiumProcessing}
                >
                    {isBanProcessing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    {currentlyBanned ? "Unban" : "Ban"}
                </Button>
            );
            
            const premiumActionButton = (
                <Button 
                    variant={profile.is_premium ? "outline" : "default"} 
                    size="sm"
                    onClick={() => togglePremium({ userId: profile.id, currentStatus: profile.is_premium })}
                    disabled={isSelf || isBanProcessing || isPremiumProcessing}
                    className={profile.is_premium ? "text-primary border-primary/50" : ""}
                >
                    {isPremiumProcessing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    {profile.is_premium ? "Downgrade" : "Grant Premium"}
                </Button>
            );

            return (
              <TableRow key={profile.id}>
                <TableCell>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {profile.first_name ? profile.first_name[0] : profile.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">
                  {profile.first_name || 'N/A'} {profile.last_name || ''}
                </TableCell>
                <TableCell>
                  <p className="font-medium">{profile.email}</p>
                  <p className="text-xs text-muted-foreground truncate">{profile.id}</p>
                </TableCell>
                <TableCell>
                  {profile.is_admin ? (
                    <Badge variant="destructive">Admin</Badge>
                  ) : (
                    <Badge variant="secondary">User</Badge>
                  )}
                </TableCell>
                <TableCell>
                    {profile.is_premium ? (
                        <Badge className="bg-primary hover:bg-primary/90 flex items-center justify-center">
                            <Zap className="h-3 w-3 mr-1" /> Premium
                        </Badge>
                    ) : (
                        <Badge variant="outline">Standard</Badge>
                    )}
                </TableCell>
                <TableCell>
                  {format(new Date(profile.created_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="text-center">
                    {currentlyBanned ? (
                        <Badge variant="destructive" className="flex items-center justify-center">
                            <Ban className="h-3 w-3 mr-1" /> Banned
                        </Badge>
                    ) : (
                        <Badge variant="default" className="bg-green-500 hover:bg-green-500/90 flex items-center justify-center">
                            <CheckCircle className="h-3 w-3 mr-1" /> Active
                        </Badge>
                    )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                    {isSelf ? (
                        <Badge variant="outline">Current User</Badge>
                    ) : (
                        <>
                            {premiumActionButton}
                            {banActionButton}
                        </>
                    )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;