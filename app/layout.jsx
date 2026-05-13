import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Toaster } from 'sonner'
import Navbar from "./components/nav"
import Footer from './components/footer'
import Providers from './providers'

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
  title: "City  Rentals System",
  description: "Lets find your future home",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        data-scroll-behavior='smooth'
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}>
        <Analytics />
        <SpeedInsights />
        <Toaster position="top-right" duration={4000} richColors />
        <Navbar />
        <main>
          <Providers>{children}</Providers>
        </main>
        <Footer />
      </body>
    </html>
  );
}
