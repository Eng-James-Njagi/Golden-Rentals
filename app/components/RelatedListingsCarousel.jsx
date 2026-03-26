'use client'

import { useState, useEffect, useRef } from 'react'
import PropertyCard from './PropertyCard'
import styles from './css/RelatedListingsCarousel.module.css'

const PER_SCROLL = 3

/**
 * RelatedListingsCarousel
 *
 * Props:
 *   listings — array of listing objects, already fetched and filtered by the server
 *   title    — section heading (default: "You might also like...")
 */
export default function RelatedListingsCarousel({
  listings = [],
  title = 'You might also like...',
}) {
  const [offset, setOffset] = useState(0)
  const trackRef            = useRef(null)

  const maxOffset = Math.max(0, listings.length - PER_SCROLL)
  const canPrev   = offset > 0
  const canNext   = offset < maxOffset

  const prev = () => setOffset(o => Math.max(0, o - PER_SCROLL))
  const next = () => setOffset(o => Math.min(maxOffset, o + PER_SCROLL))

  useEffect(() => {
    if (!trackRef.current) return
    const cardPct = 100 / PER_SCROLL
    trackRef.current.style.transform = `translateX(-${offset * cardPct}%)`
  }, [offset])

  if (listings.length === 0) return null

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>{title}</h2>

      <div className={styles.carouselWrapper}>
        <button
          className={styles.navBtn}
          onClick={prev}
          disabled={!canPrev}
          aria-label="Previous"
        >
          &#8592;
        </button>

        <div className={styles.viewport}>
          <div className={styles.track} ref={trackRef}>
            {listings.map(item => (
              <div key={item.listing_id} className={styles.cardSlot}>
                <PropertyCard
                  listing={item}
                  onWardClick={() => {}}
                />
              </div>
            ))}
          </div>
        </div>

        <button
          className={styles.navBtn}
          onClick={next}
          disabled={!canNext}
          aria-label="Next"
        >
          &#8594;
        </button>
      </div>
    </section>
  )
}