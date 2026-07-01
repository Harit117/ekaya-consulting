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
  var header = document.querySelector(".site-header");
  var onScroll = function () {
    var y = window.scrollY;
    if (header) header.classList.toggle("scrolled", y > 12);
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

  // Simple form handling (front-end demo)
  document.querySelectorAll("form[data-demo]").forEach(function (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var msg = form.querySelector(".form-success");
      if (msg) { msg.classList.add("show"); }
      form.reset();
      if (msg) setTimeout(function () { msg.classList.remove("show"); }, 6000);
    });
  });

  // Services accordion
  var accItems = Array.prototype.slice.call(document.querySelectorAll(".acc-item"));
  if (accItems.length) {
    var setOpen = function (item, open) {
      item.classList.toggle("open", open);
      var head = item.querySelector(".acc-head");
      if (head) head.setAttribute("aria-expanded", open ? "true" : "false");
    };
    accItems.forEach(function (item) {
      var head = item.querySelector(".acc-head");
      if (!head) return;
      head.addEventListener("click", function () {
        var isOpen = item.classList.contains("open");
        accItems.forEach(function (other) { if (other !== item) setOpen(other, false); });
        setOpen(item, !isOpen);
      });
    });

    // Open a specific service from the #hash or the anchor chips
    var openById = function (id, scroll) {
      var target = document.getElementById(id);
      if (!target || !target.classList.contains("acc-item")) return;
      accItems.forEach(function (other) { setOpen(other, other === target); });
      if (scroll) {
        setTimeout(function () { target.scrollIntoView({ behavior: "smooth", block: "start" }); }, 60);
      }
    };
    if (location.hash && location.hash.length > 1) openById(location.hash.slice(1), true);
    document.querySelectorAll('.chips a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (ev) {
        var id = a.getAttribute("href").slice(1);
        if (document.getElementById(id)) {
          ev.preventDefault();
          openById(id, true);
          history.replaceState(null, "", "#" + id);
        }
      });
    });
  }

  // Footer year
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();
})();
