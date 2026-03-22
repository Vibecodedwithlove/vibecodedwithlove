import { cn } from '@/lib/utils';

interface ProjectAnatomyProps {
  whatItDoes: string;
  userFlow: string;
  mainComponents: string;
  externalDependencies: string | null;
  leastConfident: string | null;
}

function InfoCircleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function FootprintsIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  );
}

function PuzzleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 4H5a2 2 0 00-2 2v14a2 2 0 002 2h4m0-21v7m0 0H4m5 0h4V4m0 0h4a2 2 0 012 2v14a2 2 0 01-2 2h-4m0-21v7m0 0h5m-5 0h-4"
      />
    </svg>
  );
}

function PlugIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
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
  );
}

function FlagIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-7 7 7 7H9.5l-1-1H5a2 2 0 00-2 2zm9-13h.01"
      />
    </svg>
  );
}

function Section({
  icon: Icon,
  title,
  children,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-6 last:mb-0', className)}>
      <div className="flex items-center gap-3 mb-3">
        <div className="text-warmPrimary dark:text-warmPrimaryLight flex-shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>
      <div className="ml-8">{children}</div>
    </div>
  );
}

export default function ProjectAnatomy({
  whatItDoes,
  userFlow,
  mainComponents,
  externalDependencies,
  leastConfident,
}: ProjectAnatomyProps) {
  return (
    <div className="space-y-6">
      <Section icon={InfoCircleIcon} title="What It Does">
        <p className="text-muted leading-relaxed">{whatItDoes}</p>
      </Section>

      <Section icon={FootprintsIcon} title="How Users Use It">
        <div className="text-muted leading-relaxed whitespace-pre-line">
          {userFlow}
        </div>
      </Section>

      <Section icon={PuzzleIcon} title="Main Components">
        <div className="text-muted leading-relaxed whitespace-pre-line">
          {mainComponents}
        </div>
      </Section>

      {externalDependencies && (
        <Section icon={PlugIcon} title="External Dependencies">
          <p className="text-muted leading-relaxed">{externalDependencies}</p>
        </Section>
      )}

      {leastConfident && (
        <div
          className={cn(
            'p-4 rounded-lg',
            'bg-warmPrimary/10 dark:bg-warmPrimary/5',
            'border-l-4 border-warmPrimary dark:border-warmPrimaryLight',
            'mb-6'
          )}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="text-warmPrimary dark:text-warmPrimaryLight flex-shrink-0">
              <FlagIcon />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Where I Need Help
            </h3>
          </div>
          <div className="ml-8 text-muted leading-relaxed whitespace-pre-line">
            {leastConfident}
          </div>
        </div>
      )}
    </div>
  );
}
