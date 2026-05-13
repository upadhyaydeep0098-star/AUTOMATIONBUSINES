# Yudi Labs — Deployment Guide

Step-by-step instructions to take this site from local files to live at `yudilabs.com`.

---

## Prerequisites

- Domain `yudilabs.com` purchased on Namecheap ✓
- A GitHub account (free) — [github.com](https://github.com)
- A Vercel account (free) — [vercel.com](https://vercel.com)

Both Vercel and GitHub are free. Sign up for Vercel using your GitHub account — it links them automatically.

---

## Part 1 — Push the site to GitHub (5 min)

### Option A — GitHub Desktop (easiest, GUI)

1. Download **GitHub Desktop** from [desktop.github.com](https://desktop.github.com)
2. Sign in with your GitHub account
3. Click **File → Add Local Repository**
4. Browse to the site folder (the one with `index.html` in it)
5. GitHub Desktop will say "this isn't a repository yet" → click **Create a Repository**
6. Name: `yudilabs-website`
7. Click **Publish Repository** → choose Private or Public → Publish

✅ Site is now on GitHub.

### Option B — Drag-and-drop on github.com

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `yudilabs-website`
3. Set Private or Public, click **Create repository**
4. On the empty repo page, click **uploading an existing file**
5. Drag the entire contents of your site folder into the upload area
6. Scroll down, click **Commit changes**

✅ Site is now on GitHub.

---

## Part 2 — Deploy to Vercel (3 min)

1. Sign in to [vercel.com](https://vercel.com) with your GitHub account
2. Click **Add New → Project**
3. You'll see your `yudilabs-website` repo listed → click **Import**
4. **Framework Preset:** leave as "Other"
5. **Root Directory:** leave as `./`
6. **Build & Output Settings:** leave all defaults (this is a static site)
7. Click **Deploy**

After ~30 seconds, you'll see a confetti animation and a temporary URL like:
`yudilabs-website-abc123.vercel.app`

Click it. Your site is live. 🎉

---

## Part 3 — Connect your domain (5 min + DNS propagation)

### In Vercel

1. From your project dashboard, click **Settings → Domains**
2. Enter `yudilabs.com` and click **Add**
3. Vercel shows you **two DNS records** to add:
   - An **A record** pointing to `76.76.21.21`
   - A **CNAME record** for `www` pointing to `cname.vercel-dns.com`
4. Keep this tab open — you need to copy those values.

### In Namecheap

1. Log in to [namecheap.com](https://namecheap.com)
2. **Domain List** → click **Manage** next to `yudilabs.com`
3. Click the **Advanced DNS** tab
4. Delete any existing default records (parking page records)
5. Click **Add New Record**:
   - **Type:** A Record
   - **Host:** `@`
   - **Value:** `76.76.21.21`
   - **TTL:** Automatic
6. Click **Add New Record** again:
   - **Type:** CNAME Record
   - **Host:** `www`
   - **Value:** `cname.vercel-dns.com`
   - **TTL:** Automatic
7. Save

### Wait

DNS propagation takes anywhere from **2 minutes to 1 hour**, sometimes longer. You can check status at [dnschecker.org](https://dnschecker.org) (enter `yudilabs.com`).

Once propagation finishes, `yudilabs.com` shows your site with **automatic free SSL** (HTTPS). 🔒

---

## Part 4 — Submit to search engines (5 min)

### Google Search Console (the most important step)

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Click **Add property** → choose **URL prefix**
3. Enter `https://yudilabs.com` → Continue
4. Verify ownership — easiest method is **HTML tag**:
   - Copy the meta tag Google gives you
   - Paste it into `index.html` inside `<head>` (just above `</head>`)
   - Push the change (Vercel auto-deploys)
   - Back in Google → click **Verify**
5. Once verified: click **Sitemaps** in the left menu
6. Enter `sitemap.xml` → Submit

✅ Google now knows your site exists. Indexing starts within 24 hours.

### Bing Webmaster Tools (also drives ChatGPT/Copilot answers)

1. Go to [bing.com/webmasters](https://bing.com/webmasters)
2. Sign in with your Google account
3. Import your Google Search Console site (one click)
4. ✅ Done

---

## Part 5 — Optional but recommended

### Contact forms

The site forms are already wired to Formspree:

```text
https://formspree.io/f/xzdoqpke
```

Forms currently submit from:

- `index.html`
- `about.html`
- `services.html`
- `contact.html`
- `blog.html`

After deploying, submit one test message and confirm it appears in the
Formspree dashboard and arrives at `hello@yudilabs.com`.

### Add analytics (free)

**Plausible** ($9/mo, privacy-friendly) or **Google Analytics 4** (free):

For GA4:
1. Sign up at [analytics.google.com](https://analytics.google.com)
2. Create a property for `yudilabs.com`
3. Copy the **Measurement ID** (looks like `G-XXXXXXXXXX`)
4. Add this snippet to `<head>` of every page (or just `index.html` for now):

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## Part 6 — How future edits work

```
1. Edit any file (locally in VS Code, or directly on GitHub web UI)
2. Save / commit
3. Push to GitHub
4. Vercel auto-deploys in ~20 seconds
5. yudilabs.com is updated
```

### Editing directly on GitHub (no local setup)

1. Go to your repo on github.com
2. Click any file → click the **pencil** icon
3. Edit → commit changes
4. Vercel auto-deploys

### Editing locally (recommended for bigger changes)

1. Install VS Code or Cursor
2. Clone the repo: `git clone https://github.com/YOUR-USERNAME/yudilabs-website.git`
3. Edit files
4. `git add . && git commit -m "your message" && git push`

---

## Part 7 — Adding a new blog post

Use the included script:

```bash
cd /path/to/yudilabs-website
./new-post.sh
```

Follow the prompts. It creates a new HTML file from the template, optionally adds it to `sitemap.xml` and `blog.html`, then tells you to write the article body.

After writing:

```bash
git add .
git commit -m "Add post: Your Post Title"
git push
```

Live in 20 seconds.

---

## Troubleshooting

**My domain doesn't show the site after an hour**
→ Check DNS at [dnschecker.org](https://dnschecker.org). If records still show old values, your DNS provider is slow. Wait up to 24 hours. If it never updates, double-check the records in Namecheap match what Vercel showed.

**Forms aren't working**
→ Either set up Formspree (see Part 5) OR the form falls back to opening the user's email client with a pre-filled message. The fallback works without any setup.

**Vercel deploy fails**
→ Vercel deploys static HTML/CSS/JS as-is. There's nothing to build. If it fails, check the deployment log for the specific error. Most common: the repo wasn't pushed correctly.

**SSL not working (red lock icon)**
→ Wait 10–15 minutes after domain connects. Vercel issues a free Let's Encrypt certificate automatically; it takes a few minutes after DNS propagates.

---

## Quick reference

| Task | Where |
|---|---|
| Buy/manage domain | [namecheap.com](https://namecheap.com) |
| Hosting + deployments | [vercel.com](https://vercel.com) |
| Source code | [github.com](https://github.com) |
| Submit to Google | [search.google.com/search-console](https://search.google.com/search-console) |
| Form submissions | [formspree.io](https://formspree.io) |
| Analytics | [analytics.google.com](https://analytics.google.com) |
| Domain status check | [dnschecker.org](https://dnschecker.org) |

---

## Estimated total time to launch

| Step | Time |
|---|---|
| GitHub setup + repo upload | 5 min |
| Vercel deploy | 3 min |
| DNS configuration in Namecheap | 5 min |
| DNS propagation wait | 5–60 min |
| Google Search Console submission | 5 min |
| **Total active time** | **~20 min** |
| **Total elapsed time** | **~30–80 min** |

You can be live and indexed within an hour.
