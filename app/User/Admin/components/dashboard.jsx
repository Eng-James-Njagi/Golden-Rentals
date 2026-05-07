'use client';

import { useState, useEffect } from "react";
import cardStyles from "../css/cardsInfo.module.css";
import revenueStyles from '../css/revenueStats.module.css';
import GrowthMetricsChart from "./GrowthMetricsChart";

const STAT_CARDS = [
  { label: "Active Listings", key: "activeListings" },
  { label: "Suspended Listings", key: "suspendedListings" },
  { label: "Registered Listers", key: "registeredListers" },
  { label: "Total Visits", key: "totalVisits" },
];

const REVENUE_CARDS = [
  { label: 'Total Revenue Generated', key: 'totalRevenue', prefix: 'KSH' },
  { label: 'Total Transactions Performed', key: 'totalTransactions', prefix: '' },
  { label: 'Total Calls', key: 'totalCalls', prefix: '' },
];

function getWeekOptions() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  return [ 1, 2, 3, 4 ].map(w => ({
    label: `Week ${w}`,
    start: new Date(Date.UTC(year, month, (w - 1) * 7 + 1, 0, 0, 0)).toISOString(),
    end: new Date(Date.UTC(year, month, w * 7, 23, 59, 59)).toISOString(),
  }));
}

function getMonthOptions() {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months.map((name, i) => {
    const year = new Date().getFullYear();
    const lastDay = new Date(Date.UTC(year, i + 1, 0)).getUTCDate();
    return {
      label: name,
      start: new Date(Date.UTC(year, i, 1, 0, 0, 0)).toISOString(),
      end: new Date(Date.UTC(year, i, lastDay, 23, 59, 59)).toISOString(),
    };
  });
}

function getYearOptions() {
  const current = new Date().getFullYear();
  const years = [];
  for (let y = 2026; y <= current; y++) {
    years.push({
      label: String(y),
      start: new Date(Date.UTC(y, 0, 1, 0, 0, 0)).toISOString(),
      end: new Date(Date.UTC(y, 11, 31, 23, 59, 59)).toISOString(),
    });
  }
  return years;
}

const WEEK_OPTIONS = getWeekOptions();
const MONTH_OPTIONS = getMonthOptions();
const YEAR_OPTIONS = getYearOptions();

const formatValue = (value, prefix) =>
  prefix ? `${prefix} ${Number(value).toLocaleString()}` : Number(value).toLocaleString();

export default function Dashboard() {
  const [ stats, setStats ] = useState({
    activeListings: 0, suspendedListings: 0,
    registeredListers: 0, totalVisits: 0,
  });

  const [ revenueStats, setRevenueStats ] = useState({
    totalRevenue: 0, totalTransactions: 0, totalCalls: 0,
  });

  const [ filtered, setFiltered ] = useState(false);
  const [ week, setWeek ] = useState(WEEK_OPTIONS[ 0 ]);
  const [ month, setMonth ] = useState(MONTH_OPTIONS[ new Date().getMonth() ]);
  const [ year, setYear ] = useState(YEAR_OPTIONS[ YEAR_OPTIONS.length - 1 ]);
  const [ active, setActive ] = useState('week');

  // fetch stat cards
  useEffect(() => {
    fetch("/api/Admin")
      .then(r => r.json())
      .then(data => setStats(data));
  }, []);

  // fetch revenue
  useEffect(() => {
    const selected = active === 'week' ? week : active === 'month' ? month : year;
    const params = new URLSearchParams({ filtered: String(filtered) });
    if (filtered) {
      params.set('start', selected.start);
      params.set('end', selected.end);
    }
    fetch(`/api/adminRo/revenue?${params}`)
      .then(r => r.json())
      .then(data => setRevenueStats(prev => ({
        ...prev,
        totalRevenue: data.totalRevenue ?? 0,
        totalTransactions: data.totalTransactions ?? 0,
        totalCalls: data.totalCalls ?? 0,
      })));
  }, [ filtered, active, week, month, year ]);

  return (
    <>
      <section className={cardStyles.cardsSection}>
        {STAT_CARDS.map((card, i) => (
          <div key={card.key} className={cardStyles.card} style={{ animationDelay: `${i * 60}ms` }}>
            <span className={cardStyles.cardLabel}>{card.label}</span>
            <span className={cardStyles.cardValue}>{stats[ card.key ]}</span>
          </div>
        ))}
      </section>

      <section className={revenueStyles.revenueSection}>
        <div className={revenueStyles.controlBlock}>

          <label className={revenueStyles.filterToggle}>
            <input
              type="checkbox"
              checked={filtered}
              onChange={e => setFiltered(e.target.checked)}
              className={revenueStyles.filterCheckbox}
            />
            <span className={revenueStyles.filterLabel}>Filter by period</span>
          </label>

          <div className={`${revenueStyles.dropdowns} ${!filtered ? revenueStyles.dropdownsDisabled : ''}`}>
            <select
              disabled={!filtered}
              className={`${revenueStyles.dropdown} ${active === 'week' ? revenueStyles.dropdownActive : ''}`}
              value={week.label}
              onChange={e => {
                setWeek(WEEK_OPTIONS.find(w => w.label === e.target.value));
                setActive('week');
              }}
            >
              {WEEK_OPTIONS.map(o => <option key={o.label}>{o.label}</option>)}
            </select>

            <select
              disabled={!filtered}
              className={`${revenueStyles.dropdown} ${active === 'month' ? revenueStyles.dropdownActive : ''}`}
              value={month.label}
              onChange={e => {
                setMonth(MONTH_OPTIONS.find(m => m.label === e.target.value));
                setActive('month');
              }}
            >
              {MONTH_OPTIONS.map(o => <option key={o.label}>{o.label}</option>)}
            </select>

            <select
              disabled={!filtered}
              className={`${revenueStyles.dropdown} ${active === 'year' ? revenueStyles.dropdownActive : ''}`}
              value={year.label}
              onChange={e => {
                setYear(YEAR_OPTIONS.find(y => y.label === e.target.value));
                setActive('year');
              }}
            >
              {YEAR_OPTIONS.map(o => <option key={o.label}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div className={revenueStyles.revenueCards}>
          {REVENUE_CARDS.map(card => (
            <div key={card.key} className={revenueStyles.revenueCard}>
              <span className={revenueStyles.revenueCardLabel}>{card.label}</span>
              <span className={revenueStyles.revenueCardValue}>
                {formatValue(revenueStats[ card.key ], card.prefix)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <GrowthMetricsChart />
    </>
  );
}