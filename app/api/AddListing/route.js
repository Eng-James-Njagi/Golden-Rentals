import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';

const BUCKET = 'Properties';
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

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

// ═══════════════════════════════════════════════════════════════
// POST /api/listings — Cloudinary-only media upload
// Supabase Storage removed. images_table stores cloudinary_url only.
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
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      );
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

    // ── Upload media to Cloudinary only ───────────────────────
    const cloudinaryUploaded = []; // tracked for rollback

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

        const cloudinaryResult = await uploadToCloudinary(
          file,
          'image',
          `pedu-rentals/listings/${listingId}/images`
        );

        cloudinaryUploaded.push({ public_id: cloudinaryResult.public_id, type: 'image' });

        const { error: imageRowError } = await supabase
          .from('images_table')
          .insert({
            listing_id: listingId,
            image_url: null,
            cloudinary_public_id: cloudinaryResult.public_id,
            cloudinary_url: cloudinaryResult.secure_url,
            video_url: null,
            position: i + 1,
            storage_provider: 'cloudinary',
          });

        if (imageRowError) throw new Error(imageRowError.message);
      }

      // ── Video (optional) ──
      const video = fd.get('video');

      if (video instanceof File && video.size > MAX_VIDEO_BYTES) {
        throw new Error('Video exceeds 50 MB');
      }

      if (video instanceof File && video.size > 0) {
        const cloudinaryResult = await uploadToCloudinary(
          video,
          'video',
          `pedu-rentals/listings/${listingId}/videos`
        );

        cloudinaryUploaded.push({ public_id: cloudinaryResult.public_id, type: 'video' });

        const { error: videoRowError } = await supabase
          .from('images_table')
          .insert({
            listing_id: listingId,
            image_url: null,
            cloudinary_public_id: cloudinaryResult.public_id,
            cloudinary_url: cloudinaryResult.secure_url,
            video_url: null,
            position: 0,
            storage_provider: 'cloudinary',
          });

        if (videoRowError) throw new Error(videoRowError.message);
      }

    } catch (mediaErr) {
      // ── Rollback: delete Cloudinary assets ──
      for (const { public_id, type } of cloudinaryUploaded) {
        await deleteFromCloudinary(public_id, type);
      }

      // ── Rollback: delete listing row ──
      await supabase.from('Property_Listing').delete().eq('listing_id', listingId);

      return NextResponse.json({ error: mediaErr.message }, { status: 500 });
    }

    return NextResponse.json({ listing_id: listingId }, { status: 201 });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}