/* ============================================================
   MARQUEE — genre strip (L3). Loop-scroll at 60px/s, velocity
   skew (MAR-02), glyph pop on reveal (MAR-03), hover/focus
   pause. Reduced motion: static wrapped row (CSS + no loop).
   ============================================================ */

(function () {
  "use strict";

  var M = window.Motion;
  if (typeof SITE === "undefined") { return; }

  var marquee = document.getElementById("marquee");
  var track = document.getElementById("marquee-track");
  if (!marquee || !track) { return; }

  function buildItem(item, duplicate) {
    var node = document.createElement("span");
    node.className = "marquee-item";
    if (duplicate) { node.setAttribute("aria-hidden", "true"); }
    var glyph = document.createElement("span");
    glyph.className = "marquee-glyph";
    glyph.innerHTML = M.glyph(item.glyph);
    node.appendChild(glyph);
    node.appendChild(document.createTextNode(item.label));
    return node;
  }

  /* Content rendered 2× for the seamless wrap; the duplicate is aria-hidden. */
  SITE.marquee.items.forEach(function (item) { track.appendChild(buildItem(item, false)); });
  SITE.marquee.items.forEach(function (item) { track.appendChild(buildItem(item, true)); });

  if (M.isReduced() || !M.hasGsap()) { return; } /* static row; CSS keeps it readable */

  var speed = 60; /* px/s base */
  var boost = 1;
  var boostTarget = 1;
  var x = 0;
  var half = 0;

  function measure() {
    half = track.scrollWidth / 2;
    if (x <= -half) { x += half; }
  }
  measure();
  window.addEventListener("resize", measure);

  var coarse = window.matchMedia("(pointer: coarse)").matches;

  var skewTo = coarse ? null : gsap.quickTo(track, "skewX", { duration: 0.3, ease: "power2.out" });

  /* MAR-02 velocity coupling via ScrollTrigger's velocity signal. */
  ScrollTrigger.create({
    trigger: marquee,
    start: "top bottom",
    end: "bottom top",
    onUpdate: function (self) {
      var v = self.getVelocity();
      boostTarget = Math.min(coarse ? 2 : 4, 1 + Math.abs(v) / 800);
      if (skewTo && !coarse) { skewTo(Math.max(-6, Math.min(6, v / 120))); }
    }
  });

  /* Hover / focus pause (approved improvement; WCAG 2.2 moving-content courtesy). */
  var paused = false;
  function setPaused(p) { paused = p; }
  marquee.addEventListener("mouseenter", function () { setPaused(true); });
  marquee.addEventListener("mouseleave", function () { setPaused(false); });
  marquee.addEventListener("focusin", function () { setPaused(true); });
  marquee.addEventListener("focusout", function () { setPaused(false); });

  var last = performance.now();
  var running = true;
  var visible = true;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
    }, { threshold: 0 }).observe(marquee);
  }
  document.addEventListener("visibilitychange", function () { running = !document.hidden; });

  gsap.ticker.add(function (time, deltaTime) {
    if (!running || !visible) { last = time; return; }
    var dt = Math.min(deltaTime / 1000, 0.05);
    boost += (boostTarget - boost) * 0.08;
    boostTarget += (1 - boostTarget) * 0.03;
    if (!paused) {
      x -= speed * boost * dt;
      if (half > 0 && x <= -half) { x += half; }
      gsap.set(track, { x: x });
    }
    last = time;
  });

  /* MAR-03 glyph-pop on first reveal. */
  ScrollTrigger.create({
    trigger: marquee,
    start: "top 90%",
    once: true,
    onEnter: function () {
      gsap.fromTo(track.querySelectorAll(".marquee-glyph"),
        { scale: 0.6, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(2)", stagger: 0.06 });
    }
  });
})();
