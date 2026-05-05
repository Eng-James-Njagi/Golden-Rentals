'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import styles from '../css/Lister/Analytics.module.css';

// ─── Icons ────────────────────────────────────────────────────────────────────
function EyeIcon({ size = 15 }) {
   return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
         <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
         <circle cx="12" cy="12" r="3" />
      </svg>
   );
}

function PhoneIcon({ size = 15 }) {
   return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
         <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.64A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
      </svg>
   );
}

function StarIcon({ filled, size = 13 }) {
   return (
      <svg width={size} height={size} viewBox="0 0 24 24"
         fill={filled ? 'currentColor' : 'none'}
         stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
         <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
   );
}

function PinIcon() {
   return (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
         <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
         <circle cx="12" cy="10" r="3" />
      </svg>
   );
}

function CloseIcon() {
   return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
         <line x1="18" y1="6" x2="6" y2="18" />
         <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
   );
}

// ─── Stars ────────────────────────────────────────────────────────────────────
function Stars({ rating }) {
   return (
      <span className={styles.stars}>
         {[ 1, 2, 3, 4, 5 ].map((n) => (
            <span key={n} className={rating >= n ? styles.starFilled : styles.starEmpty}>
               <StarIcon filled={rating >= n} />
            </span>
         ))}
      </span>
   );
}

// ─── Reviews Modal ────────────────────────────────────────────────────────────
// PLACEHOLDER — replace PLACEHOLDER_REVIEWS with real fetch once reviews table exists
const PLACEHOLDER_REVIEWS = [
   { id: 1, name: 'James M.', rating: 5, comment: 'Great place, very clean and the landlord is responsive.' },
   { id: 2, name: 'Aisha K.', rating: 4, comment: 'Good location, a bit noisy at night but overall fine.' },
   { id: 3, name: 'Brian O.', rating: 3, comment: 'Average. Water issues occasionally but manageable.' },
];

function ReviewsModal({ listing, onClose }) {
   const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };

   useEffect(() => {
      const handler = (e) => { if (e.key === 'Escape') onClose(); };
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
   }, [ onClose ]);

   return (
      <div className={styles.backdrop} onClick={handleBackdrop} role="dialog" aria-modal="true">
         <div className={styles.modal}>

            {/* Header */}
            <div className={styles.modalHeader}>
               <div className={styles.modalHeaderLeft}>
                  {listing.image_url && (
                     <div className={styles.modalThumb}>
                        <Image
                           src={listing.image_url}
                           alt={listing.property_name}
                           fill
                           style={{ objectFit: 'cover' }}
                           sizes="48px"
                        />
                     </div>
                  )}
                  <div>
                     <p className={styles.modalLabel}>Reviews</p>
                     <h3 className={styles.modalTitle}>{listing.property_name}</h3>
                     {(listing.ward_name || listing.property_location) && (
                        <p className={styles.modalLocation}>
                           <PinIcon />
                           {[ listing.ward_name, listing.property_location ].filter(Boolean).join(' · ')}
                        </p>
                     )}
                  </div>
               </div>
               <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                  <CloseIcon />
               </button>
            </div>

            {/* Summary strip */}
            <div className={styles.modalSummary}>
               <span className={styles.modalRating}>{listing.rating ?? '—'}</span>
               <Stars rating={listing.rating ?? 0} />
               <span className={styles.modalReviewCount}>{PLACEHOLDER_REVIEWS.length} reviews</span>
            </div>

            {/* Review cards */}
            <div className={styles.reviewList}>
               {PLACEHOLDER_REVIEWS.map((r) => (
                  <div key={r.id} className={styles.reviewCard}>
                     <div className={styles.reviewTop}>
                        <div className={styles.reviewAvatar}>{r.name.charAt(0)}</div>
                        <div>
                           <p className={styles.reviewName}>{r.name}</p>
                           <Stars rating={r.rating} />
                        </div>
                     </div>
                     <p className={styles.reviewComment}>{r.comment}</p>
                  </div>
               ))}
            </div>

         </div>
      </div>
   );
}

