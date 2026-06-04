/* ============================================================
   BS DETAILING — interactions
   ============================================================ */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- sticky header state ---- */
  var header = document.getElementById("siteHeader");
  var mnav;
  function onScroll() {
    if (window.scrollY > 20) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
    if (mnav) mnav.style.top = Math.round(header.getBoundingClientRect().bottom) + "px";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- mobile nav ---- */
  var burger = document.getElementById("burger");
  mnav = document.getElementById("mobileNav");
  function closeNav() {
    burger.classList.remove("open");
    mnav.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
  }
  burger.addEventListener("click", function () {
    var open = burger.classList.toggle("open");
    mnav.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
  });
  mnav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", closeNav);
  });

  /* ---- reveal on scroll ---- */
  var revEls = document.querySelectorAll("[data-reveal]");
  function revealNow(el) {
    if (el.classList.contains("in")) return;
    var delay = 0;
    var sibs = el.parentElement ? el.parentElement.querySelectorAll(":scope > [data-reveal]") : [];
    sibs.forEach(function (s, i) { if (s === el) delay = i * 70; });
    el.style.transitionDelay = Math.min(delay, 420) + "ms";
    el.classList.add("in");
  }
  if ("IntersectionObserver" in window && !reduce) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { revealNow(e.target); ro.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revEls.forEach(function (el) { ro.observe(el); });
    // safety net: if observers never fire (some embedded contexts), reveal anyway
    setTimeout(function () {
      revEls.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight + 200) revealNow(el);
      });
    }, 1400);
  } else {
    revEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- hero spec readout fill ---- */
  var heroVis = document.getElementById("heroVisual");
  if (heroVis) {
    if (reduce) heroVis.classList.add("in");
    else {
      var hvo = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { heroVis.classList.add("in"); hvo.disconnect(); } });
      }, { threshold: 0.3 });
      hvo.observe(heroVis);
      setTimeout(function () { heroVis.classList.add("in"); }, 1400);
    }
  }

  /* ---- count-up stats ---- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var valEl = el.querySelector(".val");
    if (reduce) { valEl.textContent = target; return; }
    var dur = 1500, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      valEl.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
      else valEl.textContent = target;
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll("[data-count]");
  var counted = new WeakSet();
  function runCount(el) { if (counted.has(el)) return; counted.add(el); countUp(el); }
  if ("IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { runCount(e.target); co.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { co.observe(c); });
    setTimeout(function () {
      counters.forEach(function (c) {
        var r = c.getBoundingClientRect();
        if (r.top < window.innerHeight) runCount(c);
      });
    }, 1600);
  } else {
    counters.forEach(runCount);
  }

  /* ---- process draw-on-scroll ---- */
  var proc = document.getElementById("proc");
  if (proc) {
    if (reduce) proc.classList.add("in");
    else {
      var po = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { proc.classList.add("in"); po.disconnect(); } });
      }, { threshold: 0.3 });
      po.observe(proc);
      setTimeout(function () { proc.classList.add("in"); }, 1600);
    }
  }

  /* ---- before / after sliders ---- */
  document.querySelectorAll("[data-ba]").forEach(function (ba) {
    var dragging = false;
    function setPos(clientX) {
      var r = ba.getBoundingClientRect();
      var p = ((clientX - r.left) / r.width) * 100;
      p = Math.max(2, Math.min(98, p));
      ba.style.setProperty("--pos", p + "%");
    }
    function down(e) {
      dragging = true;
      ba.setPointerCapture && e.pointerId != null && ba.setPointerCapture(e.pointerId);
      setPos(e.clientX != null ? e.clientX : e.touches[0].clientX);
    }
    function move(e) {
      if (!dragging) return;
      var x = e.clientX != null ? e.clientX : (e.touches && e.touches[0].clientX);
      if (x != null) setPos(x);
    }
    function up() { dragging = false; }
    ba.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", up);
    // hover-to-scrub on desktop (subtle)
    ba.addEventListener("pointermove", function (e) {
      if (!dragging && e.pointerType === "mouse") setPos(e.clientX);
    });
  });

  /* ---- magnetic buttons ---- */
  if (!reduce && window.matchMedia("(pointer:fine)").matches) {
    document.querySelectorAll("[data-magnetic]").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var mx = e.clientX - r.left - r.width / 2;
        var my = e.clientY - r.top - r.height / 2;
        btn.style.transform = "translate(" + mx * 0.18 + "px," + my * 0.22 + "px)";
      });
      btn.addEventListener("pointerleave", function () {
        btn.style.transform = "";
      });
    });
  }

  /* ---- custom crosshair cursor ---- */
  var cursor = document.querySelector(".cursor");
  if (cursor && window.matchMedia("(pointer:fine)").matches && !reduce) {
    var cx = 0, cy = 0, tx = 0, ty = 0, raf = null;
    cursor.style.opacity = "0";
    window.addEventListener("pointermove", function (e) {
      tx = e.clientX; ty = e.clientY;
      cursor.style.opacity = "1";
      if (!raf) raf = requestAnimationFrame(loop);
    });
    document.addEventListener("pointerleave", function () { cursor.style.opacity = "0"; });
    function loop() {
      cx += (tx - cx) * 0.25; cy += (ty - cy) * 0.25;
      cursor.style.transform = "translate(" + cx + "px," + cy + "px)";
      if (Math.abs(tx - cx) > 0.4 || Math.abs(ty - cy) > 0.4) raf = requestAnimationFrame(loop);
      else raf = null;
    }
  } else if (cursor) {
    cursor.style.display = "none";
  }

  /* ---- booking form -> whatsapp ---- */
  var form = document.getElementById("bookingForm");
  if (form) {
    var WHATSAPP = "38765380444";
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ime = (form.ime.value || "").trim();
      var vozilo = (form.vozilo.value || "").trim();
      var usluga = form.usluga.value;
      var poruka = (form.poruka.value || "").trim();
      var txt =
        "Upit — BS Detailing%0A" +
        "Ime: " + encodeURIComponent(ime) + "%0A" +
        "Vozilo: " + encodeURIComponent(vozilo) + "%0A" +
        "Usluga: " + encodeURIComponent(usluga) +
        (poruka ? "%0APoruka: " + encodeURIComponent(poruka) : "");
      window.open("https://wa.me/" + WHATSAPP + "?text=" + txt, "_blank");
    });
  }

  /* ---- active nav link highlight ---- */
  var sections = document.querySelectorAll("main section[id]");
  var navLinks = document.querySelectorAll(".nav a");
  if ("IntersectionObserver" in window) {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          var id = e.target.id;
          navLinks.forEach(function (a) {
            a.style.color = a.getAttribute("href") === "#" + id ? "var(--text)" : "";
          });
        }
      });
    }, { threshold: 0.4 });
    sections.forEach(function (s) { so.observe(s); });
  }
})();
