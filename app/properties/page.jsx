import { Suspense } from 'react'
import PropertiesClient from './PropertiesClient'
import styles from '../components/css/properties.module.css'

function LoadingSkeleton() {
  return (
    <div className={styles.pageLayout}>
      <div style={{ width: 240, minWidth: 240, borderRight: '1px solid #e8e8ed', height: 'calc(100vh - 64px)' }} />
      <main className={styles.mainContent}>
        <div className={styles.grid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      </main>
    </div>
  )
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <PropertiesClient />
    </Suspense>
  )
}