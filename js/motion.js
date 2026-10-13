/* ============================================================
   MOTION — shared utilities for the v2 redesign.
   Timing/easing tokens, the reduced-motion master switch,
   WebAudio synth helpers (gate sounds), icon + glyph helpers,
   theme-param preservation, saveData probe.
   Everything degrades silently: if this file fails, main.js
   still renders all content.
   ============================================================ */

window.Motion = (function () {
  "use strict";

  var reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduced = reducedMq.matches;

  function applyReducedClass() {
    document.documentElement.classList.toggle("reduced-motion", reduced);
  }
  applyReducedClass();
  if (typeof reducedMq.addEventListener === "function") {
    reducedMq.addEventListener("change", function (e) { reduced = e.matches; applyReducedClass(); });
  }

  /* GSAP + ScrollTrigger registration (safe if vendored files fail) */
  var hasGsap = typeof window.gsap !== "undefined";
  var hasST = hasGsap && typeof window.ScrollTrigger !== "undefined";
  if (hasST) { gsap.registerPlugin(ScrollTrigger); }
  if (hasGsap && !reduced) {
    document.documentElement.classList.add("anim");
  }
  if (!hasGsap) {
    document.documentElement.classList.add("no-gsap"); /* activates the CSS fallback path */
  }

  /* §1.5 timing scale + easing vocabulary */
  var T = {
    micro: 0.16,
    reveal: 0.55,
    section: 0.8,
    letterStagger: 0.055,
    tokenStagger: 0.045,
    chipStagger: 0.035
  };

  var E = {
    out: "power2.out",
    pop: "back.out(1.7)",
    pop2: "back.out(2)",
    expo: "expo.out",
    flip: "power3.inOut",
    steps: "steps(1)"
  };

  /* ---------- WebAudio (gate sounds; synthesized, no samples) ---------- */
  var audioCtx = null;

  function safePlay(fn) {
    try {
      if (reduced) { return; }
      if (!audioCtx) {
        var Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) { return; }
        audioCtx = new Ctx();
      }
      if (audioCtx.state !== "running") {
        audioCtx.resume().catch(function () {});
        if (audioCtx.state !== "running") { return; }
      }
      fn(audioCtx);
    } catch (e) { /* audio is never allowed to break the page */ }
  }

  /* GATE-03 ding: triangle arpeggio 660→880Hz, 180ms, gain 0.12.
     Silent on first visit (browser blocks pre-gesture audio) — accepted. */
  function ding() {
    safePlay(function (ctx) {
      var t0 = ctx.currentTime;
      [660, 880].forEach(function (freq, i) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.12, t0 + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + i * 0.09 + 0.18);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t0 + i * 0.09);
        osc.stop(t0 + i * 0.09 + 0.2);
      });
    });
  }

  /* GATE-05 coin: two square blips B5(988) → E6(1319), 80ms each, 60ms apart. */
  function coin() {
    safePlay(function (ctx) {
      var t0 = ctx.currentTime;
      [988, 1319].forEach(function (freq, i) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.value = freq;
        var start = t0 + i * 0.14;
        gain.gain.setValueAtTime(0.15, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.08);
        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.09);
      });
    });
  }

  /* ---------- SVG helpers (sprites: assets/icons/glyphs.svg + ui.svg) ---------- */
  function glyph(name, cls) {
    return '<svg class="' + (cls || "") + '" aria-hidden="true" focusable="false"><use href="assets/icons/glyphs.svg#' + name + '"></use></svg>';
  }

  function icon(name, cls) {
    return '<svg class="' + (cls || "") + '" aria-hidden="true" focusable="false"><use href="assets/icons/ui.svg#' + name + '"></use></svg>';
  }

  /* Stroke draw-in: add .icon-draw, then .drawn on reveal (CSS animates dashoffset). */
  function armIconDraw(container) {
    var svgs = container.querySelectorAll("svg use");
    for (var i = 0; i < svgs.length; i++) {
      var host = svgs[i].closest("svg") || svgs[i].parentElement;
      host.classList.add("icon-draw");
    }
  }

  function drawIcons(container) {
    var svgs = container.querySelectorAll(".icon-draw");
    if (reduced) {
      for (var i = 0; i < svgs.length; i++) { svgs[i].classList.add("drawn"); }
      return;
    }
    for (var j = 0; j < svgs.length; j++) {
      (function (svg, k) {
        setTimeout(function () { svg.classList.add("drawn"); }, k * 60);
      })(svgs[j], j);
    }
  }

  function wiggleIcon(svgEl) {
    if (reduced || !svgEl) { return; }
    svgEl.classList.remove("icon-wiggle");
    void svgEl.offsetWidth; /* restart the steps() animation */
    svgEl.classList.add("icon-wiggle");
  }

  /* ---------- Theme param preservation (B survives full navigations) ---------- */
  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") || "c";
  }

  function hrefWithTheme(url) {
    var t = currentTheme();
    if (t === "c") { return url; }
    return url + (url.indexOf("?") === -1 ? "?" : "&") + "theme=" + t;
  }

  function setTheme(t, persist) {
    document.documentElement.setAttribute("data-theme", t === "b" ? "b" : "c");
    if (persist) {
      try { localStorage.setItem("site-theme", t === "b" ? "b" : "c"); } catch (e) {}
    }
    /* hero shader re-reads its uniforms on this event */
    document.dispatchEvent(new CustomEvent("themechange", { detail: { theme: t === "b" ? "b" : "c" } }));
  }

  /* ---------- Probes ---------- */
  function prefersSaveData() {
    return !!(navigator.connection && navigator.connection.saveData);
  }

  function isReduced() { return reduced; }
  function hasGsapAvailable() { return hasGsap && !reduced; }
  function hasScrollTrigger() { return hasST && !reduced; }

  /* Smooth scroll helper (reduced motion: jump). */
  function scrollToEl(el) {
    if (!el) { return; }
    if (reduced) {
      el.scrollIntoView();
      return;
    }
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return {
    T: T,
    E: E,
    isReduced: isReduced,
    hasGsap: hasGsapAvailable,
    hasScrollTrigger: hasScrollTrigger,
    safePlay: safePlay,
    ding: ding,
    coin: coin,
    glyph: glyph,
    icon: icon,
    armIconDraw: armIconDraw,
    drawIcons: drawIcons,
    wiggleIcon: wiggleIcon,
    currentTheme: currentTheme,
    hrefWithTheme: hrefWithTheme,
    setTheme: setTheme,
    prefersSaveData: prefersSaveData,
    scrollToEl: scrollToEl
  };
})();
