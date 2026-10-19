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

  /* one block (or a small group) revealed when its first element enters */
  function reveal(selector, vars, triggerSelector) {
    var targets = els(selector);
    if (!targets.length) return;
    var trigger = !triggerSelector ? targets[0]
      : (typeof triggerSelector === 'string' ? document.querySelector(triggerSelector) : triggerSelector);
    gsap.from(targets, Object.assign({
      autoAlpha: 0,
      y: 24,
      duration: 0.6,
      ease: EASE,
      clearProps: CLEAR,
      scrollTrigger: { trigger: trigger, start: START, once: true }
    }, vars));
  }

  /* cards revealed as they enter; cards entering together are staggered */
  function revealBatch(selector, stagger) {
    var targets = els(selector);
    if (!targets.length) return;
    gsap.set(targets, { autoAlpha: 0, y: 28 });
    window.ScrollTrigger.batch(targets, {
      start: START,
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: EASE,
          stagger: stagger,
          overwrite: true,
          clearProps: CLEAR
        });
      }
    });
  }

  var mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', function () {
    /* ---------- HERO (on load, ~1.05s) ---------- */
    gsap.timeline({ defaults: { ease: EASE, clearProps: CLEAR } })
      .from('.hero-visual', { scale: 1.03, duration: 1.05, ease: 'power1.out' }, 0)
      .from('.hero-eyebrow', { autoAlpha: 0, y: 14, duration: 0.4 }, 0)
      .from('.hero-title .line', { autoAlpha: 0, y: 24, duration: 0.5, stagger: 0.1 }, 0.1)
      .from('.hero-lead', { autoAlpha: 0, y: 14, duration: 0.4 }, 0.45)
      .from('.hero-actions .btn', { autoAlpha: 0, y: 12, duration: 0.4, stagger: 0.08 }, 0.57);

    /* ---------- REASON ---------- */
    reveal('.reason .section-head');
    /* editorial rows: photo slides in from its own side, text fades up */
    els('.reason-item').forEach(function (item) {
      var fromRight = item.classList.contains('reason-item--reverse');
      reveal(item.querySelector('.reason-photo'), { x: fromRight ? 40 : -40, y: 0, duration: 0.7 }, item);
      reveal(item.querySelectorAll('.reason-num, .reason-title, .reason-desc'), { y: 20, stagger: 0.1 }, item);
    });

    /* ---------- SERVICE ---------- */
    reveal('.service .section-head');
    revealBatch('.service-card', 0.1);

    /* ---------- COMPANY (#about) ----------
       label/title targeted directly: .about-content is display:contents on mobile */
    reveal('#about .section-label, #about .section-title', { stagger: 0.06 });
    reveal('.company-table', { y: 28 });                                   // table as one block
    reveal('#about .draft-note, .about-btn', { y: 16, stagger: 0.08 }, '.company-table');
    reveal('.about-brand', { x: 32, y: 0, duration: 0.7 });                // logo panel from the right

    /* ---------- REPRESENTATIVE ---------- */
    reveal('.rep-visual', { x: -32, y: 0, duration: 0.7 });                // portrait from the left
    reveal('.rep-content .section-label, .rep-content .section-title', { stagger: 0.06 });
    reveal('.rep-card, .rep-content > .draft-note', { x: 32, y: 0, duration: 0.7, stagger: 0.08 }, '.rep-card');
    reveal('.rep-contact-title', { y: 16 });
    revealBatch('.rep-contact-card, .rep-qr-card, .rep-ecard', 0.1);       // cards move as a whole; QR images are not targeted
    reveal('.rep-contact > .draft-note', { y: 12 });

    /* ---------- STAFF ---------- */
    reveal('.staff .section-head');
    reveal('.staff-deco span', { x: 24, y: 0, duration: 0.9, stagger: 0.12 }, '.staff');   // diagonal shapes
    reveal('.staff-photo--main', { x: -40, y: 0, duration: 0.8 });                          // featured photo from the left
    revealBatch('.staff-photo--sub1, .staff-photo--sub2, .staff-photo--sub3', 0.12);         // smaller photos fade up

    /* ---------- CONTACT ---------- */
    reveal('.contact-content');
    reveal('.contact-card, .contact-note', { stagger: 0.12 }, '.contact-cards');

    /* ---------- FOOTER: no animation ---------- */
  });

  /* trigger positions depend on fonts and lazy images */
  window.addEventListener('load', function () {
    window.ScrollTrigger.refresh();
  });
})();
