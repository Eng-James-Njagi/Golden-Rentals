// app/api/AddListing/route.js
// Uploads to BOTH Supabase (existing) and Cloudinary (new) in parallel.
// images_table now stores cloudinary_public_id and cloudinary_url alongside supabase url.
// NOTE: After migration is confirmed working, Supabase upload can be removed.

import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';

const BUCKET = 'Properties';

// ── Supabase upload (existing — unchanged) ──────────────────────────────────
async function uploadToSupabase(supabase, file, folder, listingId) {
  const ext = file.name.split('.').pop();
  const filename = `${folder}/${listingId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, buffer, { contentType: file.type, upsert: false });

  if (error) throw new Error(`Supabase upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

export async function POST(request) {
  try {
    const supabase = await createServerSupabaseClient();

    // ── Auth ──────────────────────────────────────────────────────────────
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── Parse form ────────────────────────────────────────────────────────
    const formData = await request.formData();

    const name = formData.get('property_name')?.toString().trim();
    const ward_name = formData.get('ward_name')?.toString().trim();
    const ward_id = formData.get('ward_id')?.toString().trim();
    const ward_location = formData.get('ward_location')?.toString().trim();
    const property_location = formData.get('property_location')?.toString().trim();
    const category_id = formData.get('category_id');
    const type_id = formData.get('type_id');
    const duration = formData.get('rent_duration')?.toString().trim();
    const furniture = formData.get('property_interior')?.toString().trim();
    const phone = formData.get('phone_number')?.toString().trim();
    const price = formData.get('property_price')?.toString().trim();
    const description = formData.get('description')?.toString().trim();

    // ── Validation ────────────────────────────────────────────────────────
    const required = { name, ward_name, ward_location, property_location, category_id, type_id, duration, furniture, phone, price, description };
    const missing = Object.entries(required).filter(([ , v ]) => !v).map(([ k ]) => k);
    if (missing.length) {
      return NextResponse.json({ error: `Missing: ${missing.join(', ')}` }, { status: 400 });
    }

    if (isNaN(Number(price))) {
      return NextResponse.json({ error: 'Price must be numeric' }, { status: 400 });
    }
    if (!/^\d{6,15}$/.test(phone.replace(/\s/g, ''))) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    // ── File validation ───────────────────────────────────────────────────
    const imageFiles = [
      formData.get('image_0'),
      formData.get('image_1'),
      formData.get('image_2'),
    ].filter(f => f instanceof File && f.size > 0);

    const videoFile = formData.get('video');
    const hasVideo = videoFile instanceof File && videoFile.size > 0;

    const MAX_BYTES = 5 * 1024 * 1024;
    for (const f of imageFiles) {
      if (f.size > MAX_BYTES) {
        return NextResponse.json({ error: `Image "${f.name}" exceeds 5 MB` }, { status: 400 });
      }
    }
    if (hasVideo && videoFile.size > MAX_BYTES) {
      return NextResponse.json({ error: `Video exceeds 5 MB` }, { status: 400 });
    }

    // ── Insert listing row ────────────────────────────────────────────────
    const { data: listing, error: listingError } = await supabase
      .from('Property_Listing')
      .insert({
        property_name: name,
        ward_id: parseInt(ward_id, 10),
        ward_name,
        ward_location,
        property_location,
        category_id: Number(category_id),
        property_type_id: Number(type_id),
        rent_duration: duration,
        property_interior: furniture,
        phone_number: Number(phone.replace(/\s/g, '')),
        property_price: price,
        description,
        user_id: user.id,
      })
      .select('listing_id')
      .single();

    if (listingError) {
      return NextResponse.json({ error: listingError.message }, { status: 500 });
    }

    const listingId = listing.listing_id;

    // ── Upload media & insert images_table rows ───────────────────────────
    // Tracked for rollback
    const cloudinaryUploaded = [];

    try {
      const mediaRows = [];

      // Upload each image to both Supabase and Cloudinary in parallel
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[ i ];
        const cloudinaryFolder = `pedu-rentals/listings/${listingId}/images`;

        // Run both uploads simultaneously
        const [ supabaseUrl, cloudinaryResult ] = await Promise.all([
          uploadToSupabase(supabase, file, 'images', listingId),
          uploadToCloudinary(file, 'image', cloudinaryFolder),
        ]);

        // Track Cloudinary upload for rollback
        cloudinaryUploaded.push({ public_id: cloudinaryResult.public_id, type: 'image' });

        mediaRows.push({
          listing_id: listingId,
          image_url: supabaseUrl,              // existing Supabase URL
          cloudinary_public_id: cloudinaryResult.public_id, // new Cloudinary public_id
          cloudinary_url: cloudinaryResult.secure_url, // new Cloudinary URL
          video_url: null,
          position: i + 1,
          storage_provider: 'both',                   // tracks which providers have this file
        });
      }

      // Upload video if present
      let videoSupabaseUrl = null;
      let videoCloudinaryResult = null;

      if (hasVideo) {
        const cloudinaryFolder = `pedu-rentals/listings/${listingId}/videos`;

        const [ sbUrl, cdResult ] = await Promise.all([
          uploadToSupabase(supabase, videoFile, 'videos', listingId),
          uploadToCloudinary(videoFile, 'video', cloudinaryFolder),
        ]);

        videoSupabaseUrl = sbUrl;
        videoCloudinaryResult = cdResult;

        cloudinaryUploaded.push({ public_id: cdResult.public_id, type: 'video' });

        // Video gets its own row at position 0
        mediaRows.push({
          listing_id: listingId,
          image_url: null,
          cloudinary_public_id: cdResult.public_id,
          cloudinary_url: cdResult.secure_url,
          video_url: videoSupabaseUrl,
          position: 0,
          storage_provider: 'both',
        });
      }

      // Insert all media rows
      if (mediaRows.length > 0) {
        const { error: mediaError } = await supabase
          .from('images_table')
          .insert(mediaRows);

        if (mediaError) throw new Error(`Media insert failed: ${mediaError.message}`);
      }

    } catch (mediaErr) {
      // ── Rollback: delete Cloudinary uploads ──
      for (const { public_id, type } of cloudinaryUploaded) {
        await deleteFromCloudinary(public_id, type);
      }

      // ── Rollback: delete Supabase storage files ──
      const { data: imgList } = await supabase.storage.from(BUCKET).list(`images/${listingId}`);
      const { data: vidList } = await supabase.storage.from(BUCKET).list(`videos/${listingId}`);
      const toDelete = [
        ...(imgList ?? []).map(f => `images/${listingId}/${f.name}`),
        ...(vidList ?? []).map(f => `videos/${listingId}/${f.name}`),
      ];
      if (toDelete.length > 0) {
        await supabase.storage.from(BUCKET).remove(toDelete);
      }

      // ── Rollback: delete listing row ──
      await supabase.from('Property_Listing').delete().eq('listing_id', listingId);

      return NextResponse.json({ error: mediaErr.message }, { status: 500 });
    }

    return NextResponse.json({ listing_id: listingId }, { status: 201 });

  } catch (err) {
    console.error('POST /api/AddListing error:', err);
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 });
  }
}