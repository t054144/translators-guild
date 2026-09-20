/* ══════════════════════════════════════════════════════════════
   ROBOCYCLE — the scroll journey

   The brief asked for Framer Motion. This site is three static
   files with no build step, and pulling in React to move a few
   panels would cost far more than it buys, so the same motion is
   done natively: IntersectionObserver for the arrivals, one
   scroll listener behind rAF for the track that fills as the
   journey is read. If the site later becomes a React app, these
   are the transitions to port.

   Everything here is decoration. If it never runs, the page still
   reads: nothing is hidden behind a scroll position it cannot
   reach, and a reduced-motion preference turns the lot off.
   ══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── arrivals ───────────────────────────────────────────────── */

  var watched = document.querySelectorAll('.reveal, .step, .turn');

  if (!('IntersectionObserver' in window) || reduced) {
    for (var i = 0; i < watched.length; i++) watched[i].classList.add('is-in');
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);          // arrive once, then stay
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });
    for (var j = 0; j < watched.length; j++) io.observe(watched[j]);
  }

  /* ── the track that fills as the journey is read ────────────── */

  var journey = document.getElementById('journey');
  var fill = document.getElementById('track-fill');

  if (journey && fill && !reduced) {
    var ticking = false;

    function draw() {
      ticking = false;
      var r = journey.getBoundingClientRect();
      var h = window.innerHeight;
      // 0 when the journey's top reaches the middle of the screen,
      // 1 when its bottom does.
      var span = r.height + h * 0.5;
      var passed = (h * 0.62) - r.top;
      var k = Math.max(0, Math.min(1, passed / span));
      fill.style.height = (k * 100).toFixed(2) + '%';
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(draw);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    draw();
  }

  /* ── the donation form ──────────────────────────────────────── */

  /* There is no collection system behind this yet. The form says so
     in plain sight, and this only swaps in the thank-you: it sends
     nothing, stores nothing, and must be wired to a real endpoint
     before anyone is asked to fill it in for real. */
  var form = document.getElementById('donate-form');
  var thanks = document.getElementById('thanks');

  if (form && thanks) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.querySelector('#f-name');
      var contact = form.querySelector('#f-contact');
      if (!name.value.trim() || !contact.value.trim()) {
        (name.value.trim() ? contact : name).focus();
        return;
      }
      form.classList.add('is-off');
      thanks.classList.add('is-on');
      thanks.setAttribute('tabindex', '-1');
      thanks.focus({ preventScroll: true });
      thanks.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    });
  }
})();
