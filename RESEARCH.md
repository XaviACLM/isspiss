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

**Observations from telemetry analysis:**

*Piss events:*
- Level increases take ~5 seconds per 1%
- A single event can raise the level 5-10%

*Sensor oscillation:*
- Tank readings oscillate due to truncation (e.g., true level ~26.5% bounces between 26% and 27%)
- Oscillation frequency varies widely: as fast as every 0.9 seconds, as slow as every 22 seconds
- One anomalous 13+ minute pause was observed
- Oscillations occur within ~10% of the truncation boundary

*Urine processor:*
- Drains the tank at ~1% every 5 minutes once stable
- First 2-4% of drainage shows some instability
- For about 1 minute after each percentage drop, oscillations as wide as 36 seconds may occur
- NODE3000004 (Urine Processor State) stays at 32 while inactive, 16 while active. Specific meaning of this or whether it has other values is unclear.

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

**Throttling**: The API is quite strict, for now allowing only 15 queries per hour. We fetch every 20 minutes (expected 6-9 queries per hour) and keep old data if fetches fail.

**Integration approach**: Backend fetches every 20 minutes, caches, and pushes to frontends via SSE. Will need to chain requests: station → expeditions → crew details.

---

## TODO

- [x] Analyze 2-day-long telemetry log for patterns
- [x] Determine NODE3000004 values and what they mean (stayed at 32 during observation)
- [x] Replace Open Notify with Launch Library 2 API in backend
