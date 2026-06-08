async function getSignature(folder) {
  console.log('[sign] requesting signature for folder:', folder);
  const res = await fetch('/api/cloudinary-sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder }),
  });
  console.log('[sign] response status:', res.status);
  if (!res.ok) throw new Error('Failed to get upload signature');
  const data = await res.json();
  console.log('[sign] signature received:', data);
  return data;
}

async function uploadFile(file, resourceType, folder) {
  console.log('[upload] starting upload:', file.name, resourceType, folder);
  const sign = await getSignature(folder);

  const fd = new FormData();
  fd.append('file', file);
  fd.append('api_key', sign.api_key);
  fd.append('timestamp', sign.timestamp);
  fd.append('signature', sign.signature);
  fd.append('folder', folder);

  console.log('[upload] hitting cloudinary...');
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${sign.cloud_name}/${resourceType}/upload`,
    { method: 'POST', body: fd }
  );
  console.log('[upload] cloudinary response status:', res.status);
  if (!res.ok) throw new Error(`Cloudinary upload failed for ${file.name}`);
  const data = await res.json();
  console.log('[upload] done:', data.public_id);
  return {
    cloudinary_url:       data.secure_url,
    cloudinary_public_id: data.public_id,
    resource_type:        resourceType,
  };
}

export async function uploadListingMedia(listingId, images, video) {
  const folder = `pedu-rentals/listings/${listingId}`;
  const media = [];

  // images at positions 1-3
  for (let i = 0; i < images.length; i++) {
    const result = await uploadFile(images[i], 'image', `${folder}/images`);
    media.push({ ...result, position: i + 1 });
  }

  // video at position 0
  if (video) {
    const result = await uploadFile(video, 'video', `${folder}/videos`);
    media.push({ ...result, position: 0 });
  }

  return media;
}