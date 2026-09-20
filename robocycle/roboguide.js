/* ══════════════════════════════════════════════════════════════
   ROBOGUIDE — a guided answer set, not an AI

   No model is configured, so this does not pretend to be one. It
   matches a question against an allowlist of RoboCycle topics and
   answers from approved copy; anything it does not recognise goes
   to a human rather than being guessed at.

   Because there is no model, the prompt-injection surface is zero:
   nothing a visitor types is ever interpreted as an instruction —
   it is only ever matched against the keyword lists below and then
   escaped before display. Input is length-capped and rate-limited
   anyway, so the same limits are already in place if a real model
   is added later.

   What it must never do: describe opening, dismantling, puncturing,
   discharging, cooling or repairing a battery; encourage anyone to
   carry a dangerously damaged one; or claim a component was reused.
   The danger rule below is checked first and wins over everything.
   ══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var thread = document.getElementById('thread');
  var form   = document.getElementById('guide-form');
  if (!thread || !form) return;

  var input  = document.getElementById('guide-input');
  var MAX    = 300;                  // characters accepted per message
  var WINDOW = 8;                    // messages allowed per minute
  var stamps = [];

  var CONTACT = 'Email <b>hello@robocycle.kw</b> and a person will answer.';

  /* Checked before anything else: a battery in this state is not a
     question about donating, it is a safety matter. */
  var DANGER = /swollen|swelling|bulg|leak|smok|burn|fire|hot|melt|hiss|puff|expand/i;

  var TOPICS = [
    { k: /accept|take|what can i|allowed|categor|items?/i,
      a: 'RoboCycle is being set up to accept phones, laptops, tablets, power banks, ' +
         'chargers and cables, circuit boards, electronic components and small ' +
         'electronic devices — including anything with a lithium-ion battery inside. ' +
         'Working or not.' },

    { k: /how.*(donat|work|start)|steps?|process|journey/i,
      a: 'You tell us what you have, what condition it is in, and how to reach you. ' +
         'We contact you to arrange the handover. After that the device is assessed, ' +
         'and parts that are still good <em>may be</em> reused — we will only say that ' +
         'one was once it actually has been. <a href="donate.html">Start a request</a>.' },

    { k: /drop|collect|pick.?up|where|location|address|booth|container|point/i,
      a: 'No collection point is confirmed yet, so we are not listing addresses — we ' +
         'would rather show you nothing than send you somewhere that does not exist. ' +
         'You can still register a donation and we will contact you when collection ' +
         'opens. <a href="collection-points.html">See the plan</a>.' },

    { k: /track|status|reference|my request|where.*request/i,
      a: 'Tracking opens when collection does. When it works, a reference alone will ' +
         'not be enough: we will send a one-time code to the contact you gave us, ' +
         'because a request holds your name and a way to reach you. ' +
         '<a href="my-request.html">More on tracking</a>.' },

    { k: /status(es)? mean|received|assess|scheduled|completed|cancel/i,
      a: 'The stages will be: Request received, Awaiting contact, Collection scheduled, ' +
         'Collected, Under assessment, Completed, or Cancelled. None of them are live ' +
         'yet, so nothing will show a stage it has not reached.' },

    { k: /reward|point|badge|benefit|tree|plant|discount/i,
      a: 'Nothing is being awarded yet. Once a donation has actually been received and ' +
         'verified, it may become eligible for a digital badge, a confirmed contribution ' +
         'record, or a future partner benefit. We are not promising a specific reward ' +
         'until one exists.' },

    { k: /data|privacy|personal|information|safe.*data|id\b/i,
      a: 'We ask for a first name, one way to contact you, and a general area — not an ' +
         'ID, a date of birth, or your street address. You are told before anything is ' +
         'stored, and right now nothing is: the form is not connected to a collection ' +
         'system yet.' },

    { k: /battery|lithium|cell|power bank/i,
      a: 'Batteries are the reason RoboCycle exists. A lithium cell does not become safe ' +
         'by sitting unused — it can swell and vent as it ages, which is dangerous in a ' +
         'bin lorry or a sorting line. Keep loose cells apart with their terminals taped, ' +
         'and never put one in household waste. If one is swollen, leaking or hot, tell ' +
         'me and I will point you to proper help.' },

    { k: /who|what is robocycle|about|idea|why/i,
      a: 'RoboCycle is a Kuwait initiative for handling electronic waste more safely: ' +
         'collecting devices people no longer use, assessing them, and giving usable ' +
         'parts another purpose instead of letting them reach a waste container. ' +
         '<a href="how-it-works.html">How it works</a>.' },

    { k: /contact|talk|human|person|help|email|phone/i,
      a: CONTACT }
  ];

  function reply(text) {
    if (DANGER.test(text)) {
      return { alert: true, html:
        '<b>Please stop and treat this as a safety matter.</b><br><br>' +
        'Do not put it in a bin, do not open, puncture, crush or charge it, and do not ' +
        'try to take the battery out. Do not carry it around.<br><br>' +
        'Contact your local authority for safe handling guidance. If there is smoke, ' +
        'heat or fire, call <b>112</b> now.<br><br>' +
        'I am not able to talk you through handling a damaged battery, and you should ' +
        'be wary of anything that offers to.' };
    }
    for (var i = 0; i < TOPICS.length; i++) {
      if (TOPICS[i].k.test(text)) return { html: TOPICS[i].a };
    }
    return { html:
      'That one is outside what I have been given answers for, and I would rather say ' +
      'so than invent something. ' + CONTACT };
  }

  function add(html, cls) {
    var el = document.createElement('div');
    el.className = 'msg ' + cls;
    el.innerHTML = html;
    thread.appendChild(el);
    thread.scrollTop = thread.scrollHeight;
    return el;
  }

  function ask(text) {
    text = String(text || '').slice(0, MAX).trim();
    if (!text) return;

    var now = Date.now();
    stamps = stamps.filter(function (t) { return now - t < 60000; });
    if (stamps.length >= WINDOW) {
      add('You are going a little fast for me. Give it a moment, or ' + CONTACT, 'bot alert');
      return;
    }
    stamps.push(now);

    add(esc(text), 'me');                    // escaped: never treated as markup
    var r = reply(text);
    window.setTimeout(function () {
      add(r.html, r.alert ? 'bot alert' : 'bot');
    }, 260);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    ask(input.value);
    input.value = '';
  });

  Array.prototype.forEach.call(document.querySelectorAll('.suggestions button'), function (b) {
    b.addEventListener('click', function () { ask(b.textContent); });
  });

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
})();
