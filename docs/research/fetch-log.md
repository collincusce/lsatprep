# Stage 1 research — fetch log

Audit trail of every URL hit during the Stage 1 research subagent run.
Date of access: 2026-04-20.

Columns: URL | result | note

## LSAC (official, public samples)

| URL | Result | Note |
|---|---|---|
| https://www.lsac.org/lsat/taking-lsat/test-format/logical-reasoning/logical-reasoning-sample-questions | SUCCESS | 10 full LR sample questions extracted with stimuli, stems, choices A-E, and stated correct answers. Primary source for LR few-shot anchors. |
| https://www.lsac.org/lsat/taking-lsat/test-format/reading-comprehension/reading-comprehension-sample-questions | SUCCESS | 3 RC passages (Lichtenstein humanities; Canadian aboriginal rights law; Dutch tulip social-sciences) plus 1 comparative pair (global warming), 14 RC questions total with stated correct answers. |
| https://www.lsac.org/lsat/taking-lsat/test-format/analytical-reasoning/analytical-reasoning-sample-questions | EMPTY | Page exists but contains only descriptive prose about Analytical Reasoning, no sample games. Section is retired as of Aug 2024; LSAC has de-emphasized AR sample pages. |
| https://www.lsac.org/sites/default/files/media/sample-large-print-lsat.pdf | PARTIAL (via curl + PDF read) | WebFetch returned a binary-only response; downloaded via curl. PDF contains 3 full LR questions (a city-council expressway flaw, an ancient-Egyptian-hippopotamus necessary-assumption, a jury-instructions EXCEPT-strengthen) plus answer-sheet forms. © 2015 LSAC. |
| https://www.lsac.org/lsat/prepare/types-lsat-questions/reading-comprehension | SUCCESS | Official description of RC section: 4 sets, subject areas (humanities / social sciences / biological-and-physical sciences / law), comparative reading rationale. Used for taxonomy authoring. |
| https://app.lawhub.org/library/drillsets | NOT FETCHED | LawHub requires an LSAC account login; out of scope for an unauthenticated subagent. Referenced as future authenticated source. |

## 7sage (difficulty methodology + taxonomy)

| URL | Result | Note |
|---|---|---|
| https://7sage.com/lr-question-types | SUCCESS | Full 19-type LR taxonomy with average-frequency-per-section and typical stem templates. Used as the primary template source for Section 3 of the dossier. |
| https://7sage.com/lsat-resources/lsat-score-calculator | SUCCESS | Raw-to-scaled conversion principles, equating notes, "miss 7-9 to get 170" thresholds. Used to anchor §2. |
| https://7sage.com/discussion/12933/difficulty-ratio | SUCCESS (text, not methodology) | Confirms 1-5 star scale for games but no percent-correct thresholds. |
| https://7sage.com/discussion/16301/questions-difficulty | SUCCESS (text, not methodology) | Confirms "Easy, Easier, Medium, Hard, Very Hard" labels based on 7sage-user data. No published percent thresholds. |
| https://www.7sage.com/forums/discussion/38442/average-test-question-difficulty/p1 | SUCCESS (thin) | Thread is user speculation; no official methodology. |
| https://classic.7sage.com/lsat_explanations/lsat-june-2007-section-1-game-2 | REDIRECT → 7sage.com root | Could not access specific LG explanation without account. Used LSAT Trainer fallback instead. |
| https://7sage.com/lsat-resources/sample-lsat-questions | PARTIAL | Page description only; actual questions embedded as PNG images we can't OCR. |

## Third-party prep (LSAT Trainer, LSAT Hacks, PowerScore, Manhattan, LSAT Demon)

