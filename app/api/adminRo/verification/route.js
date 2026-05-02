// app/api/admin/verification/route.js
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createAdminClient();

    // Fetch all listings with media via RPC
    const { data: listings, error: listingError } = await admin.rpc('get_listings_paginated', {
      p_limit:  100,
      p_offset: 0,
    });

    if (listingError) {
      return NextResponse.json({ error: listingError.message }, { status: 500 });
    }

    // Get all unique user_ids from listings
    const userIds = [...new Set((listings ?? []).map(l => l.user_id).filter(Boolean))];

    // Fetch lister status for all listers
    const { data: listers, error: listerError } = await admin
      .from('Listers_Info')
      .select('"lister_UUID", "Status"')
      .in('"lister_UUID"', userIds);

    if (listerError) {
      return NextResponse.json({ error: listerError.message }, { status: 500 });
    }

    // Map UUID → status
    const statusMap = {};
    (listers ?? []).forEach(l => { statusMap[l['lister_UUID']] = l['Status']; });

    const shaped = (listings ?? []).map(l => ({
      ...l,
      status: statusMap[l.user_id] ?? 'FREE TIER',
    }));

    return NextResponse.json({ data: shaped });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}