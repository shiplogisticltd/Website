# Shipmate Logistics — Website

A fast, fully static logistics website built with vanilla HTML, CSS, and JavaScript. No frameworks, no build step — open a file and it works.

---

## 🚀 Quick Start

```bash
# Clone or download the project
cd marg-logistics

# Serve locally (Python, Node, or any static server)
python3 -m http.server 8000
# OR
npx -y serve .

# Open in browser
open http://localhost:8000
```

> **No npm install needed.** All JavaScript is vanilla, all CSS is a single file.

---

## 📁 File Structure

```
marg-logistics/
├── index.html          ← Home page
├── about.html          ← About page
├── services.html       ← Services page
├── fleet.html          ← Fleet/vehicles page
├── contact.html        ← Contact + quote form page
│
├── content.json        ← ALL editable text lives here (see below)
├── main.js             ← All JavaScript logic
│
├── css/
│   └── style.css       ← Complete stylesheet (single source of truth)
│
├── assets/
│   ├── images/         ← All images (hero poster, logos, fleet photos, etc.)
│   │   └── logos/
│   │       └── mainlogo.png
│   ├── videos/         ← Hero background video
│   │   └── hero-loop.mp4
│   └── sounds/         ← Audio files (e.g. krishna.mp3)
│
└── netlify.toml        ← Netlify deployment config
```

---

## ✏️ How to Edit Content

**All website text, links, and data is stored in `content.json`.** You do NOT need to touch the HTML to change copy.

### Editing text

Open `content.json` and find the key you want to change:

```json
{
  "home": {
    "hero": {
      "title": "Freight that arrives on schedule, every time.",
      "subtitle": "Shipmate Logistics moves full truckloads..."
    }
  }
}
```

Change the value. Save. Refresh the browser.

### Key sections in `content.json`

| Key | What it controls |
|-----|-----------------|
| `site.*` | Phone, email, address, WhatsApp number |
| `home.hero.*` | Hero section heading and subtitle |
| `home.stats.items` | The 4 number counters (cities, vehicles, etc.) |
| `home.testimonials.items` | Customer quotes and avatars |
| `home.trustStrip.logos` | Scrolling company logos/names in trust bar |
| `services.list` | Each service card (title, image, bullet points) |
| `fleet.vehicles` | Each vehicle card (name, capacity, image) |
| `contact.hubs.items` | Regional hub cities and addresses |
| `contact.form.*` | Form labels and success/error messages |
| `footer.*` | Footer links, tagline, copyright |

---

## 🎨 How to Change Colors / Branding

All design tokens are CSS variables at the top of `css/style.css`:

```css
:root {
  /* ── Brand colors ── */
  --navy-900:   #041629;   /* Main dark navy */
  --amber:      #f2a93b;   /* Brand amber/gold */
  --amber-dark: #d6892a;
  --cream:      #f7f4ee;   /* Light background */
  --cream-dim:  #ece7db;   /* Slightly darker cream */

  /* ── Typography ── */
  --font-display: "Space Grotesk", sans-serif;
  --font-body:    "Inter", sans-serif;
  --font-mono:    "JetBrains Mono", monospace;
}
```

Change any value and the whole site updates instantly.

---

## 🖼️ How to Replace Images

| Image | Path | Used in |
|-------|------|---------|
| Main logo | `assets/images/logos/mainlogo.png` | Header + footer |
| Hero poster (video fallback) | `assets/images/hero-poster.jpg` | Home hero |
| Hero video | `assets/videos/hero-loop.mp4` | Home hero background |
| Service cards | Set in `content.json` → `services.list[].image` | Services section |
| Fleet cards | Set in `content.json` → `fleet.vehicles[].image` | Fleet section |
| Testimonial avatars | Set in `content.json` → `home.testimonials.items[].avatar` | Testimonials |
| Krishna button | `assets/images/krishna.png` | Floating button |

---

## 📞 How to Change the WhatsApp Number

Open `content.json` and update:

```json
{
  "site": {
    "whatsappNumber": "919876543210",
    "whatsappMessage": "Hello! I'd like a freight quote."
  }
}
```

> Use full international format without `+` or spaces: `919876543210` for `+91 98765 43210`.

---

## 📝 How to Update the Contact Form

The form submits to **Formspree**. To change the destination email:

1. Go to [formspree.io](https://formspree.io) and create/login to your account
2. Create a new form → copy the form endpoint ID (e.g. `mykalzow`)
3. Open `contact.html` and update:
   ```html
   <form ... action="https://formspree.io/f/YOUR_FORM_ID" ...>
   ```
4. Also update the JS fetch URL in `main.js` (search for `formspree.io`):
   ```js
   const res = await fetch("https://formspree.io/f/YOUR_FORM_ID", { ... });
   ```

---

## 🗺️ How to Add/Remove a Navigation Page

1. Create the new HTML file (copy `about.html` as a template)
2. Add a link in the `<nav>` section of **all 5 HTML files**:
   ```html
   <li><a class="nav__link" href="newpage.html">New Page</a></li>
   ```
3. Add the page to `content.json` → `site.nav`:
   ```json
   { "label": "New Page", "href": "newpage.html" }
   ```

---

## 🚢 Deploy to Netlify

### Option A — Drag & Drop (fastest)
1. Go to [app.netlify.com](https://app.netlify.com) → Sites → "Add new site"
2. Drag the entire `marg-logistics/` folder into the drop zone
3. Done! Netlify gives you a URL in seconds.

### Option B — Git (recommended for ongoing edits)
1. Push the project to GitHub/GitLab
2. In Netlify: "Import an existing project" → connect your repo
3. Build settings:
   - **Build command:** *(leave blank — no build step needed)*
   - **Publish directory:** `.` (root)
4. Every `git push` auto-deploys.

### Custom Domain (CNAME)
The `CNAME` file at the root sets the custom domain for GitHub Pages. For Netlify, set the domain in: **Netlify → Site Settings → Domain Management**.

---


## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Markup | HTML5 (semantic) |
| Styles | Vanilla CSS (single stylesheet, design tokens, BEM-lite) |
| Script | Vanilla JS (IIFE, no dependencies) |
| Content | JSON (loaded at runtime via `fetch`) |
| Forms | Formspree (hosted form backend) |
| Hosting | Netlify / GitHub Pages |
| Fonts | Google Fonts (Space Grotesk, Inter, JetBrains Mono) |

---

## 📐 Design System (for developers)

### Color tokens
Use the CSS variables — never hardcode hex values in new rules.

### Spacing
Sections use `clamp()` for fluid padding: `clamp(56px, 9vw, 120px)`.

### Animation
- `--t-fast: 0.2s`, `--t-med: 0.5s`, `--t-slow: 0.9s`
- Easing: `--ease: cubic-bezier(0.16, 1, 0.3, 1)` (spring-like)

### Scroll reveal
Add `class="reveal"` to any element to animate it in on scroll.
Add `class="reveal-stagger"` to a container to stagger its children.

### Responsive breakpoints

| Name | Width |
|------|-------|
| Mobile nav threshold | `< 1080px` |
| Tablet | `< 980px` |
| Mobile large | `< 768px` |
| Mobile | `< 640px` |
| Small mobile | `< 480px` |
