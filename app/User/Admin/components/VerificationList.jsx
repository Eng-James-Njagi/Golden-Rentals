'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from '../css/verification.module.css';

const STATUS_STYLES = {
  'SUBSCRIBED': styles.badgeSubscribed,
  'REPORTED':   styles.badgeReported,
  'FREE PLAN':  styles.badgeFreePlan,
  'FREE TIER':  styles.badgeFreePlan,
  'OVERDUE':    styles.badgeOverdue,
};

const FILTER_OPTIONS = ['All', 'SUBSCRIBED', 'REPORTED', 'FREE PLAN', 'OVERDUE'];

export default function VerificationList({ onSelect }){
  const [listings, setListings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [filter, setFilter]       = useState('All');
  const router = useRouter();

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/adminRo/verification');
      if (!res.ok) throw new Error('Failed to fetch listings.');
      const json = await res.json();
      setListings(json.data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const filtered = filter === 'All'
    ? listings
    : listings.filter(l => l.status === filter);

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <span className={styles.filterLabel}>Filter By</span>
        <select
          className={styles.filterSelect}
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          {FILTER_OPTIONS.map(o => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>

      {error && <p className={styles.errorBanner}>{error}</p>}

      {loading && (
        <div className={styles.skeletons}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className={styles.empty}>No listings found.</div>
      )}

      {!loading && filtered.map(listing => {
        const firstImage = listing.media?.[0]?.image_url ?? null;
        const statusKey  = listing.status ?? 'FREE TIER';

        return (
          <div
            key={listing.listing_id}
            className={styles.listingRow}
            onClick={() => onSelect(listing.listing_id)}
          >
            <div className={styles.imageBox}>
              {firstImage ? (
                <Image
                  src={firstImage}
                  alt={listing.property_name}
                  fill
                  sizes="120px"
                  className={styles.listingImage}
                />
              ) : (
                <div className={styles.imagePlaceholder}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.2" />
                    <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M3 15l5-4 4 4 3-3 6 5" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </div>
              )}
            </div>

            <div className={styles.listingInfo}>
              <p className={styles.listingName}>{listing.property_name}</p>
              <div className={styles.listingMeta}>
                <span className={styles.metaItem}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  {listing.views ?? 208}
                </span>
                <span className={styles.metaItem}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.13 11.5 19.79 19.79 0 0 1 1.07 2.87 2 2 0 0 1 3.05 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.34 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  {listing.calls ?? 23}
                </span>
              </div>
              <div className={styles.listingRating}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span>{listing.rating ?? 3.5}</span>
                <span className={styles.reviews}>Reviews : {listing.review_count ?? 45}</span>
              </div>
              <span className={styles.moreDetails}>more details....</span>
            </div>

            <span className={`${styles.statusBadge} ${STATUS_STYLES[statusKey] ?? styles.badgeOverdue}`}>
              {statusKey}
            </span>
          </div>
        );
      })}
    </div>
  );
}