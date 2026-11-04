# Amplitronics

A standalone electronics store for a mixed-audience Amplitude practitioner workshop. Inspired by the [Amplitronics Signal Studio reference](https://amplitronics-signal-studio.lovable.app/).

**Live store:** https://shermozle.github.io/amplitronics-practitioner-workshop/

**Participant instructions:** [QUICKSTART.md](./QUICKSTART.md), also available inside the site from its footer.

## Run locally

Requires Node 22+ for the development server and tests. Production requires only a modern browser.

```sh
npm start
# http://127.0.0.1:4173
npm test
npm run check
```

There are no runtime package dependencies, package installation, build step, backend, secret keys, or server routes. Upload the static application files to any static host. Use HTTP(S), including for local testing; ES modules and Amplitude persistence are not supported from `file://`.

## Store behaviour

- Twelve illustrated products across phones, laptops, gaming, audio, computing, and games.
- Search, categories, sale filtering, sorting, product details, wishlist, cart quantities, promo codes, shipping, checkout, confirmation, rewards, personas, and order history.
- `AMP10` gives 10% off; standard shipping is free after discounts at $150, otherwise $9.95; express is $19.95. All amounts use AUD. Displayed GST is simulated as included; the site does not calculate tax obligations.
- Luhn card validation, expiry/CVV checks, deterministic declines, simulated timeouts, and adjustable random failure probability. All transaction outcomes are browser simulations.
- Store state is saved in localStorage per persona or anonymous device. Delivery and payment form values stay in memory only and are not included in custom telemetry. No emails, payments, actual authentication, or shipments occur.
- The bottom-left cog is mounted outside the router, so it is available on every page. Settings include the local project key, region, SDK toggles, shoppers, error scenarios, history importer and live event inspector.
- Hash routes work under any GitHub Pages project prefix and survive refresh without a server fallback.

## Amplitude integration

The API-key field starts empty (`YOUR_AMPLITUDE_API_KEY` placeholder). No visitor data is sent to Amplitude until a participant saves a project key. Save reloads the page to prevent old SDK instances and project credentials mixing. Disconnect removes the key from saved config and reloads; it does not delete project data.

`telemetry.js` initializes Browser SDK 2 **2.49.1**, Session Replay plugin **1.36.6**, the project-specific Guides & Surveys plugin, and the actual Web Experiment tag. It deliberately does not substitute Feature Experiment for Web Experiment.

Startup order:

1. Load the pinned Browser SDK from Amplitude’s CDN.
2. Load and register replay and engagement plugins before Analytics init.
3. Register the inspector/enrichment plugin; initialize Analytics with the selected region and local identity.
4. Restore known-user traits and flush events queued during startup.
5. Load the project-specific `.experiment.js` Web Experiment tag. US and EU use their respective project-tag CDN hosts.

Live page views are emitted solely by Autocapture as `[Amplitude] Page Viewed`; the app does not send a separate custom `Page Viewed` event. New historical datasets use the same native event name and standard Amplitude page properties for landing, category/search, product, cart, checkout and confirmation navigation. Page paths retain the GitHub Pages project prefix; hash routes appear in page locations, and page URLs follow the SDK’s `location.href.split('?')[0]` rule. Delivery/payment steps that do not change the URL do not create extra page views.

Analytics custom events carry `data_source: live`, session/device/user IDs, insert IDs, currency, and available UTM properties. Purchase events carry top-level `revenue`, `currency`, and `revenueType`. There is one revenue-bearing event per order, avoiding a second revenue event that would double count purchases.

Autocapture enables attribution, pages, sessions, files, forms, clicks, frustration, network tracking and web vitals. Form-submit tracking skips private controls, and the enrichment plugin drops automatic settings-form events. Private controls and payment fields are excluded from element/frustration tracking using the documented `shouldTrackEventResolver`. Meaningful delivery/payment interactions also have explicit custom events. The enrichment layer additionally scrubs value/card/email/address properties and any property containing the project key. The SDK’s own upload request necessarily includes the public ingestion key.

Session Replay requests a sample rate of 1, masks input fields by default and blocks `.amp-private` and `.payment-fields`. Project remote settings and quotas still govern recording. This is a fictional demo store: enter test details only.

Web Experiment and Guides & Surveys must be enabled and authored/published in the participant’s Amplitude project. Stable target IDs are documented in the quick-start. The app has no Amplitude admin API credentials and cannot create product entitlements, experiments or surveys. Script-load status is not a claim of valid credentials or successful delivery; inspect upload results and verify in Amplitude.

Official setup references used:

- [Browser SDK 2](https://amplitude.com/docs/sdks/analytics/browser/browser-sdk-2)
- [Replay browser plugin](https://amplitude.com/docs/sdks/session-replay/session-replay-plugin)
- [Web Experiment implementation](https://amplitude.com/docs/web-experiment/implementation)
- [Guides & Surveys SDK](https://amplitude.com/docs/sdks/guides-and-surveys/sdk)
- [HTTP V2 ingestion](https://amplitude.com/docs/apis/analytics/http-v2)

The hero artwork is copied from the user-provided reference site. All product illustrations and interface icons in `art.js` are local SVG markup; there are no remote product image or font dependencies. The store runs without Amplitude connectivity; enabled telemetry products need Amplitude’s network services.

## Historical generator

`backlog.js` produces a repeatable population with a locally saved seed and UTC start date. It covers the last 30 complete UTC days, exactly 200 distinct daily visitors. Sixty return each day and 140 new visitors arrive daily, yielding 4,260 unique users / 6,000 visitor-days, plus repeat sessions within a day.

Traffic is weighted across Google paid search, Instagram paid social, organic search, email, direct, and an explicitly fictional referral domain. Channel intent changes conversion probability. Events have ordered timestamps and consistent funnels; purchases follow payment attempts, and some failures recover. Mobile payment timeouts increase on days 18–24 for a diagnosis exercise. Every synthetic event includes `data_source: synthetic`, a `dataset` value and marketing/device properties. It does not impersonate reserved native replay, experiment, or survey events.

Uploads go directly to `https://api2.amplitude.com/2/httpapi` (US) or `https://api.eu.amplitude.com/2/httpapi` (EU) with the public project key. Three workers send batches of at most 10 events, paced by at least 100ms per worker, keeping the maximum nominal send rate under 300 events/second and 30 requests/second before network latency. This is below the documented Free-plan project/request rates. A per-request 20-second timeout prevents hanging progress.

- HTTP 429: wait at least 60 seconds, respecting longer numeric Retry-After values, then retry.
- Network/5xx: bounded exponential retries.
- HTTP 413: split batches and retry.
- HTTP 400/403 or incomplete acknowledgement: stop with a visible error; do not advance the checkpoint.
- Progress: advance and save only through the contiguous acknowledged event prefix, even when workers finish out of order.
- Pause: abort in-flight work and preserve the last acknowledged prefix. Ambiguous requests are retried with identical insert IDs.
- Resume: regenerate from the recipe, verify the project fingerprint and seven-day deduplication window, continue at the checkpoint. A newly generated dataset is a separate population and adds new data.

New recipes use version 2 with a fixed site URL. Version 1 recipes that have already started retain their original generation and event order so saved upload positions remain valid. Unsent version 1 recipes are replaced on the next preview. Choose **New dataset** for Autocapture-compatible page views when an older recipe is present; already-ingested project events are not changed.

A checkpoint is small and lives in localStorage; event datasets are regenerated, not stored there. The SHA-256 project fingerprint prevents accidentally resuming to a different project without duplicating the API key in the recipe. Checkpoint saves must succeed before uploading continues.

Historical API events populate Analytics only. They cannot generate past browser replay recordings, real native experiment allocations, or guide/survey delivery artefacts. Run live sessions for those products. An actual Amplitude API key is intentionally not bundled, so end-to-end ingestion and project-delivered product experiences require participant verification.

## Files and verification

| File | Purpose |
| --- | --- |
| `index.html`, `styles.css`, `app.js` | Static app shell, responsive store and controls |
| `catalog.js`, `art.js` | Shared products, personas, local SVG art |
| `pageview.js` | Shared page titles and Autocapture-compatible historical page properties |
| `commerce.js` | Pure totals, validation and payment simulation |
| `telemetry.js`, `storage.js` | SDK lifecycle, identity, event inspector, persistence |
| `backlog.js` | Deterministic journeys and resumable HTTP uploader |
| `tracking-plan.csv` | Custom event and property map |
| `QUICKSTART.md` | Participant instructions |
| `server.mjs` | Optional local static preview server |
| `tests/*.test.mjs` | Native Node unit tests and an SDK spy harness |

`npm test` checks daily user counts, timestamps, identity and insert IDs, deterministic generation, funnel and revenue consistency, attribution, planted mobile errors, HTTP region/payload handling, retries, 413 splitting, partial acknowledgements, checkpoint resume/pause, payment validation/totals, SDK initialization order, persona identity and reset, private-property scrubbing, and missing/broken SDK handling. Browser QA covers shopping, checkout errors/recovery, settings and responsive layout. No actual Amplitude credentials are used in tests.

## GitHub Pages deployment

Publish the repository root on the `main` branch with `.nojekyll` present. No Actions build or backend is required. For another owner/repository, update the two absolute public-site links in this README and QUICKSTART; all application links/assets are relative.

```sh
gh api --method POST repos/OWNER/REPO/pages \
  --field 'source[branch]=main' --field 'source[path]=/'
```

The local development server is not part of the deployed hosting architecture.
