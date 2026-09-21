/* ══════════════════════════════════════════════════════════════
   POST /api/donate — receive a donation request

   Nothing is connected yet, and this endpoint refuses rather than
   pretends: with no SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in
   the environment it returns 503 with `stored: false`, and the
   client shows that instead of a confirmation. A request is only
   ever reported as received once the insert has actually come
   back.

   Runs on Vercel's Node runtime. The service-role key is read
   from the environment and never leaves the server.
   ══════════════════════════════════════════════════════════════ */

'use strict';

var crypto = require('crypto');

var LIMITS = { name: 60, contact: 120, area: 80, note: 300, items: 25 };
var METHODS = ['Email', 'Phone', 'WhatsApp'];
var HANDOVER = ['Drop-off (coming soon)', 'Request collection (coming soon)', 'Help me choose'];
var DEVICES = ['Phone', 'Laptop', 'Tablet', 'Power bank', 'Charger or cable',
               'Electronic components', 'Small electronic device', 'Other'];
var CONDITIONS = ['Working', 'Not working', 'Physically damaged', 'Battery is swollen',
                  'Battery is leaking', 'Becomes unusually hot', 'I am not sure'];

/* One window per address, in memory. Good enough to blunt a script;
   a real deployment should put this in Redis or at the edge, since
   serverless instances do not share this map. */
var hits = new Map();
function rateLimited(ip) {
  var now = Date.now();
  var seen = (hits.get(ip) || []).filter(function (t) { return now - t < 60 * 60 * 1000; });
  seen.push(now);
  hits.set(ip, seen);
  if (hits.size > 5000) hits.clear();          // crude ceiling on memory
  return seen.length > 5;                      // 5 requests per hour
}

function clean(v, max) {
  return String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max);
}
function oneOf(v, list) { return list.indexOf(v) === -1 ? null : v; }

module.exports = function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  var ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) {
    return res.status(429).json({ ok: false, error: 'Too many requests. Please try again later.' });
  }

  var body = req.body || {};

  // Honeypot: a field no person sees and no person fills in.
  if (clean(body.website, 10)) return res.status(200).json({ ok: true, stored: false });

  var name = clean(body.name, LIMITS.name);
  var contact = clean(body.contact, LIMITS.contact);
  var method = oneOf(clean(body.contact_method, 20), METHODS);
  var handover = oneOf(clean(body.method, 60), HANDOVER);
  var area = clean(body.area, LIMITS.area);
  var note = clean(body.note, LIMITS.note);
  var consent = body.consent === true;

  var errors = [];
  if (!name) errors.push('name');
  if (!contact) errors.push('contact');
  if (!method) errors.push('contact_method');
  if (!handover) errors.push('method');
  if (!consent) errors.push('consent');

  var raw = Array.isArray(body.items) ? body.items.slice(0, LIMITS.items) : [];
  var items = raw.map(function (it) {
    return {
      device_type: oneOf(clean(it && it.device, 40), DEVICES),
      condition: oneOf(clean(it && it.condition, 40), CONDITIONS),
      quantity: Math.max(1, Math.min(999, parseInt(it && it.quantity, 10) || 1)),
      notes: clean(it && it.notes, LIMITS.note)
    };
  }).filter(function (it) { return it.device_type && it.condition; });
  if (!items.length) errors.push('items');

  if (errors.length) {
    // Says which field, never why the value was rejected.
    return res.status(400).json({ ok: false, error: 'Some details are missing.', fields: errors });
  }

  items.forEach(function (it) {
    it.battery_warning = /swollen|leaking|hot|damaged/i.test(it.condition);
  });

  var url = process.env.SUPABASE_URL;
  var key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    // The demo adapter. It validates, and then says plainly that
    // nothing was kept.
    console.log('[donate] validated, not stored (no database configured)', {
      items: items.length, handover: handover, battery_warning: items.some(function (i) { return i.battery_warning; })
    });
    return res.status(503).json({
      ok: false,
      stored: false,
      demo: true,
      error: 'RoboCycle is not accepting requests yet — nothing was saved. ' +
             'Please email hello@robocycle.kw and we will contact you when collection opens.'
    });
  }

  /* A reference the visitor keeps, and only its hash is stored: a
     leak of the table does not hand anyone a working lookup key. */
  var reference = crypto.randomBytes(9).toString('base64url').toUpperCase();
  var hash = crypto.createHash('sha256').update(reference).digest('hex');

  var payload = {
    public_reference_hash: hash,
    first_name: name,
    contact_method: method,
    contact_value: contact,
    preferred_area: area || null,
    donation_method: handover,
    status: 'Request Received',
    consent_at: new Date().toISOString(),
    items: items
  };

  fetch(url.replace(/\/$/, '') + '/rest/v1/rpc/create_donation_request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: key,
      Authorization: 'Bearer ' + key
    },
    body: JSON.stringify({ payload: payload })
  }).then(function (r) {
    if (!r.ok) throw new Error('insert failed: ' + r.status);
    return r.json();
  }).then(function () {
    // Only now is it true.
    res.status(201).json({ ok: true, stored: true, reference: reference });
  }).catch(function (err) {
    console.error('[donate] store failed', err.message);   // no personal data in logs
    res.status(502).json({
      ok: false, stored: false,
      error: 'We could not save your request. Please try again shortly.'
    });
  });
};
