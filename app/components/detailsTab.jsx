'use client';

import { useState } from 'react';
import styles from '../components/css/detailsTab.module.css';

const TABS = ['Description', 'Property Location', 'Reviews'];

function convertToEmbedUrl(url) {
  if (!url) return null;
  // Already an embed URL
  if (url.includes('/maps/embed')) return url;
  // Attempt to pass through — stored as embed URL per decision
  return url;
}

export default function PropertyTabs({ listing }) {
  const { description, property_location } = listing;
  const [active, setActive] = useState('Description');

  const embedUrl = convertToEmbedUrl(property_location);

  return (
    <div className={styles.tabsContainer}>
      {/* Tab bar */}
      <div className={styles.tabBar} role="tablist">
        {TABS.map(tab => (
          <button
            key={tab}
            role="tab"
            aria-selected={active === tab}
            className={`${styles.tab} ${active === tab ? styles.tabActive : ''}`}
            onClick={() => setActive(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div className={styles.panel} role="tabpanel">
        {active === 'Description' && (
          <div className={styles.description}>
            {description ? (
              <p>{description}</p>
            ) : (
              <p className={styles.empty}>No description provided.</p>
            )}
          </div>
        )}

        {active === 'Property Location' && (
          <div className={styles.mapWrap}>
            {embedUrl ? (
              <iframe
                src={embedUrl}
                className={styles.mapIframe}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Property location map"
              />
            ) : (
              <div className={styles.mapEmpty}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z"
                    stroke="currentColor" strokeWidth="1.4" />
                  <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                <span>Location not available</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}