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
  - Launch Libray 2 API (current ISS crew)
- **Deployment**: Wrangler CLI

---

## Frontend-Backend Communication

**Protocol**: Server-Sent Events (SSE)

The frontend opens a persistent connection to `/events` and listens for server-pushed updates.

### Event Types

```
event: status
data: {"isPissing": false, "tankLevel": 47, "lastPissEnded": "2024-01-13T12:34:56Z", "crew": [{"name": "Oleg Kononenko", "agency": "Roscosmos"}, {"name": "Tracy Dyson", "agency": "NASA"}]}

event: pissStart
data: {"tankLevel": 47, "startedAt": "2024-01-13T12:45:00Z"}

event: pissEnd
data: {"tankLevel": 51, "endedAt": "2024-01-13T12:46:30Z", "deltaPercent": 4}

event: crewUpdate
data: {"crew": [{"name": "Oleg Kononenko", "agency": "Roscosmos"}, {"name": "Tracy Dyson", "agency": "NASA"}]}
```

### Frontend Interface

```ts
interface CrewMember {
  name: string;
  agency: string;  // e.g. "NASA", "Roscosmos", "ESA", "JAXA"
}

interface PissState {
  isPissing: boolean;
  tankLevel: number;          // 0-100, 1% resolution
  lastPissEnded: Date | null;
  currentPissStarted: Date | null;
  crew: CrewMember[];
}

// Connection abstraction (allows swapping real SSE for mock)
interface PissEventSource {
  subscribe(handlers: {
    onStatus: (state: PissState) => void;
    onPissStart: (data: { tankLevel: number; startedAt: Date }) => void;
    onPissEnd: (data: { tankLevel: number; endedAt: Date; deltaPercent: number }) => void;
    onTankUpdate: (data: { tankLevel: number }) => void;
    onCrewUpdate: (data: { crew: CrewMember[] }) => void;
  }): () => void;  // returns unsubscribe function
}
```

---

## Mock Backend (For Frontend Development)

An in-browser mock implementing `PissEventSource` that:
- Fires fake events on timers or via a debug UI panel
- Allows manual triggering of piss start/end events
- Simulates realistic-ish timing (piss events every ~30 min, lasting ~1-2 min)

**To use mock mode** (enables DebugPanel):
```powershell
$env:VITE_USE_MOCK="true"; npm run dev
```

By default (no env var), the frontend connects to the real backend at `http://127.0.0.1:8787`.

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
   - After a delay, show duration: "Yes (47 seconds...)"

### Ad System

- **Normal mode**: One column of placeholder ads on each side (desktop). On mobile, an annoying sticky banner at the bottom.
- **Excessive mode**: Triggered by an unassuming "Excuse me, could I get some more ads?" button off in one corner
  - Flash "Sure thing!" on blank screen
  - Return with ads saturating entire background
  - Main content gets semi-opaque background to remain readable

Ads are placeholders (empty rectangles) until real ad integration. For excessive ads mode, the "ads" are simply a collection of flashy ad gifs kept at /public/ads.

### Crew Display

Simple list of current ISS crew, displayed below the main Q&A (right-aligned on desktop). Hidden in excessive ads mode.

```
Currently aboard:
Sergey Mikayev (Roscosmos)
Christopher Williams (NASA)
Sergey Kud-Sverchkov (Roscosmos)
```

- Header "Currently aboard:" in italic
- No bullets, clean list
- Name + agency abbreviation (NASA, Roscosmos, ESA, JAXA, etc.)

**Explicitly excluded** (to keep UI minimal and deadpan):
- Nationality flags - redundant with agency info
- Wikipedia links - feature creep
- Social media links - off-topic

The Launch Library 2 API provides much more data (nationality, wiki, social media). See `RESEARCH.md` for details if we decide to expand this later.

### Explanation

A small button labeled "What" appears on the top right (same in mobile). Upon clicking, it opens a panel with some information about the website - what it is, authors, data sources, repo link, credit Claude. On large screens this panel is centered and the background is blurred and slightly darkened. On mobile, the panel simply takes up the whole screen. A small X on the top right of the panel allows for closing.

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
5. Fetch ISS crew from Launch Libray 2 API (every 20 minutes)
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

### Crew Data (Launch Library 2 API)
- Fetches from `https://ll.thespacedevs.com/2.3.0/space_stations/4/`
- Chains requests: station → expeditions → crew details
- Extracts name and agency abbreviation (RFSA normalized to "Roscosmos")
- Poll every 20 minutes, keep old data if throttled
- See `RESEARCH.md` for full API documentation

### Piss Detection Logic
- **Piss start**: Tank level increases from previous value
- **Piss end**: No tank level increase for 20 seconds
- Simple timeout-based detection; no cooldown or debouncing
- Edge case accepted: if final drops take >20s, brief "no" then back to "yes" is tolerable

---

## Development Phases

### Phase 1: Frontend
- [x] Set up React + Vite + Tailwind project
- [x] Implement mock event source with debug controls
- [x] Build main UI components
- [x] Implement ad system (normal + excessive modes)
- [x] Responsive design (mobile)
- [x] Polish animations and transitions
- [x] Crew display component

#### Design Notes
- **Typography**: Serif fonts (Georgia fallback) for an elegant, print-like aesthetic
- **Color**: Light tan/cream background (#faf8f5) evoking newsprint
- **Layout**: Question text offset left of answer on desktop for a literary feel
- **"Yes" reveal**: Duration counter appears after 10 seconds as a delayed punchline
- **Excessive ads mode**: Fixed-size semitransparent card (no rounded corners)

### Phase 2: Backend (Current)
- [x] Set up Cloudflare Workers project
- [x] Research Lightstreamer connection (identified NODE3000005, NODE3000004)
- [x] Implement Durable Object for state management
- [x] Implement piss detection logic
- [x] Integrate Launch Library 2 API for crew data
- [x] Build SSE endpoint with real data
- [ ] Deploy and test

### Phase 3: Launch
- [x] Connect frontend to real backend
- [ ] Deploy backend to Cloudflare Workers
- [ ] Deploy frontend to hosting
- [ ] Set up real ad integration
- [ ] Deploy to isspiss.com
- [ ] Profit (pay for domain)
