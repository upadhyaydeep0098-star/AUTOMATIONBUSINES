# Yudi Labs

Static agency website, deployed through the existing Vercel configuration.

Repository: `upadhyaydeep0098-star/AUTOMATIONBUSINES`.
The October editorial redesign starts from `311edc1`, verified against
`origin/main` before editing, on `codex/yudilabs-editorial-redesign`.
The local checkout is `/Users/yudijet/Documents/Codex/yudilabs`.
The Clinic Platform in `Documents/Agency` is a separate project.

## Local preview

With Node.js installed:

```sh
node scripts/preview.mjs
```

Open `http://127.0.0.1:4177`. Set `PORT` to choose another local port.
Use this server instead of opening the HTML directly: the site uses root-relative
assets and clean URLs. The preview binds only to this computer and uses the
production security headers, except HTTPS upgrading on the local HTTP origin.

```sh
node --test scripts/interactions.test.mjs
node --check script.js
git diff --check
```

## Editing

- `index.html`: homepage, animated quote comparison, selectable workflow examples, cost calculator and booking links.
- `services.html`: service overview, language toggle, engagement options, calculator and enquiry form.
- `refresh.css`: shared white/charcoal/cobalt/citron theme and responsive styles, loaded after `styles.css`.
- `home-palette.css`: approved white/carbon/vermilion treatment for the homepage header, opening and workflow examples; other sections keep the reviewed editorial design.
- `styles.css`: existing supporting-page layout and component styles.
- `script.js`: navigation, restrained motion, keyboard-accessible workflow tabs, form submission, service language toggle and calculator.
- `assets/workflow-notes-*.webp`: generated editorial still life, in 480px and 960px responsive variants.
- `assets/ui/`: Lucide SVG icons, with the upstream license.
- `blog/_template.html` and `new-post.sh`: publishing template and helper.
- `vercel.json`: existing clean URLs, redirects, security and caching configuration.

The contact endpoint remains `https://formspree.io/f/xzdoqpke`.
Consultations link to `https://calendly.com/hello-yudilabs/30min`.
No credentials or customer data are stored in this repository.

The workflow visuals are illustrative. The main diagram uses HTML, CSS and local
SVG icons, without a video, animation framework, external font request or 3D runtime.
Animation pauses when offscreen, when the tab is hidden, when paused by the visitor,
and when reduced motion is requested. The new editorial image is lazy-loaded and
approximately 21 KB on phones or 55 KB at its larger size. Shared JavaScript is
approximately 14 KB before compression; there is no new runtime dependency.

The cost calculator uses hours/week x hourly team cost in USD x 52. It shows the
annual value of manual time, not guaranteed savings or net ROI. Build, software,
maintenance, and human-review costs are excluded. Workflow examples are synthetic;
banking names describe founder experience, not customer endorsements. No analytics
or conversion uplift is claimed by this redesign.

## Review evidence

October 10 local QA used Playwright with the installed Brave browser because the
Browser plugin was unavailable. Sixteen public pages were checked at 1440x960,
1280x720, 768x1024, 390x844 and 320x667 (80 page/viewport checks): one H1 per page,
meaningful content, parsed JSON-LD, valid canonical hosts, 33 internal resources
and 79 fragment references. No page-level horizontal overflow or application
runtime errors were found. Wide article tables remain in focusable scroll regions.

Interaction checks covered workflow tab click/arrow/Home/End/deep-link navigation,
mobile menu focus and Escape, both service-language views, FAQ state, motion
pause/resume and reduced motion, calculator boundaries, and navigation/content
without JavaScript. Twelve Node tests cover motion, forms and calculator behavior.
Both enquiry forms were tested with intercepted success and failure responses;
the only console errors were the two deliberately simulated HTTP 503 responses.
No real enquiry or booking was submitted. The Calendly embed was excluded from
this local pass; live email delivery, live scheduling, Safari and Firefox still
require separate checks.

The generated section concepts and final screenshots were inspected together,
including the 1504x1040 opening concept's native viewport. Design review covered:

- Copy and hierarchy: the same main offer and booking action; removed stale timing claims.
- Layout: open headline/copy columns, source-to-result workflow, alternating full-width bands.
- Typography: self-hosted Inter/Inter Tight, bounded heading sizes and readable mobile wrapping.
- Palette: white, charcoal, cobalt and citron, without the older cream/slate treatment.
- Containers: unframed sections, subtle workflow windows, consistent 6px controls.
- Assets: retained the real Yudi Labs mark; optimized workflow-note photography replaces the concept's invented invoice.
- Responsive behavior: condensed input files and icon-only pause on phones, visible next-section hint at all six tested opening sizes.

Intentional concept adaptations are factual sample-data labels, three supplier
files instead of one, existing local icons instead of invented product logos,
unframed matching records instead of nested cards, a clear USD/cost disclaimer,
and preserving the existing footer destinations. Short phone viewports prioritize
the primary booking action over the secondary workflow link.

## Publishing

Production is deployed by the existing Vercel `automationbusines` project from
the GitHub repository's `main` branch. The public URL is
`https://www.yudilabs.com/`; the apex domain redirects there. After publishing,
verify the deployment is ready and check the public site before reporting success.
