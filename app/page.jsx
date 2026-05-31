import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import Hero from './components/Home/heroSection'
import TrendingListings from './components/Home/TrendingListingsSection'
import BrowseCategories from './components/Home/BrowseCategorySection'
import HomeSeekers from './components/Home/HomeSeekerSection'
import Testimonials from './components/Home/TestimonialSection'
import CTABanner from './components/Home/CTAbannerSection'

export default async function Home() {
  const cookieStore = await cookies();
  const hasVisited = cookieStore.get('has_visited');

  if (!hasVisited) {
    redirect('/properties');
  }

  return (
    <>
      <Hero />
      <TrendingListings />
      <BrowseCategories />
      <HomeSeekers />
      <Testimonials />
      <CTABanner />
    </>
  );
}