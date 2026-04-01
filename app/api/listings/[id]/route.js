import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const revalidate = 0;

export async function GET(request, { params }) {
  const { id } = await params;
  const listing_id = parseInt(id, 10);

  if (isNaN(listing_id)) {
    return NextResponse.json({ error: 'Invalid listing ID' }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.rpc('get_listings_paginated', {
    p_limit: 1,
    p_offset: 0,
    p_listing_id: listing_id,
  });

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch listing', details: error.message },
      { status: 500 }
    );
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
  }

  return NextResponse.json({ data: data[ 0 ] });
}
