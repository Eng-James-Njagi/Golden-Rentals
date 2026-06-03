'use client';

import { useState, useEffect, useRef } from 'react';
import { useNavVisibility } from '../hooks/useNavVisibility';

export default function FeedbackBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [navHeight, setNavHeight] = useState(64);
  const bannerRef = useRef(null);
  const visible = useNavVisibility();

  // Observe navbar height changes
  useEffect(() => {
    const nav = document.querySelector('nav');
    if (!nav) return;

    const update = () => setNavHeight(nav.offsetHeight);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(nav);
    return () => observer.disconnect();
  }, []);

  // Update --page-top-offset whenever nav or banner size changes
  useEffect(() => {
    const banner = bannerRef.current;

    const updateOffset = () => {
      const bannerH = dismissed ? 0 : (bannerRef.current?.offsetHeight || 0);
      const navH = document.querySelector('nav')?.offsetHeight || 64;
      document.documentElement.style.setProperty(
        '--page-top-offset',
        `${navH + bannerH}px`
      );
    };

    updateOffset();

    if (!banner) return;
    const observer = new ResizeObserver(updateOffset);
    observer.observe(banner);
    return () => observer.disconnect();
  }, [dismissed, navHeight]); // navHeight in deps — reruns when nav resizes

  if (dismissed) return null;

  const bannerHeight = bannerRef.current?.offsetHeight || 40;

  return (
    <div
      ref={bannerRef}
      style={{
        backgroundColor: 'var(--darkBackground)',
        borderBottom: '1px solid black',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '14px',
        color: '#030101',
        position: 'fixed',
        top: `${navHeight}px`,
        left: 0,
        right: 0,
        zIndex: 999,
        transform: visible ? 'translateY(0)' : `translateY(-${navHeight + bannerHeight}px)`,
        transition: 'transform 0.3s ease, top 0.3s ease',
      }}
    >
      <span style={{
        color: 'black',
        fontFamily: 'var(--font-geist-sans)',
        fontSize: '16px',
      }}>
        Hi👋 Welcome to Pedu Rentals! We're live and improving — your feedback shapes what we build next.
        <button
          data-tally-open="KYkPYV"
          data-tally-overlay="1"
          data-tally-width="600"
          data-tally-auto-close="3000"
          style={{
            background: 'none',
            border: 'none',
            textDecoration: 'underline',
            fontFamily: 'var(--font-inter)',
            cursor: 'pointer',
            fontSize: '14px',
            marginLeft: '4px',
            color: 'var(--darkSecondary)',
          }}
        >
          share your feedback here
        </button>
      </span>
      <button
        onClick={() => setDismissed(true)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '16px',
          color: 'var(--darkSecondary)',
        }}
      >
        ×
      </button>
    </div>
  );
}