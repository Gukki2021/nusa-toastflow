# ToastFlow · NUS Alumni Toastmasters

**Live site:** https://gukki2021.github.io/nusa-toastflow/
**Repo:** https://github.com/Gukki2021/nusa-toastflow

A lightweight, no-login **VP Education programming planner** for the NUS Alumni
Toastmasters Club. Members reserve prepared-speech slots and meeting roles;
the VPE gets **smart, fair role suggestions** drawn from past meetings and can
**generate a print-ready programming sheet** in one click.

Built as static HTML/CSS/JS (no framework, no build step) with a **Supabase**
backend for shared reservations. Deploys to **GitHub Pages**.

## Two input sources

Each meeting's programming sheet is assembled by merging two sources:

1. **Supabase** — roles members reserve online through this site.
2. **Meeting Appointment Holders Google Sheet** — the VPE's manually-maintained
   roster, matched by meeting date.

**Merge rule:** online reservations take priority; the Google Sheet fills any
role not reserved online. Conflicts (both sources name a different person for the
same role) keep the online booking and are flagged in the VPE dashboard.

The same Google Sheet also feeds the recommendation engine's history — its
columns cover every past and future meeting — so keeping that sheet current keeps
both the appointments and the suggestions up to date.

### Connect the Google Sheet (one-time)

1. Open the appointment spreadsheet in Google Sheets (if it's an uploaded
   `.xlsx`, first *File → Save as Google Sheets* to get a native sheet).
2. *File → Share → Publish to web* → choose the **Meeting Appointment Holders**
   tab → format **CSV** → **Publish**.
3. Copy the published URL and paste it into the
   `<meta name="appointments-csv-url" content="…">` tag near the top of
   `index.html`. Leave it blank to disable the integration.

The published CSV is read-only and contains only what's already on the sheet.

---

## What's inside

| File | Purpose |
|------|---------|
| `index.html` | Main planner + VPE admin dashboard |
| `programming-sheet.html` | Print-ready programming sheet (A4, replicates the club's PDF layout) |
| `scripts/recommend.js` | Recommendation engine (rotation fairness · role freshness · Pathways level) |
| `scripts/appointments.js` | Parses the appointment-holder Google Sheet (published CSV) and merges it with Supabase |
| `scripts/extract-data.py` | Regenerates `data/*.json` from the master spreadsheet |
| `data/projects.json`, `data/pathways.json` | Pathways objectives + project picker catalogue (public — tracked in git) |
| `data/members.json`, `data/history.json` | Roster + appointment history — **git-ignored** (member data) |
| `data/*.sample.json` | Anonymised placeholders so the app runs after a fresh clone |
| `supabase-setup.sql` | One-time database setup |
| `supabase-role-migration.sql` | Role-name migration (run once if upgrading an older DB) |
| `supabase-admin-functions.sql` | Exco/admin functions: block external slots, set holder, release (passcode-gated) |
| `reference.html` | Pathways reference: roles-by-level chart + reference PDFs |
| `scripts/extract-basecamp.py` | Builds `data/member-pathways.json` from a Base Camp dashboard export |
| `templates/` | Blank programming-sheet template |

---

## Run locally

The pages `fetch()` the JSON data files, so serve over HTTP (not `file://`):

```bash
cd toastflow
python3 -m http.server 8000
# open http://localhost:8000
```

### Refresh the recommendation data

Whenever the master **Program Plan** spreadsheet changes:

```bash
pip install openpyxl
python scripts/extract-data.py "NUSA TM 25-26 Program Plan & Distribution List.xlsx"
```

This rewrites `data/members.json` and `data/history.json` on your machine only.

---

## Privacy model

`members.json` and `history.json` contain member **emails** and are **never
committed** (see `.gitignore`). Two **email-free** copies *are* committed and
deployed so the live site's recommendations, member dropdowns and roster work:

- `members.public.json` — names + Pathways credentials only (no emails)
- `member-pathways.public.json` — names + current Pathway (no emails)

`extract-data.py` / `extract-basecamp.py` regenerate both the private and the
`.public.json` files. The app loads the private local file first, then falls back
to the public copy (what GitHub Pages serves). Appointment **history** on the live
site comes from the published Google Sheet CSV, not from `history.json`.

The Supabase **anon key** in `index.html` is safe to publish by design (Row-Level
Security protects the data). Never put the service-role key in the browser. Note:
the `appointments-csv-url` (a shared Google Sheet) is fetched client-side, so the
appointment roster it contains is visible to anyone using the site.

---

## Deploy to GitHub Pages

```bash
git init && git add . && git commit -m "ToastFlow initial commit"
gh repo create nusa-toastflow --public --source=. --push
```

Then in the repo: **Settings → Pages → Build from branch → `main` / root**.
The site publishes at `https://<org-or-user>.github.io/nusa-toastflow/`.

### Team workflow (Git)

1. `git clone` the repo.
2. Create a branch: `git checkout -b my-change`.
3. Edit, commit, `git push`, open a Pull Request.
4. Merge → GitHub Pages redeploys automatically.

Everyone shares the same reservation data via Supabase, independent of which
branch is deployed.

---

## Supabase setup (one-time)

1. Create a Supabase project.
2. SQL Editor → run `supabase-setup.sql`.
3. Project Settings → API → copy the **Project URL** and **anon public** key
   into the `<meta>` tags at the top of `index.html`.
   (An older DB? run `supabase-role-migration.sql` to update role names.)

---

## Exco admin actions (passcode-gated)

Run `supabase-admin-functions.sql` once, and **change the `exco_passcode`** in it
first. Exco members enter that passcode in the VPE dashboard to unlock:

- **Block ext.** — reserve an open role for an external evaluator/guest as a
  placeholder ("External — admin to add"); it shows locked to members.
- **Set name** — fill in / change the holder of any slot (e.g. the external's
  real name later).
- **Release** — clear a slot (undo a block, remove a wrong or test reservation).

The passcode is checked server-side, so the public anon key alone cannot edit.

## Member → Pathway database

`data/member-pathways.json` maps each member to the Pathway they're **currently
working on** (from a Base Camp Manager dashboard export via
`scripts/extract-basecamp.py`). It surfaces in the dashboard's **Roster &
Pathways** view and as a tag on each role suggestion. Git-ignored (member names).

## Roadmap / ideas

- Move roster + history into private Supabase tables so recommendations work for
  the whole committee (not just locally).
- One-click "apply all top suggestions" to fill a meeting draft.
- Email/WhatsApp reminders to confirmed role-holders.
- Auto-import the Word/PDF programming sheet each month.
