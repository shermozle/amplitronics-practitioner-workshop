# Amplitronics participant quick-start

Open the [workshop store](https://shermozle.github.io/amplitronics-practitioner-workshop/) and choose **Participant quick-start** in the footer for the interactive version.

This fictional store works for analytics practitioners, product managers, and designers. No coding, account creation, backend, or real payment is required.

## Connect your Amplitude project

1. Open the **cog at the bottom-left** of any page.
2. Paste your Amplitude **project API key** into Connect. Use the US default, or choose EU to match your project.
3. Leave the product switches enabled, then click **Save & connect**. The browser reloads. The key stays in localStorage on this device.
4. In Events, look for custom event upload results. **Local** means the SDK was not connected when the event happened. **Sent** means Amplitude acknowledged it. The automatic event inspector observes events before upload, so check those in Amplitude’s debugger or User Lookup.

Your project must have the relevant products enabled. Published experiments, guides and surveys come from your Amplitude project; the site does not create them through admin APIs. Session Replay requests a 100% sample for live workshop visits, subject to remote project settings and quotas.

## 1. Shop and see the signals

Browse a category, search for “wireless”, save a product to your wishlist, and add it to your cart. Apply **AMP10** for 10% off. Continue to checkout and use **Fill demo delivery details**.

On payment, choose **Fill successful card** and place the demo order.

**Done when:** you can find `Order Completed` in the local event inspector and your Amplitude project.

- Product and design: which steps helped you feel confident about purchasing?
- Analytics: inspect `product_id`, `category`, `quantity`, `total`, `currency`, and top-level `revenue`.

## 2. Diagnose checkout friction

Use Shoppers → **New anonymous user + session**. Shop again and try each payment outcome:

| Outcome | Test card or setting |
| --- | --- |
| Successful payment | `4242 4242 4242 4242` |
| Invalid card | `1234` |
| Transaction declined | `4000 0000 0000 0002` |
| Payment timeout | Cog → Checkout errors → Payment timeout |
| Random declines/timeouts | Cog → Checkout errors → Random payment errors; set the chance |

Use a future expiry such as `12/35`, security code `123`, and fictional name. Payment details are never stored or sent to a payment service. Errors appear as small text beside the card or payment field.

Switch back to Normal checkout when you want a successful purchase. The declined test card always fails. There are one-click fill buttons on the payment page.

**Done when:** you can explain a checkout failure using both `Checkout Error` and a real live replay.

- Product and design: rewrite one error message to improve recovery.
- Analytics: build Product Viewed → Product Added to Cart → Checkout Started → Order Completed. Compare people who experienced `Checkout Error` with those who did not.

## 3. Add a history to investigate

Open **30-day history** in the cog. Review the counts and dates, then select **Send 30-day backlog**. Keep the browser tab open. It may take several minutes; Pause and Resume use a saved checkpoint.

The generator creates exactly **200 distinct visitors per complete UTC day for 30 days**. Sixty return across days and 140 are new each day: **6,000 visitor-days and 4,260 distinct users** in total. Some people have two sessions in a day.

Journeys include browsing, searching, wishlists, cart abandonment, shipping choices, payment errors, recovery, purchases, feedback, and six marketing channels. Paid search, paid social, organic search, email, direct and referral have different buying intent. Mobile checkout timeouts rise on days 18–24.

Page views are named `[Amplitude] Page Viewed` in both live and new historical data. Live visits use Autocapture; the historical generator supplies the same standard page properties. No additional custom `Page Viewed` event is emitted. Older uploaded datasets remain in your project; choose **New dataset** for the updated history format.

Filter `data_source = synthetic` for generated history or `data_source = live` for workshop visits. Use `dataset` to select an individual generated population. Campaigns are available as `utm_source`, `utm_medium`, `utm_campaign`, `channel`, and `referrer`.

**Done when:** you have a hypothesis about the mobile checkout issue and can identify a marketing channel worth investigating.

The backlog contains Analytics events. It does not create historical replay recordings, native experiment assignments, or Guides & Surveys delivery history. It does not delete existing project data. Resume the same run within seven days; that is Amplitude’s event deduplication window. **New dataset** creates a separate population and adds more data when sent.

## 4. Try a better experience

For Web Experiment, create and publish a web experiment in Amplitude for this site. Useful stable selectors:

- `#hero-title`: homepage headline
- `#hero-description`: homepage description
- `#hero-cta`: homepage offer link
- `#product-add-to-cart`: product detail call to action
- `#checkout-cta`: cart checkout link
- `#place-order`: payment submit button

Use `Order Completed` as a conversion event. The store uses hash routes so every URL works on GitHub Pages: `/#/`, `/#/shop`, and `/#/product/aurora-x7`. Configure URL targeting to include the relevant hash route.

For Guides & Surveys, enable Web in your project, create a guide or survey, target this site or the `Product Added to Cart` event, and publish. The engagement plugin shares Analytics identity. Use the actual SDK-delivered experience to inspect native survey results. The store’s simple post-purchase rating is a separate custom event named `Store Feedback Submitted`.

**Done when:** a live browser visit receives your published variant, guide, or survey.

## Shoppers and identity

The cog’s Shoppers section shows the device, user and session IDs. Choose one of four fictional known users, or use the login picker:

- Jess Nakamura: Gold, loyal enthusiast
- Sam Okafor: Bronze, first-time shopper
- Priya Shah: Silver, creative professional
- Leo Martin: Gold, lapsed customer

Signing in identifies the current anonymous visitor and merges their cart into the persona’s browser cart. Switching between known personas starts a new anonymous device first. **New anonymous user** creates a new device ID and session and opens a separate empty cart. Existing personas’ carts and orders remain available on this browser.

## If you get stuck

- No events: confirm the API key and US/EU region, inspect the upload status, and check blockers or network restrictions.
- No replay: confirm Session Replay is enabled in your Amplitude project. Generate a new live visit and custom event. Historical API events have no browser recording.
- No experiment/guide/survey: check that it is published, the project key matches, the URL/selector and user targeting match, and your project has the product enabled.
- Upload stopped: read the progress message, fix the connection or API key, and resume. Invalid keys and partial acknowledgements never advance the checkpoint.
- State disappears: browser storage must be enabled. Moving browsers, devices or domains starts with separate local state.

[Event tracking plan](./tracking-plan.csv) · [Implementation and testing notes](./README.md)
