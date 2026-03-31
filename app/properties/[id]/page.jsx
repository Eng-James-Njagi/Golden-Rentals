import { notFound } from 'next/navigation';
import Link from 'next/link';
import PropertyHero from '../../components/detailsHero';
import PropertyTabs from '../../components/detailsTab';
import styles from '../../components/css/detailsPage.module.css';
import RelatedListingsCarousel from '../../components/RelatedListingsCarousel'

async function getListing(id) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

  const res = await fetch(`${baseUrl}/api/listings/${id}`, {
    cache: 'no-store',
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch listing');

  const json = await res.json();
  return json.data;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) return { title: 'Property Not Found' };

  return {
    title: `${listing.property_name} — KSH ${Number(listing.property_price).toLocaleString('en-KE')}/mo`,
    description: listing.description?.slice(0, 155) ?? undefined,
  };
}

export default async function PropertyDetailPage({ params }) {
  const { id } = await params;
  const listing = await getListing(id);

  if (!listing) notFound();

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Back nav */}
        <Link href="/properties" className={styles.backLink}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12l7-7M5 12l7 7"
              stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to listings
        </Link>

        {/* Hero: gallery + info */}
        <PropertyHero listing={listing} />

        {/* Tabs: description + map */}
        <PropertyTabs listing={listing} />

        <RelatedListingsCarousel
          categoryName={listing.category_name}
          currentId={listing.listing_id}
        />
      </div>
    </div>
  );
}