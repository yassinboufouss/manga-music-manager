import React from 'react';
import { Profile } from '@/hooks/use-admin-profiles';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface UserTableProps {
  profiles: Profile[];
}

const UserTable: React.FC<UserTableProps> = ({ profiles }) => {
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Avatar</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email / ID</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.map((profile) => (
            <TableRow key={profile.id}>
              <TableCell>
                <Avatar className="h-8 w-8">
                  {/* Assuming we don't have avatar_url setup yet, use initials */}
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
              <TableCell className="text-right text-sm text-muted-foreground">
                {format(new Date(profile.updated_at), 'MMM d, yyyy')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;