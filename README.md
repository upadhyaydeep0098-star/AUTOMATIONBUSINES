# Yudi Labs

Static agency website, deployed through the existing Vercel configuration.

This checkout was created from `upadhyaydeep0098-star/AUTOMATIONBUSINES` at
`8612b72826494803a596cb5b415b70ce51ae68ec`. The September redesign is on
`codex/yudilabs-webflow-redesign`. The Clinic Platform in `Documents/Agency`
is a separate project.

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

- `index.html`: homepage, native workflow preview, use-case disclosures, process and booking links.
- `refresh.css`: shared light theme and responsive homepage styles, loaded after `styles.css`.
- `styles.css`: existing supporting-page layout and component styles.
- `script.js`: navigation, restrained motion, form submission, service language toggle and calculator.
- `assets/ui/`: Lucide SVG icons, with the upstream license.
- `blog/_template.html` and `new-post.sh`: publishing template and helper.
- `vercel.json`: existing clean URLs, redirects, security and caching configuration.

The contact endpoint remains `https://formspree.io/f/xzdoqpke`.
Consultations link to `https://calendly.com/hello-yudilabs/30min`.
No credentials or customer data are stored in this repository.

The workflow visuals are illustrative. The main diagram uses HTML, CSS and local
SVG icons, without a video, animation framework, external font request or 3D runtime.
Animation pauses when offscreen, when the tab is hidden, when paused by the visitor,
and when reduced motion is requested. All real service copy and article content on
the supporting pages are retained.

## Review evidence

In-app browser checks covered 16 public pages, one H1 per page, parsed JSON-LD,
32 internal resources, 73 fragment references, and phone overflow. The homepage
was inspected at 1536x1024, 1280x720, 768x1024, 390x844 and 320x667.
Accordion state, menu opening/Escape dismissal, motion pause, service language
switching and calculator updates were exercised. Eight Node tests cover motion
preferences and form validation, success, failure and duplicate submission.
Form responses are mocked in tests; no test enquiry or booking was submitted.

Visual review compared the concept and rendered screenshots for headline wrapping,
typography, white/cobalt/charcoal palette, section order, horizontal workflow layout,
spacing and mobile flow. Corrected heading line height, legacy dark preview panels
and the mobile demo height. Intentional concept adaptations: existing circuit mark,
neutral sample workflow data, accessible pause control, compact mobile workflow,
and the existing footer links in place of invented reference destinations.

## Publishing

Production is deployed by the existing Vercel `automationbusines` project from
the GitHub repository's `main` branch. The public URL is
`https://www.yudilabs.com/`; the apex domain redirects there. After publishing,
verify the deployment is ready and check the public site before reporting success.
