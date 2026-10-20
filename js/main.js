/* I-NEXT Homepage — Phase 1 (no animation library) */
(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.getElementById('menu-panel');

  /* ---------- Menu toggle ---------- */
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    panel.hidden = !open;
  }

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });

    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) {
        setMenu(false);
        toggle.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (!panel.hidden && !header.contains(e.target)) setMenu(false);
    });
  }

  /* ---------- Header state on scroll ---------- */
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Current section in global nav ---------- */
  var navLinks = document.querySelectorAll('.global-nav a[href^="#"]');
  var navMap = {};
  navLinks.forEach(function (link) {
    navMap[link.getAttribute('href').slice(1)] = link;
  });
  // HERO and CONTACT have no entry in the global nav
  var sectionToNav = { hero: null, reason: 'reason', contact: null };

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var target = sectionToNav[entry.target.id];
        navLinks.forEach(function (link) { link.classList.remove('is-current'); });
        if (target && navMap[target]) navMap[target].classList.add('is-current');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    Object.keys(sectionToNav).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }

  /* ---------- Lazy images: fetch the rest once the page has loaded ----------
     keeps the first paint light, but every photo is ready before the visitor
     (or a full-page screenshot that does not scroll) reaches it */
  window.addEventListener('load', function () {
    var loadRest = function () {
      document.querySelectorAll('img[loading="lazy"]').forEach(function (img) {
        img.loading = 'eager';
        img.decoding = 'auto'; // async decoding can leave off-screen photos unpainted in captures
      });
    };
    if ('requestIdleCallback' in window) window.requestIdleCallback(loadRest, { timeout: 2000 });
    else setTimeout(loadRest, 200);
  });
})();
