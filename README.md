# Shipmate Logistics — Website

A premium, fully responsive logistics company website built with plain HTML5, CSS3, and vanilla JavaScript. No frameworks, no build step, no backend required.

---

## What changed in this version

- **Color palette** — replaced the orange/amber/yellow theme with a navy + teal palette (`--amber`, `--amber-light`, `--amber-dark`, `--route` tokens in `css/style.css`). All buttons, eyebrows, route lines, stat numbers, tags and the CTA banner update automatically since they reference these tokens.
- **Mobile hero fix** — on screens ≤768px, the dark overlay over the homepage video was reduced so the video shows through properly, and the hero text/buttons are now centered and stacked correctly.

---

## Folder structure

```
shipmate/
├── index.html
├── about.html
├── services.html
├── fleet.html
├── contact.html
├── content.json          ALL editable text & data for the whole site
├── css/
│   └── style.css         Core + mobile + color styling (single file)
├── js/
│   └── main.js           All interactivity — nav, animations, forms, FABs
└── assets/                (add your own — see note below)
    ├── images/
    ├── sounds/
    └── videos/
```

> **Note:** the `assets/` folder (images, hero video, logo, Krishna sound) is **not included** in this export. Copy your existing `assets/` folder from your current live site into this new folder before uploading, keeping the same file names referenced in `content.json`.

---

## How to update text and data

Almost all visible text comes from `content.json`. Open it in any text editor, edit the value between quotes, save, and refresh. Keep quotation marks, commas, and brackets intact.

---

## Running the site locally

```bash
python3 -m http.server 8000
```
Then open `http://localhost:8000`.

---

## Uploading the latest version to GitHub

### Option A — You already have a GitHub repo for this site
1. Open a terminal in this project folder.
2. Pull the latest remote state (avoids conflicts):
   ```bash
   git pull origin main
   ```
3. Copy/replace these updated files into your repo folder, overwriting the old ones:
   - `css/style.css`
   - `index.html`, `about.html`, `services.html`, `fleet.html`, `contact.html`
   - `js/main.js`
   - `content.json`
4. Stage, commit, and push:
   ```bash
   git add .
   git commit -m "Update color palette and mobile hero fix"
   git push origin main
   ```
5. If you host via **GitHub Pages**, the live site updates automatically within a minute or two of the push. If you host via **Netlify/Vercel** connected to this repo, they will auto-deploy on push too.

### Option B — You don't have a repo yet (first-time setup)
1. Go to [github.com/new](https://github.com/new), create a repository (e.g. `shipmate-website`), keep it **Public** (required for free GitHub Pages) or **Private** if you'll use Netlify/Vercel instead.
2. In your local project folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit — Shipmate Logistics website"
   git branch -M main
   git remote add origin https://github.com/<your-username>/shipmate-website.git
   git push -u origin main
   ```
3. Continue to the hosting steps below.

---

## Connecting GitHub to your main domain

You have two common paths. **GitHub Pages** is free and simplest if you're fine with a static site host. **Netlify/Vercel** are also free, slightly more flexible (better redirects, instant deploy previews) and recommended if you already use Formspree-style integrations.

### Path 1 — GitHub Pages (free, built into GitHub)
1. In your repo, go to **Settings → Pages**.
2. Under "Build and deployment", set **Source** to `Deploy from a branch`, branch `main`, folder `/ (root)`. Save.
3. GitHub gives you a URL like `https://<your-username>.github.io/shipmate-website/`. Confirm it loads correctly.
4. **Connect your domain:**
   - In the same **Settings → Pages** screen, enter your domain (e.g. `www.shipmatelogistics.in`) under "Custom domain" and save. GitHub will create a `CNAME` file in your repo automatically.
   - Go to your domain registrar / DNS provider (GoDaddy, Namecheap, Cloudflare, etc.) and add these records:
     - For an **apex domain** (`shipmatelogistics.in`): add four `A` records pointing to:
       ```
       185.199.108.153
       185.199.109.153
       185.199.110.153
       185.199.111.153
       ```
     - For a **subdomain** (`www.shipmatelogistics.in`): add a `CNAME` record pointing to `<your-username>.github.io`.
   - Wait for DNS to propagate (a few minutes to a few hours).
   - Back in **Settings → Pages**, tick **Enforce HTTPS** once it becomes available (GitHub auto-issues an SSL certificate).

### Path 2 — Netlify (free, more control, recommended)
1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**.
2. Connect your GitHub account and select the `shipmate-website` repo.
3. Build settings: leave **Build command** empty and **Publish directory** as `/` (root), since this is a static site with no build step.
4. Deploy — Netlify gives you a `https://random-name.netlify.app` URL.
5. **Connect your domain:**
   - Go to **Site settings → Domain management → Add custom domain**, enter your domain.
   - Netlify shows you the DNS records to add (usually a `CNAME` for `www` pointing to your Netlify subdomain, and an `A` record or Netlify DNS for the apex domain).
   - Update those records at your domain registrar.
   - Netlify auto-issues a free SSL certificate once DNS resolves.
6. From now on, every `git push` to `main` auto-deploys the live site — no manual upload needed.

---

## Quick reference — every future update

```bash
# after editing files locally
git add .
git commit -m "describe your change"
git push
```
That's it — GitHub Pages or Netlify picks up the change automatically.

---

## Contact form

Submissions go to Formspree: `https://formspree.io/f/mnjyeevd` (set in both `contact.html` and `js/main.js`'s `setupContactForm()`). To change the destination, update the URL in both places and check your Formspree dashboard to confirm the form ID is active.

---

## Browser support

Targets all modern browsers (Chrome, Safari, Firefox, Edge) on desktop and mobile. Internet Explorer is not supported.
