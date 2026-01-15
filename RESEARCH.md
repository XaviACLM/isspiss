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

### ~~Open Notify API~~ (DEPRECATED - DO NOT USE)

**URL**: http://api.open-notify.org/astros.json

This API is manually maintained and significantly out of date (showed 9 crew when only 3 are aboard). Do not use.

### Launch Library 2 API (The Space Devs)

More complex but accurate. Requires multiple requests to get full crew info.

**Step 1: Get ISS data**
```
GET https://ll.thespacedevs.com/2.3.0/space_stations/4/
```
- ID 4 is the ISS (fixed)
- `onboard_crew`: number (but may lag behind reality)
- `active_expeditions`: list of expedition objects with `url` field

**Step 2: Get expedition details**
```
GET https://ll.thespacedevs.com/2.3.0/expeditions/{id}/
```
- `crew`: list of crew member objects

**Step 3: Extract astronaut info**
Each crew member has an `astronaut` object containing:
- `name`: full name
- `agency.name` / `agency.abbrev`: e.g. "NASA", "Roscosmos"
- `nationality[].alpha_2_code` / `alpha_3_code`: e.g. "US", "USA"
- `nationality[].name` / `nationality_name`: e.g. "United States", "American"
- `wiki`: Wikipedia URL
- `social_media_links[]`: each has `url` and `social_media.name` / `social_media.logo.thumbnail_url`

**Integration approach**: Backend fetches every 60 seconds, caches, and pushes to frontends via SSE. Will need to chain requests: station → expeditions → crew details.

---

## TODO

- [ ] Analyze 2-day-long telemetry log for patterns
- [ ] Determine NODE3000004 values and what they mean
- [x] Replace Open Notify with Launch Library 2 API in backend
