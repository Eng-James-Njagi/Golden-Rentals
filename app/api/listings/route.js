import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const PAGE_SIZE = 20;
const PREFETCH_SIZE = 40;

export const revalidate = 0; // disable cache — filters must always be fresh

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const prefetch = searchParams.get('prefetch') === 'true';

  const limit = prefetch ? PREFETCH_SIZE : PAGE_SIZE;
  const offset = (page - 1) * PAGE_SIZE;

  // parse filter params
  const ward_id = searchParams.get('ward_id') ? parseInt(searchParams.get('ward_id'), 10) : null;
  const category_id = searchParams.get('category_id') ? parseInt(searchParams.get('category_id'), 10) : null;
  const type_ids = searchParams.get('type_ids') ? searchParams.get('type_ids').split(',').map(Number) : null;
  const price_range = searchParams.get('price_range') || null;
  const rent_duration = searchParams.get('rent_duration') || null;
  const property_interior = searchParams.get('property_interior') || null;

  const supabase = await createServerSupabaseClient();

  // count query — must apply same filters
  let countQuery = supabase
    .from('Property_Listing')
    .select('listing_id', { count: 'exact', head: true });

  if (ward_id) countQuery = countQuery.eq('ward_id', ward_id);
  if (category_id) countQuery = countQuery.eq('category_id', category_id);
  if (type_ids?.length) countQuery = countQuery.in('property_type_id', type_ids);
  if (rent_duration) countQuery = countQuery.eq('rent_duration', rent_duration);
  if (property_interior) countQuery = countQuery.ilike('property_interior', property_interior);

  const { count, error: countError } = await countQuery;

  if (countError) {
    return NextResponse.json(
      { error: 'Failed to fetch count', details: countError.message },
      { status: 500 }
    );
  }

  // RPC call with filters
  const { data, error } = await supabase.rpc('get_listings_paginated', {
    p_limit: limit,
    p_offset: offset,
    p_ward_id: ward_id,
    p_category_id: category_id,
    p_type_ids: type_ids,
    p_price_range: price_range,
    p_rent_duration: rent_duration,
    p_property_interior: property_interior,
  });

  

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch listings', details: error.message },
      { status: 500 }
    );
  }

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return NextResponse.json({
    data,
    pagination: {
      current_page: page,
      total_pages: totalPages,
      total_records: count,
      page_size: PAGE_SIZE,
      has_next: page < totalPages,
      has_prev: page > 1,
    },
  });
}

export async function POST(request) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const fd = await request.formData();

    const property_name     = fd.get('property_name');
    const ward_id           = fd.get('ward_id');
    const ward_name         = fd.get('ward_name');
    const ward_location     = fd.get('ward_location');
    const property_location = fd.get('property_location');
    const category_id       = fd.get('category_id');
    const type_id           = fd.get('type_id');
    const rent_duration     = fd.get('rent_duration');
    const property_interior = fd.get('property_interior');
    const phone_number      = fd.get('phone_number');
    const property_price    = fd.get('property_price');
    const description       = fd.get('description');

    const missing = [];
    for (const [key, val] of Object.entries({
      property_name, ward_id, ward_location, property_location,
      category_id, type_id, rent_duration, property_interior,
      phone_number, property_price, description
    })) {
      if (!val || String(val).trim() === '') missing.push(key);
    }
    if (missing.length > 0) {
      return NextResponse.json({ error: `Missing required fields: ${missing.join(', ')}` }, { status: 400 });
    }

    // Insert listing first to get listing_id
    const { data: listing, error: listingError } = await supabase
      .from('Property_Listing')
      .insert({
        user_id:        user.id,
        property_name,
        ward_id:          parseInt(ward_id, 10),
        ward_name,
        ward_location,
        property_location,
        category_id:      parseInt(category_id, 10),
        property_type_id: parseInt(type_id, 10),
        rent_duration,
        property_interior,
        phone_number:     parseInt(phone_number, 10),
        property_price,
        description,
      })
      .select('listing_id')
      .single();

    if (listingError) {
      return NextResponse.json({ error: listingError.message }, { status: 500 });
    }

    // Upload images and insert into images_table
    for (let i = 0; i < 3; i++) {
      const file = fd.get(`image_${i}`);
      if (!file || !(file instanceof File)) {
        return NextResponse.json({ error: `image_${i} is required` }, { status: 400 });
      }

      const ext = file.name.split('.').pop();
      const path = `listings/${user.id}/${listing.listing_id}_${i}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('Properties')
        .upload(path, file, { contentType: file.type });

      if (uploadError) {
        return NextResponse.json({ error: `Image upload failed: ${uploadError.message}` }, { status: 500 });
      }

      const { data: { publicUrl } } = supabase.storage
        .from('Properties')
        .getPublicUrl(path);

      const { error: imageRowError } = await supabase
        .from('images_table')
        .insert({
          listing_id: listing.listing_id,
          image_url:  publicUrl,
          video_url:  null,
          position:   i + 1,
        });

      if (imageRowError) {
        return NextResponse.json({ error: imageRowError.message }, { status: 500 });
      }
    }

    // Video — optional
    const video = fd.get('video');
    if (video instanceof File && video.size > 0) {
      const ext = video.name.split('.').pop();
      const path = `listings/${user.id}/${listing.listing_id}_video.${ext}`;

      const { error: videoUploadError } = await supabase.storage
        .from('Properties')
        .upload(path, video, { contentType: video.type });

      if (videoUploadError) {
        return NextResponse.json({ error: `Video upload failed: ${videoUploadError.message}` }, { status: 500 });
      }

      const { data: { publicUrl } } = supabase.storage
        .from('Properties')
        .getPublicUrl(path);

      const { error: videoRowError } = await supabase
        .from('images_table')
        .insert({
          listing_id: listing.listing_id,
          image_url:  null,
          video_url:  publicUrl,
          position:   0,
        });

      if (videoRowError) {
        return NextResponse.json({ error: videoRowError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ listing_id: listing.listing_id }, { status: 201 });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
