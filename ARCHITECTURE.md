# AirPool AI — Technical Architecture & Engine Specification

> **Tagline:** Same airport. Same direction. One smarter ride.  
> **Domain:** Flight-aware peer mobility, corridor route optimization, and transparent rideshare splitting.

---

## 1. System Overview

AirPool AI resolves airport ground-transportation congestion and fare inflation by pairing arriving air travelers headed in the same urban corridor into a single rideshare vehicle.

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

---

## 2. Core Deterministic Matching Rules Engine

Candidates are evaluated through a two-phase protocol:

### Phase A: Hard Constraints (Binary Feasibility Gates)
A candidate is immediately disqualified if any of the following fail:
1. **Airport Match:** Traveler and candidate must land at the same airport code (`airportCode`).
2. **Corridor Alignment:** Destinations must share the same radial transit corridor (e.g., SFO Highway 101 Northbound vs Silicon Valley Southbound). Divergent corridors are disqualified.
3. **Temporal Synchronization:** Landing time difference must be within both parties' acceptable waiting tolerance:
   $$\Delta t = |t_{\text{arrival, A}} - t_{\text{arrival, B}}| \le \min(\text{maxWait}_A, \text{maxWait}_B)$$
4. **Detour Cap:** The sequential inter-dropoff detour in minutes must not exceed either traveler's detour limit:
   $$\text{Detour}_{\text{mins}} \le \min(\text{maxDetour}_A, \text{maxDetour}_B)$$
5. **Vehicle Capacity:** Combined passenger count $\le 4$ (standard vehicle) and total luggage units $\le 4$.

### Phase B: Deterministic 4-Factor Weighted Ranking (0 – 100)
Feasible candidates are scored with the exact weights:

$$\text{Total Score} = (S_{\text{route}} \times 0.40) + (S_{\text{wait}} \times 0.25) + (S_{\text{detour}} \times 0.20) + (S_{\text{fare}} \times 0.15)$$

- **Route Compatibility ($S_{\text{route}}$, 40%):** Proximity and overlap between drop-off zones along the transit corridor.
- **Waiting-Time Compatibility ($S_{\text{wait}}$, 25%):** Penalizes waiting delta linearly: $100 - (\frac{\Delta t}{\text{maxWait}} \times 100)$.
- **Detour Acceptability ($S_{\text{detour}}$, 20%):** Evaluates diversion overhead against max allowable limit.
- **Fare Fairness ($S_{\text{fare}}$, 15%):** Ensures equitable proportional benefit: $100 - |\text{SavingsPct}_A - \text{SavingsPct}_B|$.

---

## 3. Deterministic Fare & Split Formulation

Rather than a crude 50/50 split that penalizes riders with shorter routes, AirPool AI implements a **Proportional Distance-Weighted Split**:

1. **Solo Fare Baseline ($F_{\text{solo}}$):**
   $$F_{\text{solo}} = \text{BaseFee} + (d_{\text{solo}} \times \text{Rate}_{\text{km}}) + (t_{\text{solo}} \times \text{Rate}_{\text{min}})$$
2. **Shared Multi-Stop Fare ($F_{\text{shared}}$):**
   $$F_{\text{shared}} = \text{BaseFee} + (d_{\text{shared}} \times \text{Rate}_{\text{km}}) + (t_{\text{shared}} \times \text{Rate}_{\text{min}}) + \text{StopFee}$$
3. **Equitable Passenger Split:**
   $$\text{Weight}_A = \frac{F_{\text{solo}, A}}{F_{\text{solo}, A} + F_{\text{solo}, B}}$$
   $$\text{Share}_A = F_{\text{shared}} \times \text{Weight}_A$$
   $$\text{Share}_B = F_{\text{shared}} \times (1 - \text{Weight}_A)$$
4. **Carbon Reduction Metric:**
   $$\text{CO}_2\text{ Saved (kg)} = (d_{\text{solo}, A} + d_{\text{solo}, B} - d_{\text{shared}}) \times 0.171\text{ kg/km}$$

---

## 4. Supabase PostgreSQL Persistence Architecture

### Tables:
- **`profiles`:** User metadata, rating, verification status, and Cloudinary media links.
- **`trip_requests`:** Destination zone, flight number, baggage claim window, and passenger count.
- **`candidate_matches`:** Evaluated matches, sub-scores, and fare split records.
- **`confirmations`:** Locks match status and generates 4-digit mutual verification PIN.

### Concurrency & Double-Booking Protection:
- Server Action validates candidate trip status prior to confirmation. If candidate status changes to `CONFIRMED` by another request, the transaction is rejected with an explanatory notice, prompting the user to select the next ranked candidate.
- Fallback in-memory adapter automatically takes over if Supabase environment variables are omitted, ensuring judge demonstrations run with 100% reliability.

---

## 5. Cloudinary Media Security & Transformation Pipeline

- **Server-Side Signature Generation (`/api/cloudinary-sign`):** HMAC SHA-256 signature generated server-side using `CLOUDINARY_API_SECRET`. Client never has access to the secret key.
- **Direct Authenticated Upload:** Uploads flow directly from browser to Cloudinary CDN with signature and timestamp validation.
- **Dynamic Delivery Transformations:**
  - Automated face detection crop: `c_thumb,g_face,w_140,h_140`
  - High performance WebP auto-formatting: `f_auto,q_auto`
  - Rounded styling: `r_max`
- **Fallback Simulation:** When credentials are absent in local judge mode, assets are safely rendered with client data URIs and verification badges.

---

## 6. Judge Pitch & Demo Reset Mechanism

- A **"Reset Demo"** control is available in both the top navigation bar and footer.
- Wipes transient confirmations and resets the pool back to 8+ diverse fictional travelers with varying arrival windows, enabling repeated 2-minute demo cycles with zero residual state.
