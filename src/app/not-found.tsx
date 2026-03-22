import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50 flex items-center justify-center px-4">
      <div className="max-w-2xl text-center space-y-8">
        {/* Illustration / Icon */}
        <div className="space-y-6">
          <div className="text-8xl font-bold bg-gradient-to-r from-warmPrimary to-warmPrimaryDark bg-clip-text text-transparent">
            404
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
            Page Not Found
          </h1>

          <p className="text-xl text-foreground/80 leading-relaxed">
            Looks like this page doesn&apos;t exist. Maybe it was deleted, moved, or you followed an old link. No judgment—it happens to the best of us.
          </p>
        </div>

        {/* Suggestions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/">
            <Button variant="primary" size="lg" className="w-full">
              Go Home
            </Button>
          </Link>

          <Link href="/browse">
            <Button variant="secondary" size="lg" className="w-full">
              Browse Projects
            </Button>
          </Link>
        </div>

        {/* Extra Help */}
        <div className="text-foreground/60 text-sm">
          <p>Still looking for something?</p>
          <Link
            href="/about"
            className="text-warmPrimary hover:text-warmPrimaryDark transition-colors"
          >
            Learn more about our community →
          </Link>
        </div>
      </div>
    </div>
  );
}
