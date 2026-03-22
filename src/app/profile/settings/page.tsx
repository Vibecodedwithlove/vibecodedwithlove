import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import ProfileSettingsForm from '@/components/profile/ProfileSettingsForm';

export const metadata: Metadata = {
  title: 'Profile Settings',
  description: 'Edit your profile information and preferences',
};

export default async function ProfileSettingsPage() {
  const supabase = await createClient();

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (authError || !user?.id) {
    redirect('/auth/login');
  }

  // Fetch current user's profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Profile Settings</h1>
          <p className="text-foreground/70 text-lg">
            Update your profile information and preferences
          </p>
        </div>

        {/* Settings Form */}
        <div className="bg-input border border-border rounded-lg p-8">
          <ProfileSettingsForm profile={profile} />
        </div>
      </div>
    </div>
  );
}
