/* ══════════════════════════════════════════════════════════════
   POST /api/request-status — look up one request

   Two values are required: the reference the visitor was given,
   and a one-time code sent to the contact already on the request.
   A reference alone is never enough, because a request holds a
   name and a way to reach someone.

   The verification service does not exist yet, so this returns
   501 and the page shows "coming soon" rather than a status.
   ══════════════════════════════════════════════════════════════ */

'use strict';

module.exports = function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  return res.status(501).json({
    ok: false,
    available: false,
    error: 'Request tracking is not available yet.'
  });
};
