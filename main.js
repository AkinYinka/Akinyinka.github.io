/* ============================================================
   Yinka Akinbobola — Portfolio interactions
   ============================================================ */

(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof gsap !== "undefined";
  var preloaderEl = document.getElementById("preloader");

  // If GSAP failed to load, keep everything visible (html stays .no-js)
  // and just remove the preloader.
  if (!hasGsap) {
    if (preloaderEl) preloaderEl.style.display = "none";
    return;
  }

  document.documentElement.classList.remove("no-js");
  document.documentElement.classList.add("js");

  if (typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ----------------------------------------------------------
     Smooth scroll (Lenis) — optional enhancement
     ---------------------------------------------------------- */
  var lenis = null;
  if (typeof Lenis !== "undefined" && !reducedMotion) {
    lenis = new Lenis({ lerp: 0.12 });
    document.documentElement.classList.add("lenis");
    lenis.on("scroll", function () {
      if (typeof ScrollTrigger !== "undefined") ScrollTrigger.update();
    });
    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var target = document.querySelector(a.getAttribute("href"));
        if (target) {
          e.preventDefault();
          lenis.scrollTo(target, { offset: 0 });
        }
      });
    });
  }

  /* ----------------------------------------------------------
     Fit display lines to container width (justified stack)
     ---------------------------------------------------------- */
  function fitLines() {
    document.querySelectorAll(".hero-title, .contact-title").forEach(function (title) {
      var avail = title.clientWidth;
      if (!avail) return;
      title.querySelectorAll(".line-inner").forEach(function (el) {
        el.style.fontSize = "100px";
        var w = el.getBoundingClientRect().width;
        if (w > 0) {
          el.style.fontSize = Math.min(98.5 * (avail / w), 300) + "px";
        }
      });
    });
    if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fitLines);
  }
  fitLines();
  var fitTimer;
  window.addEventListener("resize", function () {
    clearTimeout(fitTimer);
    fitTimer = setTimeout(fitLines, 150);
  });

  /* ----------------------------------------------------------
     Preloader + hero intro
     ---------------------------------------------------------- */
  var countEl = document.getElementById("preloader-count");
  var counter = { value: 0 };

  function heroIntro() {
    var tl = gsap.timeline();
    if (document.querySelector(".hero-window")) {
      tl.to(".hero-window", {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.0,
        ease: "power3.out",
      });
    }
    tl.to(".hero-title .line-inner", {
      y: 0,
      duration: 1.1,
      ease: "power4.out",
      stagger: 0.12,
    }, "-=0.45");
    tl.to("[data-hero-fade]", {
      opacity: 1,
      duration: 0.9,
      ease: "power2.out",
      stagger: 0.15,
    }, "-=0.5");
    return tl;
  }

  if (preloaderEl) {
    var introTl = gsap.timeline();
    introTl.to(counter, {
      value: 100,
      duration: reducedMotion ? 0.01 : 1.4,
      ease: "power2.inOut",
      onUpdate: function () {
        if (countEl) countEl.textContent = String(Math.round(counter.value)).padStart(2, "0");
      },
    });
    introTl.to(preloaderEl, {
      yPercent: -100,
      duration: reducedMotion ? 0.01 : 0.8,
      ease: "power4.inOut",
      onComplete: function () {
        if (preloaderEl) preloaderEl.style.display = "none";
      },
    });
    introTl.add(heroIntro(), "-=0.35");
  } else {
    // Case pages have no preloader — play the hero intro immediately.
    heroIntro();
  }

  // Respect reduced motion: stop the hero video's ambient loop.
  var heroVideo = document.querySelector(".hero-video");
  if (heroVideo && reducedMotion) {
    heroVideo.removeAttribute("autoplay");
    heroVideo.pause();
  }

  // Safety net: never trap the user behind the preloader.
  setTimeout(function () {
    if (preloaderEl && preloaderEl.style.display !== "none") {
      preloaderEl.style.display = "none";
      gsap.set(".hero-title .line-inner", { y: 0 });
      gsap.set("[data-hero-fade]", { opacity: 1 });
    }
  }, 5000);

  /* ----------------------------------------------------------
     Reading progress (case pages)
     ---------------------------------------------------------- */
  var progFill = document.querySelector(".read-progress-fill");
  if (progFill) {
    var updateProg = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      progFill.style.transform = "scaleX(" + p + ")";
    };
    window.addEventListener("scroll", updateProg, { passive: true });
    if (lenis) lenis.on("scroll", updateProg);
    updateProg();
  }

  /* ----------------------------------------------------------
     Rotating hero roles
     ---------------------------------------------------------- */
  var roles = gsap.utils.toArray(".hero-role");
  if (roles.length > 1 && !reducedMotion) {
    var current = 0;
    gsap.set(roles, { autoAlpha: 0, y: 14 });
    gsap.set(roles[0], { autoAlpha: 1, y: 0 });
    roles.forEach(function (r) { r.classList.remove("is-active"); });
    roles[0].classList.add("is-active");

    setInterval(function () {
      var next = (current + 1) % roles.length;
      gsap.to(roles[current], { autoAlpha: 0, y: -14, duration: 0.5, ease: "power2.in" });
      gsap.fromTo(roles[next],
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.35 });
      current = next;
    }, 4000);
  }

  /* ----------------------------------------------------------
     Scroll reveals
     ---------------------------------------------------------- */
  if (typeof ScrollTrigger !== "undefined") {
    gsap.utils.toArray("[data-reveal]").forEach(function (el) {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    });

    // About statement — word-by-word reveal
    var statement = document.getElementById("about-statement");
    if (statement) {
      var words = statement.textContent.trim().split(/\s+/);
      statement.innerHTML = words
        .map(function (w) {
          return '<span class="word"><span>' + w + "</span></span>";
        })
        .join(" ");
      gsap.to(statement.querySelectorAll(".word > span"), {
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.02,
        scrollTrigger: { trigger: statement, start: "top 80%", once: true },
      });
    }

    // Stat counters
    gsap.utils.toArray(".stat-num").forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      var obj = { value: 0 };
      gsap.to(obj, {
        value: target,
        duration: 1.6,
        ease: "power2.out",
        onUpdate: function () {
          el.textContent = Math.round(obj.value);
        },
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });
    });

    // Contact title lines
    gsap.utils.toArray("[data-contact-line]").forEach(function (el, i) {
      gsap.to(el, {
        y: 0,
        duration: 1,
        ease: "power4.out",
        delay: i * 0.1,
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });
    });

    /* --------------------------------------------------------
       Process — pinned horizontal scroll (desktop only)
       -------------------------------------------------------- */
    var mm = gsap.matchMedia();
    mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", function () {
      var track = document.getElementById("process-track");
      var fill = document.getElementById("process-bar-fill");
      if (!track) return;

      var getDistance = function () {
        return Math.max(track.scrollWidth - window.innerWidth + 120, 0);
      };

      var tween = gsap.to(track, {
        x: function () { return -getDistance(); },
        ease: "none",
        scrollTrigger: {
          trigger: ".process",
          start: "top top",
          end: function () { return "+=" + getDistance(); },
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: function (self) {
            if (fill) fill.style.transform = "scaleX(" + self.progress + ")";
          },
        },
      });

      return function () {
        tween.scrollTrigger && tween.scrollTrigger.kill();
        tween.kill();
        gsap.set(track, { x: 0 });
      };
    });
  } else {
    gsap.set("[data-reveal], [data-contact-line]", { opacity: 1, y: 0 });
  }

  /* ----------------------------------------------------------
     Marquee
     ---------------------------------------------------------- */
  var track = document.getElementById("marquee-track");
  if (track && !reducedMotion) {
    gsap.to(track, { xPercent: -50, duration: 24, ease: "none", repeat: -1 });
  }

  var toolsTrack = document.getElementById("tools-track");
  if (toolsTrack && !reducedMotion) {
    gsap.to(toolsTrack, { xPercent: -50, duration: 22, ease: "none", repeat: -1 });
  }

  /* ----------------------------------------------------------
     Custom cursor + magnetic elements (fine pointers only)
     ---------------------------------------------------------- */
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (finePointer) {
    var dot = document.getElementById("cursor-dot");
    var ring = document.getElementById("cursor-ring");
    var mouse = { x: -100, y: -100 };
    var ringPos = { x: -100, y: -100 };

    var cursorShown = false;
    window.addEventListener("mousemove", function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!cursorShown) {
        cursorShown = true;
        ringPos.x = mouse.x;
        ringPos.y = mouse.y;
        dot.style.visibility = "visible";
        ring.style.visibility = "visible";
      }
      gsap.set(dot, { x: mouse.x, y: mouse.y });
    });

    gsap.ticker.add(function () {
      ringPos.x += (mouse.x - ringPos.x) * 0.14;
      ringPos.y += (mouse.y - ringPos.y) * 0.14;
      gsap.set(ring, { x: ringPos.x, y: ringPos.y });
    });

    document.querySelectorAll("[data-hover]").forEach(function (el) {
      el.addEventListener("mouseenter", function () { ring.classList.add("is-hover"); });
      el.addEventListener("mouseleave", function () { ring.classList.remove("is-hover"); });
    });

    document.querySelectorAll("[data-magnetic]").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        gsap.to(el, { x: dx * 0.25, y: dy * 0.25, duration: 0.4, ease: "power3.out" });
      });
      el.addEventListener("mouseleave", function () {
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
      });
    });
  }

  /* ----------------------------------------------------------
     Three.js hero — undulating dot field (light theme)
     ---------------------------------------------------------- */
  function initHeroCanvas() {
    if (typeof THREE === "undefined" || reducedMotion) return;
    var canvas = document.getElementById("hero-canvas");
    if (!canvas) return;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    } catch (err) {
      return; // WebGL unavailable — hero still works without it.
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.set(0, 5.5, 13);
    camera.lookAt(0, 0, 0);

    var COLS = 110;
    var ROWS = 60;
    var SEP = 0.42;
    var count = COLS * ROWS;
    var positions = new Float32Array(count * 3);
    var colors = new Float32Array(count * 3);
    var inkColor = new THREE.Color("#8d867a");
    var accentColor = new THREE.Color("#ff4d24");
    var i, x, z, idx;
    for (i = 0; i < count; i++) {
      x = (i % COLS) - COLS / 2;
      z = Math.floor(i / COLS) - ROWS / 2;
      idx = i * 3;
      positions[idx] = x * SEP;
      positions[idx + 1] = 0;
      positions[idx + 2] = z * SEP;
      // Mostly warm-grey dots with occasional accent sparks
      var c = Math.random() < 0.045 ? accentColor : inkColor;
      colors[idx] = c.r;
      colors[idx + 1] = c.g;
      colors[idx + 2] = c.b;
    }
    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    var material = new THREE.PointsMaterial({
      vertexColors: true,
      size: 0.05,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    scene.add(new THREE.Points(geometry, material));

    var mouseX = 0, mouseY = 0;
    window.addEventListener("mousemove", function (e) {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    });

    function resize() {
      var w = canvas.clientWidth;
      var h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);

    var heroVisible = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        heroVisible = entries[0].isIntersecting;
      }).observe(canvas);
    }

    var clock = new THREE.Clock();
    var pos = geometry.attributes.position;
    function animate() {
      requestAnimationFrame(animate);
      if (!heroVisible) return;
      var t = clock.getElapsedTime() * 0.6;
      for (var j = 0; j < count; j++) {
        var k = j * 3;
        var px = pos.array[k];
        var pz = pos.array[k + 2];
        pos.array[k + 1] =
          Math.sin(px * 0.45 + t) * 0.55 +
          Math.cos(pz * 0.35 + t * 0.8) * 0.55;
      }
      pos.needsUpdate = true;
      camera.position.x += (mouseX * 1.6 - camera.position.x) * 0.03;
      camera.position.y += (5.5 - mouseY * 1.2 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    }
    animate();
  }
  initHeroCanvas();
})();
