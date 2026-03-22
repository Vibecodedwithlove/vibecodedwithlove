'use client';

import Button from '@/components/ui/Button';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50 flex items-center justify-center px-4">
      <div className="max-w-2xl text-center space-y-8">
        {/* Error Icon */}
        <div className="space-y-6">
          <div className="text-8xl">⚠️</div>

          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
            Oops! Something went wrong
          </h1>

          <p className="text-xl text-foreground/80 leading-relaxed">
            We encountered an unexpected error. Don&apos;t worry—our team is aware of it, and we&apos;re working on a fix. Try refreshing the page or going back home.
          </p>
        </div>

        {/* Error Details */}
        {error.message && (
          <details className="bg-input border border-border rounded-lg p-4 text-left space-y-2">
            <summary className="cursor-pointer font-medium text-foreground/80 hover:text-foreground transition-colors">
              Error details
            </summary>
            <pre className="text-xs text-foreground/60 overflow-x-auto whitespace-pre-wrap break-words">
              {error.message}
            </pre>
          </details>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary" size="lg" onClick={reset}>
            Try Again
          </Button>

          <Link href="/">
            <Button variant="secondary" size="lg">
              Go Home
            </Button>
          </Link>
        </div>

        {/* Support */}
        <div className="text-foreground/60 text-sm space-y-1">
          <p>If this keeps happening, let us know about it.</p>
          <p>
            Check out our{' '}
            <Link href="/about" className="text-warmPrimary hover:text-warmPrimaryDark transition-colors">
              community guidelines
            </Link>
            {' '}for more help.
          </p>
        </div>
      </div>
    </div>
  );
}
