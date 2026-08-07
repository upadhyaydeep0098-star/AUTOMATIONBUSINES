#!/bin/bash
# Yudi Labs — Blog post generator
# Usage: ./new-post.sh
# Creates a new blog post from blog/_template.html, optionally adds it to blog.html and sitemap.xml.

set -e

# Colors
B="\033[1m"; G="\033[32m"; C="\033[36m"; R="\033[31m"; N="\033[0m"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

TEMPLATE="blog/_template.html"
[ -f "$TEMPLATE" ] || { echo -e "${R}Error: $TEMPLATE not found${N}"; exit 1; }

# Portable in-place sed (GNU sed vs BSD/macOS sed)
if sed --version >/dev/null 2>&1; then
  sedi() { sed -i "$@"; }
else
  sedi() { sed -i '' "$@"; }
fi

echo -e "${B}${C}┌─────────────────────────────────────────┐${N}"
echo -e "${B}${C}│  Yudi Labs — New Blog Post Generator    │${N}"
echo -e "${B}${C}└─────────────────────────────────────────┘${N}"
echo ""

# Collect inputs
read -p "$(echo -e "${B}Post title:${N} ")" TITLE
read -p "$(echo -e "${B}Slug${N} (URL, e.g. ai-agents-vs-rpa): ")" SLUG
read -p "$(echo -e "${B}Category tag${N} (e.g. Workflow Automation): ")" TAG
read -p "$(echo -e "${B}Short description${N} (~150 chars for SEO): ")" DESC
read -p "$(echo -e "${B}Keywords${N} (comma-separated, for SEO): ")" KEYWORDS
read -p "$(echo -e "${B}Read time${N} (e.g. 7 min read): ")" READTIME

# Validate
[ -z "$TITLE" ] && { echo -e "${R}Title is required${N}"; exit 1; }
[ -z "$SLUG" ] && { echo -e "${R}Slug is required${N}"; exit 1; }

# Slug normalisation
SLUG=$(echo "$SLUG" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '-' | sed 's/^-//;s/-$//')
NEW_FILE="blog/${SLUG}.html"

# Don't overwrite
if [ -f "$NEW_FILE" ]; then
  echo -e "${R}Error: $NEW_FILE already exists${N}"
  exit 1
fi

# Date strings
DATE_ISO=$(date +%Y-%m-%d)
DATE_LONG=$(date +"%B %-d, %Y" 2>/dev/null || date +"%B %d, %Y")
DATE_SHORT=$(date +"%b %Y")

# Escape for sed (replace pipes in user inputs)
esc() { echo "$1" | sed 's/[\/&|]/\\&/g'; }
TITLE_E=$(esc "$TITLE")
DESC_E=$(esc "$DESC")
TAG_E=$(esc "$TAG")
KEYWORDS_E=$(esc "$KEYWORDS")
READTIME_E=$(esc "$READTIME")

# Copy + substitute
cp "$TEMPLATE" "$NEW_FILE"
sedi "s|{{TITLE}}|$TITLE_E|g" "$NEW_FILE"
sedi "s|{{SLUG}}|$SLUG|g" "$NEW_FILE"
sedi "s|{{TAG}}|$TAG_E|g" "$NEW_FILE"
sedi "s|{{DESCRIPTION}}|$DESC_E|g" "$NEW_FILE"
sedi "s|{{KEYWORDS}}|$KEYWORDS_E|g" "$NEW_FILE"
sedi "s|{{READTIME}}|$READTIME_E|g" "$NEW_FILE"
sedi "s|{{DATE_MODIFIED}}|$DATE_ISO|g" "$NEW_FILE"
sedi "s|{{DATE}}|$DATE_ISO|g" "$NEW_FILE"
sedi "s|{{DATE_LONG}}|$DATE_LONG|g" "$NEW_FILE"

# The template ships noindex; a real post goes live indexable.
sedi 's|<meta name="robots" content="noindex, nofollow" />|<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />|' "$NEW_FILE"

echo ""
echo -e "${G}✓ Created${N} $NEW_FILE"

# Offer to add to sitemap.xml
echo ""
read -p "$(echo -e "${B}Add to sitemap.xml?${N} (y/N): ")" ADD_SITEMAP
if [[ "$ADD_SITEMAP" =~ ^[Yy] ]]; then
  ENTRY="  <url>\\
    <loc>https:\\/\\/www.yudilabs.com\\/blog\\/${SLUG}<\\/loc>\\
    <lastmod>${DATE_ISO}<\\/lastmod>\\
    <changefreq>monthly<\\/changefreq>\\
    <priority>0.7<\\/priority>\\
  <\\/url>"
  sedi "s|<\/urlset>|${ENTRY}\\
<\/urlset>|" sitemap.xml
  echo -e "${G}✓ Added to sitemap.xml${N}"
fi

# Offer to add card to blog.html
echo ""
read -p "$(echo -e "${B}Add a card to blog.html?${N} (y/N): ")" ADD_BLOG
if [[ "$ADD_BLOG" =~ ^[Yy] ]]; then
  CARD="          <a href=\"/blog/${SLUG}\" class=\"blog-card\" aria-labelledby=\"post-${SLUG}\">\\
            <span class=\"tag\">${TAG_E}<\\/span>\\
            <h2 id=\"post-${SLUG}\">${TITLE_E}<\\/h2>\\
            <span class=\"blog-card-date\">Updated ${DATE_SHORT}<\\/span>\\
            <p>${DESC_E}<\\/p>\\
            <span class=\"read-more\">Read article <span aria-hidden=\"true\">→<\\/span><\\/span>\\
          <\\/a>"
  sedi "s|<div class=\"blog-grid reveal\" data-stagger>|<div class=\"blog-grid reveal\" data-stagger>\\
${CARD}|" blog.html
  echo -e "${G}✓ Added card to blog.html${N}"
fi

echo ""
echo -e "${B}${G}Done.${N}"
echo ""
echo -e "${B}Next steps:${N}"
echo "  1. Open ${NEW_FILE} and write your article body"
echo "     (look for the <!-- ARTICLE BODY GOES HERE --> marker)"
echo "  2. Update the TL;DR block at the top"
echo "  3. Add a sitemap.xml entry with <lastmod>${DATE_ISO}</lastmod> (skip if you said yes above)"
echo "  4. Add a feed.xml item for the new post"
echo "  5. Bump nothing else — keep ?v=20260807 on styles.css/script.js as-is"
echo "  6. Preview by opening the file in a browser"
echo "  7. git add . && git commit -m 'Add post: ${TITLE}' && git push"
echo "  8. Vercel auto-deploys in ~20 seconds"
echo ""
