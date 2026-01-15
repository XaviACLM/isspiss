# ISS Piss - Backend Research Notes

Work-in-progress notes on NASA telemetry, tank specs, and data sources.

---

## Urine Tank Specifications

**Capacity**: ~18 lbs (~8.2 liters)

- 1% of tank ≈ 82ml
- Typical piss event observed: 8% increase (~650ml) over ~40 seconds
- This aligns with normal human bladder capacity (400-800ml)

**Source**: "International Space Station Water Balance Operations"
Authors: Barry Tobias, John D. Garr II (NASA Johnson Space Center), Meghan Erne (Barrios Technology)
URL: https://ntrs.nasa.gov/api/citations/20110012703/downloads/20110012703.pdf

---

## NASA Telemetry (Lightstreamer)

**Connection details:**
- Server: `https://push.lightstreamer.com`
- Adapter Set: `ISSLIVE`
- Subscription mode: `MERGE`
- Fields: `TimeStamp`, `Value`, `Status.Class`, `Status.Indicator`

**Relevant telemetry items:**
| Item | Description | Notes |
|------|-------------|-------|
| `NODE3000005` | Urine Tank Level (%) | **Primary data source** - 0-100, integer |
| `NODE3000004` | Urine Processor State | May indicate when processor is actively running |

**How we found these:**
The ISS Mimic project displays all live ISS telemetry with labels:
https://iss-mimic.github.io/Mimic/

**Observations from telemetry watching (Jan 2026):**
- Tank level updates are not continuous; they come in bursts
- During a piss event, level increases ~1% every 5 seconds
- A single event can raise the level 5-10%
- We did not notice any changes in the urine processor state, which staged at 32
- TODO: Analyze full 48 hour log for more patterns - urine processor may become active when tank is full.

---

## Astronaut Data

**API**: Open Notify - People in Space
**URL**: http://api.open-notify.org/astros.json

Returns JSON with everyone currently in space:
```json
{
  "number": 10,
  "people": [
    {"name": "Oleg Kononenko", "craft": "ISS"},
    {"name": "...", "craft": "Tiangong"},
    ...
  ]
}
```

- Includes both ISS and Tiangong crews
- `craft` field distinguishes station
- Could display on frontend: "X people currently aboard"
- Crew changes are rare (every few months)

**Integration approach**: Backend fetches every 60 seconds, caches, and pushes to frontends via SSE. Avoids CORS issues and redundant requests.

---

## TODO

- [ ] Analyze 2-day-long telemetry log for patterns
- [ ] Determine NODE3000004 values and what they mean
