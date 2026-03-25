'use client';

import { useState, useEffect } from 'react';
import styles from './css/nav.module.css';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Navbar() {
   const [ menuOpen, setMenuOpen ] = useState(false);
   const [ scrolled, setScrolled ] = useState(false);
   const pathname = usePathname();

   useEffect(() => {
      const handleScroll = () => setScrolled(window.scrollY > 10);
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
   }, []);

   const toggleMenu = () => setMenuOpen((prev) => !prev);

   const navLinks = [
      { label: 'Home', path: '/' },
      { label: 'Properties', path: '/properties' },
      { label: 'About', path: '/about' },
   ];

   return (
      <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
         <div className={styles.brand}>
            <span className={styles.logoIcon}>
               <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 3L3 12V25H10V18H18V25H25V12L14 3Z" fill="#F5A623" />
                  <rect x="11" y="18" width="6" height="7" fill="#E8940A" />
               </svg>
            </span>
            <span className={styles.brandName}>Golden Rentals</span>
         </div>

         <ul className={`${styles.navLinks} ${menuOpen ? styles.navOpen : ''}`}>
            {navLinks.map(({ label, path }) => (
               <li key={label}>
                  <Link
                     href={path}
                     className={`${styles.navLink} ${pathname === path ? styles.navLinkActive : ''}`}
                     onClick={() => setMenuOpen(false)}
                  >
                     {label}
                  </Link>
               </li>
            ))}
         </ul>

         <div className={styles.actions}>
            <a href="#" className={styles.ctaButton}>
               BECOME A LISTER
               <span className={styles.arrow}>→</span>
            </a>

            <button
               className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ''}`}
               onClick={toggleMenu}
               aria-label="Toggle menu"
               aria-expanded={menuOpen}
            >
               <span />
               <span />
               <span />
            </button>
         </div>
      </nav>
   );
}