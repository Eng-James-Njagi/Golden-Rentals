import Hero from './components/heroSection'
import BrowseCategories from './components/BrowseCategorySection'
import HomeSeekers from './components/HomeSeekerSection'
import Testimonials from './components/TestimonialSection'
import CTABanner from './components/CTAbannerSection'
export default function Home() {
  return (
    <>
    <Hero/>
    <BrowseCategories/>
    <HomeSeekers/>
    <Testimonials/>
    <CTABanner/>
    </>
  );
}
