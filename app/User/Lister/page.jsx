'use client';

import { useState, useCallback, useEffect } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import ListerNav from "../../components/ListerNav";
import AccountSettings from "../../components/Lister/Accountsetting";
import AddListing from '../../components/Lister/AddListing';
import MyListings from '../../components/Lister/listings';

const supabase = createBrowserSupabaseClient();

export default function ListerLand() {
  const [ slotData, setSlotData ] = useState(null);

  const fetchSlots = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [ { data: lister }, { count: listingCount } ] = await Promise.all([
        supabase
          .from('Listers_Info')
          .select('Slots')
          .eq('lister_UUID', user.id)
          .single(),
        supabase
          .from('Property_Listing')
          .select('listing_id', { count: 'exact', head: true })
          .eq('user_id', user.id),
      ]);

      const slots    = lister?.Slots ?? 0;
      const listings = listingCount  ?? 0;

      setSlotData({ slots, listings, can_add: slots > listings });
    } catch {
      // non-blocking
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const [ { data: lister }, { count: listingCount } ] = await Promise.all([
          supabase
            .from('Listers_Info')
            .select('Slots')
            .eq('lister_UUID', user.id)
            .single(),
          supabase
            .from('Property_Listing')
            .select('listing_id', { count: 'exact', head: true })
            .eq('user_id', user.id), 
        ]);

        const slots    = lister?.Slots ?? 0;
        const listings = listingCount  ?? 0;

        setSlotData({ slots, listings, can_add: slots > listings });
      } catch {
        // non-blocking
      }
    };

    load();
  }, []);

  return (
    <>
      <ListerNav
        defaultTab="listings"
        panels={{
          account: <AccountSettings />,
          add: <AddListing canAdd={slotData?.can_add ?? false} />,
          listings: (
            <MyListings
              slotData={slotData}
              onSlotAdded={fetchSlots}
            />
          ),
        }}
      />
    </>
  );
}