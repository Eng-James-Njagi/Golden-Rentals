'use client';

import { useEffect } from 'react';

export default function ViewTracker({ listingId }) {
  useEffect(() => {
    fetch(`/api/listings/${listingId}/view`, { method: 'POST' });
  }, [listingId]);

  return null;
}