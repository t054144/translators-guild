/* ══════════════════════════════════════════════════════════════
   ROBOCYCLE — the donation request

   Seven steps, several items per request, and one rule that
   shapes the rest: the form never claims a request was submitted.
   There is no collection service connected, so the last step says
   so plainly and hands the person an email address instead of a
   reference number. When api/donate is wired to a real store,
   send() below becomes the fetch and the outcome becomes the
   server's answer — not a message written here.
   ══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var form = document.getElementById('donate-form');
  if (!form) return;

  var LAST = 6;                       // review is the last panel
  var step = 1;
  var items = [];

  var bar      = document.getElementById('steps-bar');
  var backBtn  = document.getElementById('back');
  var nextBtn  = document.getElementById('next');
  var sendBtn  = document.getElementById('submit');
  var outcome  = document.getElementById('outcome');
  var note     = document.getElementById('safety-note');
  var list     = document.getElementById('item-list');
  var review   = document.getElementById('review');

  /* A condition that means this must never be posted into an
     unattended container. */
  function riskyCondition(value) {
    return /swollen|leaking|hot|damaged/i.test(value);
  }

  function field(name) {
    var el = form.querySelector('[name="' + name + '"]:checked') ||
             form.querySelector('[name="' + name + '"]');
    return el ? el.value.trim() : '';
  }

  /* ── the safety branch ──────────────────────────────────────── */

  form.addEventListener('change', function (e) {
    if (e.target.name === 'condition') {
      note.classList.toggle('is-on', riskyCondition(e.target.value));
    }
  });

  /* ── items ──────────────────────────────────────────────────── */

  function currentItem() {
    return {
      device: field('device'),
      condition: field('condition'),
      quantity: Math.max(1, Math.min(999, parseInt(field('quantity'), 10) || 1))
    };
  }

  function drawItems() {
    list.innerHTML = '';
    var all = items.concat([currentItem()]);
    all.forEach(function (it, i) {
      var row = document.createElement('div');
      row.className = 'item-row' + (riskyCondition(it.condition) ? ' warn' : '');
      var risky = riskyCondition(it.condition)
        ? ' · <span style="color:#b3400c;font-weight:600">needs safe handling</span>' : '';
      row.innerHTML = '<b>' + esc(it.device) + '</b>' +
        '<span class="meta">× ' + it.quantity + ' · ' + esc(it.condition) + risky + '</span>';
      if (i < items.length) {
        var rm = document.createElement('button');
        rm.type = 'button'; rm.className = 'rm'; rm.textContent = 'Remove';
        rm.addEventListener('click', function () { items.splice(i, 1); drawItems(); });
        row.appendChild(rm);
      } else {
        var tag = document.createElement('span');
        tag.className = 'meta'; tag.style.marginLeft = 'auto';
        tag.textContent = 'being added';
        row.appendChild(tag);
      }
      list.appendChild(row);
    });
  }

  document.getElementById('add-item').addEventListener('click', function () {
    items.push(currentItem());
    // back to the top of the form for the next item, keeping the rest
    form.querySelector('[name="device"][value="Phone"]').checked = true;
    form.querySelector('[name="condition"][value="Working"]').checked = true;
    form.querySelector('[name="quantity"]').value = 1;
    note.classList.remove('is-on');
    go(1);
  });

  /* ── review ─────────────────────────────────────────────────── */

  function drawReview() {
    var all = items.concat([currentItem()]);
    var rows = [
      ['Items', all.map(function (i) {
        return esc(i.device) + ' × ' + i.quantity + ' (' + esc(i.condition) + ')';
      }).join('<br>'), 1],
      ['Handover', esc(field('method')), 4],
      ['Name', esc(field('name')) || '<span style="color:#b3400c">still needed</span>', 5],
      ['Contact', esc(field('contact_method')) + ' — ' +
        (esc(field('contact')) || '<span style="color:#b3400c">still needed</span>'), 5],
      ['Area', esc(field('area')) || '—', 5],
      ['Note', esc(field('note')) || '—', 5]
    ];
    review.innerHTML = '';
    rows.forEach(function (r) {
      var b = document.createElement('div');
      b.className = 'review-block';
      b.innerHTML = '<dl class="review-grid"><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></dl>';
      var edit = document.createElement('button');
      edit.type = 'button'; edit.className = 'edit'; edit.textContent = 'Edit';
      edit.addEventListener('click', function () { go(r[2]); });
      b.appendChild(edit);
      review.appendChild(b);
    });

    if (all.some(function (i) { return riskyCondition(i.condition); })) {
      var warn = document.createElement('div');
      warn.className = 'safety-note is-on';
      warn.innerHTML = '<h3>⚠ One of these needs safe handling</h3>' +
        '<p>We will contact you before any handover, and it must not go into an ' +
        'unattended container. Please do not open, puncture, crush or charge it ' +
        'in the meantime.</p>';
      review.appendChild(warn);
    }
  }

  /* ── validation ─────────────────────────────────────────────── */

  function validateDetails() {
    var ok = true;
    [['f-name', 'err-name'], ['f-contact', 'err-contact']].forEach(function (pair) {
      var input = document.getElementById(pair[0]);
      var err = document.getElementById(pair[1]);
      var bad = !input.value.trim();
      err.hidden = !bad;
      input.setAttribute('aria-invalid', bad ? 'true' : 'false');
      if (bad && ok) { input.focus(); }
      if (bad) ok = false;
    });
    var consent = document.getElementById('f-consent');
    var cErr = document.getElementById('err-consent');
    cErr.hidden = consent.checked;
    if (!consent.checked) { if (ok) consent.focus(); ok = false; }
    return ok;
  }

  /* ── movement ───────────────────────────────────────────────── */

  function go(n) {
    if (n > 5 && !validateDetails()) return;
    step = Math.max(1, Math.min(LAST, n));

    Array.prototype.forEach.call(form.querySelectorAll('.step-panel'), function (p) {
      p.classList.toggle('is-on', +p.dataset.panel === step);
    });
    Array.prototype.forEach.call(bar.children, function (li) {
      var s = +li.dataset.step;
      li.classList.toggle('done', s < step);
      if (s === step) li.setAttribute('aria-current', 'step');
      else li.removeAttribute('aria-current');
    });

    backBtn.hidden = step === 1;
    nextBtn.hidden = step === LAST;
    sendBtn.hidden = step !== LAST;

    if (step === 3) drawItems();
    if (step === LAST) drawReview();

    form.querySelector('.step-panel.is-on').scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'center'
    });
  }

  nextBtn.addEventListener('click', function () { go(step + 1); });
  backBtn.addEventListener('click', function () { go(step - 1); });

  /* ── the end ────────────────────────────────────────────────── */

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateDetails()) { go(5); return; }

    var all = items.concat([currentItem()]);
    var risky = all.some(function (i) { return riskyCondition(i.condition); });

    /* No backend, so no reference and no claim of success. When
       api/donate is connected this becomes a fetch, and the outcome
       below is replaced by whatever the server confirms it saved. */
    form.style.display = 'none';
    document.querySelector('.steps-bar').style.display = 'none';
    outcome.classList.add('is-on');
    outcome.innerHTML =
      '<img src="mark.png" alt="">' +
      '<h3>Not submitted yet — and that is honest</h3>' +
      '<p style="margin-bottom:14px">' +
      'RoboCycle has no collection service running, so there is nowhere for this ' +
      'request to go. Rather than hand you a reference number that means nothing, ' +
      'here is what you actually have: <b>' + all.length + ' item' +
      (all.length > 1 ? 's' : '') + '</b> ready to donate the moment collection opens.' +
      '</p>' +
      '<p style="margin-bottom:14px">Email <b>hello@robocycle.kw</b> to be told when it does.</p>' +
      (risky
        ? '<div class="safety-note is-on" style="text-align:left"><h3>⚠ In the meantime</h3>' +
          '<p>You told us about a battery that is swollen, leaking, running hot or ' +
          'physically damaged. Please do not put it in a household bin, and do not ' +
          'open, puncture, crush or charge it. Contact your local authority for safe ' +
          'handling guidance — in an emergency, call 112.</p></div>'
        : '') +
      '<p style="margin-top:18px"><a class="btn btn--ghost" href="/robocycle/">Back to the start</a></p>';
    outcome.setAttribute('tabindex', '-1');
    outcome.focus({ preventScroll: true });
    outcome.scrollIntoView({ block: 'center' });
  });

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  go(1);
})();
