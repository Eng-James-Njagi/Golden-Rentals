'use client';

import { useState, useEffect } from "react";
import cardStyles from "../css/Admin/cardsInfo.module.css";
import revenueStyles from '../css/Admin/revenueStats.module.css';

const STAT_CARDS = [
  { label: "Active Listings",    key: "activeListings" },
  { label: "Suspended Listings", key: "suspendedListings" },
  { label: "Registered Listers", key: "registeredListers" },
  { label: "Total Visits",       key: "totalVisits" },
];

const DURATIONS = ['Weekly', 'Monthly', 'Daily', 'Yearly'];

const REVENUE_CARDS = [
  { label: 'Total Revenue Generated',      key: 'totalRevenue',      prefix: 'KSH' },
  { label: 'Total Transactions Performed', key: 'totalTransactions',  prefix: 'KSH' },
  { label: 'Total Calls',                  key: 'totalCalls',         prefix: 'KSH' },
];

const formatValue = (value, prefix) =>
  `${prefix} ${Number(value).toLocaleString()}`;

export default function Dashboard() {
  const [stats, setStats] = useState({
    activeListings:    0,
    suspendedListings: 0,
    registeredListers: 0,
    totalVisits:       0,
  });

  const [revenueStats] = useState({
    totalRevenue:      0,
    totalTransactions: 0,
    totalCalls:        0,
  });

  const [duration, setDuration] = useState('Weekly');

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
      <section className={cardStyles.cardsSection}>
        {STAT_CARDS.map((card, i) => (
          <div key={card.key} className={cardStyles.card} style={{ animationDelay: `${i * 60}ms` }}>
            <span className={cardStyles.cardLabel}>{card.label}</span>
            <span className={cardStyles.cardValue}>{stats[card.key]}</span>
          </div>
        ))}
      </section>

      <section className={revenueStyles.revenueSection}>
        <div className={revenueStyles.durationBlock}>
          <span className={revenueStyles.durationLabel}>Duration</span>
          <div className={revenueStyles.durationGrid}>
            {DURATIONS.map(d => (
              <label key={d} className={revenueStyles.durationOption}>
                <input
                  type="radio"
                  name="duration"
                  value={d}
                  checked={duration === d}
                  onChange={() => setDuration(d)}
                  className={revenueStyles.durationRadio}
                />
                <span className={revenueStyles.durationText}>{d}</span>
              </label>
            ))}
          </div>
        </div>

        <div className={revenueStyles.revenueCards}>
          {REVENUE_CARDS.map(card => (
            <div key={card.key} className={revenueStyles.revenueCard}>
              <span className={revenueStyles.revenueCardLabel}>{card.label}</span>
              <span className={revenueStyles.revenueCardValue}>
                {formatValue(revenueStats[card.key], card.prefix)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}