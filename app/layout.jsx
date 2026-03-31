import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import Navbar from "./components/nav"
import Footer from './components/footer'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: [ "latin" ],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: [ "latin" ],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: [ "latin" ],
});

export const metadata = {
  title: "Golden Rentals System",
  description: "Lets find your future home",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body 
      data-scroll-behavior='smooth'
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}>
        <Navbar/>
        <main>
          {children}
          <Analytics />
          <SpeedInsights />
        </main>
        <Footer/>
      </body>
    </html>
  );
}
