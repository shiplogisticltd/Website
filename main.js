/* ==========================================================================
   MARG LOGISTICS — main.js
   Vanilla JS only. Handles:
   - content.json loading & dynamic text/render
   - header scroll state + mobile nav
   - scroll-reveal animations (IntersectionObserver)
   - animated stat counters
   - testimonials carousel
   - fleet filters
   - coverage / network map rendering
   - contact form validation (client-side only)
   - WhatsApp floating button
   - decorative "route line" SVG injection
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------
     Utilities
     ------------------------------------------------------------------ */
  const $ = (sel, scope = document) => scope.querySelector(sel);
  const $$ = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

  function getPath(obj, path) {
    return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
  }

  function currentPage() {
    const file = location.pathname.split("/").pop() || "index.html";
    return file;
  }

  /* ------------------------------------------------------------------
     Content loader
     ------------------------------------------------------------------ */
  async function loadContent() {
    try {
      const res = await fetch("content.json", { cache: "no-store" });
      if (!res.ok) throw new Error("content.json not found");
      return await res.json();
    } catch (err) {
      console.warn("MARG: could not load content.json — static fallback content will remain.", err);
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

    // Attribute bindings: data-content-attr="attrName:path.to.value"
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
      const onScroll = () => {
        header.classList.toggle("is-scrolled", window.scrollY > 12);
      };
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
    }

    // Mark active nav link
    const page = currentPage();
    $$(".nav__link").forEach((link) => {
      const href = link.getAttribute("href");
      if (href === page || (page === "" && href === "index.html")) {
        link.setAttribute("aria-current", "page");
      }
    });

    // WhatsApp CTA hrefs (header buttons, if any)
    if (data) {
      $$("[data-whatsapp-link]").forEach((el) => {
        el.setAttribute(
          "href",
          `https://wa.me/${data.site.whatsappNumber}?text=${encodeURIComponent(data.site.whatsappMessage)}`
        );
      });
    }
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
     Scroll reveal animations
     ------------------------------------------------------------------ */
  function setupReveal() {
    const targets = $$(".reveal, .reveal-stagger");
    if (!("IntersectionObserver" in window) || targets.length === 0) {
      targets.forEach((t) => t.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    targets.forEach((t) => observer.observe(t));
  }

  /* ------------------------------------------------------------------
     Stat counters
     ------------------------------------------------------------------ */
  function renderStats(data) {
    const grid = $("#statsGrid");
    if (!grid || !data) return;
    const stats = getPath(data, "home.stats.items") || [];

    grid.innerHTML = stats
      .map(
        (s) => `
        <div class="reveal">
          <div class="stat__value" data-target="${s.value}" data-decimal="${s.decimal ? "true" : "false"}" data-suffix="${s.suffix || ""}">
            <span class="stat__num">0</span><span class="stat__suffix">${s.suffix || ""}</span>
          </div>
          <p class="stat__label">${s.label}</p>
        </div>`
      )
      .join("");

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
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const value = target * eased;
        numEl.textContent = isDecimal ? value.toFixed(1) : Math.round(value).toLocaleString("en-IN");
        if (progress < 1) requestAnimationFrame(tick);
        else numEl.textContent = isDecimal ? target.toFixed(1) : target.toLocaleString("en-IN");
      }
      requestAnimationFrame(tick);
    };

    if (!("IntersectionObserver" in window)) {
      items.forEach(run);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            run(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    items.forEach((el) => observer.observe(el));
  }

  /* ------------------------------------------------------------------
     Services rendering (home preview + services page full grid)
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
          <a class="card__link" href="services.html#${service.code.toLowerCase()}">
            Learn more
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
          </a>
        </div>
      </article>`;
  }

  function renderServicesPreview(data) {
    const grid = $("#servicesPreviewGrid");
    if (!grid || !data) return;
    const list = (getPath(data, "services.list") || []).slice(0, 3);
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
    wrap.innerHTML = steps
      .map(
        (step, i) => `
        <div class="process__step reveal">
          <span class="process__index">${String(i + 1).padStart(2, "0")}</span>
          <h3>${step.title}</h3>
          <p>${step.text}</p>
        </div>`
      )
      .join("");
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

  function renderFleetPreview(data) {
    const grid = $("#fleetPreviewGrid");
    if (!grid || !data) return;
    const list = (getPath(data, "fleet.vehicles") || []).slice(0, 3);
    grid.innerHTML = list.map(fleetCard).join("");
    setupReveal();
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
        .map(
          (c, i) =>
            `<button class="fleet-filter ${i === 0 ? "is-active" : ""}" data-filter="${c}" type="button">${c}</button>`
        )
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
    wrap.innerHTML = items
      .map(
        (item) => `
        <div class="standard-card reveal">
          <h3>${item.title}</h3>
          <p>${item.text}</p>
        </div>`
      )
      .join("");
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
    track.innerHTML = items
      .map(
        (t) => `
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
        </div>`
      )
      .join("");

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

    function go(delta) {
      index = (index + delta + total) % total;
      update();
    }

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

    // Auto-rotate
    let timer = setInterval(() => go(1), 7000);
    const viewport = $("#testimonialsViewport");
    if (viewport) {
      viewport.addEventListener("mouseenter", () => clearInterval(timer));
      viewport.addEventListener("mouseleave", () => (timer = setInterval(() => go(1), 7000)));
    }

    setupReveal();
  }

  /* ------------------------------------------------------------------
     Contact page: hubs list + form validation
     ------------------------------------------------------------------ */
  function renderHubs(data) {
    const grid = $("#hubsGrid");
    if (!grid || !data) return;
    const items = getPath(data, "contact.hubs.items") || [];
    grid.innerHTML = items
      .map(
        (h) => `
        <div class="hub-card reveal">
          <h3>${h.city}</h3>
          <p>${h.address}</p>
        </div>`
      )
      .join("");
    setupReveal();
  }

  function renderContactInfo(data) {
    const wrap = $("#contactInfoItems");
    if (!wrap || !data) return;
    const items = getPath(data, "contact.info.items") || [];
    wrap.innerHTML = items
      .map(
        (item) => `
        <div class="info-item">
          <div class="info-item__label">${item.label}</div>
          <div class="info-item__value">${item.value}</div>
        </div>`
      )
      .join("");
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

      // Submit to Formspree
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
          if (messageBox) {
            messageBox.textContent = successMsg;
            messageBox.classList.add("is-success");
          }
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

    // Live-clear invalid state on input
    $$("input, select, textarea", form).forEach((field) => {
      field.addEventListener("input", () => field.classList.remove("is-invalid"));
    });
  }

  /* ------------------------------------------------------------------
     Trust strip + about timeline / values / pillars
     ------------------------------------------------------------------ */
  function renderTrustStrip(data) {
    const wrap = $("#trustRow");
    if (!wrap || !data) return;
    const logos = getPath(data, "home.trustStrip.logos") || [];
    const items = logos.map((l) => `<span class="trust__item">${l.name}</span>`).join("");
    // Duplicate items for seamless infinite marquee (CSS moves -50%)
    wrap.innerHTML = items + items;
  }

  function renderTimeline(data) {
    const wrap = $("#aboutTimeline");
    if (!wrap || !data) return;
    const items = getPath(data, "about.timeline.items") || [];
    wrap.innerHTML = items
      .map(
        (item) => `
        <div class="timeline__item reveal">
          <div class="timeline__year">${item.year}</div>
          <div class="timeline__text">${item.text}</div>
        </div>`
      )
      .join("");
    setupReveal();
  }

  function renderPillars(data) {
    const wrap = $("#missionPillars");
    if (!wrap || !data) return;
    const items = getPath(data, "about.mission.pillars") || [];
    wrap.innerHTML = items
      .map(
        (p) => `
        <div class="pillar reveal">
          <h3>${p.title}</h3>
          <p>${p.text}</p>
        </div>`
      )
      .join("");
    setupReveal();
  }

  function renderValues(data) {
    const wrap = $("#aboutValues");
    if (!wrap || !data) return;
    const items = getPath(data, "about.values.items") || [];
    wrap.innerHTML = items
      .map(
        (v) => `
        <div class="value-card reveal">
          <h3>${v.title}</h3>
          <p>${v.text}</p>
        </div>`
      )
      .join("");
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
     WhatsApp FAB — inject icon + wrap with Krishna in .fab-stack
     ------------------------------------------------------------------ */
  function setupFABs() {
    const wa = document.querySelector(".whatsapp-fab");
    const krishna = document.querySelector(".krishna-float");

    // Inject WhatsApp SVG icon if not already present
    if (wa && !wa.querySelector("svg")) {
      wa.innerHTML = `<svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style="width:30px;height:30px;">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.404A9.948 9.948 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.95 7.95 0 0 1-4.246-1.224l-.305-.181-3.14.885.838-3.068-.198-.315A7.95 7.95 0 0 1 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
      </svg>`;
    }

    // Wrap both FABs in a shared pill stack
    if (wa && krishna && !document.querySelector(".fab-stack")) {
      const stack = document.createElement("div");
      stack.className = "fab-stack";
      wa.parentNode.insertBefore(stack, wa);
      stack.appendChild(krishna);
      stack.appendChild(wa);
    }
  }

  /* ------------------------------------------------------------------
     Init
     ------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", async () => {
    injectRouteSVGs();
    setupFABs();

    const data = await loadContent();

    setupHeader(data);

    if (data) {
      applyTextBindings(data);
      renderTrustStrip(data);
      renderStats(data);
      renderServicesPreview(data);
      renderServicesFull(data);
      renderProcess(data);
      renderFleetPreview(data);
      renderFleetFull(data);
      renderFleetStandards(data);
      renderTestimonials(data);
      renderHubs(data);
      renderContactInfo(data);
      renderFormOptions(data);
      renderTimeline(data);
      renderPillars(data);
      renderValues(data);
      renderFooter(data);
      setupContactForm(data);
    }

    setupReveal();
  });
})();
