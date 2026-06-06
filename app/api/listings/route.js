import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';

const PAGE_SIZE = 20;
const PREFETCH_SIZE = 40;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const revalidate = 0;

// ═══════════════════════════════════════════════════════════════
// GET /api/listings — unchanged
// ═══════════════════════════════════════════════════════════════
export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const prefetch = searchParams.get('prefetch') === 'true';

  const limit = prefetch ? PREFETCH_SIZE : PAGE_SIZE;
  const offset = (page - 1) * PAGE_SIZE;

  const ward_id = searchParams.get('ward_id') ? parseInt(searchParams.get('ward_id'), 10) : null;
  const category_id = searchParams.get('category_id') ? parseInt(searchParams.get('category_id'), 10) : null;
  const type_ids = searchParams.get('type_ids') ? searchParams.get('type_ids').split(',').map(Number) : null;
  const price_range = searchParams.get('price_range') || null;
  const rent_duration = searchParams.get('rent_duration') || null;
  const property_interior = searchParams.get('property_interior') || null;

  const supabase = await createServerSupabaseClient();

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

// ═══════════════════════════════════════════════════════════════
// POST /api/listings — uploads to Supabase + Cloudinary in parallel
// ═══════════════════════════════════════════════════════════════
export async function POST(request) {
  try {
    const supabase = await createServerSupabaseClient();

    // ── Auth ──────────────────────────────────────────────────
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const fd = await request.formData();

    const property_name = fd.get('property_name');
    const ward_id = fd.get('ward_id');
    const ward_name = fd.get('ward_name');
    const ward_location = fd.get('ward_location');
    const property_location = fd.get('property_location');
    const category_id = fd.get('category_id');
    const type_id = fd.get('type_id');
    const rent_duration = fd.get('rent_duration');
    const property_interior = fd.get('property_interior');
    const phone_number = fd.get('phone_number');
    const property_price = fd.get('property_price');
    const description = fd.get('description');

    // ── Validation ────────────────────────────────────────────
    const missing = [];
    for (const [ key, val ] of Object.entries({
      property_name, ward_id, ward_location, property_location,
      category_id, type_id, rent_duration, property_interior,
      phone_number, property_price, description,
    })) {
      if (!val || String(val).trim() === '') missing.push(key);
    }
    if (missing.length > 0) {
      return NextResponse.json({ error: `Missing required fields: ${missing.join(', ')}` }, { status: 400 });
    }

    // ── Insert listing row first to get listing_id ────────────
    const { data: listing, error: listingError } = await supabase
      .from('Property_Listing')
      .insert({
        user_id: user.id,
        property_name,
        ward_id: parseInt(ward_id, 10),
        ward_name,
        ward_location,
        property_location,
        category_id: parseInt(category_id, 10),
        property_type_id: parseInt(type_id, 10),
        rent_duration,
        property_interior,
        phone_number: parseInt(phone_number, 10),
        property_price,
        description,
      })
      .select('listing_id')
      .single();

    if (listingError) {
      return NextResponse.json({ error: listingError.message }, { status: 500 });
    }

    const listingId = listing.listing_id;

    // ── Upload media ──────────────────────────────────────────
    // Track Cloudinary uploads for rollback on failure
    const cloudinaryUploaded = [];

    try {
      // ── Images ──
      for (let i = 0; i < 3; i++) {
        const file = fd.get(`image_${i}`);
        if (!file || !(file instanceof File) || file.size === 0) {
          throw new Error(`image_${i} is required`);
        }
        if (file.size > MAX_IMAGE_BYTES) {
          throw new Error(`image_${i} exceeds 5 MB`);
        }

        const ext = file.name.split('.').pop();
        const supabasePath = `listings/${user.id}/${listingId}_${i}.${ext}`;
        const cloudinaryFolder = `pedu-rentals/listings/${listingId}/images`;

        // Upload to both in parallel
        const [ supabaseUpload, cloudinaryResult ] = await Promise.all([
          supabase.storage
            .from('Properties')
            .upload(supabasePath, file, { contentType: file.type }),
          uploadToCloudinary(file, 'image', cloudinaryFolder),
        ]);

        if (supabaseUpload.error) {
          throw new Error(`Supabase image upload failed: ${supabaseUpload.error.message}`);
        }

        // Track for rollback
        cloudinaryUploaded.push({ public_id: cloudinaryResult.public_id, type: 'image' });

        const { data: { publicUrl } } = supabase.storage
          .from('Properties')
          .getPublicUrl(supabasePath);

        // Insert row with both URLs
        const { error: imageRowError } = await supabase
          .from('images_table')
          .insert({
            listing_id: listingId,
            image_url: publicUrl,
            cloudinary_public_id: cloudinaryResult.public_id,
            cloudinary_url: cloudinaryResult.secure_url,
            video_url: null,
            position: i + 1,
            storage_provider: 'both',
          });

        if (imageRowError) throw new Error(imageRowError.message);
      }

      // ── Video (optional) ──
      const video = fd.get('video');

      if (video instanceof File && video.size > MAX_VIDEO_BYTES) {
        await supabase.from('Property_Listing').delete().eq('listing_id', listingId);
        return NextResponse.json({ error: 'Video exceeds 50 MB' }, { status: 400 });
      }

      if (video instanceof File && video.size > 0) {
        const ext = video.name.split('.').pop();
        const supabasePath = `listings/${user.id}/${listingId}_video.${ext}`;
        const cloudinaryFolder = `pedu-rentals/listings/${listingId}/videos`;

        const [ supabaseUpload, cloudinaryResult ] = await Promise.all([
          supabase.storage
            .from('Properties')
            .upload(supabasePath, video, { contentType: video.type }),
          uploadToCloudinary(video, 'video', cloudinaryFolder),
        ]);

        if (supabaseUpload.error) {
          throw new Error(`Supabase video upload failed: ${supabaseUpload.error.message}`);
        }

        cloudinaryUploaded.push({ public_id: cloudinaryResult.public_id, type: 'video' });

        const { data: { publicUrl } } = supabase.storage
          .from('Properties')
          .getPublicUrl(supabasePath);

        const { error: videoRowError } = await supabase
          .from('images_table')
          .insert({
            listing_id: listingId,
            image_url: null,
            cloudinary_public_id: cloudinaryResult.public_id,
            cloudinary_url: cloudinaryResult.secure_url,
            video_url: publicUrl,
            position: 0,
            storage_provider: 'both',
          });

        if (videoRowError) throw new Error(videoRowError.message);
      }

    } catch (mediaErr) {
      // ── Rollback Cloudinary ──
      for (const { public_id, type } of cloudinaryUploaded) {
        await deleteFromCloudinary(public_id, type);
      }

      // ── Rollback listing row ──
      await supabase.from('Property_Listing').delete().eq('listing_id', listingId);

      return NextResponse.json({ error: mediaErr.message }, { status: 500 });
    }

    return NextResponse.json({ listing_id: listingId }, { status: 201 });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}