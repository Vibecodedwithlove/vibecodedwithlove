/**
 * Middleware for session refresh and cookie management
 * Used in Next.js middleware
 */

import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response = NextResponse.next(
              {
                request: {
                  headers: request.headers,
                },
              }
            );
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh session to update auth state and token
  await supabase.auth.getSession();

  return response;
}
