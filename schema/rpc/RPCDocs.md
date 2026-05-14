**How the RPC works**

---

**Step 1 — Approximate count (`approx_count` CTE)**

Reads `pg_class.reltuples` — a number Postgres maintains automatically. No table scan. Just reads a stored statistic. Returns approximate total listings in `Property_Listing`.

---

**Step 2 — Decay factor (`decay_config` CTE)**

Uses that count to pick aggressiveness:

```
< 50 listings   → 0.3  (gentle)
< 200 listings  → 0.5  (moderate)
< 500 listings  → 0.7  (faster)
500+  listings  → 1.0  (aggressive)
```

At low volume, older listings stay competitive longer. As the platform grows, fresh listings surface faster automatically. No manual tuning needed.

---

**Step 3 — Scoring (`scored` CTE)**

Every listing gets a score:

```
score = views / (1 + hours_since_created) ^ decay_factor
```

Concretely:
- A listing with 100 views created 1 hour ago scores very high
- A listing with 100 views created 30 days ago scores much lower
- A listing with 0 views scores 0 regardless of age
- A new listing with few views can outrank an old listing with many views if the decay factor is high enough

---

**Step 4 — Tier assignment (`tiered` CTE)**

`NTILE(10)` splits all scored listings into 10 equal buckets ranked by score descending — decile 1 is highest scored, decile 10 is lowest.

Those deciles map to three tiers:

```
deciles 1–2  → hot   (top 20%)
deciles 3–5  → warm  (next 30%)
deciles 6–10 → cold  (bottom 50%)
```

---

**Step 5 — Final ordering**

```
ORDER BY tier (hot first, then warm, then cold), random() within each tier
```

Result: hot listings always appear before warm, warm before cold — but the exact sequence within each group changes every request. Two users loading the same filtered page see different orderings within each tier.

---

**Filters interact with this at Step 3** — the `WHERE` clause runs before scoring, so tier assignment is always relative to the filtered set, not the entire catalog. If you filter by `category_id=1`, hot/warm/cold are computed only among rental apartments, not all listings.