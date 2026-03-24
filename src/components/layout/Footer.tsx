import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { label: 'Browse', href: '/browse' },
    { label: 'Submit', href: '/project/submit' },
    { label: 'Resources', href: '/resources' },
    { label: 'About', href: '/about' },
    { label: 'GitHub', href: 'https://github.com/Vibecodedwithlove/vibecodedwithlove' },
  ];

  return (
    <footer className="w-full border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Branding */}
          <div>
            <div className="flex items-center gap-2 font-heading font-bold text-lg text-foreground mb-2">
              <span>❤️</span>
              <span>vibecodedwithlove</span>
            </div>
            <p className="text-sm text-muted">
              Built with AI. Improved with community.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-heading font-bold text-sm uppercase text-foreground mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith('http') ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted hover:text-warmPrimary transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-muted hover:text-warmPrimary transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Credit */}
          <div>
            <h3 className="font-heading font-bold text-sm uppercase text-foreground mb-4">
              Made With
            </h3>
            <p className="text-sm text-muted">
              Made with ❤️ and{' '}
              <a
                href="https://claude.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-warmPrimary hover:text-warmPrimaryDark transition-colors"
              >
                Claude Code
              </a>
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border pt-8">
          <p className="text-xs text-muted text-center">
            © {currentYear} vibecodedwithlove. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
