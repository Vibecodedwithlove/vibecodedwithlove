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

    // Redirect to home on successful authentication
    const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    return NextResponse.redirect(new URL('/', redirectUrl));
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=${encodeURIComponent(errorMessage)}`,
        request.url
      )
    );
  }
}
