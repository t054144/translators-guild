# RoboCycle

A public site for donating electronics safely, for Kuwait.

Plain HTML, CSS and JavaScript — no framework, no build step, no
package manager. Open `index.html` or serve the folder.

## What is here

| File | What it does |
| --- | --- |
| `index.html` | Home: the film, the three reasons, the journey in brief |
| `how-it-works.html` | The six stages, and which are running |
| `donate.html` / `donate.js` | The donation request, in seven steps |
| `collection-points.html` | Coming soon — no address is listed until one is verified |
| `my-request.html` | Coming soon — tracking needs a verification service |
| `roboguide.html` / `roboguide.js` | A guided answer set. Not an AI, and says so |
| `intro.js` | The opening film, rendered live on a canvas |
| `journey.js` | Scroll arrivals, the journey track, the explainer modal |
| `../api/donate.js` | Validates a request; refuses honestly with no database |
| `../api/request-status.js` | Returns 501 until verification exists |
| `../supabase/migrations/` | Schema, row-level security, retention |

## Environment variables

None are set, and the site works without them — it just refuses to
accept requests. To connect the database:

| Variable | Used by | Effect when missing |
| --- | --- | --- |
| `SUPABASE_URL` | `api/donate.js` | 503 with `stored: false`, and the page says nothing was saved |
| `SUPABASE_SERVICE_ROLE_KEY` | `api/donate.js` | as above. Server only — never send it to a browser |

Run the migration in `supabase/migrations/` before pointing the
endpoint at a project.

## What works, and what does not

Working now: the film, the pages, the seven-step form with its
safety branch and validation, RoboGuide, the accessibility and
reduced-motion behaviour.

Not working, and labelled as such on the site: submitting a request
(no database), collection points (none verified), tracking (no
verification service), rewards, impact records.

## The rules this code keeps

- Nothing claims to have happened. No request is reported as
  received until an insert returns; no impact record exists without
  a verification date.
- No address appears until it is verified, and the row-level
  security policy — not the page — decides that.
- A tracking reference alone never opens a request.
- RoboGuide never explains how to open, dismantle or handle a
  damaged battery. It escalates instead.
- Only the hash of a reference is stored.
- Personal details stay out of logs and out of URLs.