// ─── Detail row ───────────────────────────────────────────────────────────────
function ListingRow({ listing, onReviewsClick }) {
   return (
      <div
         className={styles.detailRow}
         onClick={() => onReviewsClick(listing)}
         role="button"
         tabIndex={0}
         onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onReviewsClick(listing); }}
      >

         {/* Thumbnail */}
         <div className={styles.rowThumb}>
            {listing.image_url ? (
               <Image
                  src={listing.image_url}
                  alt={listing.property_name}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="64px"
               />
            ) : (
               <div className={styles.rowThumbFallback} />
            )}
         </div>

         {/* Name + location */}
         <div className={styles.detailMeta}>
            <p className={styles.detailName}>{listing.property_name}</p>
            {(listing.ward_name || listing.ward_location) && (   // ← fixed
               <p className={styles.detailLocation}>
                  <span className={styles.detailLocationIcon}><PinIcon /></span>
                  {[ listing.ward_name, listing.ward_location ].filter(Boolean).join(' · ')}  
               </p>
            )}
            <span className={styles.moreDetails}>more details…</span>  
         </div>

         {/* Stats */}
         <div className={styles.detailStats}>
            <span className={styles.statChip}>
               <span className={styles.statIcon}><EyeIcon /></span>
               {(listing.views ?? 0).toLocaleString()}
            </span>
            <span className={styles.statChip}>
               <span className={styles.statIcon}><PhoneIcon /></span>
               {(listing.call_logs ?? 0).toLocaleString()}
            </span>
            <span className={styles.reviewsChip}>   {/* ← changed button to span, whole row is clickable */}
               <Stars rating={listing.rating ?? 0} />
               <span className={styles.reviewsChipLabel}>Reviews</span>
            </span>
         </div>

      </div>
   );
}
// ─── Summary Card ─────────────────────────────────────────────────────────────
function SummaryCard({ label, value, icon, colorClass }) {
   return (
      <div className={`${styles.card} ${styles[ colorClass ]}`}>
         <div className={styles.cardIcon}>{icon}</div>
         <div className={styles.cardBody}>
            <span className={styles.cardLabel}>{label}</span>
            <span className={styles.cardValue}>
               {value === null ? '—' : value.toLocaleString()}
            </span>
         </div>
      </div>
   );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Analytics() {
   const [ summary, setSummary ] = useState(null);
   const [ listings, setListings ] = useState([]);
   const [ summaryLoading, setSummaryLoading ] = useState(true);
   const [ listingsLoading, setListingsLoading ] = useState(true);
   const [ summaryError, setSummaryError ] = useState(null);
   const [ listingsError, setListingsError ] = useState(null);
   const [ activeModal, setActiveModal ] = useState(null);

   useEffect(() => {
      fetch('/api/analytics/summary')
         .then((r) => { if (!r.ok) throw new Error('Failed to fetch summary.'); return r.json(); })
         .then(setSummary)
         .catch((e) => setSummaryError(e.message))
         .finally(() => setSummaryLoading(false));
   }, []);

   useEffect(() => {
      fetch('/api/analytics/listings')
         .then((r) => { if (!r.ok) throw new Error('Failed to fetch listings.'); return r.json(); })
         .then((json) => setListings(json.data ?? []))
         .catch((e) => setListingsError(e.message))
         .finally(() => setListingsLoading(false));
   }, []);

   const handleReviewsClick = useCallback((listing) => setActiveModal(listing), []);
   const handleCloseModal = useCallback(() => setActiveModal(null), []);

   return (
      <div className={styles.root}>

         {/* ── Summary Cards ── */}
         <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Overview</h2>
            {summaryError && <p className={styles.errorBanner}>{summaryError}</p>}
            <div className={styles.grid}>
               {summaryLoading ? (
                  <><div className={styles.skeleton} /><div className={styles.skeleton} /><div className={styles.skeleton} /></>
               ) : (
                  <>
                     <SummaryCard label="Total Views" value={summary?.totalViews ?? null} icon={<EyeIcon size={18} />} colorClass="colorBlue" />
                     <SummaryCard label="Total Calls" value={summary?.totalCalls ?? null} icon={<PhoneIcon size={18} />} colorClass="colorAmber" />
                     <SummaryCard label="Total Reviews" value={null} icon={<StarIcon size={18} />} colorClass="colorTeal" />
                  </>
               )}
            </div>
         </section>

         {/* ── Listings Breakdown ── */}
         <article className={styles.section}>
            <h2 className={styles.sectionTitle}>Listings breakdown</h2>
            {listingsError && <p className={styles.errorBanner}>{listingsError}</p>}

            {listingsLoading && (
               <div className={styles.detailSkeletons}>
                  {Array.from({ length: 4 }).map((_, i) => <div key={i} className={styles.detailSkeleton} />)}
               </div>
            )}

            {!listingsLoading && !listingsError && listings.length === 0 && (
               <div className={styles.emptyState}><p>No listings found.</p></div>
            )}

            {!listingsLoading && listings.length > 0 && (
               <div className={styles.detailTable}>
                  <div className={styles.detailHeader}>
                     <span>Property</span>
                     <span className={styles.detailHeaderStats}>Views · Calls · Reviews</span>
                  </div>
                  {listings.map((listing) => (
                     <ListingRow key={listing.listing_id} listing={listing} onReviewsClick={handleReviewsClick} />
                  ))}
               </div>
            )}
         </article>

         {/* ── Modal ── */}
         {activeModal && <ReviewsModal listing={activeModal} onClose={handleCloseModal} />}

      </div>
   );
}