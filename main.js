/* ============================================================
   Yinka Akinbobola | Portfolio interactions
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
     Smooth scroll (Lenis): optional enhancement
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
  var ddPaths = gsap.utils.toArray(".dd-path");
  var ddDots = gsap.utils.toArray(".dd-dot");
  var ddLabels = gsap.utils.toArray(".dd-labels span");

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
    if (document.querySelector(".hero-title .line-inner")) {
      tl.to(".hero-title .line-inner", {
        y: 0,
        duration: 1.1,
        ease: "power4.out",
        stagger: 0.12,
      }, "-=0.45");
    }
    tl.to("[data-hero-fade]", {
      opacity: 1,
      duration: 0.9,
      ease: "power2.out",
      stagger: 0.15,
    }, "-=0.5");
    return tl;
  }

  var introSeen = document.documentElement.classList.contains("intro-seen");
  if (preloaderEl && introSeen) {
    preloaderEl.style.display = "none";
    preloaderEl = null;
    heroIntro();
  } else if (preloaderEl) {
    try { sessionStorage.setItem("ya-intro", "1"); } catch (e) {}
    var introTl = gsap.timeline();
    if (ddPaths.length) {
      // Double Diamond draw-in: Discover→Define, then Develop→Deliver.
      ddPaths.forEach(function (p) {
        var len = p.getTotalLength();
        p.style.strokeDasharray = len;
        p.style.strokeDashoffset = len;
      });
      gsap.set(ddDots, { scale: 0, transformOrigin: "center" });
      gsap.set(ddLabels, { opacity: 0, y: 8 });
      gsap.set(".preloader-name", { opacity: 0 });

      introTl.to(ddPaths[0], {
        strokeDashoffset: 0,
        duration: 0.36,
        ease: "power2.inOut",
      });
      introTl.to(ddPaths[1], {
        strokeDashoffset: 0,
        duration: 0.36,
        ease: "power2.inOut",
      }, "-=0.06");
      introTl.to(ddDots, {
        scale: 1,
        duration: 0.2,
        ease: "back.out(2.5)",
        stagger: 0.05,
      }, "-=0.35");
      introTl.to(ddLabels, {
        opacity: 1,
        y: 0,
        duration: 0.22,
        ease: "power2.out",
        stagger: 0.04,
      }, "-=0.4");
      introTl.to(".preloader-name", {
        opacity: 1,
        duration: 0.2,
      }, "-=0.2");
      introTl.to({}, { duration: 0.1 }); // brief hold
    }
    introTl.to(preloaderEl, {
      yPercent: -100,
      duration: 0.5,
      ease: "power4.inOut",
      onComplete: function () {
        if (preloaderEl) preloaderEl.style.display = "none";
      },
    });
    introTl.add(heroIntro(), "-=0.3");
    // Any click or key skips straight to the page.
    var skipIntro = function () {
      introTl.progress(1);
      window.removeEventListener("pointerdown", skipIntro);
      window.removeEventListener("keydown", skipIntro);
    };
    window.addEventListener("pointerdown", skipIntro);
    window.addEventListener("keydown", skipIntro);
  } else {
    // Case pages have no preloader, so play the hero intro immediately.
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
  }, 2500);

  /* ----------------------------------------------------------
     Nav: highlight the section in view
     ---------------------------------------------------------- */
  var navLinks = Array.prototype.filter.call(
    document.querySelectorAll('.site-nav a[href^="#"]'),
    function (a) { return document.querySelector(a.getAttribute("href")); }
  );
  if (navLinks.length) {
    var navEl = document.querySelector(".site-nav");
    navEl.classList.add("has-spy");
    var spyTicking = false;
    var updateSpy = function () {
      spyTicking = false;
      var line = window.innerHeight * 0.35;
      var current = null;
      navLinks.forEach(function (a) {
        var r = document.querySelector(a.getAttribute("href")).getBoundingClientRect();
        if (r.top <= line && r.bottom > line) current = a;
      });
      navLinks.forEach(function (a) {
        var on = a === current;
        a.classList.toggle("is-active", on);
        if (on) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    };
    var requestSpy = function () {
      if (!spyTicking) { spyTicking = true; requestAnimationFrame(updateSpy); }
    };
    window.addEventListener("scroll", requestSpy, { passive: true });
    window.addEventListener("resize", requestSpy);
    if (lenis) lenis.on("scroll", requestSpy);
    updateSpy();
  }

  /* ----------------------------------------------------------
     Copy email (mailto fails silently without a mail client)
     ---------------------------------------------------------- */
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    var label = btn.textContent;
    var status = document.getElementById("copy-status");
    btn.addEventListener("click", function () {
      var value = btn.getAttribute("data-copy");
      var done = function (msg) {
        btn.textContent = msg;
        if (status) status.textContent = msg === "Copied" ? "Email address copied" : "";
        setTimeout(function () { btn.textContent = label; }, 2200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(function () { done("Copied"); }, function () { done(value); });
      } else {
        done(value);
      }
    });
  });

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

    // About statement: word-by-word reveal
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
       Process: pinned horizontal scroll (desktop only)
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

})();
