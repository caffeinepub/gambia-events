# Specification

## Summary
**Goal:** Fix post-login auto-redirect, role selection in profile setup, and resolve frontend runtime errors in the authentication flow for the Gambia Events app.

**Planned changes:**
- After successful Internet Identity login, automatically redirect the user to the homepage (or intended destination) without requiring manual navigation.
- If the user has no profile, redirect to the profile setup flow first, then to the homepage upon completion.
- Fix the role selector in ProfileSetupModal so that clicking "Attendee" or "Organizer" visually highlights the selection, stores it in component state, and saves the correct role on form submission.
- Ensure organizer role grants access to the Organizer Dashboard and attendee role is treated as a standard user after profile save.
- Audit and fix all frontend console errors related to authentication, profile setup, and role-based routing (broken imports, undefined variables, failed actor calls, unhandled promise rejections).
- Ensure route guards (ProtectedRoute, RoleGuard) correctly evaluate auth and role state after login with no blank screens or stuck spinners.

**User-visible outcome:** Users are automatically redirected after login, can reliably select their role during profile setup, and experience no errors or stuck states throughout the login → profile setup → homepage flow.
