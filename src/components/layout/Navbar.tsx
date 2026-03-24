'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface User {
  username: string;
  avatar_url: string | null;
}

interface NavbarProps {
  user?: User | null;
}

export default function Navbar({ user }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const handleThemeToggle = () => {
    const html = document.documentElement;
    const newIsDark = !isDark;
    setIsDark(newIsDark);

    if (newIsDark) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const navLinks = [
    { label: 'Browse', href: '/browse' },
    { label: 'Submit', href: '/project/submit' },
    { label: 'Resources', href: '/resources' },
    { label: 'About', href: '/about' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-heading font-bold text-xl text-foreground hover:text-warmPrimary transition-colors"
          >
            <span>❤️</span>
            <span>vibecodedwithlove</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-foreground hover:text-warmPrimary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {/* Theme toggle */}
            <button
              onClick={handleThemeToggle}
              aria-label="Toggle dark mode"
              className="p-2 rounded-lg hover:bg-input transition-colors"
            >
              {isDark ? (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.293 1.293a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zm2.828 2.828a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zm2.828 2.828a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zM10 7a3 3 0 110 6 3 3 0 010-6zm-4.293-1.293a1 1 0 010 1.414L4.586 8a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM2.03 11.656a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM2 13a1 1 0 11-2 0 1 1 0 012 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            {/* User menu or login */}
            {user ? (
              <div className="relative flex items-center gap-3">
                <Link
                  href={`/profile/${user.username}`}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  {user.avatar_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatar_url}
                      alt={`${user.username} avatar`}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <span className="text-sm font-medium text-foreground hidden sm:inline">
                    {user.username}
                  </span>
                </Link>
                <a
                  href="/auth/signout"
                  className="text-xs text-muted hover:text-foreground transition-colors hidden sm:inline"
                >
                  Sign out
                </a>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm font-medium text-white bg-warmPrimary rounded-lg hover:bg-warmPrimaryDark transition-colors hidden sm:inline-block"
              >
                Login
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-input transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2 text-sm text-foreground hover:bg-input rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href={`/profile/${user.username}`}
                  className="block px-4 py-2 text-sm text-foreground hover:bg-input rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  My Profile
                </Link>
                <a
                  href="/auth/signout"
                  className="block px-4 py-2 text-sm text-muted hover:bg-input rounded-lg transition-colors"
                >
                  Sign out
                </a>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="block px-4 py-2 text-sm font-medium text-white bg-warmPrimary rounded-lg hover:bg-warmPrimaryDark transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
