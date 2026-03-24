import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(
      new URL('/auth/login?error=no_code', request.url)
    );
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=${encodeURIComponent(error.message)}`,
          request.url
        )
      );
    }

    // Redirect to intended page or home on successful authentication
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    let redirectPath = searchParams.get('redirect') || '/';
    // Prevent open redirect — validate the resolved URL stays on our origin
    try {
      const resolved = new URL(redirectPath, siteUrl);
      const origin = new URL(siteUrl).origin;
      if (resolved.origin !== origin) {
        redirectPath = '/';
      }
    } catch {
      redirectPath = '/';
    }
    return NextResponse.redirect(new URL(redirectPath, siteUrl));
  } catch (err) {
    console.error('Auth callback failed:', err);
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=${encodeURIComponent('Authentication failed. Please try again.')}`,
        request.url
      )
    );
  }
}
