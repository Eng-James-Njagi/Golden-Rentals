import Hero from './components/Home/heroSection'
import BrowseCategories from './components/Home/BrowseCategorySection'
import HomeSeekers from './components/About/HomeSeekerSection'
import Testimonials from './components/Home/TestimonialSection'
import CTABanner from './components/Home/CTAbannerSection'
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
