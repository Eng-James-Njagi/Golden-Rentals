import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function useTrackVisit() {
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/adminRo/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname }),
    });
  }, [pathname]);
}