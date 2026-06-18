# Shipmate Logistics — Website

A premium, fully responsive logistics company website built with plain HTML5, CSS3, and vanilla JavaScript. No frameworks, no build step, no backend required.

---

## Folder structure

```
Shipmate-logistics/
├── index.html              Home page
├── about.html              About Us page
├── services.html           Services page
├── fleet.html              Fleet page
├── contact.html            Contact / Get a Quote page
├── content.json            ALL editable text & data for the whole site
├── css/
│   ├── style.css           Core styling
│   └── css-additions.css   Extended styles (FABs, mobile nav, hero tweaks)
├── js/
│   └── main.js             All interactivity — nav, animations, forms, FABs
└── assets/
    ├── images/             Photos, icons, logos
    │   ├── logos/          Brand logo (mainlogo.png) + trust strip logos
    │   ├── fleet/          Fleet vehicle images
    │   ├── services/       Service card images
    │   ├── testimonials/   Client headshot images
    │   ├── whatsapp.png    (legacy — replaced by inline SVG at runtime)
    │   └── krishna.png     Krishna floating button image
    ├── sounds/
    │   └── krishna.mp3     Music played by the Krishna button
    └── videos/
        └── hero-loop.mp4   Homepage hero background video
```

---

## How to update text and data

Almost every piece of visible text — headlines, descriptions, stats, service details, fleet specs, testimonials, contact info, hub addresses, footer links — comes from **`content.json`**. Open it in any text editor, find the relevant key, and edit the value between quotation marks. Save the file and refresh the browser. No build step needed.

Tips:
- Keep the quotation marks `" "` around every text value.
- Do not remove commas `,` between items, or square brackets `[ ]` / curly braces `{ }` — these define the data structure.
- Before making large edits, save a backup copy of `content.json` so you can restore it if something breaks.

---

## How to replace images and video

All media lives inside `assets/`. To swap a file, replace it with a new one using **the exact same filename and folder path**. Paths are case-sensitive.

| File | Suggested size | Purpose |
|---|---|---|
| `assets/videos/hero-loop.mp4` | 1920×1080, 10–20 s, muted, looping | Homepage hero background |
| `assets/images/hero-poster.jpg` | 1920×1080 | Hero fallback before video loads |
| `assets/images/about-story.jpg` | 1200×1500 (portrait) | About page story section |
| `assets/images/services/service-*.jpg` (×6) | 1200×900 | Service cards |
| `assets/images/fleet/fleet-*.jpg` (×6) | 1200×900 | Fleet vehicle cards |
| `assets/images/testimonials/testimonial-*.jpg` (×3) | 400×400 (square) | Client headshots |
| `assets/images/logos/mainlogo.png` | any, max 200px tall | Header & footer brand logo |
| `assets/images/logos/logo-*.svg` (×5) | 160×48 | Trust strip partner logos |
| `assets/images/krishna.png` | 200×200 (square) | Krishna floating button |
| `assets/sounds/krishna.mp3` | any | Music toggled by the Krishna button |

If you rename a file or add new images, update the matching path in `content.json` to reflect the change.

---

## Running the site locally

The site loads `content.json` via `fetch()`, so opening `index.html` directly from disk (`file://`) will be blocked by most browsers. Run a local server instead:

```bash
# Python 3 (recommended)
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

---

## Deploying

This is a fully static site. Upload the entire project folder — including `content.json`, `css/`, `js/`, and `assets/` — to any static host:

- **Netlify** — drag-and-drop the folder at netlify.com/drop
- **Vercel** — `vercel deploy` from the project directory
- **GitHub Pages** — push to a repo and enable Pages in Settings
- **AWS S3** — enable Static Website Hosting on the bucket
- **Any standard web server** — copy files to the `public_html` or `www` root

No build step, no compilation, no dependencies to install.

---

## Contact / quote form

The quote form on `contact.html` performs client-side validation only. To make submissions actually send data, connect it to a form service and update `setupContactForm()` in `js/main.js`:

**Formspree (simplest option)**
1. Create a free form at [formspree.io](https://formspree.io).
2. Copy your form endpoint URL (e.g. `https://formspree.io/f/abcxyz`).
3. In `main.js`, find `setupContactForm()` and replace the placeholder endpoint with your Formspree URL.

**Netlify Forms**
Add `data-netlify="true"` to the `<form>` tag and deploy via Netlify — submissions are captured automatically with no code changes.

---

## WhatsApp floating button

The WhatsApp FAB (bottom-right corner) builds its link from two fields in `content.json`:

```json
"site": {
  "whatsappNumber": "919876543210",
  "whatsappMessage": "Hello, I'd like a freight quote."
}
```

Update `whatsappNumber` (country code + number, no `+` or spaces) and `whatsappMessage` (the pre-filled text the user sees when WhatsApp opens). The button SVG icon is injected automatically by `main.js` at runtime — no image file required.

---

## Krishna floating button

The Krishna button sits just above the WhatsApp button. Tapping it plays `assets/sounds/krishna.mp3`. Tapping again stops and resets the music. While playing, the button shows a golden glow pulse animation. To change the sound, replace `krishna.mp3` with any audio file of the same name. To change the image, replace `assets/images/krishna.png`.

---

## CSS files

The stylesheet is split into two files, both must be in `css/`:

| File | Purpose |
|---|---|
| `style.css` | Core design system — typography, layout, components, colours |
| `css-additions.css` | Additions and overrides — brand logo sizing, mobile nav overlay, hero opacity, WhatsApp/Krishna FABs, mobile breakpoints |

Both are loaded via `<link>` tags in every HTML page. Changes to either file take effect immediately on refresh — no compilation needed.

---

## JavaScript

All interactivity lives in `js/main.js`. Key functions:

| Function | What it does |
|---|---|
| `loadContent()` | Fetches `content.json` |
| `applyTextBindings()` | Fills `data-content` elements with JSON values |
| `setupHeader()` | Scroll state, mobile nav toggle, active link |
| `setupReveal()` | IntersectionObserver scroll-reveal animations |
| `renderStats()` | Animated number counters |
| `renderTestimonials()` | Touch/click carousel with dots |
| `renderFleetFull()` | Fleet grid with category filter buttons |
| `setupContactForm()` | Client-side form validation |
| `setupWhatsAppFAB()` | Injects WhatsApp SVG and sets href from content.json |
| `setupKrishnaFAB()` | Play/stop toggle for Krishna music with glow state |

---

## Browser support

The site targets all modern browsers (Chrome, Safari, Firefox, Edge) on both desktop and mobile. Internet Explorer is not supported.
