# ISS Piss - Project Specification

A website that tells you when astronauts are urinating on the International Space Station.

Live at: isspiss.com (eventually)

---

## Tech Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Deployment**: TBD (likely Cloudflare Pages or similar static hosting)

### Backend (Phase 2 - Later)
- **Runtime**: Cloudflare Workers
- **State**: Cloudflare Durable Objects (for persistent connection to NASA + stats)
- **Data Sources**:
  - NASA ISS telemetry via Lightstreamer protocol (urine tank data)
  - Open Notify API (current ISS crew)
- **Deployment**: Wrangler CLI

---

## Frontend-Backend Communication

**Protocol**: Server-Sent Events (SSE)

The frontend opens a persistent connection to `/events` and listens for server-pushed updates.

### Event Types

```
event: status
data: {"isPissing": false, "tankLevel": 47, "lastPissEnded": "2024-01-13T12:34:56Z", "crew": ["Oleg Kononenko", "Nikolai Chub", "Tracy Dyson"]}

event: pissStart
data: {"tankLevel": 47, "startedAt": "2024-01-13T12:45:00Z"}

event: pissEnd
data: {"tankLevel": 51, "endedAt": "2024-01-13T12:46:30Z", "deltaPercent": 4}

event: crewUpdate
data: {"crew": ["Oleg Kononenko", "Nikolai Chub", "Tracy Dyson"]}
```

### Frontend Interface

```ts
interface PissState {
  isPissing: boolean;
  tankLevel: number;          // 0-100, 1% resolution
  lastPissEnded: Date | null;
  currentPissStarted: Date | null;
  crew: string[];             // Names of astronauts currently on ISS
}

// Connection abstraction (allows swapping real SSE for mock)
interface PissEventSource {
  subscribe(handlers: {
    onStatus: (state: PissState) => void;
    onPissStart: (data: { tankLevel: number; startedAt: Date }) => void;
    onPissEnd: (data: { tankLevel: number; endedAt: Date; deltaPercent: number }) => void;
    onTankUpdate: (data: { tankLevel: number }) => void;
    onCrewUpdate: (data: { crew: string[] }) => void;
  }): () => void;  // returns unsubscribe function
}
```

---

## Mock Backend (For Frontend Development)

An in-browser mock implementing `PissEventSource` that:
- Fires fake events on timers or via a debug UI panel
- Allows manual triggering of piss start/end events
- Simulates realistic-ish timing (piss events every ~30 min, lasting ~1-2 min)

This will be swapped for the real SSE connection when backend is ready.

---

## UI Design

**Style**: Minimalist absurdist. Clean, tasteful typography and colors. The joke is delivered deadpan.

### Layout

```
+------------------------------------------------------------------+
|  [Ads Column]  |        Main Content         |   [Ads Column]    |
|                |                             |                   |
|   (desktop)    |  "Is anyone currently      |    (desktop)      |
|                |   pissing on the ISS?"     |                   |
|                |                             |                   |
|                |   "Not for the last        |                   |
|                |    17 minutes"             |                   |
|                |                             |                   |
|                |   OR                        |                   |
|                |                             |                   |
|                |   "YES"  <- grows larger,  |                   |
|                |           clips into text   |                   |
|                |           above             |                   |
|                |                             |                   |
+------------------------------------------------------------------+
|  [Excuse me, could I get some more ads?]    |   (top left corner, immediately right of the ads column) |
+------------------------------------------------------------------+
```

### States

1. **Not pissing**:
   - Question: "Is anyone currently pissing on the ISS?"
   - Answer: "Not for the last X minutes" (or hours/days as appropriate)
   - Calm, static display

2. **Pissing in progress**:
   - Answer changes to "Yes"
   - Text grows larger over time, carelessly clipping into question above
   - Possibly show duration: "Yes (47 seconds...)"

### Ad System

- **Normal mode**: One column of placeholder ads on each side (desktop). On mobile, an annoying sticky banner at the bottom.
- **Excessive mode**: Triggered by an unassuming "Excuse me, could I get some more ads?" button off in one corner
  - Flash "Sure thing!" on blank screen
  - Return with ads saturating entire background
  - Main content gets semi-opaque background to remain readable

