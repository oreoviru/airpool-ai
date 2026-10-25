# ✈️ AirPool AI

<div align="center">

**Same airport. Same direction. One smarter ride.**

*A flight-aware peer route optimization and cost-sharing platform connecting air travelers landing at the same hub and heading down the same transit corridors.*

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media_CDN-3448C5?style=for-the-badge&logo=cloudinary)](https://cloudinary.com/)

</div>

---

## 💡 Overview

Every day, hundreds of passengers land at the same airport around the same time and summon separate rideshares heading to identical downtown hubs or corporate campuses. The result: bloated fares, airport terminal traffic jams, and avoidable carbon emissions.

**AirPool AI** solves this with a deterministic, flight-synchronized matching engine that pairs travelers arriving on compatible flights with minimal detour, transparent proportional fare splits, and mutual pickup verification.

---

## 🌟 Key Features

### 1. 🛬 Flight-Aware Synchronization
- Synchronizes with flight arrival times, arrival gates, and baggage claim windows.
- Matches are bounded by arrival readiness intervals so neither passenger waits excessively at the curb.

### 2. ⚡ Deterministic 4-Factor Matching Engine
Before any candidate is ranked, **5 Hard Feasibility Constraints** must pass:
1. **Airport Match:** Exact airport hub matching (`SFO`, `JFK`, `LAX`, `ORD`, `BLR`).
2. **Corridor Alignment:** Transit corridor vector alignment (e.g., Highway 101 Northbound vs Silicon Valley Southbound). Divergent corridors are strictly eliminated.
3. **Temporal Compatibility:** Landing time difference must be within both parties' acceptable waiting tolerance ($\Delta t \le \min(\text{maxWait}_A, \text{maxWait}_B)$).
4. **Detour Cap:** Additional sequential drop-off overhead must not exceed either user's maximum detour tolerance.
5. **Vehicle Capacity:** Combined passenger count $\le 4$ and trunk luggage limit $\le 4$.

#### Exact Algorithmic Weights:
$$\text{Match Score} = (S_{\text{route}} \times 0.40) + (S_{\text{wait}} \times 0.25) + (S_{\text{detour}} \times 0.20) + (S_{\text{fare}} \times 0.15)$$

- **Route Compatibility (40%):** Proximity and transit corridor overlap.
- **Waiting-Time Compatibility (25%):** Penalizes arrival gap against acceptable waiting window.
- **Detour Acceptability (20%):** Measures route diversion efficiency.
- **Fare Fairness (15%):** Proportional equity of shared cost-savings.

### 3. 💵 Proportional Transparent Fare Splitting
Rather than an unfair 50/50 split when one passenger travels further:
- Proportional route weighting calculates solo baseline tariffs and shared detour extensions.
- Riders save up to **45%** on airport ground transit.
- Displays real-time environmental metrics ($\text{kg CO}_2$ reduced per trip).

### 4. 🗄️ Supabase Persistence & Concurrency Protection
- Complete PostgreSQL schema with UUID keys, indexes, foreign key cascades, and Row-Level Security (RLS) policies.
- Server-side double-booking validation prevents race conditions or dual confirmations.
- **Graceful Fallback Adapter:** If Supabase keys are not set, the platform automatically runs on an in-memory repository with zero runtime crashes during live evaluations.

### 5. ☁️ Secure Cloudinary Media Integration
- Generates signed HMAC SHA-256 upload tokens via `/api/cloudinary-sign` without exposing secrets to the client.
- Upload widget for boarding pass verification and profile avatars.
- Delivers transformed, face-detected CDN assets (`c_thumb,g_face,w_140,h_140,f_auto,q_auto`).

### 6. 🏆 Judge-Ready Presentation Polish
- **Accept/Reject Flow:** Declining a match immediately reveals the next best candidate in the ranked pool.
- **Mutual 4-Digit Pickup PIN:** Generates verified 4-digit code and vehicle dispatch ETA.
- **One-Click Demo Reset:** Instant reset button in the navbar and footer to clear transient demo sessions and restore the pristine seeded pool for repeated pitches.

---

## 📐 System Architecture

```
                                  ┌────────────────────────────┐
                                  │      Next.js Frontend      │
                                  │   (App Router + Tailwind)  │
                                  └──────────────┬─────────────┘
                                                 │
                            ┌────────────────────┼────────────────────┐
                            ▼                    ▼                    ▼
                   ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐
                   │ Deterministic   │  │ Supabase (PG)   │  │ Cloudinary       │
                   │ Matching Engine │  │ Persistence     │  │ Signed Media     │
                   │  (40/25/20/15)  │  │ & Fallback Store│  │ Delivery CDN     │
                   └─────────────────┘  └─────────────────┘  └──────────────────┘
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed mathematical equations and database specifications.

---

## 📁 Project Structure

```
AIRPOOL/
├── src/
│   ├── app/
│   │   ├── actions.ts                  # Server Actions (Search, Confirm, Reject, Reset)
│   │   ├── globals.css                 # Dark mobility-tech styles & glassmorphism
│   │   ├── layout.tsx                  # Root layout with Outfit & JetBrains Mono fonts
│   │   ├── page.tsx                    # Landing page, hero telemetry, search form & dashboard
│   │   ├── trips/page.tsx              # "My Trips" persisted dashboard & mutual PINs
│   │   └── api/
│   │       └── cloudinary-sign/route.ts # Secure HMAC SHA-256 Cloudinary signature API
│   ├── components/
│   │   ├── Navbar.tsx                  # Header with flight telemetry & "Reset Demo" button
│   │   ├── Footer.tsx                  # Regulatory compliance notice & secondary reset
│   │   ├── HeroBanner.tsx              # Mobility-tech hero with judge quick-fill shortcuts
│   │   ├── TripSearchForm.tsx          # Flight-aware search form & Cloudinary upload widget
│   │   ├── MatchDiscoveryDashboard.tsx # Real-time ranking, parameter relaxation & toasts
│   │   ├── MatchDetailCard.tsx         # 4-factor score breakdown, transparent fare split
│   │   ├── ConfirmedMatchModal.tsx     # Confetti celebration, driver ETA, & 4-digit PIN
│   │   └── UnmatchedFallbackState.tsx  # Dynamic relaxation for tight constraints
│   ├── lib/
│   │   ├── matching/
│   │   │   └── engine.ts               # 5 Hard Constraints + 4-Factor Weighted Algorithm
│   │   ├── constants/
│   │   │   ├── airports.ts             # SFO, JFK, LAX, ORD, BLR hubs & destination zones
│   │   │   └── demo-data.ts            # 9 diverse fictional flight travelers
│   │   ├── supabase/
│   │   │   ├── client.ts               # Supabase client with fallback adapter
│   │   │   └── schema.sql              # Production PostgreSQL schema
│   │   ├── storage/
│   │   │   └── repository.ts           # Storage repository with double-booking prevention
│   │   └── cloudinary/
│   │       └── client.ts               # Cloudinary transformed asset generator & uploader
│   └── types/
│       └── index.ts                    # Strict TypeScript type definitions
├── supabase/
│   └── migrations/
│       └── 20261025_init_schema.sql    # Supabase migration file
├── ARCHITECTURE.md                     # Technical architecture & mathematical formulation
├── .env.example                        # Template for Cloudinary & Supabase credentials
└── package.json
```

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js 18+ (tested on v26)
- npm or pnpm

### 2. Installation
```bash
git clone https://github.com/oreoviru/airpool-ai.git
cd airpool-ai
npm install
```

### 3. Environment Variables (Optional)
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

> **Note:** AirPool AI includes an automated in-memory fallback adapter. If external credentials are not supplied, the entire matching engine, UI, and simulated confirmations work out of the box with zero runtime errors!

### 4. Run Locally
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 5. Production Build
```bash
npm run build
npm run start
```

---

## 🧪 2-Minute Judge Pitch Walkthrough

1. **Open the App:** Navigate to `http://localhost:3000`.
2. **Select Preset:** Click the **`✈️ SFO → Downtown SF`** shortcut button in the hero section to populate realistic flight data.
3. **Execute Match:** Click **"Search Matched Passengers"**. The server evaluates candidates through the 5 hard constraints and ranks feasible travelers.
4. **Inspect Weights:** On the top candidate card (Dr. Sophia Chen, Score: 96/100), click **"Inspect 4-Factor Deterministic Algorithm Weights"** to show the live breakdown (Route 40%, Wait 25%, Detour 20%, Fare 15%).
5. **Review Fare Split:** Examine the transparent breakdown comparing solo taxi tariffs against the proportional shared cost.
6. **Lock Ride:** Click **"Accept & Lock Ride"**. Confetti fires and the mutual **4-Digit Verification PIN** and assigned driver details appear.
7. **View Persisted State:** Click **"View in My Trips"** to see the confirmed ride persisted at `/trips`.
8. **Reset Demo:** Click **"Reset Demo"** in the top navigation bar to restore the demo pool for the next presentation.

---

## 📄 License

MIT &copy; 2026 AirPool AI.
