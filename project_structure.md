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
- **Data Source**: NASA ISS telemetry via Lightstreamer protocol
- **Deployment**: Wrangler CLI

---

## Frontend-Backend Communication

**Protocol**: Server-Sent Events (SSE)

The frontend opens a persistent connection to `/events` and listens for server-pushed updates.

### Event Types

```
event: status
data: {"isPissing": false, "tankLevel": 47, "lastPissEnded": "2024-01-13T12:34:56Z"}

event: pissStart
data: {"tankLevel": 47, "startedAt": "2024-01-13T12:45:00Z"}

event: pissEnd
data: {"tankLevel": 51, "endedAt": "2024-01-13T12:46:30Z", "deltaPercent": 4}
```

### Frontend Interface

```ts
interface PissState {
  isPissing: boolean;
  tankLevel: number;          // 0-100, 1% resolution
  lastPissEnded: Date | null;
  currentPissStarted: Date | null;
}

// Connection abstraction (allows swapping real SSE for mock)
interface PissEventSource {
  subscribe(handlers: {
    onStatus: (state: PissState) => void;
    onPissStart: (data: { tankLevel: number; startedAt: Date }) => void;
    onPissEnd: (data: { tankLevel: number; endedAt: Date; deltaPercent: number }) => void;
    onTankUpdate: (data: { tankLevel: number }) => void;
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
|  [Excuse me, could I get some more ads?]    |   (bottom corner) |
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
2. Filter for urine tank level updates
3. Detect piss events (tank level increasing = piss in progress)
4. Store state: current status, last piss event, daily stats
5. Push updates to connected frontends via SSE

### Endpoints
- `GET /events` - SSE stream of piss events
- `GET /status` - Current state as JSON (fallback/debugging)

### NASA Lightstreamer Details
- TBD: Need to research exact subscription parameters, field names for urine tank data
- The ISS telemetry stream includes many data points; we filter for relevant ones

---

## Development Phases

### Phase 1: Frontend (Current)
- [ ] Set up React + Vite + Tailwind project
- [ ] Implement mock event source with debug controls
- [ ] Build main UI components
- [ ] Implement ad system (normal + excessive modes)
- [ ] Responsive design (mobile)
- [ ] Polish animations and transitions

### Phase 2: Backend
- [ ] Set up Cloudflare Workers project
- [ ] Research and implement Lightstreamer connection
- [ ] Implement Durable Object for state management
- [ ] Build SSE endpoint
- [ ] Deploy and test with real data

### Phase 3: Launch
- [ ] Connect frontend to real backend
- [ ] Set up real ad integration
- [ ] Deploy to isspiss.com
- [ ] Profit (pay for domain)
