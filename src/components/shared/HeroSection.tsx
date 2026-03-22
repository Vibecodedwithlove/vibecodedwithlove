import Link from 'next/link';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function HeroSection() {
  return (
    <section className={cn(
      'relative w-full py-20 px-4 sm:py-24 lg:py-32',
      'bg-gradient-to-br from-warmPrimary-50 via-warmSecondary-50 to-amber-50',
      'dark:from-warmPrimary-950 dark:via-warmPrimary-900 dark:to-amber-900',
      'overflow-hidden'
    )}>
      {/* Subtle decorative pattern background */}
      <div className="absolute inset-0 opacity-10 dark:opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-warmPrimary-300 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-warmSecondary-300 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative max-w-4xl mx-auto text-center">
        {/* Headline */}
        <h1 className={cn(
          'text-4xl sm:text-5xl lg:text-6xl font-bold',
          'bg-gradient-to-r from-warmPrimary-900 via-warmSecondary-900 to-amber-900',
          'dark:from-warmPrimary-50 dark:via-warmSecondary-100 dark:to-amber-100',
          'bg-clip-text text-transparent',
          'mb-6 sm:mb-8 leading-tight'
        )}>
          Built with AI. Improved with community.
        </h1>

        {/* Subheading */}
        <p className={cn(
          'text-lg sm:text-xl text-foreground/80',
          'max-w-2xl mx-auto mb-10 sm:mb-12',
          'leading-relaxed'
        )}>
          Share your AI-assisted projects with radical transparency. Get constructive feedback from developers who celebrate your journey, not judge your tools. Build better together.
        </p>

        {/* CTA Buttons */}
        <div className={cn(
          'flex flex-col sm:flex-row gap-4 sm:gap-6',
          'justify-center items-center sm:items-stretch'
        )}>
          <Link href="/browse" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
            >
              Browse Projects
            </Button>
          </Link>
          <Link href="/project/submit" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
            >
              Submit Yours
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
