/* ============================================================
   GATE — the MIHIN-8 boot sequence (L1). GSAP-free by design:
   CSS keyframes + JS timing. Original branding only; no
   third-party console marks anywhere. Total auto-sequence
   ≤ ~2.9s; the coin click is user-gated. Skippable at any
   moment; never mounts twice per session; never mounts for
   reduced-motion users (main CSS also hard-hides #gate).
   ============================================================ */

(function () {
  "use strict";

  var M = window.Motion;
  var gate = document.getElementById("gate");
  if (!gate || typeof SITE === "undefined") { return; }

  /* Exit conditions checked before anything mounts. */
  var seen = false;
  try { seen = sessionStorage.getItem("mm8_seen") === "1"; } catch (e) {}
  if (seen || M.isReduced()) { gate.parentNode.removeChild(gate); return; }

  var G = SITE.gate;
  var timers = [];
  var finished = false;

  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

  function finish(withFlash) {
    if (finished) { return; }
    finished = true;
    timers.forEach(clearTimeout);
    try { sessionStorage.setItem("mm8_seen", "1"); } catch (e) {}

    function teardown() {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = "";
      if (gate.parentNode) { gate.parentNode.removeChild(gate); }
      /* GATE-07: hero takes over (token burst + letter reveal). */
      window.dispatchEvent(new CustomEvent("gate:done"));
      var heroName = document.getElementById("hero-name");
      if (heroName) { heroName.focus({ preventScroll: true }); }
    }

    if (withFlash) {
      var flash = gate.querySelector(".flash");
      if (flash) {
        flash.style.transition = "transform 0.12s cubic-bezier(0.16, 1, 0.3, 1)";
        flash.style.transform = "scaleY(1)";
        flash.style.opacity = "1";
      }
      setTimeout(function () {
        gate.style.transition = "opacity 0.25s ease-in";
        gate.style.opacity = "0";
        setTimeout(teardown, 260);
      }, 130);
    } else {
      teardown();
    }
  }

  /* ---------- Build the cabinet ---------- */
  var cab = document.createElement("div");
  cab.className = "cab";
  cab.setAttribute("role", "dialog");
  cab.setAttribute("aria-modal", "true");
  cab.setAttribute("aria-label", "Intro");

  cab.innerHTML =
    '<div class="cab-marquee"></div>' +
    '<div class="cab-body">' +
      '<div class="cart-silhouette" aria-hidden="true"></div>' +
      '<div class="crt">' +
        '<pre class="boot" aria-hidden="true"></pre>' +
        '<div class="title-card" aria-hidden="true"></div>' +
        '<div class="press-start" aria-hidden="true"></div>' +
        '<div class="coin" aria-hidden="true"></div>' +
        '<div class="coin-slot" aria-hidden="true"></div>' +
        '<div class="flash" aria-hidden="true"></div>' +
      "</div>" +
      '<div class="cart-silhouette" aria-hidden="true"></div>' +
    "</div>" +
    '<div class="gate-hint"></div>';

  gate.appendChild(cab);

  var skip = document.createElement("button");
  skip.type = "button";
  skip.className = "skip";
  skip.textContent = G.skip + " ▸";
  skip.addEventListener("click", function () { finish(false); });
  gate.appendChild(skip);

  gate.querySelector(".cab-marquee").textContent = G.cabinet;

  var boot = cab.querySelector(".boot");
  var titleCard = cab.querySelector(".title-card");
  var pressStart = cab.querySelector(".press-start");
  var coin = cab.querySelector(".coin");
  var slot = cab.querySelector(".coin-slot");
  var flash = cab.querySelector(".flash");
  var hint = cab.querySelector(".gate-hint");

  titleCard.textContent = G.title;
  pressStart.textContent = G.pressStart;
  hint.textContent = G.insertCoin;

  /* ---------- Sequence (GATE-01…04) ---------- */
  function typeBoot(done) {
    var lines = G.bootLines.slice();
    var li = 0;
    var ci = 0;
    var cursor = document.createElement("span");
    cursor.className = "cursor";

    function tick() {
      if (li >= lines.length) { done(); return; }
      var line = lines[li];
      if (ci < line.length) {
        boot.insertBefore(document.createTextNode(line.charAt(ci)), cursor);
        ci++;
        timers.push(setTimeout(tick, 14));
      } else {
        boot.insertBefore(document.createTextNode("\n"), cursor);
        li++;
        ci = 0;
        timers.push(setTimeout(tick, li >= lines.length ? 0 : 260));
      }
    }
    boot.appendChild(cursor);
    tick();
  }

  gate.hidden = false;
  document.body.style.overflow = "hidden";

  later(function () {
    boot.parentNode.classList.add("wake"); /* GATE-01 screen-wake */
    later(function () {
      typeBoot(function () {
        later(function () {
          titleCard.classList.add("slam"); /* GATE-03 title-slam */
          boot.style.transition = "opacity 0.3s ease";
          boot.style.opacity = "0.25";
          M.ding();
          later(function () {
            pressStart.classList.add("blink", "ready"); /* GATE-04 press-blink */
          }, 120);
        }, 120);
      });
    }, 320);
  }, 30);

  /* ---------- GATE-05/06: coin drop, CRT flash ---------- */
  function dropCoin() {
    if (finished) { return; }
    pressStart.classList.remove("blink", "ready");
    M.coin();

    var drop = cab.querySelector(".crt").getBoundingClientRect().height + 48;
    coin.style.opacity = "1";
    coin.style.transition = "transform 0.3s cubic-bezier(0.55, 0, 1, 0.45)";
    coin.style.transform = "translateY(" + drop + "px)";

    later(function () {
      slot.classList.add("flash");
      later(function () { slot.classList.remove("flash"); }, 160);
      finish(true);
    }, 310);
  }

  function onKey(e) {
    if (e.key === "Escape") { document.removeEventListener("keydown", onKey); finish(false); return; }
    if ((e.key === "Enter" || e.key === " ") && !finished) {
      document.removeEventListener("keydown", onKey);
      dropCoin();
    }
  }
  cab.addEventListener("click", dropCoin);
  pressStart.addEventListener("click", function (e) { e.stopPropagation(); dropCoin(); });
  document.addEventListener("keydown", onKey);

  /* Focus lands on SKIP: blind Enter = skip; focus trapped while mounted. */
  skip.focus({ preventScroll: true });
  gate.addEventListener("keydown", function (e) {
    if (e.key !== "Tab") { return; }
    var focusables = gate.querySelectorAll("button");
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
  });

  /* Failsafe: this module must never keep the site hostage. */
  later(function () { if (!finished) { finish(false); } }, 30000);
})();
