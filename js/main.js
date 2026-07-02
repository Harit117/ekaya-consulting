/* EKAYA CONSULTING — interactions */
(function () {
  "use strict";

  // Mobile nav toggle
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.classList.remove("open");
      });
    });
  }

  // Inject scroll-progress bar + back-to-top button
  var progress = document.createElement("div");
  progress.className = "scroll-progress";
  document.body.appendChild(progress);

  var toTop = document.createElement("button");
  toTop.className = "to-top";
  toTop.setAttribute("aria-label", "Back to top");
  toTop.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 15l-6-6-6 6"/></svg>';
  document.body.appendChild(toTop);
  toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Header shadow + progress + to-top on scroll
  // Hysteresis: collapse only after scrolling past 110px, expand only when
  // back above 60px. The dead-zone prevents rapid toggling and keeps the
  // resize away from the very top, so it never flickers near the top.
  var header = document.querySelector(".site-header");
  var headerCompact = false;
  var onScroll = function () {
    var y = window.scrollY;
    if (header) {
      if (!headerCompact && y > 110) { headerCompact = true; header.classList.add("scrolled"); }
      else if (headerCompact && y < 60) { headerCompact = false; header.classList.remove("scrolled"); }
    }
    var h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    toTop.classList.toggle("show", y > 500);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Reveal on scroll
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  // Animated counters
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var target = parseFloat(el.getAttribute("data-count"));
        var suffix = el.getAttribute("data-suffix") || "";
        var dur = 1400, start = null;
        var step = function (ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var val = Math.floor((0.5 - 0.5 * Math.cos(Math.PI * p)) * target);
          el.textContent = val + suffix;
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = target + suffix;
        };
        requestAnimationFrame(step);
        cio.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  // Form handling — submits to Web3Forms (free, no backend needed).
  // Enquiries are emailed to the address tied to this access key.
  // To activate: paste the Web3Forms access key for sales@ekayaconsulting.com below.
  var WEB3FORMS_KEY = "0f268caa-38d3-4524-a270-6de12735503d";

  document.querySelectorAll("form[data-demo]").forEach(function (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var success = form.querySelector(".form-success");
      var errorEl = form.querySelector(".form-error");
      var btn = form.querySelector('[type="submit"]');
      if (success) success.classList.remove("show");
      if (errorEl) errorEl.classList.remove("show");

      var showError = function (text) {
        if (errorEl) { errorEl.textContent = text; errorEl.classList.add("show"); }
      };

      // Not configured yet — fail honestly instead of faking success.
      if (!WEB3FORMS_KEY || WEB3FORMS_KEY.indexOf("REPLACE_") === 0) {
        showError("This form isn't connected yet. Please email sales@ekayaconsulting.com or call +91 98982 81520.");
        return;
      }

      var data = new FormData(form);
      data.append("access_key", WEB3FORMS_KEY);
      data.append("subject", form.getAttribute("data-subject") || "New Website Enquiry — Ekaya Consulting");
      data.append("from_name", "Ekaya Consulting Website");

      if (btn) { btn.disabled = true; btn.style.opacity = ".7"; }
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: data
      })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (j && j.success) {
            if (success) success.classList.add("show");
            form.reset();
            if (success) setTimeout(function () { success.classList.remove("show"); }, 8000);
          } else {
            showError((j && j.message) ? j.message : "Something went wrong. Please try again or email sales@ekayaconsulting.com.");
          }
        })
        .catch(function () {
          showError("Network error. Please try again or email sales@ekayaconsulting.com.");
        })
        .finally(function () {
          if (btn) { btn.disabled = false; btn.style.opacity = ""; }
        });
    });
  });

  /* ============================================================
     SHARED MODAL
     ============================================================ */
  var modal = document.getElementById("detail-modal");
  var modalContent = modal ? modal.querySelector(".modal-content") : null;
  var lastFocused = null;

  function openModal(node, subIndex) {
    if (!modal || !modalContent) return;
    modalContent.innerHTML = "";
    modalContent.appendChild(node);
    modalContent.scrollTop = 0;
    lastFocused = document.activeElement;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    var closeBtn = modal.querySelector(".modal-close");
    if (closeBtn) closeBtn.focus();
    if (typeof subIndex === "number") scrollToSub(subIndex);
  }

  function scrollToSub(idx) {
    var target = modalContent.querySelector('[data-sub="' + idx + '"]');
    if (!target) return;
    setTimeout(function () {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.classList.add("flash");
      setTimeout(function () { target.classList.remove("flash"); }, 1600);
    }, 260);
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  if (modal) {
    modal.querySelectorAll("[data-close]").forEach(function (el) {
      el.addEventListener("click", closeModal);
    });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && modal.classList.contains("open")) closeModal();
    });
  }

  /* ============================================================
     SERVICE CARDS (services page)
     ============================================================ */
  var svcStore = document.getElementById("svc-store");

  function openService(key, subIndex) {
    if (!svcStore) return false;
    var detail = svcStore.querySelector('.svc-detail[data-key="' + key + '"]');
    if (!detail) return false;
    openModal(detail.cloneNode(true), subIndex);
    return true;
  }

  document.querySelectorAll(".svc-card").forEach(function (card) {
    var key = card.getAttribute("data-key");
    var activate = function (ev) {
      var li = ev.target.closest("li[data-sub]");
      if (li) {
        openService(key, parseInt(li.getAttribute("data-sub"), 10));
      } else {
        openService(key);
      }
    };
    card.addEventListener("click", activate);
    card.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); openService(key); }
    });
  });

  // Service anchor chips
  document.querySelectorAll(".chips a[data-key]").forEach(function (a) {
    a.addEventListener("click", function (ev) {
      var key = a.getAttribute("data-key");
      if (svcStore && svcStore.querySelector('.svc-detail[data-key="' + key + '"]')) {
        ev.preventDefault();
        openService(key);
        history.replaceState(null, "", "#" + key);
      }
    });
  });

  // Open a service from the URL hash (e.g. arriving from footer links)
  if (svcStore && location.hash.length > 1) {
    openService(location.hash.slice(1));
  }

  /* ============================================================
     INDUSTRY SLIDER + detail
     ============================================================ */
  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  var SERVICE_META = {
    talent:    { label: "Talent Solutions", sub: "Recruitment & staffing", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11"/></svg>' },
    workforce: { label: "Workforce Management", sub: "Payroll & compliance", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 12l2 2 4-4"/><path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6z"/></svg>' },
    vendor:    { label: "Vendor Management", sub: "Verified service providers", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/></svg>' },
    facility:  { label: "Integrated Facility Services", sub: "On-site support teams", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M15 9h.01M9 13h.01M15 13h.01M9 17h.01M15 17h.01"/></svg>' },
    bdsaas:    { label: "Business Development", sub: "Client acquisition (BDSaaS)", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/></svg>' },
    sales:     { label: "Sales Process Consulting", sub: "Scalable sales engines", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 7v5l3 2"/><path d="M22 6l-3 3-2-2"/></svg>' },
    advisory:  { label: "Business Advisory & Consulting", sub: "Strategy & performance", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20V10M18 20V4M6 20v-4"/></svg>' }
  };

  var INDUSTRIES = {
    manufacturing:  { name: "Manufacturing", intro: "Skilled and unskilled manpower, compliant payroll and reliable on-site support for plants and production units.", services: ["talent", "workforce", "vendor", "facility", "advisory"], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 20h20M4 20V9l6 4V9l6 4V6l4 2v12"/></svg>' },
    hospitality:    { name: "Hospitality", intro: "Front-of-house talent, housekeeping and pantry teams, and workforce management built for guest-facing operations.", services: ["talent", "facility", "workforce", "vendor"], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 21V8l9-5 9 5v13M9 21v-6h6v6M3 8h18"/></svg>' },
    retail:         { name: "Retail", intro: "Store staffing, seasonal hiring and sales capability to keep footfall converting across every location.", services: ["talent", "workforce", "sales", "bdsaas", "facility"], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 2l-2 5h16l-2-5M4 7v13a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V7M9 12h6"/></svg>' },
    logistics:      { name: "Logistics", intro: "Warehouse and transport manpower, verified vendors and payroll that scales with seasonal demand.", services: ["talent", "vendor", "workforce", "facility"], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M1 3h15v13H1zM16 8h4l3 3v5h-7M5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/></svg>' },
    healthcare:     { name: "Healthcare", intro: "Trained support staff, strict compliance and hygienic, well-run facilities for care environments.", services: ["talent", "facility", "workforce", "advisory"], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 21C6 16 3 12 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 4-3 8-9 13z"/><path d="M12 8v6M9 11h6"/></svg>' },
    fmcg:           { name: "FMCG", intro: "Field sales strength, bulk hiring and business development to drive distribution and growth.", services: ["talent", "sales", "bdsaas", "workforce"], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 2h12l-1 6H7zM7 8l-2 12h14L17 8M9 13h6"/></svg>' },
    it:             { name: "IT & ITES", intro: "Specialist hiring, workforce administration and advisory to scale teams and operations quickly.", services: ["talent", "workforce", "advisory", "bdsaas"], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 21h8M12 18v3"/></svg>' },
    realestate:     { name: "Real Estate", intro: "Facility management, front-office staffing and vendor networks for premium residential and commercial properties.", services: ["facility", "talent", "vendor", "advisory"], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 21V7l8-4v18M11 21V10l8 3v8M3 21h18M7 11h.01M7 15h.01"/></svg>' },
    infrastructure: { name: "Infrastructure", intro: "Project manpower, site support and compliant workforce management for large-scale builds.", services: ["talent", "facility", "vendor", "workforce"], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 20h20M6 20V10M10 20V10M14 20V10M18 20V10M4 10l8-6 8 6"/></svg>' },
    education:      { name: "Education", intro: "Support and administrative staffing, facility upkeep and workforce planning for institutions.", services: ["talent", "facility", "workforce", "advisory"], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M22 10L12 5 2 10l10 5 10-5zM6 12v5c0 1 3 3 6 3s6-2 6-3v-5"/></svg>' }
  };

  function buildIndustry(key) {
    var data = INDUSTRIES[key];
    if (!data) return null;
    var wrap = document.createElement("div");
    var items = data.services.map(function (sk) {
      var m = SERVICE_META[sk];
      if (!m) return "";
      return '<a href="services.html#' + sk + '">' +
        '<span class="isi">' + m.icon + '</span>' +
        '<span class="txt"><strong>' + m.label + '</strong><span>' + m.sub + '</span></span>' +
        '<span class="arr">' + ARROW + '</span></a>';
    }).join("");
    wrap.innerHTML =
      '<div class="ind-detail-body">' +
        '<div class="di">' + data.icon + '</div>' +
        '<h3>' + data.name + '</h3>' +
        '<p class="lead">' + data.intro + '</p>' +
        '<div class="ind-detail-count">Services We Offer</div>' +
        '<div class="ind-svc-list">' + items + '</div>' +
      '</div>';
    return wrap;
  }

  document.querySelectorAll(".ind-card").forEach(function (card) {
    var key = card.getAttribute("data-key");
    var activate = function () {
      var node = buildIndustry(key);
      if (node) openModal(node);
    };
    card.addEventListener("click", activate);
    card.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); activate(); }
    });
  });

  // Slider arrows
  var slider = document.getElementById("ind-slider");
  if (slider) {
    var arrows = document.querySelectorAll(".ind-arrow");
    var step = function () {
      var first = slider.querySelector(".ind-card");
      return first ? first.offsetWidth + 20 : 260;
    };
    arrows.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var dir = parseInt(btn.getAttribute("data-dir"), 10);
        slider.scrollBy({ left: dir * step() * 2, behavior: "smooth" });
      });
    });
    var updateArrows = function () {
      var maxScroll = slider.scrollWidth - slider.clientWidth - 2;
      arrows.forEach(function (btn) {
        var dir = parseInt(btn.getAttribute("data-dir"), 10);
        if (dir < 0) btn.disabled = slider.scrollLeft <= 2;
        else btn.disabled = slider.scrollLeft >= maxScroll;
      });
    };
    updateArrows();
    slider.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
  }

  // Footer year
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();
})();
