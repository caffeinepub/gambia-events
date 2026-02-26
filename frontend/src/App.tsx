import React, { useEffect, useRef, useState } from 'react';
import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
  Link,
  useNavigate,
} from '@tanstack/react-router';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import ProfileSetupModal from './components/ProfileSetupModal';
import ProtectedRoute from './components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Heart, Menu, X, MapPin, Loader2 } from 'lucide-react';

// ─── Pages ───────────────────────────────────────────────────────────────────
import HomePage from './pages/HomePage';
import EventDetailsPage from './pages/EventDetailsPage';
import OrganizerDashboardPage from './pages/OrganizerDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import TouristModePage from './pages/TouristModePage';
import UserProfilePage from './pages/UserProfilePage';

// ─── Query Client ────────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

// ─── Header Component ────────────────────────────────────────────────────────
function Header() {
  const { identity, login, clear, loginStatus, isInitializing } = useInternetIdentity();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleLogin = async () => {
    try {
      await login();
    } catch (err: unknown) {
      const e = err as Error;
      if (e?.message === 'User is already authenticated') {
        await clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  const handleLogout = async () => {
    await clear();
    qc.clear();
    navigate({ to: '/' });
    setMobileOpen(false);
  };

  const navLinks = [
    { to: '/' as const, label: 'Home' },
    { to: '/tourist' as const, label: '🌍 Tourist Mode' },
    ...(isAuthenticated
      ? [
          { to: '/organizer' as const, label: 'Organizer Dashboard' },
          { to: '/profile' as const, label: 'My Profile' },
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <img
              src="/assets/generated/app-logo.dim_128x128.png"
              alt="Gambia Events"
              className="h-8 w-8 rounded-lg"
            />
            <span className="hidden sm:block">Gambia Events</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                activeProps={{
                  className:
                    'px-3 py-2 rounded-lg text-sm font-medium text-primary bg-primary/10',
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth Button */}
          <div className="flex items-center gap-2">
            {isInitializing ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : isAuthenticated ? (
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            ) : (
              <Button size="sm" onClick={handleLogin} disabled={isLoggingIn}>
                {isLoggingIn ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Logging in...
                  </span>
                ) : (
                  'Login'
                )}
              </Button>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                activeProps={{
                  className:
                    'block px-3 py-2 rounded-lg text-sm font-medium text-primary bg-primary/10',
                }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

// ─── Footer Component ────────────────────────────────────────────────────────
function Footer() {
  const appId = encodeURIComponent(window.location.hostname || 'gambia-events');
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            <span>Gambia Events — Discover the best events in The Gambia</span>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Built with <Heart className="h-4 w-4 text-red-500 fill-red-500 mx-1" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium ml-1"
            >
              caffeine.ai
            </a>
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Gambia Events
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── App Shell (inside router context) ───────────────────────────────────────
function AppShell() {
  const { identity, loginStatus, isInitializing } = useInternetIdentity();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isAuthenticated = !!identity;

  // Track previous loginStatus to detect transition to 'success'
  const prevLoginStatus = useRef(loginStatus);
  const hasRedirectedAfterLogin = useRef(false);

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  // Auto-redirect after login
  useEffect(() => {
    const wasLoggingIn = prevLoginStatus.current === 'logging-in';
    const isNowSuccess = loginStatus === 'success';

    if (wasLoggingIn && isNowSuccess && !hasRedirectedAfterLogin.current) {
      hasRedirectedAfterLogin.current = true;
      navigate({ to: '/' });
    }

    prevLoginStatus.current = loginStatus;
  }, [loginStatus, navigate]);

  // Reset redirect flag on logout
  useEffect(() => {
    if (!isAuthenticated) {
      hasRedirectedAfterLogin.current = false;
    }
  }, [isAuthenticated]);

  // Show profile setup modal when authenticated but no profile yet
  const showProfileSetup =
    isAuthenticated &&
    !isInitializing &&
    !profileLoading &&
    profileFetched &&
    userProfile === null;

  const handleProfileComplete = () => {
    qc.invalidateQueries({ queryKey: ['currentUserProfile'] });
    navigate({ to: '/' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ProfileSetupModal open={showProfileSetup} onComplete={handleProfileComplete} />
      <Toaster richColors position="top-right" />
    </div>
  );
}

// ─── Routes ──────────────────────────────────────────────────────────────────
const rootRoute = createRootRoute({ component: AppShell });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const eventDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/events/$eventId',
  component: EventDetailsPage,
});

const organizerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/organizer',
  component: () => (
    <ProtectedRoute>
      <OrganizerDashboardPage />
    </ProtectedRoute>
  ),
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => (
    <ProtectedRoute>
      <AdminDashboardPage />
    </ProtectedRoute>
  ),
});

const touristRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tourist',
  component: TouristModePage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: () => (
    <ProtectedRoute>
      <UserProfilePage />
    </ProtectedRoute>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  eventDetailsRoute,
  organizerRoute,
  adminRoute,
  touristRoute,
  profileRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// ─── Root App ────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
