import type { Metadata } from "next";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "vibecodedwithlove.com — Built with AI. Improved with community.",
  description:
    "Share projects built with AI assistance. Get constructive feedback from our community of developers exploring AI tools in development.",
  keywords: [
    "AI",
    "development",
    "projects",
    "community",
    "Claude",
    "ChatGPT",
    "code",
  ],
  authors: [{ name: "vibecodedwithlove" }],
  openGraph: {
    title: "vibecodedwithlove.com — Built with AI. Improved with community.",
    description:
      "Share projects built with AI assistance. Get constructive feedback from our community of developers exploring AI tools in development.",
    type: "website",
    url: "https://vibecodedwithlove.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "vibecodedwithlove",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "vibecodedwithlove.com — Built with AI. Improved with community.",
    description:
      "Share projects built with AI assistance. Get constructive feedback from our community.",
    images: ["/og-image.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let user = null;

  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (authUser) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', authUser.id)
        .single();

      if (profile) {
        user = {
          username: profile.username,
          avatar_url: profile.avatar_url || authUser.user_metadata?.avatar_url || null,
        };
      } else {
        // Profile not yet created, use GitHub metadata
        user = {
          username: authUser.user_metadata?.user_name || authUser.email?.split('@')[0] || 'user',
          avatar_url: authUser.user_metadata?.avatar_url || null,
        };
      }
    }
  } catch {
    // Not logged in or Supabase not configured
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${bricolageGrotesque.variable} antialiased min-h-screen flex flex-col`}
      >
        <Navbar user={user} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
