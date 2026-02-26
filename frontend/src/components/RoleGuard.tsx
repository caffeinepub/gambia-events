import { useGetCallerUserProfile } from '../hooks/useGetCallerUserProfile';
import { UserRole } from '../backend';
import { Loader2, ShieldX } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole: UserRole;
}

export default function RoleGuard({ children, requiredRole }: RoleGuardProps) {
  const { data: profile, isLoading } = useGetCallerUserProfile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasAccess = () => {
    if (!profile) return false;
    if (requiredRole === UserRole.admin) return profile.role === UserRole.admin;
    if (requiredRole === UserRole.user) return profile.role === UserRole.user || profile.role === UserRole.admin;
    return false;
  };

  if (!hasAccess()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
          <ShieldX className="w-10 h-10 text-destructive" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground max-w-sm">
            You don't have permission to access this page.
            {requiredRole === UserRole.admin && ' This area is restricted to administrators only.'}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
