# September reconciliation — 6 September 2026

This update supersedes the earlier same-day **audit** in `2026-09-06-programme-review.md`. That report describes the pre-change state, not the current database.

## Authority and result

- September appointments: [user-supplied workbook](https://drive.google.com/file/d/18lylRf1_-ttqsf5SkivKhvk5yzI72lnc/view), read again on 6 September. Only the sanitized September roles are stored in `data/september-2026-reviewed.json`; the distribution list and contacts are not published.
- Name / credential references: [July final programme](https://drive.google.com/file/d/1h-hFlifvl1cCxxf5ghtSksDCAOJqe-Zm/view) and [August final programme](https://drive.google.com/file/d/1294QuWv4FKisTMEMMBoBXhDpoShHvrP8/view).
- Workbook reader shows September header as `2026-11-09 00:00:00`. It sits between August and October, with similar day/month inversions elsewhere. Applied to existing **2026-09-11**, the September meeting requested by the user; not imported as November 9.
- Live Supabase import: 14 September roles, **12 confirmed / 2 tentative**. Four existing September records updated (including the Speech 4 placeholder); ten missing roles added. Existing contacts and reservation IDs preserved. No source workbook writes.
- Other dates: August remains 14 confirmed; October 1 tentative; November 2 tentative; December 1 tentative. Only proven name aliases normalized outside September. Total: **32 reservations**.
- `member_willingness`: two interest names normalized to Kelvin SIM and TU Yu; no roles or notes changed.
- September `meeting_info.saa` is CHEN Qin. Venue and theme left unconfirmed. August SAA spelling normalized; August venue preserved.
- Pre-change reservation snapshot excluding contacts is retained locally under ignored `.private/`. It is not a full database backup; contact fields were never changed.

## September role holders

| Role | Programme display | State |
|---|---|---|
| SAA | CHEN Qin, VC5 | Confirmed |
| TME | Winona LIM | Confirmed |
| Timer | GOH Shu Ching, PM5, EH3 | Tentative (`Shuching?`) |
| Table Topics | XU Jiaqi, PM1 | Confirmed |
| Speech 1 | Sandy GOH, PM3 | Confirmed |
| Evaluator 1 | Vincent CHUA* | Confirmed |
| Speech 2 | Sabrina XU, PI3 | Confirmed |
| Evaluator 2 | Marc WONG* | Confirmed |
| Speech 3 | WEE Gee Shing, PI4 | Confirmed |
| Evaluator 3 | LER Wee Meng, ATMB, CL | Confirmed |
| Speech 4 | Sara LIM | Confirmed |
| Evaluator 4 | Jonta KOGA, PI2 | Confirmed |
| Ah Counter | TBC | Tentative (`?`) |
| Language Evaluator | LAU Kwong Fook, ATMB, CL | Confirmed |

`*` marks visiting Toastmasters. Cairnhill TMC and Anchorvale CC appear only in the left column. A blank credential means not confirmed from the final-reference documents; it does not mean the person has no qualifications. A historical workbook column lists Vincent Chua as DL5, but it is not silently treated as a confirmed September credential. Vincent CHUA and July's Vincent CHEN are different identities.

## Conflicting project data resolved in favour of the September workbook

| Speaker | Previous database | Applied source text |
|---|---|---|
| Sandy GOH | L4: The Entertaining Speech | The Communication Series: Entertaining Speaker + Storytelling L1 Project 4: How to Say It |
| Sabrina XU | Persuasive Influence L4: Manage Projects Successfully | Level 4 The Success Club Series/Better Speaker Series |
| WEE Gee Shing | Persuasive Influence L1: Evaluation and Feedback | Level 5 Successful Club Series - Evaluate to Motivate. |
| Sara LIM | TBC soft-block | Level 1 Evaluation and Feedback First Speech |

## Name corrections

Explicit aliases are in `scripts/people.js`; surnames are not inferred by moving the last word automatically.

| Old spelling / order | Reviewed name |
|---|---|
| Sandy / Sandy W. Goh | Sandy GOH |
| Shu Ching Goh / Shuching | GOH Shu Ching |
| Jiaqi Xu | XU Jiaqi |
| Kwong Fook Lau | LAU Kwong Fook |
| Wee Meng Ler | LER Wee Meng |
| Sabrina X. Xu / Sabrina Xu | Sabrina XU |
| Jonta Koga | Jonta KOGA |
| Wee Gee Shing | WEE Gee Shing |
| Yu Tu | TU Yu |
| Chen Qin | CHEN Qin |
| Kelvin Sim / Jayden Teo / Winona Lim / Sara Lim | Kelvin SIM / Jayden TEO / Winona LIM / Sara LIM |
| Jeanie Lee Chin Ying | Jeanie LEE |
| Attapol Pinsa / Sam Lim / Shelley Chow | Attapol PINSA / Sam LIM / Shelley CHOW |

Sandy GOH and GOH Shu Ching remain separate people. Jai Ganesh Supra retains the final PDF's spelling pending surname confirmation. Roster-only names not established by the final PDFs (e.g. Min Zhang, Li Wang, Xiaopeng Dong, Zi Hui Yeo, Sin En Soh, Wen Wei CHANG) remain unguessed; this is not a claim that every roster name has been confirmed by its owner.

## Generator corrections and verification

- Uses the August regular-meeting timing baseline, ending 21:50; calendar exports agree. July's special installation timing is not reused.
- Carries `confirmed` into the sheet; question-mark assignments remain TBC.
- Never fills a missing current project from historical speeches or an assumed member Pathway.
- Saved non-catalogue project text remains visible in the admin dropdown.
- Name + verified credential + optional visitor marker on the right; club affiliation separate on the left.
- Removes unconfirmed September SMU address/map and old voting QR codes.
- Restores full objectives from the user-supplied final-reference projects where available. Additional official-reference purpose text is explicitly labelled as paraphrased, not passed off as a verbatim manual.
- Share links are labelled snapshots. Manual text edits must be exported via Word/PDF, or updated in the planner before sharing a new snapshot.
- Browser test `scripts/verify-programme.cjs` reads the real backend, compares all 14 roles and all project strings, verifies pending labels, guest-name columns, custom admin projects, share-link round-trip and October's empty project remaining empty. It does not insert a test booking.
- Source-table parsing now includes SAA and no longer misclassifies historical Speech 5 as Speech 4.

## Still needs VPE / speaker review before final publication

1. Timer acceptance; Ah Counter holder.
2. Venue/address, selected theme (the workbook lists two question-mark alternatives), voting codes and speech titles.
3. Vincent CHUA and Marc WONG's current credentials; no assumed qualification is printed.
4. Sandy's level: the source says **L1 Project 4**, while the [official 2026 vintage-path briefing](https://content.toastmasters.org/image/upload/vintage-paths-talking-points-club-officers.pdf) places How to Say It in **Level 2**. The source wording has been preserved for review, not silently corrected. Exact objectives/timing await the intended project reference.
5. Sabrina's exact selected module and duration within the two named series. WEE's source describes a Successful Club Series presentation, not a fully specified Pathways project. Official guidance describes [Evaluate to Motivate as 10 minutes](https://france.toastmasters.org/magazine/magazine-issues/2017/august2017/speech-evaluations). Sara's first speech has a [5–7 minute evaluation form](https://ccdn.toastmasters.org/medias/files/department-documents/education-documents/evaluation-resources/english/8100e1-evaluation-resource-first-speech.pdf). Recheck the 7:55–8:30 speech block after the remaining durations are known.

This is a reviewed, exportable **draft**, not an automatically approved final programme. The supplied workbook was imported once; there is no new continuous Drive-to-Supabase sync.
