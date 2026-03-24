'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Profile } from '@/types';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';

interface ProfileSettingsFormProps {
  profile: Profile;
}

export default function ProfileSettingsForm({ profile }: ProfileSettingsFormProps) {
  const [formData, setFormData] = useState({
    display_name: profile.display_name || '',
    bio: profile.bio || '',
    website_url: profile.website_url || '',
    github_url: profile.github_url || '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name || null,
          bio: formData.bio || null,
          website_url: formData.website_url || null,
          github_url: formData.github_url || null,
        })
        .eq('id', profile.id);

      if (error) {
        console.error('Profile update failed:', error);
        setMessage({
          type: 'error',
          text: 'Failed to update profile. Please try again.',
        });
      } else {
        setMessage({
          type: 'success',
          text: 'Profile updated successfully!',
        });
      }
    } catch {
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      {/* Avatar Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Avatar</h3>
        <div className="flex items-end gap-6">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.username}
              width={96}
              height={96}
              className="w-24 h-24 rounded-full object-cover border-4 border-warmPrimary"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-warmPrimary to-warmPrimaryDark flex items-center justify-center border-4 border-warmPrimary">
              <span className="text-3xl font-bold text-white">
                {profile.username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="text-sm text-foreground/70">
            <p className="font-medium mb-1">Avatar is synced from your GitHub account</p>
            <p className="text-xs">Changes to your GitHub avatar will appear here automatically</p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Username (Read-only) */}
        <div className="space-y-2">
          <label htmlFor="username" className="block text-sm font-medium text-foreground">
            Username
          </label>
          <div className="px-4 py-2 bg-input/50 border border-border rounded-lg text-foreground/60 text-sm">
            @{profile.username}
          </div>
          <p className="text-xs text-foreground/60">Username cannot be changed</p>
        </div>

        {/* Display Name */}
        <Input
          label="Display Name"
          name="display_name"
          value={formData.display_name}
          onChange={handleChange}
          placeholder="Your full name or preferred display name"
          helperText="This is how other users will see you on the platform"
        />

        {/* Bio */}
        <Textarea
          label="Bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="Tell us about yourself and your interests in AI development..."
          rows={4}
          maxLength={500}
          showCharCount
          helperText="Keep it concise and meaningful"
        />

        {/* Website URL */}
        <Input
          label="Website"
          name="website_url"
          type="url"
          value={formData.website_url}
          onChange={handleChange}
          placeholder="https://yourwebsite.com"
          helperText="Your personal website or portfolio"
        />

        {/* GitHub URL */}
        <Input
          label="GitHub Profile"
          name="github_url"
          type="url"
          value={formData.github_url}
          onChange={handleChange}
          placeholder="https://github.com/yourusername"
          helperText="Link to your GitHub profile"
        />

        {/* Messages */}
        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800 border border-green-300'
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            isLoading={isLoading}
            disabled={isLoading}
            size="lg"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
