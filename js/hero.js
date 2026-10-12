/* ============================================================
   HERO — four layers (L2): shader backdrop, letter-blur-in
   name, role decode, floating skill tokens. Vanilla WebGL for
   the shader (no three.js needed). All motion is skipped or
   flattened for reduced-motion; content is final-text from
   load regardless (main.js renders it first).
   ============================================================ */

(function () {
  "use strict";

  var M = window.Motion;
  if (typeof SITE === "undefined") { return; }

  var hero = document.querySelector(".hero");
  if (!hero) { return; }

  var animate = M.hasGsap();
  var gateWillRun = !M.isReduced() && !!document.getElementById("gate");
  var started = false;

  /* ---------- HERO-A: living shader backdrop (vanilla WebGL) ---------- */
  function initShader() {
    var canvas = document.getElementById("hero-canvas");
    if (!canvas) { return; }
    var gl = canvas.getContext("webgl", { antialias: false, alpha: true }) ||
             canvas.getContext("experimental-webgl");
    if (!gl) {
      document.documentElement.classList.add("no-webgl");
      return;
    }

    var VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
    var FRAG = [
      "precision mediump float;",
      "uniform vec2 u_res;",
      "uniform float u_time;",
      "uniform vec3 u_c1;",
      "uniform vec3 u_c2;",
      "uniform vec3 u_c3;",
      "float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}",
      "float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.-2.*f);",
      " return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}",
      "float fbm(vec2 p){return 0.6*noise(p)+0.4*noise(p*2.03+7.7);}",
      "void main(){",
      " vec2 uv=gl_FragCoord.xy/u_res;",
      " vec2 q=uv*vec2(u_res.x/u_res.y,1.0);",
      " float t=u_time*0.06;",
      " float w=fbm(q*1.4+vec2(t*0.5,-t*0.3));",
      " vec2 warp=q+vec2(w-0.5,w2(w))*0.35;",
      " float m=fbm(warp*1.8+vec2(-t*0.35,t*0.22));",
      " vec3 col=mix(u_c1,u_c2,smoothstep(0.15,0.75,w));",
      " col=mix(col,u_c3,smoothstep(0.55,0.95,m)*0.85);",
      " col+=(hash(gl_FragCoord.xy)-0.5)*0.02;",
      " gl_FragColor=vec4(col,1.0);",
      "}"
    ].join("\n");
    /* w2 = second fbm sample (declared separately to keep GLSL1 happy) */
    FRAG = FRAG.replace("w2(w)", "fbm(q*1.1+vec2(t*0.27,t*0.41))");

    function compile(type, src) {
      var sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) { return null; }
      return sh;
    }

    var vs = compile(gl.VERTEX_SHADER, VERT);
    var fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { document.documentElement.classList.add("no-webgl"); return; }

    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { document.documentElement.classList.add("no-webgl"); return; }
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var uRes = gl.getUniformLocation(prog, "u_res");
    var uTime = gl.getUniformLocation(prog, "u_time");
    var uC = [
      gl.getUniformLocation(prog, "u_c1"),
      gl.getUniformLocation(prog, "u_c2"),
      gl.getUniformLocation(prog, "u_c3")
    ];

    function hexToRgb(hex) {
      var h = hex.replace("#", "");
      return [
        parseInt(h.substr(0, 2), 16) / 255,
        parseInt(h.substr(2, 2), 16) / 255,
        parseInt(h.substr(4, 2), 16) / 255
      ];
    }

    function readUniforms() {
      var style = getComputedStyle(document.documentElement);
      var names = ["--shader-c1", "--shader-c2", "--shader-c3"];
      for (var i = 0; i < 3; i++) {
        var v = style.getPropertyValue(names[i]).trim();
        if (/^#[0-9a-fA-F]{6}$/.test(v)) { gl.uniform3fv(uC[i], hexToRgb(v)); }
      }
    }
    readUniforms();
    document.addEventListener("themechange", readUniforms);

    var mobile = window.matchMedia("(max-width: 1023px)").matches;
    var scale = mobile ? 0.5 : 0.6;
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5) * scale;

    function resize() {
      var w = Math.max(1, Math.floor(hero.clientWidth * dpr));
      var h = Math.max(1, Math.floor(hero.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    }
    resize();
    window.addEventListener("resize", resize);

    var visible = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
      }, { threshold: 0.02 }).observe(hero);
    }
    document.addEventListener("visibilitychange", function () { visible = !document.hidden && visible; });

    var start = performance.now();
    function frame(now) {
      if (visible && !document.hidden) {
        resize();
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform1f(uTime, (now - start) / 1000);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      if (!M.isReduced()) { requestAnimationFrame(frame); }
    }
    /* Reduced motion: exactly one frame, then stop. */
    requestAnimationFrame(frame);
  }

  try { initShader(); } catch (e) { document.documentElement.classList.add("no-webgl"); }

  /* ---------- HERO-B/C/D/I: name, star, decode, badge ---------- */
  function runIntro() {
    if (started) { return; }
    started = true;

    var nameEl = document.getElementById("hero-name");
    var role = document.getElementById("hero-role");
    var badge = document.getElementById("hero-badge");
    if (!nameEl) { return; }

    if (!animate) { return; } /* main.js already rendered final text */

    /* Pixel star behind the name (decorative). */
    var center = nameEl.parentElement;
    if (center && !center.querySelector(".hero-star")) {
      var star = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      star.setAttribute("class", "hero-star");
      star.setAttribute("viewBox", "0 0 100 100");
      star.setAttribute("aria-hidden", "true");
      star.innerHTML = '<path d="M50 0 L58 42 L100 50 L58 58 L50 100 L42 58 L0 50 L42 42 Z" fill="currentColor"/>';
      star.style.color = "var(--accent)";
      center.insertBefore(star, nameEl);
      gsap.to(star, { rotation: 360, duration: 24, ease: "none", repeat: -1 });
      gsap.to(star, { scale: 1.04, duration: 6, yoyo: true, repeat: -1, ease: "sine.inOut" });
    }

    /* HERO-B letter-blur-in (blur sanctioned only here). */
    var text = nameEl.textContent;
    nameEl.setAttribute("aria-label", text);
    nameEl.textContent = "";
    var glyphs = [];
    for (var i = 0; i < text.length; i++) {
      var span = document.createElement("span");
      span.className = "glyph";
      span.setAttribute("aria-hidden", "true");
      span.textContent = text.charAt(i) === " " ? "\u00A0" : text.charAt(i);
      nameEl.appendChild(span);
      glyphs.push(span);
    }

    var tl = gsap.timeline();
    if (badge) {
      tl.fromTo(badge, { y: -16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "back.out(1.7)" }, 0);
    }
    tl.fromTo(glyphs,
      { opacity: 0, y: 28, scale: 1.06, filter: "blur(12px)" },
      { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.7, ease: "power3.out",
        stagger: M.T.letterStagger,
        onStart: null }, 0.05);

    /* HERO-D role decode: settle left→right over ~900ms. */
    if (role) {
      var finalText = role.getAttribute("aria-label") || role.textContent;
      var glyphSet = "!<>-_\\/[]{}—=+*^?#";
      var revealed = 0;
      role.innerHTML = "";
      var visible = document.createElement("span");
      visible.setAttribute("aria-hidden", "true");
      visible.textContent = finalText;
      role.appendChild(visible);
      if (!M.isReduced()) {
        var cycles = Math.ceil(900 / 18);
        var c = 0;
        var timer = setInterval(function () {
          c++;
          revealed = Math.floor((c / cycles) * finalText.length);
          var out = "";
          for (var k = 0; k < finalText.length; k++) {
            out += k < revealed ? finalText.charAt(k)
              : finalText.charAt(k) === " " ? " "
              : glyphSet.charAt(Math.floor(Math.random() * glyphSet.length));
          }
          visible.textContent = out;
          if (c >= cycles) { clearInterval(timer); visible.textContent = finalText; }
        }, 18);
      }
    }

    startTokens();
  }

  /* ---------- HERO-F/G/H + GATE-07: tokens ---------- */
  function startTokens() {
    if (!animate) { return; }
    var tokens = Array.prototype.slice.call(document.querySelectorAll(".token"));
    if (!tokens.length) { return; }

    if (gateWillRun && !started) {
      gsap.set(tokens, { opacity: 0 });
    }

    function place() {
      if (gateWillRun) {
        /* GATE-07 token-burst: from viewport center to their slots. */
        var cx = window.innerWidth / 2;
        var cy = window.innerHeight / 2;
        tokens.forEach(function (node) {
          var r = node.getBoundingClientRect();
          var dx = cx - (r.left + r.width / 2);
          var dy = cy - (r.top + r.height / 2);
          gsap.fromTo(node,
            { x: dx, y: dy, opacity: 0, scale: 0.6 },
            { x: 0, y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.6)", clearProps: "transform" });
        });
      }
      /* HERO-F float: gentle sine loops. */
      if (!window.matchMedia("(max-width: 1023px)").matches) {
        tokens.forEach(function (node) {
          gsap.to(node, {
            y: "+=8",
            duration: 6 + Math.random() * 3,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
          });
        });
      }
    }

    if (gateWillRun) { setTimeout(place, 50); } else { place(); }

    /* HERO-G parallax (desktop only) + HERO-H pop. */
    if (!window.matchMedia("(max-width: 1023px)").matches) {
      var setters = tokens.map(function (node) {
        var depth = parseFloat(node.getAttribute("data-depth")) || 0.5;
        return {
          x: gsap.quickTo(node, "x", { duration: 0.4, ease: "power2.out" }),
          y: gsap.quickTo(node, "y", { duration: 0.4, ease: "power2.out" }),
          depth: depth
        };
      });
      hero.addEventListener("pointermove", function (e) {
        var nx = (e.clientX / window.innerWidth - 0.5) * 2;
        var ny = (e.clientY / window.innerHeight - 0.5) * 2;
        setters.forEach(function (s) {
          s.x(-nx * 26 * s.depth);
          s.y(-ny * 26 * s.depth);
        });
      });
    }

    tokens.forEach(function (node) {
      node.addEventListener("mouseenter", function () {
        gsap.to(node, { scale: 1.12, rotation: (Math.random() > 0.5 ? 3 : -3), duration: 0.18, ease: "back.out(2)" });
      });
      node.addEventListener("mouseleave", function () {
        gsap.to(node, { scale: 1, rotation: 0, duration: 0.25, ease: "power2.out" });
      });
    });
  }

  /* Choreography: if the gate ran, the hero starts when it finishes;
     otherwise the intro plays on load. */
  if (gateWillRun) {
    window.addEventListener("gate:done", runIntro, { once: true });
  } else {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", runIntro, { once: true });
    } else {
      runIntro();
    }
  }
})();
