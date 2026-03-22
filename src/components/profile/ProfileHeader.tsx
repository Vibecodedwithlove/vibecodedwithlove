'use client';

import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { Profile } from '@/types';
import { formatDate } from '@/lib/utils';

interface ProfileHeaderProps {
  profile: Profile;
  isOwner: boolean;
}

export default function ProfileHeader({ profile, isOwner }: ProfileHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Avatar and Basic Info */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:gap-6 gap-4">
        {profile.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt={profile.display_name || profile.username}
            width={120}
            height={120}
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-warmPrimary"
          />
        ) : (
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-warmPrimary to-warmPrimaryDark flex items-center justify-center border-4 border-warmPrimary">
            <span className="text-4xl sm:text-5xl font-bold text-white">
              {(profile.display_name || profile.username).charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <div className="flex-1">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            {profile.display_name || profile.username}
          </h1>
          <p className="text-lg text-foreground/70 mb-4">@{profile.username}</p>

          {/* Bio */}
          {profile.bio && (
            <p className="text-foreground/80 mb-4 leading-relaxed max-w-2xl">
              {profile.bio}
            </p>
          )}

          {/* Links */}
          <div className="flex flex-wrap gap-3 mb-4">
            {profile.github_url && (
              <a
                href={profile.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-input border border-border hover:border-warmPrimary transition-colors text-foreground/80 hover:text-foreground text-sm font-medium"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </a>
            )}

            {profile.website_url && (
              <a
                href={profile.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-input border border-border hover:border-warmPrimary transition-colors text-foreground/80 hover:text-foreground text-sm font-medium"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                Website
              </a>
            )}
          </div>

          {/* Join Date */}
          <p className="text-sm text-foreground/60">
            Joined {formatDate(profile.created_at)}
          </p>
        </div>

        {/* Edit Button */}
        {isOwner && (
          <div className="sm:self-start">
            <Link href="/profile/settings">
              <Button variant="secondary" size="md">
                Edit Profile
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
