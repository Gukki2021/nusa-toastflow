# Release verification — 11 September 2026

Supersedes the pending-state descriptions in earlier progress reports.

- September: 14 confirmed assignments match `data/september-2026-final.json`, derived from the latest Final Word document.
- Calendar exports include Classroom 3.1, SMU SCIS 1, 80 Stamford Rd, Singapore 178902; September time 19:30–21:55 Singapore.
- Per-date agenda and guests persisted in Supabase; October does not inherit September guest names, projects or QR images.
- Browser programme regression passed: names/credentials, projects, evaluator pairings, no club names in holder column, voting images, map, Word download and share snapshot.
- Real browser reservation submitted to an empty December Timer slot, reloaded successfully, duplicate rejected (409). Invalid administrator passcode rejected (403); private reservations table denied to public client (401). Temporary QA reservation deleted after the test; existing bookings preserved.
- Mobile viewport 390px: no horizontal page overflow.
- Current booking flow is public and has no member login. New bookings are tentative until the planning team confirms them. Cancellation/change is handled by the VPE. This is not identity verification or an anti-spam guarantee.
- Word download remains HTML-compatible `.doc`; native Microsoft Word-to-PDF pagination has not been verified in this release. Browser PDF and programme content tests do not establish identical native Word layout.

Use the HTTPS GitHub Pages URL, not a local file URL. Existing downloaded calendar files and programme snapshots must be regenerated to receive changes.
