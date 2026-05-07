'use client';
import { useEffect, useState } from 'react';
import {
   LineChart, Line, XAxis, YAxis,
   CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import styles from '../css/growthMetrics.module.css';

function getWeekOptions() {
   const now = new Date();
   const year = now.getFullYear();
   const month = now.getMonth();
   return [ 1, 2, 3, 4 ].map(w => {
      const startDay = (w - 1) * 7 + 1;
      const endDay = w * 7;
      return {
         label: `Week ${w}`,
         start: new Date(Date.UTC(year, month, startDay, 0, 0, 0)).toISOString(),
         end: new Date(Date.UTC(year, month, endDay, 23, 59, 59)).toISOString(),
      };
   });
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

export default function GrowthMetricsChart() {
   const [ data, setData ] = useState([]);
   const [ week, setWeek ] = useState(WEEK_OPTIONS[ 0 ]);
   const [ month, setMonth ] = useState(MONTH_OPTIONS[ new Date().getMonth() ]);
   const [ year, setYear ] = useState(YEAR_OPTIONS[ YEAR_OPTIONS.length - 1 ]);
   const [ active, setActive ] = useState('week');

   useEffect(() => {
      const selected = active === 'week' ? week : active === 'month' ? month : year;
      fetch(`/api/adminRo/analytics?start=${selected.start}&end=${selected.end}`)
         .then(r => r.json())
         .then(rows => setData(rows.map(r => ({
            date: r.date.slice(5),
            visits: Number(r.visits),
         }))));
   }, [ active, week, month, year ]);

   return (
      <section className={styles.section}>
         <h2 className={styles.title}>Platform Growth Metrics</h2>

         <div className={styles.controls}>
            <select
               className={`${styles.dropdown} ${active === 'week' ? styles.dropdownActive : ''}`}
               value={week.label}
               onChange={e => {
                  setWeek(WEEK_OPTIONS.find(w => w.label === e.target.value));
                  setActive('week');
               }}
            >
               {WEEK_OPTIONS.map(o => <option key={o.label}>{o.label}</option>)}
            </select>

            <select
               className={`${styles.dropdown} ${active === 'month' ? styles.dropdownActive : ''}`}
               value={month.label}
               onChange={e => {
                  setMonth(MONTH_OPTIONS.find(m => m.label === e.target.value));
                  setActive('month');
               }}
            >
               {MONTH_OPTIONS.map(o => <option key={o.label}>{o.label}</option>)}
            </select>

            <select
               className={`${styles.dropdown} ${active === 'year' ? styles.dropdownActive : ''}`}
               value={year.label}
               onChange={e => {
                  setYear(YEAR_OPTIONS.find(y => y.label === e.target.value));
                  setActive('year');
               }}
            >
               {YEAR_OPTIONS.map(o => <option key={o.label}>{o.label}</option>)}
            </select>
         </div>

         <div className={styles.chartWrapper}>
            {data.length === 0 && (
               <div className={styles.noData}>No data available for this period</div>
            )}
            <ResponsiveContainer width="100%" height={300}>
               <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ className: styles.axisLabel }} />
                  <YAxis tick={{ className: styles.axisLabel }} />
                  <Tooltip />
                  <Line
                     type="monotone"
                     dataKey="visits"
                     stroke="var(--accent)"
                     strokeWidth={2}
                     dot={true}
                  />
               </LineChart>
            </ResponsiveContainer>
         </div>
      </section>
   );
}