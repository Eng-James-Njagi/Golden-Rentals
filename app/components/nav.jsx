'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import './css/nav.css'

export default function Nav() {
   const pathName = usePathname()
   const [ menuOpen, setMenuOpen ] = useState(false)

   const toggleMenu = () => setMenuOpen((prev) => !prev)
   const closeMenu = () => setMenuOpen(false)

   const links = [
      { href: '/', label: 'Home' },
      { href: '/properties', label: 'Properties' },
      { href: '/about', label: 'About' },
   ]

   return (
      <header>
         <Link href="/" className="headerLogo" onClick={closeMenu}>
            <Image src="/logo.png" alt="Golden Rentals" width={38} height={26} />
            <h1>Golden Rentals</h1>
         </Link>

         <nav className={menuOpen ? 'navOpen' : ''}>
            <ul>
               {links.map(({ href, label }) => (
                  <li key={href}>
                     <Link
                        href={href}
                        onClick={closeMenu}
                        className={pathName === href ? 'active' : ''}
                     >
                        {label}
                     </Link>
                  </li>
               ))}
            </ul>
         </nav>

         <button className={`headerBtn ${menuOpen ? 'show' : 'hide'}`}>
            BECOME A LISTER →
         </button>

         <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
         >
            <span></span>
            <span></span>
            <span></span>
         </button>
      </header>
   )
}