import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const listing_id = parseInt(id, 10);

    if (isNaN(listing_id)) {
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createAdminClient();

    // 1. Fetch listing via RPC
    const { data: listingRows, error: listingError } = await admin.rpc('get_listings_paginated', {
      p_limit:      1,
      p_offset:     0,
      p_listing_id: listing_id,
    });

    if (listingError) {
      return NextResponse.json({ error: listingError.message }, { status: 500 });
    }

    const listing = listingRows?.[0] ?? null;
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
    }

    // 2. Get user_id from Property_Listing
    const { data: plRow, error: plError } = await admin
      .from('Property_Listing')
      .select('user_id')
      .eq('listing_id', listing_id)
      .single();

    if (plError || !plRow) {
      return NextResponse.json({ error: 'Could not verify listing ownership.' }, { status: 500 });
    }

    const listerUUID = plRow.user_id;

    // 3. Fetch lister from Listers_Info — column is lister_UUID (no extra quotes in .eq)
    const { data: lister, error: listerError } = await admin
      .from('Listers_Info')
      .select('lister_id, lister_UUID, username, lister_email, lister_org, lister_contact, lister_ward, Status')
      .eq('lister_UUID', listerUUID)
      .single();

    if (listerError || !lister) {
      return NextResponse.json({ error:  'No lister available.' }, { status: 404 });
    }

    // 4. Fetch other listings by same lister
    const { data: listerListings } = await admin
      .from('Property_Listing')
      .select('listing_id')
      .eq('user_id', listerUUID)
      .neq('listing_id', listing_id);

    const listerListingIds = new Set((listerListings ?? []).map(l => l.listing_id));

    let filteredOther = [];
    if (listerListingIds.size > 0) {
      const { data: otherRows } = await admin.rpc('get_listings_paginated', {
        p_limit:  20,
        p_offset: 0,
      });
      filteredOther = (otherRows ?? []).filter(l => listerListingIds.has(l.listing_id));
    }

    return NextResponse.json({ listing, lister, otherListings: filteredOther });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}