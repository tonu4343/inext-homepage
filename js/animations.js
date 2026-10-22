/* I-NEXT Homepage — entrance animations (GSAP 3.13 + ScrollTrigger)
   - Progressive enhancement: if GSAP / ScrollTrigger did not load, nothing runs
     and all content stays visible (no CSS hides anything).
   - Runs only for prefers-reduced-motion: no-preference.
   - transform + opacity only; every scroll reveal plays once, then clears its
     inline styles so the existing CSS :hover effects keep working.
   - Footer, QR images and personal contact details are not animated individually. */
(function () {
  'use strict';

  if (!window.gsap || !window.ScrollTrigger) return;

  var gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger);

  var EASE = 'power2.out';
  var CLEAR = 'opacity,visibility,transform';
  var START = 'top 85%';

  function els(selector) {
    return gsap.utils.toArray(selector);
  }

  /* every element hidden until its scroll trigger fires */
  var pending = [];

  /* show all scroll-revealed content at once (used when nothing can scroll:
     printing, or a window tall enough to show the whole page — e.g. full-page captures) */
  function showAll() {
    if (!pending.length) return;
    window.ScrollTrigger.getAll().forEach(function (t) { t.kill(); });
    gsap.killTweensOf(pending);
    gsap.set(pending, { clearProps: CLEAR });
    pending = [];
  }
  function showAllIfNoScroll() {
    if (document.documentElement.scrollHeight <= window.innerHeight + 2) showAll();
  }

  /* Content is only hidden once its top reaches the bottom of the viewport ("armed"),
     never from page load: anything the visitor has not scrolled to stays visible, so
     full-page screenshots that do not scroll still show every section.
     Entering during a jump/very fast scroll (e.g. scroll-and-stitch capture tools)
     shows the content at once instead of fading it. */
  var FAST = 3000; // px/s

  var armed = [];
  function arm(targets, hidden, trigger) {
    window.ScrollTrigger.create({
      trigger: trigger,
      start: 'top bottom',
      once: true,
      onEnter: function (self) {
        if (Math.abs(self.getVelocity()) > FAST) return; // jumped here: leave it visible
        armed = armed.concat(targets);
        gsap.set(targets, hidden);
      }
    });
  }
  function show(targets, hidden, vars, self) {
    var wasArmed = gsap.utils.toArray(targets).some(function (t) { return armed.indexOf(t) !== -1; });
    if (!wasArmed || Math.abs(self.getVelocity()) > FAST) {
      gsap.killTweensOf(targets);
      gsap.set(targets, { clearProps: CLEAR });
      return;
    }
    gsap.fromTo(targets, hidden, Object.assign({
      autoAlpha: 1, x: 0, y: 0, duration: 0.6, ease: EASE, overwrite: true, clearProps: CLEAR
    }, vars));
  }

  /* one block (or a small group) revealed when its first element enters */
  function reveal(selector, vars, triggerSelector) {
    var targets = els(selector);
    if (!targets.length) return;
    pending = pending.concat(targets);
    vars = vars || {};
    var trigger = !triggerSelector ? targets[0]
      : (typeof triggerSelector === 'string' ? document.querySelector(triggerSelector) : triggerSelector);
    var hidden = { autoAlpha: 0, x: vars.x || 0, y: vars.y === undefined ? 24 : vars.y };
    var motion = { duration: vars.duration || 0.6, stagger: vars.stagger || 0 };
    arm(targets, hidden, trigger);
    window.ScrollTrigger.create({
      trigger: trigger,
      start: START,
      once: true,
      onEnter: function (self) { show(targets, hidden, motion, self); }
    });
  }

  /* cards revealed as they enter; cards entering together are staggered */
  function revealBatch(selector, stagger) {
    var targets = els(selector);
    if (!targets.length) return;
    pending = pending.concat(targets);
    var hidden = { autoAlpha: 0, x: 0, y: 28 };
    targets.forEach(function (t) { arm(t, hidden, t); });
    window.ScrollTrigger.batch(targets, {
      start: START,
      once: true,
      onEnter: function (batch, triggers) { show(batch, hidden, { stagger: stagger }, triggers[0]); }
    });
  }

  var mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', function () {
    /* ---------- HERO (on load, ~1.05s) ---------- */
    if (document.querySelector('.hero')) gsap.timeline({ defaults: { ease: EASE, clearProps: CLEAR } })
      .from('.hero-visual', { scale: 1.03, duration: 1.05, ease: 'power1.out' }, 0)
      .from('.hero-eyebrow', { autoAlpha: 0, y: 14, duration: 0.4 }, 0)
      .from('.hero-title .line', { autoAlpha: 0, y: 24, duration: 0.5, stagger: 0.1 }, 0.1)
      .from('.hero-lead', { autoAlpha: 0, y: 14, duration: 0.4 }, 0.45)
      .from('.hero-actions .btn', { autoAlpha: 0, y: 12, duration: 0.4, stagger: 0.08 }, 0.57);

    /* ---------- SUB-PAGE title band (on load) ---------- */
    if (document.querySelector('.page-hero')) {
      gsap.from('.page-hero-inner > *', { autoAlpha: 0, y: 18, duration: 0.5, stagger: 0.08, ease: EASE, clearProps: CLEAR });
    }
    /* photo banner (Design C): photo settles, shapes slide in, titles rise */
    if (document.querySelector('.page-banner')) {
      gsap.timeline({ defaults: { ease: EASE, clearProps: CLEAR } })
        .from('.page-banner-media', { scale: 1.04, duration: 1.1, ease: 'power1.out' }, 0)
        .from('.page-banner-shapes span', { autoAlpha: 0, x: 40, duration: 0.7, stagger: 0.08 }, 0.1)
        .from('.page-banner-en', { autoAlpha: 0, y: 26, duration: 0.6 }, 0.2)
        .from('.page-banner-ja', { autoAlpha: 0, y: 16, duration: 0.5 }, 0.4)
        .from('.page-crumbbar .breadcrumb', { autoAlpha: 0, duration: 0.4 }, 0.55);
    }
    reveal('.philosophy-head');
    reveal('.philosophy-panel', { y: 20 });
    /* 事業領域 rows: photo slides from its side, text fades up, items stagger */
    els('.biz-row').forEach(function (row) {
      var fromRight = row.classList.contains('biz-row--reverse');
      reveal(row.querySelector('.biz-photo'), { x: fromRight ? 40 : -40, y: 0, duration: 0.7 }, row);
      reveal(row.querySelectorAll('.biz-num, .biz-title, .biz-lead'), { y: 20, stagger: 0.1 }, row);
      reveal(row.querySelectorAll('.biz-items li'), { y: 12, duration: 0.45, stagger: 0.05 }, row.querySelector('.biz-items'));
    });
    reveal('.biz-cta-btn', { y: 16 });
    /* サービス詳細: bright hero on load, then bands on scroll */
    if (document.querySelector('.svc-hero')) {
      gsap.timeline({ defaults: { ease: EASE, clearProps: CLEAR } })
        .from('.svc-hero-media', { scale: 1.04, duration: 1.1, ease: 'power1.out' }, 0)
        .from('.svc-hero-inner > *', { autoAlpha: 0, y: 20, duration: 0.55, stagger: 0.1 }, 0.15);
    }
    reveal('.svc-intro-title');
    reveal('.svc-jump li', { y: 12, stagger: 0.08 }, '.svc-jump');
    els('.svc-band').forEach(function (band) {
      var fromLeft = band.classList.contains('svc-band--reverse');
      reveal(band.querySelector('.svc-media'), { x: fromLeft ? -40 : 40, y: 0, duration: 0.8 }, band);
      reveal(band.querySelectorAll('.svc-en, .svc-title, .svc-desc, .svc-tags, .svc-btn'), { y: 18, stagger: 0.08 }, band);
    });
    reveal('.svc-cta-inner .btn', { y: 14, stagger: 0.1 }, '.svc-cta');
    /* 会社概要 */
    reveal('.cinfo-table', { y: 24 });
    reveal('.cbrand', { x: 32, y: 0, duration: 0.7 });                     // logo panel from the right
    revealBatch('.cbiz-card', 0.08);
    /* お問い合わせ */
    reveal('.gform-card', { y: 20 });
    reveal('.cpage-company-strip, .cpage-related', { y: 16, stagger: 0.1 }, '.cpage-company-strip');
    reveal('.strength-head');
    revealBatch('.strength-card', 0.12);
    reveal('.page-placeholder');
    revealBatch('.page-link-card', 0.1);

    /* ---------- REASON ---------- */
    reveal('.reason .section-head');
    /* editorial rows: photo slides in from its own side, text fades up */
    els('.reason-item').forEach(function (item) {
      var fromRight = item.classList.contains('reason-item--reverse');
      reveal(item.querySelector('.reason-photo'), { x: fromRight ? 40 : -40, y: 0, duration: 0.7 }, item);
      reveal(item.querySelectorAll('.reason-num, .reason-title, .reason-desc'), { y: 20, stagger: 0.1 }, item);
    });

    /* ---------- REPRESENTATIVE ---------- */
    reveal('.rep-visual', { x: -32, y: 0, duration: 0.7 });                // portrait from the left
    reveal('.rep-content .section-label, .rep-content .section-title', { stagger: 0.06 });
    reveal('.rep-card, .rep-content > .draft-note', { x: 32, y: 0, duration: 0.7, stagger: 0.08 }, '.rep-card');

    /* ---------- STAFF ---------- */
    reveal('.staff .section-head');
    reveal('.staff-deco span', { x: 24, y: 0, duration: 0.9, stagger: 0.12 }, '.staff');   // diagonal shapes
    reveal('.staff-photo--main', { x: -40, y: 0, duration: 0.8 });                          // featured photo from the left
    revealBatch('.staff-photo--sub1, .staff-photo--sub2, .staff-photo--sub3', 0.12);         // smaller photos fade up

    /* ---------- CONTACT ---------- */
    reveal('.contact-content');
    reveal('.contact-action', { y: 16 });

    /* ---------- CONTACT banner (sub-pages) ---------- */
    reveal('.cta-banner-text, .cta-banner-btn', { y: 20, stagger: 0.12 }, '.cta-banner');

    /* ---------- FOOTER: no animation ---------- */
  });

  /* trigger positions depend on fonts and lazy images */
  window.addEventListener('load', function () {
    window.ScrollTrigger.refresh();
    showAllIfNoScroll();
  });

  /* never leave content hidden where the visitor cannot scroll to reveal it */
  window.addEventListener('beforeprint', showAll);
  window.addEventListener('resize', showAllIfNoScroll);
  showAllIfNoScroll();
})();
