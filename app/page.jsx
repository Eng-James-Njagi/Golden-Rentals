import Hero from './components/Home/heroSection'
import TrendingListings from './components/Home/TrendingListingsSection'
import BrowseCategories from './components/Home/BrowseCategorySection'
import HomeSeekers from './components/Home/HomeSeekerSection'
import Testimonials from './components/Home/TestimonialSection'
import CTABanner from './components/Home/CTAbannerSection'

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function Home() {
  const cookieStore = await cookies();
  const hasVisited = cookieStore.get('has_visited');

  if (!hasVisited) {
    cookieStore.set('has_visited', 'true', { maxAge: 60 * 3 });
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
