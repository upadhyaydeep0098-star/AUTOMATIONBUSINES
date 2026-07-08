# Yudi Labs Launch Follow-Ups

These items need founder or account-owner input before they can be completed safely.

## Replace Placeholder Proof

- Replace the homepage and services mini case studies with real client or internal workflow data.
- Keep the before/after format: team, workflow, before state, after state.
- Avoid publishing exact savings claims unless they are backed by real records.

## Add Founder Photo

- Add the real founder image at `assets/deep-upadhyay.jpg`.
- Recommended size: square crop, at least 560 x 560 px.
- The About page already contains the commented image slot.

## Search Console

- Re-submit `https://www.yudilabs.com/sitemap.xml` in Google Search Console.
- Request indexing for:
  - `https://www.yudilabs.com/`
  - `https://www.yudilabs.com/services`
  - `https://www.yudilabs.com/workflow-automation`
  - `https://www.yudilabs.com/ai-agents-for-business`
  - `https://www.yudilabs.com/about`
  - `https://www.yudilabs.com/blog`

## Google Business Profile

- Create or update the Yudi Labs Google Business Profile for Toronto.
- Use the same website URL: `https://www.yudilabs.com/`.
- Keep the category focused on automation/business consulting rather than broad AI hype.

## Booking Flow

- Confirm Calendly is connected to the right calendar.
- Confirm the booking confirmation email comes from the correct Yudi Labs address.
- Add qualifying questions to the Calendly event if needed:
  - "What task do you want to automate?"
  - "Which tools does your team use for this task?"
  - "How often does this task happen?"

## Cache busting
styles.css and script.js are cached for 1 year (immutable). When either file changes,
bump the `?v=` query string in ALL html files (currently `?v=20260709`), e.g.:
  sed -i "" "s/?v=20260709/?v=NEWDATE/g" *.html blog/*.html
Otherwise returning visitors keep the old stylesheet and pages look broken/mixed.
