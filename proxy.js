import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { createAdminClient } from './lib/supabase/server';

export async function proxy(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        set(name, value, options) {
          request.cookies.set(name, value);
          supabaseResponse.cookies.set(name, value, options);
        },
        remove(name, options) {
          request.cookies.delete(name);
          supabaseResponse.cookies.delete(name);
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isAdminRoute = request.nextUrl.pathname.startsWith('/User/Admin');
  const isListerRoute = request.nextUrl.pathname.startsWith('/User/Lister');
  const role = user?.user_metadata?.role;

  if (isAdminRoute && role !== 'admin') {
    return NextResponse.redirect(new URL('/Auth', request.url));
  }

  if (isListerRoute && role !== 'lister') {
    return NextResponse.redirect(new URL('/Auth', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [ '/User/Admin', '/User/Admin/(.*)', '/User/Lister', '/User/Lister/(.*)' ],
};