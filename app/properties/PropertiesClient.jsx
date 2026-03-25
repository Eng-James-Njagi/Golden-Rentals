'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import FilterSidebar from '../components/FilterSidebar'
import PropertyCard from '../components/PropertyCard'
import styles from '../components/css/properties.module.css'

const PAGE_SIZE = 20

function filtersFromParams(params) {
  return {
    ward_id:           params.get('ward_id')           ? Number(params.get('ward_id'))                          : null,
    category_id:       params.get('category_id')       ? Number(params.get('category_id'))                      : null,
    type_ids:          params.get('type_ids')           ? params.get('type_ids').split(',').map(Number)          : [],
    price_range:       params.get('price_range')        || null,
    rent_duration:     params.get('rent_duration')      || null,
    property_interior: params.get('property_interior')  || null,
  }
}

function filtersToParams(filters, page) {
  const params = new URLSearchParams()
  if (filters.ward_id)            params.set('ward_id',           filters.ward_id)
  if (filters.category_id)        params.set('category_id',       filters.category_id)
  if (filters.type_ids?.length)   params.set('type_ids',          filters.type_ids.join(','))
  if (filters.price_range)        params.set('price_range',       filters.price_range)
  if (filters.rent_duration)      params.set('rent_duration',     filters.rent_duration)
  if (filters.property_interior)  params.set('property_interior', filters.property_interior)
  if (page > 1)                   params.set('page',              page)
  return params
}

export default function PropertiesClient() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [filters, setFilters]         = useState(() => filtersFromParams(searchParams))
  const [currentPage, setCurrentPage] = useState(() => Number(searchParams.get('page') ?? 1))
  const [listings, setListings]       = useState([])
  const [pagination, setPagination]   = useState(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [wardPopup, setWardPopup]     = useState(null)

  const fetchListings = useCallback(async (page, activeFilters) => {
    setLoading(true)
    setError(null)
    try {
      const params = filtersToParams(activeFilters, page)
      params.set('prefetch', 'true')
      const res = await fetch(`/api/listings?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch listings')
      const json = await res.json()
      setListings(json.data ?? [])
      setPagination(json.pagination)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // fetch on page or filter change
  useEffect(() => {
    fetchListings(currentPage, filters)
  }, [currentPage, filters, fetchListings])

  // sync URL
  useEffect(() => {
    const params = filtersToParams(filters, currentPage)
    const qs = params.toString()
    router.replace(qs ? `?${qs}` : '?', { scroll: false })
  }, [filters, currentPage, router])

  const handleFilterChange = (updated) => {
    setFilters(updated)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const totalPages = pagination?.total_pages ?? 1

  const pageNumbers = () => {
    const pages = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
      return pages
    }
    pages.push(1)
    if (currentPage > 3) pages.push('...')
    const start = Math.max(2, currentPage - 1)
    const end   = Math.min(totalPages - 1, currentPage + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
    return pages
  }

  return (
    <div className={styles.pageLayout}>
      <FilterSidebar onFilterChange={handleFilterChange} />

      <main className={styles.mainContent}>
        <div className={styles.resultsHeader}>
          {!loading && pagination && (
            <p className={styles.resultsCount}>
              {pagination.total_records} properties found
            </p>
          )}
        </div>

        {error && (
          <div className={styles.errorState}>
            Failed to load listings — {error}
          </div>
        )}

        {loading && (
          <div className={styles.grid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        )}

        {!loading && !error && listings.length === 0 && (
          <div className={styles.emptyState}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M3 10V20M21 10V20M3 10h18M3 10L12 3l9 7" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
              <rect x="9" y="14" width="6" height="6" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
            <p>No properties match your filters.</p>
          </div>
        )}

        {!loading && listings.length > 0 && (
          <div className={styles.grid}>
            {listings.map(listing => (
              <PropertyCard
                key={listing.listing_id}
                listing={listing}
                onWardClick={(ward_id, ward_name) => setWardPopup({ ward_id, ward_name })}
              />
            ))}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              &#8592;
            </button>

            {pageNumbers().map((p, i) =>
              p === '...' ? (
                <span key={`ellipsis-${i}`} className={styles.ellipsis}>........</span>
              ) : (
                <button
                  key={p}
                  className={`${styles.pageBtn} ${p === currentPage ? styles.pageBtnActive : ''}`}
                  onClick={() => handlePageChange(p)}
                >
                  {p}
                </button>
              )
            )}

            <button
              className={styles.pageBtn}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              &#8594;
            </button>
          </div>
        )}
      </main>

      {wardPopup && (
        <div className={styles.wardOverlay} onClick={() => setWardPopup(null)}>
          <div className={styles.wardModal} onClick={e => e.stopPropagation()}>
            <div className={styles.wardModalHeader}>
              <span>{wardPopup.ward_name}</span>
              <button onClick={() => setWardPopup(null)}>&#x2715;</button>
            </div>
            <div className={styles.wardModalBody}>
              Map embed for {wardPopup.ward_name} goes here
            </div>
          </div>
        </div>
      )}
    </div>
  )
}