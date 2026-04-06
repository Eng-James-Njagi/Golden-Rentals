'use client'
import { useState, useRef, useEffect } from "react";
import styles from "./css/Lister/ListerNav.module.css";

const TABS = [
  { id: "listings",  label: "Listings" },
  { id: "analytics", label: "Analytics" },
  { id: "add",       label: "Add A Listing" },
  { id: "account",   label: "Account Information" },
];

const DefaultPanel = ({ label }) => (
  <div className={styles.defaultPanel}>
    <strong>{label}</strong> panel — replace with your component.
  </div>
);

export default function ListerNav({ panels = {}, defaultTab = "listings" }) {
  const [active, setActive]                 = useState(defaultTab);
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const [dropdownOpen, setDropdownOpen]     = useState(false);

  const tabRefs = useRef({});
  const barRef  = useRef(null);
  const rootRef = useRef(null);

  const activeTab = TABS.find(t => t.id === active);

  useEffect(() => {
    const updateIndicator = () => {
      const bar   = barRef.current;
      const tabEl = tabRefs.current[active];
      if (!bar || !tabEl) return;
      const padding = 16;
      const barRect = bar.getBoundingClientRect();
      const tabRect = tabEl.getBoundingClientRect();
      setIndicatorStyle({
        left:  tabRect.left - barRect.left + padding / 4,
        width: tabRect.width - padding,
      });
    };
    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [active]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  const selectTab = (id) => {
    setActive(id);
    setDropdownOpen(false);
  };

  return (
    <div className={styles.root} ref={rootRef}>

      <div className={styles.bar} ref={barRef} onClick={() => setDropdownOpen(p => !p)}>
        <div className={styles.indicator} style={indicatorStyle} />

        {TABS.map(tab => (
          <button
            key={tab.id}
            ref={el => (tabRefs.current[tab.id] = el)}
            className={`${styles.tab}${active === tab.id ? ` ${styles.tabActive}` : ""}`}
            onClick={(e) => { e.stopPropagation(); selectTab(tab.id); }}
          >
            {tab.label}
          </button>
        ))}

        <div className={styles.mobileActive}>
          <span>{activeTab.label}</span>
          <svg
            className={`${styles.chevron}${dropdownOpen ? ` ${styles.chevronOpen}` : ""}`}
            width="16" height="16" viewBox="0 0 16 16"
            fill="none" xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {dropdownOpen && (
        <div className={styles.dropdown}>
          {TABS.filter(t => t.id !== active).map(tab => (
            <button
              key={tab.id}
              className={styles.dropdownItem}
              onClick={() => selectTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className={styles.underline} />

      <div className={styles.panelWrap}>
        {panels[active] ?? <DefaultPanel label={activeTab.label} />}
      </div>

    </div>
  );
}