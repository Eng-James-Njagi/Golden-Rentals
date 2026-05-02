'use client'
import { useState, useEffect } from "react";
import styles from "../css/Admin/cardsInfo.module.css";

const CARDS = [
  { label: "Active Listings",    key: "activeListings" },
  { label: "Suspended Listings", key: "suspendedListings" },
  { label: "Registered Listers", key: "registeredListers" },
  { label: "Total Visits",       key: "totalVisits" },
];

export default function Dashboard() {
  const [stats, setStats] = useState({
    activeListings:    0,
    suspendedListings: 0,
    registeredListers: 0,
    totalVisits:       0,
  });

  useEffect(() => {
    async function fetchStats() {
      const res = await fetch("/api/Admin");
      const data = await res.json();
      setStats(data);
    }
    fetchStats();
  }, []);

  return (
    <>
      <section className={styles.cardsSection}>
        {CARDS.map((card, i) => (
          <div key={card.key} className={styles.card} style={{ animationDelay: `${i * 60}ms` }}>
            <span className={styles.cardLabel}>{card.label}</span>
            <span className={styles.cardValue}>{stats[card.key]}</span>
          </div>
        ))}
      </section>

      {/* other dashboard sections go here */}
    </>
  );
}