Ads are placeholders (random rectangles) until real ad integration.

### Crew information

The frontend will have to actually show the information of who is on the ISS, but how this will work specifically is TBD.

---

## Project Structure

```
isspiss/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PissStatus.tsx      # Main status display
│   │   │   ├── AdColumn.tsx        # Sidebar ads
│   │   │   ├── AdOverlay.tsx       # Excessive ads mode
│   │   │   ├── MoreAdsButton.tsx   # The button
│   │   │   └── DebugPanel.tsx      # Dev-only controls
│   │   ├── hooks/
│   │   │   └── usePissEvents.ts    # SSE connection hook
│   │   ├── services/
│   │   │   ├── pissEventSource.ts  # Real SSE implementation
│   │   │   └── mockEventSource.ts  # Mock for dev
│   │   ├── types/
│   │   │   └── index.ts            # Shared types
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css               # Tailwind imports
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                        # Phase 2
│   ├── src/
│   │   ├── index.ts                # Worker entry
│   │   ├── durableObjects/
│   │   │   └── pissMonitor.ts      # Lightstreamer connection + state
│   │   └── routes/
│   │       └── events.ts           # SSE endpoint
│   ├── wrangler.toml
│   └── package.json
│
├── project_structure.md            # This file
├── CLAUDE.md                       # Dev notes for Claude
└── general_idea.txt                # Original brief
```

---

## Backend Specification (Phase 2)

### Responsibilities
1. Maintain single Lightstreamer connection to NASA ISS telemetry
2. Filter for urine tank level updates (NODE3000005)
3. Detect piss events (tank level increasing = piss in progress)
4. Store state: current status, last piss event, daily stats
5. Fetch ISS crew from Open Notify API (every minute)
6. Push updates to connected frontends via SSE

### Endpoints
- `GET /events` - SSE stream of piss events
- `GET /status` - Current state as JSON (fallback/debugging)

### NASA Lightstreamer Details
- Server: `https://push.lightstreamer.com`
- Adapter Set: `ISSLIVE`
- Subscription mode: `MERGE`
- Fields: `TimeStamp`, `Value`, `Status.Class`, `Status.Indicator`
- **Telemetry items**:
  - `NODE3000005` - Urine Tank Level (%) - primary data source
  - `NODE3000004` - Urine Processor State (may indicate active processing)
- Reference: https://iss-mimic.github.io/Mimic/ (live telemetry viewer with labels)

### Open Notify API Details
- URL: `http://api.open-notify.org/astros.json`
- Returns all people in space with their craft (ISS or Tiangong)
- Filter for `craft: "ISS"` to get ISS crew only
- Poll every 60 seconds

---

## Development Phases

### Phase 1: Frontend (Current)
- [x] Set up React + Vite + Tailwind project
- [x] Implement mock event source with debug controls
- [x] Build main UI components
- [x] Implement ad system (normal + excessive modes)
- [x] Responsive design (mobile)
- [x] Polish animations and transitions
- [ ] Decide on and implement the "who is in the ISS" component/s

#### Design Notes
- **Typography**: Serif fonts (Georgia fallback) for an elegant, print-like aesthetic
- **Color**: Light tan/cream background (#faf8f5) evoking newsprint
- **Layout**: Question text offset left of answer on desktop for a literary feel
- **"Yes" reveal**: Duration counter appears after 10 seconds as a delayed punchline
- **Excessive ads mode**: Fixed-size semitransparent card (no rounded corners)

### Phase 2: Backend (Current)
- [x] Set up Cloudflare Workers project
- [x] Research Lightstreamer connection (identified NODE3000005, NODE3000004)
- [ ] Implement Durable Object for state management
- [ ] Implement piss detection logic
- [ ] Integrate Open Notify API for crew data
- [ ] Build SSE endpoint with real data
- [ ] Deploy and test

### Phase 3: Launch
- [ ] Connect frontend to real backend
- [ ] Set up real ad integration
- [ ] Deploy to isspiss.com
- [ ] Profit (pay for domain)
