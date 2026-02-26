import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserRole } from '../backend';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Users, Briefcase, CheckCircle2 } from 'lucide-react';

interface ProfileSetupModalProps {
  open: boolean;
  onComplete?: () => void;
}

export default function ProfileSetupModal({ open, onComplete }: ProfileSetupModalProps) {
  const [displayName, setDisplayName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'attendee' | 'organizer'>('attendee');
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    try {
      await saveProfile.mutateAsync({
        displayName: displayName.trim(),
        role: UserRole.user,
        accountCreated: BigInt(Date.now()) * BigInt(1_000_000),
      });
      onComplete?.();
    } catch (err) {
      console.error('Failed to save profile:', err);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Welcome to Gambia Events!</DialogTitle>
          <DialogDescription className="text-center">
            Set up your profile to get started. You can always change this later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-sm font-semibold">
              Your Name
            </Label>
            <Input
              id="displayName"
              type="text"
              placeholder="Enter your display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              autoFocus
              className="h-11"
            />
          </div>

          {/* Role Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">I am joining as...</Label>
            <div className="grid grid-cols-2 gap-3">
              {/* Attendee Option */}
              <button
                type="button"
                onClick={() => setSelectedRole('attendee')}
                className={`relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  selectedRole === 'attendee'
                    ? 'border-primary bg-primary/10 shadow-md'
                    : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                {selectedRole === 'attendee' && (
                  <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-primary" />
                )}
                <div className={`p-3 rounded-full ${selectedRole === 'attendee' ? 'bg-primary/20' : 'bg-muted'}`}>
                  <Users className={`h-6 w-6 ${selectedRole === 'attendee' ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="text-center">
                  <p className={`font-semibold text-sm ${selectedRole === 'attendee' ? 'text-primary' : 'text-foreground'}`}>
                    Attendee
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Discover &amp; book events</p>
                </div>
              </button>

              {/* Organizer Option */}
              <button
                type="button"
                onClick={() => setSelectedRole('organizer')}
                className={`relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  selectedRole === 'organizer'
                    ? 'border-primary bg-primary/10 shadow-md'
                    : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                {selectedRole === 'organizer' && (
                  <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-primary" />
                )}
                <div className={`p-3 rounded-full ${selectedRole === 'organizer' ? 'bg-primary/20' : 'bg-muted'}`}>
                  <Briefcase className={`h-6 w-6 ${selectedRole === 'organizer' ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="text-center">
                  <p className={`font-semibold text-sm ${selectedRole === 'organizer' ? 'text-primary' : 'text-foreground'}`}>
                    Organizer
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Create &amp; manage events</p>
                </div>
              </button>
            </div>
          </div>

          {saveProfile.isError && (
            <p className="text-sm text-destructive text-center">
              Failed to save profile. Please try again.
            </p>
          )}

          <Button
            type="submit"
            className="w-full h-11 text-base font-semibold"
            disabled={!displayName.trim() || saveProfile.isPending}
          >
            {saveProfile.isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Setting up...
              </span>
            ) : (
              `Continue as ${selectedRole === 'organizer' ? 'Organizer' : 'Attendee'}`
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
