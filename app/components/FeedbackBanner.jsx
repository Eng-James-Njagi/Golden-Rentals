'use client';

import { useState, useEffect, useRef } from 'react';
import { useNavVisibility } from '../hooks/useNavVisibility';

export default function FeedbackBanner() {
   const [ dismissed, setDismissed ] = useState(false);
   const [ navHeight, setNavHeight ] = useState(68);
   const bannerRef = useRef(null);
   const visible = useNavVisibility();

   useEffect(() => {
      const nav = document.querySelector('nav');
      if (nav) {
         setNavHeight(nav.offsetHeight);
      }
   }, []);

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
            color: '#030101fff',
            position: 'fixed',
            top: `${navHeight}px`,
            left: 0,
            right: 0,
            zIndex: 999,
            transform: visible ? 'translateY(0)' : `translateY(-${navHeight + bannerHeight}px)`,
            transition: 'transform 0.3s ease',
         }}
      >
         <span
            style={{
               color: 'black',
               fontFamily: 'var(--font-geist-sans)',
               fontSize: '16px',
            }}>
            Hi👋 we are currently in Beta Testing—
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
                  color: 'var(--darkSecondary)'
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