| URL | Result | Note |
|---|---|---|
| https://www.trainertestprep.com/lsat/blog/sample-lsat-logic-games | SUCCESS | June 2007 LSAT LG setups (product codes, film festival, ship voyages, recycling centers). Scenarios + rules captured; questions 1-23 referenced but full text per-question not on this page. Authentic LSAC content used with permission per site's own disclosure. |
| https://www.trainertestprep.com/lsat/blog/logical-reasoning-question-types | SUCCESS | LSAT Trainer's 3-group LR taxonomy (Argument Evaluation / Structure Recognition / Non-Argument) with per-exam frequency ranges. Used for Section 3 taxonomy. |
| https://blog.powerscore.com/lsat/lsat-logical-reasoning-and-some-of-its-challenges/ | SUCCESS | "Shell game", "accurate but irrelevant", "verbatim but wrong", "emotionally compelling distractor" trap categories captured. |
| https://blog.powerscore.com/lsat/lsat-lr-traps-how-to-avoid-the-natural-question-error/ | SUCCESS | "Natural question trap" discussed. |
| https://www.powerscore.com/lsat/help/lr_flaws.cfm | 403 FORBIDDEN | Blocked; fallback to blog.powerscore.com content. |
| https://lsathacks.com/ | 403 FORBIDDEN | Cloudflare-challenge blocked. |
| https://lsathacks.com/logical-reasoning-question-types/ | SUCCESS | LR question type list extracted; used as cross-check against 7sage taxonomy. |
| https://lsathacks.com/khan-academy-lsat-explanations/ | 403 FORBIDDEN | Blocked. |
| https://lsathacks.com/explanations/june-2007-lsat/logic-games/ | 403 FORBIDDEN | Blocked — site aggressively challenges scrapers. |
| https://lsathacks.com/explanations/june-2007-lsat/logic-games/game-1-setup/ | 403 FORBIDDEN | Blocked. |
| https://testmaxprep.com/lsat/lsat-practice-videos/logic-games/june-2007-lsat-game-1-setup | SUCCESS | June 2007 Game 1 scenario + 4 rules captured. Questions not on page. |
| https://www.foxlsat.com/blog/june-2007-lsat-game-2-setup | 404 NOT FOUND | Page moved or retired. |
| https://crushthelsatexam.com/guide-to-lsat-logic-games/ | SUCCESS | Confirms game families (sequencing / grouping / matching / distribution / selection / hybrid) and difficulty drivers. |
| https://lsatdemon.com/resources/lsat-tips-and-strategies/are-there-difficulty-levels-on-lsat-questions | SUCCESS (thin) | WebFetch returned no body text; metadata only. Not used for citations. |

## Khan Academy / LawHub

| URL | Result | Note |
|---|---|---|
| https://www.khanacademy.org/test-prep/lsat-prep | NOT FETCHED | Khan Academy LSAT migrated to LawHub in 2023; no longer accessible via Khan URL without redirect to authenticated LawHub. |
| https://app.lawhub.org/article/khan-academy-lsat-prep-resources-available-now | NOT FETCHED | Authenticated. |

## Summary of what was obtainable

- **10 authentic LR questions** from the LSAC official LR sample page (full text with stated correct answers).
- **3 more authentic LR questions** from the LSAC 2015 Large Print LSAT PDF (full stimuli, stems, and choices; correct answers not stated in PDF because it's a test booklet, not an answer key — we provide reasoned-out correct answers for those).
- **3 RC passages + 1 comparative pair** (4 total passage units; 14 questions) from the LSAC official RC sample page with stated correct answers.
- **2 LG scenarios** (June 2007 product codes; June 2007 film festival) with full scenario + rules text; questions reconstructed from mainstream-prep summaries.
- **7sage 19-type LR taxonomy** with per-section frequencies and stem templates.
- **7sage difficulty methodology** (1-5 stars based on 7sage-user percent-correct aggregates; no published star-to-percent mapping).
- **PowerScore trap catalog** (shell game, accurate-but-irrelevant, verbatim-but-wrong, emotionally-compelling, natural-question-trap).
- **Scoring curve benchmarks** (55% correct → 150 / 50th percentile; 75% → 160 / 75th percentile; 84%+ → 166+ / 90th percentile; 95%+ → ~175).

## Sources that blocked us or proved unavailable

- LSAT Hacks (Cloudflare challenge on every URL).
- LawHub / Khan Academy (authentication-gated).
- 7sage LSAT explanation pages (redirect loops for unauthenticated fetches).
- `lsac.org` analytical reasoning sample page (empty of sample games; section is retired).

## Abort-condition check

Task 18's abort condition triggers if "ZERO real-or-adapted LR samples" are obtained. We obtained **13 authentic LR items with verbatim LSAC stimuli and stems** plus RC and LG content. Abort condition **NOT triggered**. The corpus is strong enough for downstream few-shot anchoring.
