// app/api/AddListing/route.js
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const BUCKET = 'Properties';

/**
 * Upload a File/Blob to Supabase Storage and return its public URL.
 * @param {SupabaseClient} supabase
 * @param {File}   file
 * @param {string} folder  - 'images' | 'videos'
 * @param {string} listingId - used to namespace the path
 */
async function uploadFile(supabase, file, folder, listingId) {
  const ext      = file.name.split('.').pop();
  const filename = `${folder}/${listingId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer      = Buffer.from(arrayBuffer);

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

export async function POST(request) {
  try {
    const supabase = await createServerSupabaseClient();

    /* ── Auth check ── */
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    /* ── Parse multipart form ── */
    const formData = await request.formData();

    const name              = formData.get('name')?.toString().trim();
    const ward              = formData.get('ward')?.toString().trim();               // ward_name
    const ward_location     = formData.get('ward_location')?.toString().trim();      // street/estate
    const property_location = formData.get('property_location')?.toString().trim();  // Google Maps URL
    const category_id       = formData.get('category_id');
    const type_id           = formData.get('type_id');
    const duration          = formData.get('duration')?.toString().trim();
    const furniture         = formData.get('furniture')?.toString().trim();
    const phone             = formData.get('phone')?.toString().trim();
    const price             = formData.get('price')?.toString().trim();
    const description       = formData.get('description')?.toString().trim();

    /* ── Basic server-side validation ── */
    const required = { name, ward, ward_location, property_location, category_id, type_id, duration, furniture, phone, price, description };
    const missing  = Object.entries(required).filter(([, v]) => !v).map(([k]) => k);
    if (missing.length) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    if (isNaN(Number(price))) {
      return NextResponse.json({ error: 'Price must be numeric' }, { status: 400 });
    }
    if (!/^\d{6,15}$/.test(phone.replace(/\s/g, ''))) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }
    if (!property_location.includes('google.com/maps')) {
      return NextResponse.json({ error: 'property_location must be a Google Maps URL' }, { status: 400 });
    }

    /* ── File size validation ── */
    const imageFiles = [
      formData.get('image_0'),
      formData.get('image_1'),
      formData.get('image_2'),
    ].filter(f => f && f instanceof File && f.size > 0);

    const videoFile = formData.get('video');
    const hasVideo  = videoFile && videoFile instanceof File && videoFile.size > 0;

    const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
    for (const file of imageFiles) {
      if (file.size > MAX_BYTES) {
        return NextResponse.json({ error: `Image "${file.name}" exceeds 2 MB` }, { status: 400 });
      }
    }
    if (hasVideo && videoFile.size > MAX_BYTES) {
      return NextResponse.json({ error: `Video "${videoFile.name}" exceeds 2 MB` }, { status: 400 });
    }

    /* ── Resolve ward_id from ward_name ── */
    const { data: wardRow, error: wardError } = await supabase
      .from('wards_table')
      .select('ward_id, ward_name')
      .eq('ward_name', ward)
      .single();

    if (wardError || !wardRow) {
      return NextResponse.json({ error: 'Invalid ward / ward not found' }, { status: 400 });
    }

    /* ── Insert into Property_Listing ── */
    const { data: listing, error: listingError } = await supabase
      .from('Property_Listing')
      .insert({
        property_name:     name,
        ward_id:           wardRow.ward_id,
        ward_name:         wardRow.ward_name,
        ward_location,
        property_location,
        category_id:       Number(category_id),
        property_type_id:  Number(type_id),
        rent_duration:     duration,
        property_interior: furniture,
        phone_number:      Number(phone.replace(/\s/g, '')),
        property_price:    price,
        description,
        user_id:           user.id,
      })
      .select('listing_id')
      .single();

    if (listingError) {
      return NextResponse.json({ error: listingError.message }, { status: 500 });
    }

    const listingId = listing.listing_id;

    /* ── Upload images & video, then insert rows into images_table
         Rollback listing on any failure to prevent duplicates on retry ── */
    try {
      const imageUrls = await Promise.all(
        imageFiles.map(f => uploadFile(supabase, f, 'images', listingId))
      );

      let videoUrl = null;
      if (hasVideo) {
        videoUrl = await uploadFile(supabase, videoFile, 'videos', listingId);
      }

      const mediaRows = [];
      if (imageUrls.length === 0 && videoUrl) {
        // Only a video, no images
        mediaRows.push({ listing_id: listingId, image_url: null, video_url: videoUrl, position: 0 });
      } else {
        imageUrls.forEach((url, i) => {
          mediaRows.push({
            listing_id: listingId,
            image_url:  url,
            video_url:  i === 0 ? videoUrl : null,  // attach video to first slot
            position:   i,
          });
        });
      }

      if (mediaRows.length > 0) {
        const { error: mediaError } = await supabase
          .from('images_table')
          .insert(mediaRows);

        if (mediaError) throw new Error(`Media insert failed: ${mediaError.message}`);
      }

    } catch (mediaErr) {
      // Rollback: delete listing so no orphan/duplicate on retry
      await supabase.from('Property_Listing').delete().eq('listing_id', listingId);
      return NextResponse.json({ error: mediaErr.message }, { status: 500 });
    }

    return NextResponse.json({ listing_id: listingId }, { status: 201 });

  } catch (err) {
    console.error('POST /api/AddListing error:', err);
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 });
  }
}