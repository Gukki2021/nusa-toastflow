# Final template implementation progress

Authority: `/Users/j7/Downloads/NUSA-Programming-Sheet-2026-09-11 Final.doc` (HTML-based Word document, edited after earlier PDF).

## Verified changes

- September database assignments updated and re-read: 14 confirmed, no tentative role holders. Speaker order Sara / Sandy / Sabrina / WEE; evaluators Jonta / Vincent / Marc / LER. Timer Jun TAY; Ah Counter Suren Haris ANWAR.
- Supabase September venue now Classroom 3.1, SCIS 1. Other meeting dates untouched in this transaction.
- Contacts carried by matching person and role family during reorder; before snapshot including contacts saved ONLY in ignored `.private/before-final-september-2026-09-10.json`.
- Source manifest `data/september-2026-final.json` supersedes the earlier reviewed workbook manifest for September.
- Date-scoped `scripts/meeting-programmes.js` passes syntax and isolation tests: September ends 9:55, August remains 9:50, October inherits no September guests or venue.
- Generator payload and agenda now carry a per-date schedule and guest credential/club records. Right column labels use date-scoped guest credentials.
- Final Word has L2 for Sandy in speech/objectives but L1 in evaluator section. Use L2 consistently, retaining the corrected source sections.

## Incomplete — do not mark goal achieved

- Match full final Word objectives (all four), timing, QR assets, location map and layout. Existing renderer still marks every result DRAFT and hides September QR/map.
- September default agenda config does not yet have an admin editing UI or DB persistence for other dates; implement date-specific agenda/guest editing, not just hardcoded September settings.
- Synchronize index meeting time, calendar exports and poster time with per-date schedule (currently global 9:50 remains in those outputs).
- Restore August visitor output: its date config currently has an empty guests list; derive date's role-assigned visitors without carrying September guests to other meetings.
- Export proper Word-compatible file with final template fidelity and without hidden page boundaries/extra initial paragraphs; inspect resulting PDF and Word output.
- Update `scripts/verify-programme.cjs`: currently targets superseded workbook manifest, 2 tentative, old time, and old project order. Need meaningful multi-date tests, not only updated assertions.
- Verify generated PDFs visually against the final file, verify admin editing / round-trip and booking invariants, then commit/publish and verify live GitHub Pages. No current edits have been committed or deployed.

Current goal remains active. No new user input is required to continue implementation.
