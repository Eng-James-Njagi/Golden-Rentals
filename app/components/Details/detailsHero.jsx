'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from '../css/Details/detailsHero.module.css';

function PlayIcon() {
  return (
    <svg className={styles.playIcon} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="24" fill="rgba(0,0,0,0.45)" />
      <polygon points="19,14 38,24 19,34" fill="white" />
    </svg>
  );
}

export default function PropertyHero({ listing }) {
  const {
    property_name,
    property_price,
    property_interior,
    rent_duration,
    category_name,
    type_name,
    ward_name,
    ward_location,
    phone_number,
    media = [],
  } = listing;

  // Build ordered media items — each has either image_url or video_url (or both; image used as video poster)
  const mediaItems = (media ?? [])
    .filter(m => m.image_url || m.video_url)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  const [ activeIndex, setActiveIndex ] = useState(0);
  const active = mediaItems[ activeIndex ] ?? null;
  const furnished = property_interior?.toLowerCase();

  return (
    <section className={styles.hero}>
      {/* ── Left: gallery column ── */}
      <div className={styles.galleryCol}>
        {/* Main viewer */}
        <div className={styles.mainViewer}>
          {active ? (
            active.video_url ? (
              <video
                key={active.video_url}
                className={styles.mainVideo}
                src={active.video_url}
                poster={active.image_url ?? undefined}
                controls
                playsInline
              />
            ) : (
              <Image
                key={active.image_url}
                src={active.image_url}
                alt={property_name}
                fill
                sizes="(max-width: 768px) 100vw, 45vw"
                className={styles.mainImage}
                priority
              />
            )
          ) : (
            <div className={styles.mainPlaceholder}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M3 15l5-4 4 4 3-3 6 5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
              <span>No media available</span>
            </div>
          )}

          {/* Counter */}
          {mediaItems.length > 1 && (
            <span className={styles.mediaCounter}>
              {activeIndex + 1} / {mediaItems.length}
            </span>
          )}
        </div>

        {/* Thumbnail strip below main image */}
        {mediaItems.length > 1 && (
          <div className={styles.thumbStrip}>
            {mediaItems.map((item, i) => (
              <button
                key={i}
                className={`${styles.thumb} ${i === activeIndex ? styles.thumbActive : ''}`}
                onClick={() => setActiveIndex(i)}
                aria-label={`View media ${i + 1}`}
              >
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={`${property_name} thumbnail ${i + 1}`}
                    fill
                    sizes="96px"
                    className={styles.thumbImage}
                  />
                ) : (
                  <div className={styles.thumbVideoPlaceholder} />
                )}
                {item.video_url && <PlayIcon />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Right: info panel ── */}
      <div className={styles.infoPanel}>
        {category_name && (
          <span className={styles.categoryLabel}>{category_name}</span>
        )}

        <h1 className={styles.title}>{property_name}</h1>

        <div className={styles.priceRow}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
            <path d="M12 7v10M9 9.5c0-1.38 1.34-2.5 3-2.5s3 1.12 3 2.5S13.66 12 12 12s-3 1.12-3 2.5S10.34 17 12 17s3-1.12 3-2.5"
              stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <span className={styles.price}>KSH {Number(property_price).toLocaleString('en-KE')}</span>
          <span className={styles.perMonth}>/mo</span>
        </div>

        <div className={styles.metaChips}>
          {type_name && (
            <span className={styles.chip}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M3 10V20M21 10V20M3 10h18M3 10L12 3l9 7" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                <rect x="9" y="14" width="6" height="6" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              {type_name}
            </span>
          )}
          {ward_name && (
            <span className={styles.chip}>
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                <path d="M8 1.5A4.5 4.5 0 0 1 12.5 6c0 3-4.5 8.5-4.5 8.5S3.5 9 3.5 6A4.5 4.5 0 0 1 8 1.5Z"
                  stroke="currentColor" strokeWidth="1.4" />
                <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              {ward_name}
            </span>
          )}
          {ward_location && (
            <span className={styles.chip}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 11l19-9-9 19-2-8-8-2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              </svg>
              {ward_location}
            </span>
          )}
        </div>

        {furnished && (
          <span className={`${styles.badge} ${furnished === 'furnished' ? styles.badgeFurnished : styles.badgeUnfurnished}`}>
            {property_interior}
          </span>
        )}

        {rent_duration && (
          <span className={styles.durationBadge}>Rent Duration:
            {rent_duration === 'short-term' ? ' Short Term' : ' Long Term'}
          </span>
        )}

        {phone_number && (
          <a href={`tel:${phone_number}`} className={styles.contactBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M6.6 10.8a15.4 15.4 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C9.61 21 3 14.39 3 6.5a1 1 0 0 1 1-1H7.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.24 1.02L6.6 10.8Z"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            CONTACT
          </a>
        )}
      </div>
    </section>
  );
}