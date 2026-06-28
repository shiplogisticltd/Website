/* ==========================================================================
   SHIPMATE LOGISTICS — main.js
   Vanilla JS only. Handles:
   - content.json loading & dynamic text/render
   - header scroll state + mobile nav
   - scroll-reveal animations (IntersectionObserver)
   - animated stat counters
   - testimonials carousel
   - fleet filters
   - contact form validation (client-side only)
   - WhatsApp popup FAB (call / chat options)
   - team member bio modal
   - decorative "route line" SVG injection
   - BFCache restoration fix
   ========================================================================== */

(function () {
  "use strict";

  const $ = (sel, scope = document) => scope.querySelector(sel);
  const $$ = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

  function getPath(obj, path) {
    return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
  }

  function currentPage() {
    return location.pathname.split("/").pop() || "index.html";
  }

  /* ------------------------------------------------------------------
     Content loader (cached result reused for BFCache restore)
     ------------------------------------------------------------------ */
  let _cachedData = null;

  async function loadContent() {
    if (_cachedData) return _cachedData;
    try {
      const res = await fetch("content.json");
      if (!res.ok) throw new Error("content.json not found");
      _cachedData = await res.json();
      return _cachedData;
    } catch (err) {
      console.warn("Shipmate: could not load content.json — static fallback content will remain.", err);
      return null;
    }
  }

  /* ------------------------------------------------------------------
     Apply simple text bindings: <el data-content="home.hero.title">
     ------------------------------------------------------------------ */
  function applyTextBindings(data) {
    $$("[data-content]").forEach((el) => {
      const value = getPath(data, el.getAttribute("data-content"));
      if (value === undefined || value === null) return;
      if (el.hasAttribute("data-content-html")) {
        el.innerHTML = value;
      } else {
        el.textContent = value;
      }
    });

    $$("[data-content-attr]").forEach((el) => {
      el.getAttribute("data-content-attr").split(";").forEach((pair) => {
        const [attr, path] = pair.split(":").map((s) => s.trim());
        const value = getPath(data, path);
        if (value !== undefined && value !== null) el.setAttribute(attr, value);
      });
    });
  }

  /* ------------------------------------------------------------------
     Header: scroll state + mobile nav + active link
     ------------------------------------------------------------------ */
  function setupHeader(data) {
    const header = $(".header");
    const toggle = $(".nav-toggle");
    const nav = $(".nav");

    if (header) {
      const onScroll = () => { header.classList.toggle("is-scrolled", window.scrollY > 12); };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    if (toggle && nav) {
      toggle.addEventListener("click", () => {
        const isOpen = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(isOpen));
        document.body.style.overflow = isOpen ? "hidden" : "";
      });

      $$(".nav__link", nav).forEach((link) => {
        link.addEventListener("click", () => {
          nav.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
          document.body.style.overflow = "";
        });
      });

      // Close nav when clicking outside
      document.addEventListener("click", (e) => {
        if (nav.classList.contains("is-open") && !nav.contains(e.target) && !toggle.contains(e.target)) {
          nav.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
          document.body.style.overflow = "";
        }
      });
    }

    // Mark active nav link
    const page = currentPage();
    $$(".nav__link").forEach((link) => {
      const href = link.getAttribute("href");
      if (href === page || (page === "" && href === "index.html")) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  /* ------------------------------------------------------------------
     Decorative route-line SVGs
     ------------------------------------------------------------------ */
  function routeSVG({ withDot = false, viewBox = "0 0 1440 300", path, dotPath } = {}) {
    const d = path || "M-50,180 C 250,40 450,260 750,150 C 1050,40 1250,240 1500,120";
    const dot = dotPath ? `<circle class="route-dot" r="5"><animateMotion dur="18s" repeatCount="indefinite" path="${dotPath}" rotate="auto"/></circle>` : "";
    return `<svg viewBox="${viewBox}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
      <path class="route-path" d="${d}"/>
      ${withDot ? dot : ""}
    </svg>`;
  }

  function injectRouteSVGs() {
    $$(".hero__route").forEach((el) => {
      el.innerHTML = routeSVG({
        withDot: true,
        path: "M-50,420 C 200,120 480,520 760,260 C 1040,40 1280,420 1500,180",
        dotPath: "M-50,420 C 200,120 480,520 760,260 C 1040,40 1280,420 1500,180",
        viewBox: "0 0 1440 700",
      });
    });

    $$(".page-hero__route").forEach((el) => {
      el.innerHTML = routeSVG({
        withDot: true,
        path: "M-50,160 C 250,40 500,220 800,110 C 1100,10 1300,200 1500,90",
        dotPath: "M-50,160 C 250,40 500,220 800,110 C 1100,10 1300,200 1500,90",
        viewBox: "0 0 1440 320",
      });
    });

    $$(".cta-banner__route").forEach((el) => {
      el.innerHTML = routeSVG({
        withDot: true,
        path: "M-50,140 C 220,260 480,20 760,150 C 1040,280 1280,40 1500,160",
        dotPath: "M-50,140 C 220,260 480,20 760,150 C 1040,280 1280,40 1500,160",
        viewBox: "0 0 1440 280",
      });
    });

    $$(".route-divider").forEach((el) => {
      el.innerHTML = `<svg viewBox="0 0 1440 48" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
        <path class="route-path" d="M0,24 H1440"/>
      </svg>`;
    });
  }

  /* ------------------------------------------------------------------
     Scroll reveal animations — single shared observer
     ------------------------------------------------------------------ */
  let _revealObserver = null;

  function getRevealObserver() {
    if (_revealObserver) return _revealObserver;
    if (!("IntersectionObserver" in window)) return null;
    _revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            _revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" }
    );
    return _revealObserver;
  }

  function setupReveal() {
    const targets = $$(".reveal, .reveal-stagger");
    const observer = getRevealObserver();
    targets.forEach((t) => {
      if (!t.classList.contains("is-visible")) {
        if (observer) {
          observer.observe(t);
        } else {
          t.classList.add("is-visible");
        }
      }
    });
  }

  /* ------------------------------------------------------------------
     Stat counters
     ------------------------------------------------------------------ */
  function renderStats(data) {
    const grid = $("#statsGrid");
    if (!grid || !data) return;
    const stats = getPath(data, "home.stats.items") || [];

    grid.innerHTML = stats.map((s) => `
      <div class="reveal">
        <div class="stat__value" data-target="${s.value}" data-decimal="${s.decimal ? "true" : "false"}" data-suffix="${s.suffix || ""}">
          <span class="stat__num">0</span><span class="stat__suffix">${s.suffix || ""}</span>
        </div>
        <p class="stat__label">${s.label}</p>
      </div>`).join("");

    animateCounters(grid);
    setupReveal();
  }

  function animateCounters(scope) {
    const items = $$(".stat__value", scope);
    if (items.length === 0) return;

    const run = (el) => {
      const target = parseFloat(el.getAttribute("data-target"));
      const isDecimal = el.getAttribute("data-decimal") === "true";
      const numEl = $(".stat__num", el);
      const duration = 1600;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target * eased;
        numEl.textContent = isDecimal ? value.toFixed(1) : Math.round(value).toLocaleString("en-IN");
        if (progress < 1) requestAnimationFrame(tick);
        else numEl.textContent = isDecimal ? target.toFixed(1) : target.toLocaleString("en-IN");
      }
      requestAnimationFrame(tick);
    };

    if (!("IntersectionObserver" in window)) { items.forEach(run); return; }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { run(entry.target); observer.unobserve(entry.target); }
        });
      },
      { threshold: 0.4 }
    );
    items.forEach((el) => observer.observe(el));
  }

  /* ------------------------------------------------------------------
     Services rendering — NO Learn More button
     ------------------------------------------------------------------ */
  function serviceCard(service, withPoints) {
    const points = withPoints
      ? `<ul class="card__points">${service.points.map((p) => `<li>${p}</li>`).join("")}</ul>`
      : "";
    return `
      <article class="card reveal" id="${service.code.toLowerCase()}">
        <div class="card__media">
          <img src="${service.image}" alt="${service.title}" loading="lazy" width="480" height="360">
          <span class="card__tag">${service.code}</span>
        </div>
        <div class="card__body">
          <h3>${service.title}</h3>
          <p>${service.summary}</p>
          ${points}
        </div>
      </article>`;
  }

  function renderServicesPreview(data) {
    const grid = $("#servicesPreviewGrid");
    if (!grid || !data) return;
    const allServices = getPath(data, "services.list") || [];
    const previewCodes = getPath(data, "home.servicesPreview.previewCodes") || [];

    let list;
    if (previewCodes.length > 0) {
      // Show specific services by code in the order specified
      list = previewCodes
        .map((code) => allServices.find((s) => s.code === code))
        .filter(Boolean);
    } else {
      list = allServices.slice(0, 3);
    }

    grid.innerHTML = list.map((s) => serviceCard(s, false)).join("");
    setupReveal();
  }

  function renderServicesFull(data) {
    const grid = $("#servicesGrid");
    if (!grid || !data) return;
    const list = getPath(data, "services.list") || [];
    grid.innerHTML = list.map((s) => serviceCard(s, true)).join("");
    setupReveal();
  }

  function renderProcess(data) {
    const wrap = $("#processSteps");
    if (!wrap || !data) return;
    const steps = getPath(data, "services.process.steps") || [];
    wrap.innerHTML = steps.map((step, i) => `
      <div class="process__step reveal">
        <span class="process__index">${String(i + 1).padStart(2, "0")}</span>
        <h3>${step.title}</h3>
        <p>${step.text}</p>
      </div>`).join("");
    setupReveal();
  }

  /* ------------------------------------------------------------------
     Fleet rendering + filters
     ------------------------------------------------------------------ */
  function fleetCard(v) {
    return `
      <article class="card fleet-card reveal" data-category="${v.category}">
        <div class="card__media">
          <img src="${v.image}" alt="${v.name}" loading="lazy" width="480" height="360">
          <span class="card__tag">${v.code}</span>
        </div>
        <div class="card__body">
          <span class="fleet-card__category">${v.category}</span>
          <h3>${v.name}</h3>
          <div class="fleet-card__meta">
            <span class="fleet-card__capacity">${v.capacity}</span>
          </div>
          <p class="fleet-card__use">${v.useCase}</p>
        </div>
      </article>`;
  }

  function renderFleetFull(data) {
    const grid = $("#fleetGrid");
    const filters = $("#fleetFilters");
    if (!grid || !data) return;
    const list = getPath(data, "fleet.vehicles") || [];
    grid.innerHTML = list.map(fleetCard).join("");

    const categories = ["All", ...new Set(list.map((v) => v.category))];
    if (filters) {
      filters.innerHTML = categories
        .map((c, i) => `<button class="fleet-filter ${i === 0 ? "is-active" : ""}" data-filter="${c}" type="button">${c}</button>`)
        .join("");

      filters.addEventListener("click", (e) => {
        const btn = e.target.closest(".fleet-filter");
        if (!btn) return;
        $$(".fleet-filter", filters).forEach((b) => b.classList.toggle("is-active", b === btn));
        const filter = btn.getAttribute("data-filter");
        $$(".fleet-card", grid).forEach((card) => {
          const match = filter === "All" || card.getAttribute("data-category") === filter;
          card.classList.toggle("is-hidden", !match);
        });
      });
    }
    setupReveal();
  }

  function renderFleetStandards(data) {
    const wrap = $("#fleetStandards");
    if (!wrap || !data) return;
    const items = getPath(data, "fleet.standards.items") || [];
    wrap.innerHTML = items.map((item) => `
      <div class="standard-card reveal">
        <h3>${item.title}</h3>
        <p>${item.text}</p>
      </div>`).join("");
    setupReveal();
  }

  /* ------------------------------------------------------------------
     Testimonials carousel
     ------------------------------------------------------------------ */
  function renderTestimonials(data) {
    const track = $("#testimonialsTrack");
    const dotsWrap = $("#testimonialsDots");
    if (!track || !data) return;

    const items = getPath(data, "home.testimonials.items") || [];
    track.innerHTML = items.map((t) => `
      <div class="testimonial">
        <div class="testimonial__card">
          <span class="testimonial__quote-mark" aria-hidden="true">&ldquo;</span>
          <div>
            <p class="testimonial__quote">${t.quote}</p>
            <div class="testimonial__byline">
              <img class="testimonial__avatar" src="${t.avatar}" alt="" loading="lazy" width="48" height="48">
              <div>
                <div class="testimonial__name">${t.name}</div>
                <div class="testimonial__role">${t.role}</div>
              </div>
            </div>
          </div>
        </div>
      </div>`).join("");

    if (dotsWrap) {
      dotsWrap.innerHTML = items
        .map((_, i) => `<button class="testimonials__dot ${i === 0 ? "is-active" : ""}" data-index="${i}" aria-label="Go to testimonial ${i + 1}"></button>`)
        .join("");
    }

    let index = 0;
    const total = items.length;

    function update() {
      track.style.transform = `translateX(-${index * 100}%)`;
      if (dotsWrap) {
        $$(".testimonials__dot", dotsWrap).forEach((d, i) => d.classList.toggle("is-active", i === index));
      }
    }

    function go(delta) { index = (index + delta + total) % total; update(); }

    const prev = $("#testimonialPrev");
    const next = $("#testimonialNext");
    if (prev) prev.addEventListener("click", () => go(-1));
    if (next) next.addEventListener("click", () => go(1));
    if (dotsWrap) {
      dotsWrap.addEventListener("click", (e) => {
        const dot = e.target.closest(".testimonials__dot");
        if (!dot) return;
        index = parseInt(dot.getAttribute("data-index"), 10);
        update();
      });
    }

    let timer = setInterval(() => go(1), 7000);
    const viewport = $("#testimonialsViewport");
    if (viewport) {
      viewport.addEventListener("mouseenter", () => clearInterval(timer));
      viewport.addEventListener("mouseleave", () => (timer = setInterval(() => go(1), 7000)));
    }
    setupReveal();
  }

  /* ------------------------------------------------------------------
     Contact page: hubs + form
     ------------------------------------------------------------------ */
  function renderHubs(data) {
    const grid = $("#hubsGrid");
    if (!grid || !data) return;
    const items = getPath(data, "contact.hubs.items") || [];
    grid.innerHTML = items.map((h) => `
      <div class="hub-card reveal">
        <h3>${h.city}</h3>
        <p>${h.address}</p>
      </div>`).join("");
    setupReveal();
  }

  function renderContactInfo(data) {
    const wrap = $("#contactInfoItems");
    if (!wrap || !data) return;
    const items = getPath(data, "contact.info.items") || [];
    wrap.innerHTML = items.map((item) => `
      <div class="info-item">
        <div class="info-item__label">${item.label}</div>
        <div class="info-item__value">${item.value}</div>
      </div>`).join("");
  }

  function renderFormOptions(data) {
    const select = $("#loadType");
    if (!select || !data) return;
    const options = getPath(data, "contact.form.fields.loadTypeOptions") || [];
    select.innerHTML =
      `<option value="" disabled selected>Select load type</option>` +
      options.map((o) => `<option value="${o}">${o}</option>`).join("");
  }

  function setupContactForm(data) {
    const form = $("#quoteForm");
    if (!form) return;

    const successMsg = getPath(data, "contact.form.successMessage") || "Thank you. Your request has been received.";
    const errorMsg = getPath(data, "contact.form.errorMessage") || "Please complete all required fields.";
    const messageBox = $("#formMessage");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      let valid = true;

      $$("[required]", form).forEach((field) => {
        const value = field.value.trim();
        let fieldValid = value !== "";
        if (field.type === "email" && value) {
          fieldValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        }
        field.classList.toggle("is-invalid", !fieldValid);
        if (!fieldValid) valid = false;
      });

      if (!valid) {
        if (messageBox) {
          messageBox.classList.remove("is-success");
          messageBox.textContent = errorMsg;
          messageBox.classList.add("is-error");
          messageBox.setAttribute("role", "status");
          messageBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
        return;
      }

      const submitBtn = form.querySelector("[type=submit]");
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Sending…"; }

      try {
        const res = await fetch("https://formspree.io/f/mykalzow", {
          method: "POST",
          headers: { "Accept": "application/json" },
          body: new FormData(form)
        });

        if (messageBox) {
          messageBox.classList.remove("is-success", "is-error");
          messageBox.setAttribute("role", "status");
        }

        if (res.ok) {
          if (messageBox) { messageBox.textContent = successMsg; messageBox.classList.add("is-success"); }
          form.reset();
        } else {
          const body = await res.json().catch(() => ({}));
          if (messageBox) {
            messageBox.textContent = (body && body.error) || "Something went wrong. Please try again or call us directly.";
            messageBox.classList.add("is-error");
          }
        }
      } catch (_) {
        if (messageBox) {
          messageBox.textContent = "Network error — please check your connection and try again.";
          messageBox.classList.add("is-error");
        }
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Send Request"; }
        if (messageBox) messageBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });

    $$("input, select, textarea", form).forEach((field) => {
      field.addEventListener("input", () => field.classList.remove("is-invalid"));
    });
  }

  /* ------------------------------------------------------------------
     Trust strip + about pillars / values / timeline
     ------------------------------------------------------------------ */
  function renderTrustStrip(data) {
    const wrap = $("#trustRow");
    if (!wrap || !data) return;
    const logos = getPath(data, "home.trustStrip.logos") || [];
    const items = logos.map((l) => `<span class="trust__item">${l.name}</span>`).join("");
    wrap.innerHTML = items + items;
  }

  function renderTimeline(data) {
    const wrap = $("#aboutTimeline");
    if (!wrap || !data) return;
    const items = getPath(data, "about.timeline.items") || [];
    wrap.innerHTML = items.map((item) => `
      <div class="timeline__item reveal">
        <div class="timeline__year">${item.year}</div>
        <div class="timeline__text">${item.text}</div>
      </div>`).join("");
    setupReveal();
  }

  function renderPillars(data) {
    const wrap = $("#missionPillars");
    if (!wrap || !data) return;
    const items = getPath(data, "about.mission.pillars") || [];
    wrap.innerHTML = items.map((p) => `
      <div class="pillar reveal">
        <h3>${p.title}</h3>
        <p>${p.text}</p>
      </div>`).join("");
    setupReveal();
  }

  function renderValues(data) {
    const wrap = $("#aboutValues");
    if (!wrap || !data) return;
    const items = getPath(data, "about.values.items") || [];
    wrap.innerHTML = items.map((v) => `
      <div class="value-card reveal">
        <h3>${v.title}</h3>
        <p>${v.text}</p>
      </div>`).join("");
    setupReveal();
  }

  /* ------------------------------------------------------------------
     Team member cards + bio modal (About page)
     ------------------------------------------------------------------ */
  function renderLeadershipTeam(data) {
    const wrap = $("#leadershipTeam");
    if (!wrap || !data) return;
    const members = getPath(data, "about.leadership.members") || [];
    if (members.length === 0) return;

    wrap.innerHTML = members.map((m, i) => `
      <div class="team-card reveal" data-member="${i}" role="button" tabindex="0" aria-label="View bio for ${m.name}">
        <div class="team-card__photo">
          <img src="${m.photo}" alt="${m.name}" loading="lazy" width="200" height="200"
            onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
          <div class="team-card__avatar-placeholder" style="display:none">
            <svg viewBox="0 0 24 24" fill="currentColor" width="64" height="64"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
          </div>
        </div>
        <div class="team-card__info">
          <h3 class="team-card__name">${m.name}</h3>
          <p class="team-card__title">${m.title}</p>
          <span class="team-card__cta">View Bio →</span>
        </div>
      </div>`).join("");

    // Create modal overlay
    if (!$("#teamBioModal")) {
      const modal = document.createElement("div");
      modal.id = "teamBioModal";
      modal.className = "team-modal";
      modal.setAttribute("role", "dialog");
      modal.setAttribute("aria-modal", "true");
      modal.innerHTML = `
        <div class="team-modal__backdrop"></div>
        <div class="team-modal__box">
          <button class="team-modal__close" aria-label="Close bio">&times;</button>
          <div class="team-modal__photo">
            <img id="teamModalPhoto" src="" alt="" width="120" height="120"
              onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
            <div class="team-card__avatar-placeholder team-modal__placeholder" style="display:none">
              <svg viewBox="0 0 24 24" fill="currentColor" width="60" height="60"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
            </div>
          </div>
          <h2 id="teamModalName" class="team-modal__name"></h2>
          <p id="teamModalTitle" class="team-modal__position"></p>
          <p id="teamModalBio" class="team-modal__bio"></p>
        </div>`;
      document.body.appendChild(modal);

      const closeModal = () => {
        modal.classList.remove("is-open");
        document.body.style.overflow = "";
      };

      modal.querySelector(".team-modal__backdrop").addEventListener("click", closeModal);
      modal.querySelector(".team-modal__close").addEventListener("click", closeModal);
      document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
    }

    // Open modal on click/keypress
    wrap.addEventListener("click", (e) => {
      const card = e.target.closest(".team-card");
      if (!card) return;
      const idx = parseInt(card.getAttribute("data-member"), 10);
      const m = members[idx];
      if (!m) return;

      const modal = $("#teamBioModal");
      const photo = modal.querySelector("#teamModalPhoto");
      photo.src = m.photo;
      photo.alt = m.name;
      photo.style.display = "";
      photo.nextElementSibling.style.display = "none";
      modal.querySelector("#teamModalName").textContent = m.name;
      modal.querySelector("#teamModalTitle").textContent = m.title;
      modal.querySelector("#teamModalBio").textContent = m.bio;
      modal.classList.add("is-open");
      document.body.style.overflow = "hidden";
    });

    wrap.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.target.closest(".team-card")?.click();
      }
    });

    setupReveal();
  }

  /* ------------------------------------------------------------------
     Footer
     ------------------------------------------------------------------ */
  function renderFooter(data) {
    if (!data) return;
    const servicesLinks = $("#footerServiceLinks");
    if (servicesLinks) {
      const links = getPath(data, "footer.servicesLinks") || [];
      servicesLinks.innerHTML = links.map((l) => `<li><a href="${l.href}">${l.label}</a></li>`).join("");
    }

    const navLinks = $("#footerNavLinks");
    if (navLinks) {
      const links = getPath(data, "site.nav") || [];
      navLinks.innerHTML = links.map((l) => `<li><a href="${l.href}">${l.label}</a></li>`).join("");
    }
  }

  /* ------------------------------------------------------------------
     WhatsApp FAB — popup with "Phone Call" and "WhatsApp Text" options
     ------------------------------------------------------------------ */
  function setupFABs(data) {
    const wa = document.querySelector(".whatsapp-fab");
    const krishna = document.querySelector(".krishna-float");

    if (!wa) return;

    const waNum = data ? data.site.whatsappNumber : "917357177827";
    const phoneHref = data ? `tel:${data.site.phoneHref || data.site.phone}` : "tel:+917357177827";
    const waMsg = data ? encodeURIComponent(data.site.whatsappMessage) : "";
    const waLink = `https://wa.me/${waNum}?text=${waMsg}`;

    // Inject WhatsApp SVG icon
    if (!wa.querySelector("svg")) {
      wa.innerHTML = `<svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style="width:30px;height:30px;">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.404A9.948 9.948 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.95 7.95 0 0 1-4.246-1.224l-.305-.181-3.14.885.838-3.068-.198-.315A7.95 7.95 0 0 1 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
      </svg>`;
    }

    // Create popup
    const popup = document.createElement("div");
    popup.className = "wa-popup";
    popup.setAttribute("role", "menu");
    popup.innerHTML = `
      <a class="wa-popup__option wa-popup__call" href="${phoneHref}" role="menuitem">
        <span class="wa-popup__icon">📞</span>
        <span>Phone Call</span>
      </a>
      <a class="wa-popup__option wa-popup__chat" href="${waLink}" target="_blank" rel="noopener noreferrer" role="menuitem">
        <span class="wa-popup__icon">💬</span>
        <span>WhatsApp Text</span>
      </a>`;

    // Convert FAB from <a> to <button>-like behaviour
    wa.removeAttribute("href");
    wa.removeAttribute("data-whatsapp-link");
    wa.setAttribute("role", "button");
    wa.setAttribute("aria-haspopup", "true");
    wa.setAttribute("aria-expanded", "false");

    // Wrap in stack
    if (krishna && !document.querySelector(".fab-stack")) {
      const stack = document.createElement("div");
      stack.className = "fab-stack";
      wa.parentNode.insertBefore(stack, wa);
      stack.appendChild(popup);
      stack.appendChild(krishna);
      stack.appendChild(wa);
    } else if (!document.querySelector(".fab-stack")) {
      const stack = document.createElement("div");
      stack.className = "fab-stack";
      wa.parentNode.insertBefore(stack, wa);
      stack.appendChild(popup);
      stack.appendChild(wa);
    }

    // Toggle popup
    wa.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = popup.classList.toggle("is-open");
      wa.setAttribute("aria-expanded", String(isOpen));
    });

    // Close when clicking outside
    document.addEventListener("click", (e) => {
      if (!popup.contains(e.target) && e.target !== wa) {
        popup.classList.remove("is-open");
        wa.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ------------------------------------------------------------------
     Main init
     ------------------------------------------------------------------ */
  async function init() {
    injectRouteSVGs();

    const data = await loadContent();

    setupHeader(data);
    setupFABs(data);

    if (data) {
      applyTextBindings(data);
      renderTrustStrip(data);
      renderStats(data);
      renderServicesPreview(data);
      renderServicesFull(data);
      renderProcess(data);
      renderFleetFull(data);
      renderFleetStandards(data);
      renderTestimonials(data);
      renderHubs(data);
      renderContactInfo(data);
      renderFormOptions(data);
      renderTimeline(data);
      renderPillars(data);
      renderValues(data);
      renderLeadershipTeam(data);
      renderFooter(data);
      setupContactForm(data);
    }

    setupReveal();
  }

  /* ------------------------------------------------------------------
     BFCache fix: re-render when page is restored from browser cache
     (fixes blank page on back navigation)
     ------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", init);

  window.addEventListener("pageshow", (e) => {
    if (e.persisted) {
      // Page restored from back-forward cache — re-run full init
      _revealObserver = null; // reset observer so elements re-animate
      init();
    }
  });

})();
