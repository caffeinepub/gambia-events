import { Link, useRouterState } from '@tanstack/react-router';
import { Home, Globe, Ticket, User } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/tourist-mode', icon: Globe, label: 'Explore' },
  { to: '/my-tickets', icon: Ticket, label: 'Tickets', requiresAuth: true },
  { to: '/profile', icon: User, label: 'Profile', requiresAuth: true },
];

export default function MobileBottomNav() {
  const routerState = useRouterState();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const currentPath = routerState.location.pathname;

  const visibleItems = navItems.filter(
    (item) => !item.requiresAuth || isAuthenticated
  );

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border">
      <div className="flex items-center justify-around px-2 py-2 safe-area-bottom">
        {visibleItems.map(({ to, icon: Icon, label }) => {
          const isActive = currentPath === to || (to !== '/' && currentPath.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl min-w-touch min-h-touch transition-colors ${
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
