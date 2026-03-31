import React from "react";
import Link from 'next/link'
import "./css/footer.css";

const HomeIcon = () => (
  <svg className="footer-brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
    <path d="M9 21V12h6v9" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg className="footer-social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="footer-social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="footer-social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
  </svg>
);

const TwitterIcon = () => (
  <svg className="footer-social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0012 8v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="footer-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 010 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
  </svg>
);

const MailIcon = () => (
  <svg className="footer-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <polyline points="2,4 12,13 22,4" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">

        {/* Col 1 — Brand */}
        <div className="footer-brand">
          <HomeIcon />
          <p className="footer-brand-name">Golden Rental<br />Systems</p>
          <p className="footer-tagline">Structured Listings.</p>
          <p className="footer-tagline">Predictable Returns</p>
          <div className="footer-socials">
            <a href="#" aria-label="WhatsApp" className="footer-social-link"><WhatsAppIcon /></a>
            <a href="#" aria-label="Instagram" className="footer-social-link"><InstagramIcon /></a>
            <a href="#" aria-label="Facebook" className="footer-social-link"><FacebookIcon /></a>
            <a href="#" aria-label="Twitter" className="footer-social-link"><TwitterIcon /></a>
          </div>
        </div>

        {/* Col 2 — Contact + Property Type */}
        <div className="footer-col">
          <div className="footer-group">
            <h4 className="footer-col-heading">
              <span className="footer-heading-underline">Contact</span> Us
            </h4>
            <div className="footer-contact-list">
              <a href="tel:+254701999999" className="footer-contact-item">
                <PhoneIcon />
                <span>+254701 999 999</span>
              </a>
              <a href="mailto:goldenrentalsystems@gmail.com" className="footer-contact-item">
                <MailIcon />
                <span>goldenrentalsystems@gmail.com</span>
              </a>
            </div>
          </div>

          <div className="footer-group">
            <h4 className="footer-col-heading">
              <span className="footer-heading-underline">Property</span> Type
            </h4>
            <ul className="footer-link-list">
              <li><a href="#" className="footer-link">Rentals Apartments</a></li>
              <li><a href="#" className="footer-link">Airbnbs</a></li>
              <li><a href="#" className="footer-link">Commercial Spaces</a></li>
              <li><a href="#" className="footer-link">Lodgings</a></li>
              <li><a href="#" className="footer-link">Private Houses and Homes</a></li>
              <li><a href="#" className="footer-link">Hostels</a></li>
            </ul>
          </div>
        </div>

        {/* Col 3 — Links */}
        <div className="footer-col">
          <h4 className="footer-col-heading">
            <span className="footer-heading-underline">Links</span>
          </h4>
          <ul className="footer-link-list">
            <li><Link href="/" className="footer-link">Home</Link></li>
            <li><Link  href="/properties" className="footer-link">Properties</Link></li>
            <li><Link href="/about" className="footer-link">About</Link></li>
          </ul>
        </div>

      </div>

      {/* Divider + Copyright */}
      <div className="footer-bottom">
        <div className="footer-divider" />
        <p className="footer-copy">©2026</p>
      </div>
    </footer>
  );
}