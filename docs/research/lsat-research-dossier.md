# LSAT research dossier — Stage 1

**Owner:** Stage-1 research subagent
**Date compiled:** 2026-04-20
**Purpose:** Source material, taxonomy, and few-shot anchor corpus for the 4,000-question LSAT generation pipeline (`generation/`).
**Companion artifacts:** `docs/research/lsac-samples/*.json` (22 sample records), `docs/research/fetch-log.md`.

---

## 1. LSAC public sample questions — what we got

LSAC publishes a handful of free sample questions on its public website. These are the gold-standard anchors: they are authentic LSAC content with stated or inferrable correct answers.

### What we fetched

| Source | URL | Result | Samples obtained |
|---|---|---|---|
| LSAC official LR sample page | https://www.lsac.org/lsat/taking-lsat/test-format/logical-reasoning/logical-reasoning-sample-questions | SUCCESS (full verbatim) | **10 LR questions** with stated correct answers |
| LSAC official RC sample page | https://www.lsac.org/lsat/taking-lsat/test-format/reading-comprehension/reading-comprehension-sample-questions | SUCCESS (full verbatim) | **3 single RC passages + 1 comparative pair = 14 RC questions** |
| LSAC 2015 Large Print LSAT PDF | https://www.lsac.org/sites/default/files/media/sample-large-print-lsat.pdf | DOWNLOADED via curl | **3 additional LR questions** (verbatim stimuli + stems + choices; answer key not published in that PDF) |
| LSAC official AR (Logic Games) sample page | https://www.lsac.org/lsat/taking-lsat/test-format/analytical-reasoning/analytical-reasoning-sample-questions | EMPTY | Page contains descriptive prose only; no sample games. Logic Games section was retired from the LSAT in August 2024, and LSAC has de-emphasized its AR sample material. |
| LawHub (PrepTests) | https://app.lawhub.org/library/drillsets | BLOCKED (auth-gated) | Not used; requires LSAC account. |

### Totals obtained

- **13 authentic LR items** (10 with LSAC-published correct answers + 3 from the 2015 Large Print PDF, answer keys inferred).
- **4 authentic RC passage units** (3 single-passages + 1 comparative pair) covering 14 individual RC questions, all with LSAC-published correct answers. Genre coverage: humanities, law, social_sciences, comparative (paired natural-science-policy texts). **Missing: pure natural_science and no LSAC sample for a standalone comparative humanities/law pair.**
- **2 LG games** from the June 2007 LSAT (Game 1 "product codes" and Game 2 "film festival"), scenarios + rules captured verbatim from third-party reprints of the publicly-released June 2007 LSAT. Question text adapted because full verbatim question text of the June 2007 games is paywalled or behind anti-scrape protection on LSAT Hacks / 7sage / Fox LSAT.

### Fallback source tree actually used

1. LSAC own free sample pages → primary source for 10 LR + 14 RC questions.
2. LSAC 2015 Large Print LSAT PDF → 3 additional LR.
3. LSAT Trainer (reprints June 2007 with LSAC permission) → 2 LG scenarios.
4. 7sage public taxonomy pages (non-paywalled) → taxonomy reference for §3.
5. PowerScore blog → trap catalog reference for §6.

### Site blockers we hit

- **LSAT Hacks**: every URL returned 403 (Cloudflare challenge). Not usable as a direct source.
- **7sage explanation pages**: redirect to root for unauthenticated clients. Only non-paywalled public lesson pages were usable.
- **Khan Academy LSAT**: the content has migrated into LawHub (authenticated). Khan's public LSAT URLs no longer return content.
- **Anthology of June 2007 LG questions with full verbatim text**: surprisingly hard to find free. Got scenarios + rules, but full per-question verbatim text was behind 403 challenges or paywalls. We marked the 4 LG items as `third_party_adaptation` and flagged them for Stage-5 critic review.

### Honest limits

- No standalone **natural_science** RC passage. The IPCC/global-warming comparative passage is adjacent but labeled `comparative`.
- No **pure LSAC LG sample with verbatim question text and confirmed answer key**. Scenarios and rules are authentic; question text is adapted.
- No authoritative **7sage star → percent-correct mapping** exists in any public page we could find. The mapping in §2 is synthesized from LSAT percentile data, not lifted from 7sage.

**Abort condition (Task 18): NOT triggered.** The corpus contains 13 authentic LR items, which is well above the "zero real-or-adapted LR samples" threshold that would abort Stage 1.

---

## 2. Difficulty methodology — 7sage, LSAT Hacks, LSAC equating

### What 7sage actually publishes

7sage rates questions on a **1–5 star scale**, where 1 is easiest and 5 is hardest. The ratings come from 7sage-user data: how often 7sage members (aggregated across all practice takes) answer the question correctly. [[7sage difficulty ratio forum](https://7sage.com/discussion/12933/difficulty-ratio)] [[7sage questions difficulty forum](https://7sage.com/discussion/16301/questions-difficulty)]

A caveat 7sage notes publicly: because users typically study older PrepTests first (when they're worse test-takers) and newer PrepTests last (when they're more skilled), older PrepTests look harder than they actually are to an end-of-study user. [[7sage forum discussion](https://classic.7sage.com/forums/discussion/27266/any-notoriously-difficult-lr-sections)]

**We did not find a published 7sage star-to-percent-correct table.** Multiple 7sage pages reference the 1–5 scale and reference "percentages of people choosing certain answers" but none state, e.g., "5-star = ≤30% correct." Any claim to that effect would be synthesis.

### LSAC equating and overall section-level anchors

LSAC converts raw scores to scaled scores (120–180) using equating to smooth out test-to-test difficulty. Public anchors (compiled from 7sage score calculator, PowerScore, and Blueprint):

- **~55% raw correct → 150 scaled, ~50th percentile.** [[7sage score calculator](https://7sage.com/lsat-resources/lsat-score-calculator)]
- **~75% raw correct → 160 scaled, ~75th percentile.**
- **~84% raw correct → 166 scaled, ~90th percentile.** [[testmaxprep percentiles](https://testmaxprep.com/blog/lsat/lsat-percentiles)]
- **~95%+ raw correct → 175 scaled.**
- **Miss 7–9 to score 170** depending on the test's curve.

### Our calibration for the 1★/2★/3★ scale

The generator uses a 3-level scale, not 5. We map as follows, explicitly labeled as **our synthesis** informed by 50th/75th/90th percentile raw-correct benchmarks:

| Our difficulty | Approximate % of test-takers correct | Real-taker profile |
|---|---|---|
| **1★ (easy)** | ~80–100% correct | A question a student at ~50th percentile (150) would get right. Structure is clean, one gap, no conditional chain. |
| **2★ (medium)** | ~50–79% correct | A question a median student gets right roughly half the time — the middle of the LSAT difficulty band where most questions cluster. |
| **3★ (hard)** | ~15–49% correct | A question only top-quartile (160+, 75th percentile) students reliably get. Typically nested conditional logic, subtle scope shift, or dense parallel reasoning. |

**Source authority**: the percent-correct ranges are extrapolated from LSAC percentile data and the 7sage score-calculator raw-to-scaled conversions. They are **not** a published 7sage standard, and we explicitly note this in the generated questions' `difficultyReason` fields.

### How difficulty is driven up (consensus across sources)

From LSAT Hacks / 7sage / PowerScore / LSAT Trainer:

- **LR**: (a) conditional nesting (chains of 3+ conditionals), (b) abstract answer choices that describe reasoning in formal logic terms (Method of Reasoning, Parallel Reasoning), (c) EXCEPT-format stems, (d) scope-shift stimuli where the conclusion subtly re-describes the premise, (e) Parallel Flaw with 5 dense five-line answers.
- **RC**: (a) passage topic density (comparative > single; philosophy > history), (b) structural subtlety (author position only revealed in final paragraph), (c) questions requiring synthesis across passages or paragraphs, (d) extreme-language answer-choice traps.
- **LG**: (a) non-1:1 ratio of entities to positions, (b) conditional rules with contrapositive chains, (c) hybrid games (grouping + sequencing), (d) rule-substitution questions, (e) numerical distribution uncertainty ("at least 2 but no more than 4").

---

## 3. LR subtype taxonomy (16 subtypes)

Consolidated from LSAT Trainer's 14-type grouping [[link](https://www.trainertestprep.com/lsat/blog/logical-reasoning-question-types)], 7sage's 19-type taxonomy [[link](https://7sage.com/lr-question-types)], LSAT Hacks's type guide, and our own 16-subtype target from the coverage matrix.

### 3.1 assumption_necessary

- **Stimulus structure**: argument with a premise(s) → conclusion. The correct necessary assumption is a gap-filler that, if false, destroys the argument.
- **Stem templates**:
  - "Which one of the following is an assumption required by the argument?"
  - "The argument depends on assuming which one of the following?"
  - "Which one of the following is an assumption on which the argument relies?"
- **Common traps**:
  - **Too strong / sufficient**: the answer would prove the conclusion rather than merely enable it. (A sufficient answer is too strong for a necessary question.)
  - **Out of scope**: attractive topical continuation that the argument doesn't actually need.
  - **Reversed direction**: the assumption is stated backwards (B → A instead of A → B).
- **Difficulty drivers**: more plausible-sounding wrong answers; argument with embedded intermediate conclusion; negation test that requires careful re-reading.

**Example anchor**: `lr-lsac-largeprint-02.json` (the ancient-Egyptian hippopotamus). Trap (A) is out-of-scope; (C) conflates sufficient with necessary; (D) is correct via negation-test.

### 3.2 assumption_sufficient

- **Stimulus structure**: an argument with an obvious but unbridgeable gap. The correct sufficient assumption welds the premise set to the conclusion with 100% force.
- **Stem templates**:
  - "The conclusion follows logically if which one of the following is assumed?"
  - "Which one of the following principles, if valid, would most help to justify the reasoning above?"
- **Common traps**:
  - **Reversed conditional**: if conclusion says "A → B," trap offers "B → A."
  - **Too weak**: an assumption that only makes the argument likely but not logically certain.
  - **Partial bridge**: handles one premise but not the full gap.
- **Difficulty drivers**: the stimulus uses conditional language that can be formalized (e.g., "unless," "only if"); the correct answer is often the contrapositive of a relevant premise.

**Example anchor**: `lr-lsac-sample-07.json` (Peacock/Hacker feminist poets). Trap (D) is reversed; (E) is too weak.

### 3.3 strengthen

- **Stimulus structure**: causal or analogical argument. Correct answer rules out an alternative explanation, confirms a key premise, or supports an implicit mechanism.
- **Stem templates**:
  - "Which one of the following, if true, most strengthens the argument?"
  - "Which one of the following, if true, provides the most support for the argument?"
- **Common traps**:
  - **Introduces alternative cause** (often a weakener disguised).
  - **Accurate but irrelevant**: true-sounding factual addition that doesn't actually bear on the conclusion.
  - **Strengthens a different conclusion** than the one stated.
- **Difficulty drivers**: scientific / methodological stimuli where the argument relies on an unstated mechanism the correct answer isolates.

**Example anchor**: `lr-lsac-sample-04.json` (1987 supernova). Correct (B) rules out the "our instruments just can't see that far" alternative.

### 3.4 weaken

- **Stimulus structure**: causal, predictive, or inferential argument. Correct answer offers an alternative explanation, counterexample, or relevant disanalogy.
- **Stem templates**:
  - "Which one of the following, if true, most weakens the argument?"
  - "Which one of the following, if true, most seriously undermines the argument's conclusion?"
- **Common traps**:
  - **Opposite answer**: actually strengthens.
  - **Accurate but irrelevant**.
  - **Too narrow**: weakens a small part of the chain but not the conclusion.
- **Difficulty drivers**: multi-step causal chains where the correct weakener addresses a hidden link rather than the most visible one.

### 3.5 flaw

- **Stimulus structure**: argument with a structural error (false dichotomy, unrepresentative sample, correlation→causation, ad hominem, equivocation, necessary/sufficient swap, overgeneralization, unwarranted scope shift, etc.).
- **Stem templates**:
  - "The reasoning in the argument is most vulnerable to criticism on the grounds that the argument..."
  - "The argument is flawed in that it..."
  - "The reasoning above is questionable because it..."
- **Common traps**:
  - **Misdescribes the argument**: the choice sounds like a real flaw but doesn't match the actual structure.
  - **Plausible but absent**: a flaw that could be made about a similar argument, but isn't in this one.
  - **Right flaw, reversed**: describes the flaw backwards (e.g., "treats a sufficient condition as necessary" when it's the opposite).
- **Difficulty drivers**: abstract flaw language; EXCEPT-format (four describe real flaws, one is the misdescription); authors whose premises use conditional language.

**Example anchors**: `lr-lsac-sample-05.json` (political scientist on democracy — correct D describes a "neither necessary nor sufficient, but still promotes" overlooked possibility) and `lr-lsac-largeprint-01.json` (mayor's false-dilemma flaw).

### 3.6 parallel_reasoning

- **Stimulus structure**: a valid short argument. Answer choices are five mini-arguments, one of which matches the stimulus in structure.
- **Stem templates**:
  - "The reasoning in the argument above is most similar to the reasoning in which one of the following?"
  - "Which one of the following arguments is most similar in its reasoning to the argument above?"
- **Common traps**:
  - **Same topic, different structure**: lured by content similarity.
  - **Same conclusion strength, wrong premise count**.
  - **Valid but not parallel**: a valid argument with a different logical form.
- **Difficulty drivers**: abstraction — student must translate each answer into formal structure.

### 3.7 parallel_flaw

- **Stimulus structure**: a flawed argument. Correct answer has the same flaw.
- **Stem templates**:
  - "The flawed reasoning in which one of the following is most similar to the flawed reasoning in the argument above?"
  - "Which one of the following arguments exhibits flawed reasoning most similar to that exhibited by the argument above?"
- **Common traps**:
  - **Valid analog**: an answer with the right topic but no flaw.
  - **Different flaw, same topic**.
  - **Close but off-by-one**: the flaw is similar but mis-scaled (e.g., percentages vs. absolute numbers).
- **Difficulty drivers**: even harder than parallel_reasoning because students must correctly identify the flaw first, then match its structure.

**Example anchor**: `lr-lsac-sample-10.json` (Carpaccio/sumptuous reds). Stimulus flaw: "most X have Y; a thing has Y; therefore the thing is an X." Correct (D) replicates the base-rate reversal exactly.

### 3.8 method_of_reasoning

- **Stimulus structure**: argument structure is the target — how the author reasons.
- **Stem templates**:
  - "The argument proceeds by..."
  - "The executive's reasoning does which one of the following?"
  - "Which one of the following describes a technique of reasoning used in the argument?"
- **Common traps**:
  - **Partially true**: describes one move but not the main technique.
  - **Extreme verbs**: "proves," "disproves," "refutes" when the argument only suggests.
- **Example anchor**: `lr-lsac-sample-02.json` (print vs. website ads). Correct (D) describes analogy-under-information-asymmetry.

### 3.9 role_in_argument

- **Stimulus structure**: author identifies a specific sentence or claim; student must describe its function.
- **Stem templates**:
  - "The claim that [X] plays which one of the following roles in the argument?"
  - "The reference to [X] functions in the argument to..."
- **Common traps**:
  - **Confuses premise with conclusion / subsidiary conclusion**.
  - **Accurate content, wrong function**.
- **Difficulty drivers**: arguments with main conclusion + intermediate conclusion + evidence for the intermediate; the claim in question may serve two functions at once.

### 3.10 point_at_issue

- **Stimulus structure**: two speakers. The correct answer is something that one explicitly affirms and the other explicitly denies.
- **Stem templates**:
  - "A and B disagree over whether..."
  - "The dialogue provides the most support for the claim that A and B disagree about..."
- **Common traps**:
  - **One-sided**: only one speaker takes a position; the other doesn't address it.
  - **Agreement in disguise**: both speakers would accept it.
  - **Out of scope**.
- **Difficulty drivers**: speakers with nuanced, partially-overlapping views.

**Example anchor**: `lr-lsac-sample-01.json` (Laird vs. Kim on pure research).

### 3.11 main_point

- **Stimulus structure**: argument. Correct answer summarizes the main conclusion faithfully.
- **Stem templates**:
  - "Which one of the following most accurately expresses the main conclusion of the argument?"
- **Common traps**:
  - **Restates a premise as if it were the conclusion**.
  - **Verbatim but wrong** (quotes wording from the stimulus but from the wrong sentence).
  - **Overstates** or **understates** the claim's strength.
- **Difficulty drivers**: stimuli with signal phrases ("therefore," "thus") that mark an intermediate conclusion, tempting students to pick it.

### 3.12 must_be_true

- **Stimulus structure**: a set of facts. Correct answer is entailed by those facts with certainty.
- **Stem templates**:
  - "Which one of the following must also be true?"
  - "If the statements above are true, which one of the following must also be true?"
- **Common traps**:
  - **Could be true but not must**.
  - **Too strong**: claims more than the premises justify.
  - **Contradicted by the stimulus**.
- **Difficulty drivers**: conditional chains where the correct deduction is a contrapositive; EXCEPT-format inference questions.

**Example anchor**: `lr-lsac-sample-03.json` (Quebec Bridge 1907).

### 3.13 most_strongly_supported

- **Stimulus structure**: facts. Correct answer is the most defensible inference, even if not entailed with certainty.
- **Stem templates**:
  - "Which one of the following is most strongly supported by the information above?"
  - "The statements above, if true, most support which one of the following?"
- **Common traps**:
  - **Too strong**: correct answers lean weak (e.g., "some," "in some cases"); extreme answers are nearly always wrong.
  - **Plausible but unsupported**: appealing worldly truth not actually supported by the stimulus.
- **Difficulty drivers**: distinguishing "supported" from "entailed" — students over-demand certainty.

### 3.14 principle_conform

- **Stimulus structure**: a principle is stated. Answer choices are scenarios; the correct one conforms to the principle.
- **Stem templates**:
  - "Which one of the following judgments most closely conforms to the principle above?"
  - "Which one of the following conforms most closely to the principle stated above?"
- **Common traps**:
  - **Reversed application**: applies the principle's contrapositive incorrectly.
  - **Partial fit**: satisfies only the antecedent or only the consequent.
- **Difficulty drivers**: principles with multi-part antecedents.

### 3.15 principle_justify

- **Stimulus structure**: an argument. Correct answer is a principle that, if accepted, licenses the argument's conclusion.
- **Stem templates**:
  - "Which one of the following principles, if valid, most helps to justify the reasoning above?"
- **Common traps**:
  - **Too narrow** (doesn't cover the full argument).
  - **Too broad** (covers things the argument doesn't need).
  - **Reversed**: principle implies the opposite conclusion.
- **Example anchor**: `lr-lsac-sample-06.json` (pharma pricing).

### 3.16 paradox_resolve

- **Stimulus structure**: two seemingly-conflicting facts. Correct answer explains how both can be true.
- **Stem templates**:
  - "Which one of the following, if true, most helps to resolve the apparent discrepancy in the information above?"
  - "Which one of the following, if true, would most help to explain the surprising phenomenon?"
- **Common traps**:
  - **Deepens the paradox** instead of resolving it.
  - **Irrelevant**: true but doesn't touch the conflict.
  - **Resolves one horn only**.
- **Example anchor**: `lr-lsac-sample-09.json` (headlights / mandatory-use paradox). Correct (C) identifies self-selection.

---

## 4. RC taxonomy — 5 genres × ~8 question types

### 4.1 Genres

Consolidated from LSAC's own RC overview [[link](https://www.lsac.org/lsat/prepare/types-lsat-questions/reading-comprehension)].

- **Humanities**: arts, literature, literary criticism, philosophy of art, music history, aesthetics. Tone: often interpretive, with multiple critical viewpoints. Style: evocative, adjective-rich. Difficulty drivers: author's stance is implicit; requires tracking attitudes across shifts in tone. **Anchor**: Lichtenstein / pop art (`rc-lsac-lichtenstein.json`).
- **Social_sciences**: history, political science, sociology, anthropology, economics, psychology. Tone: analytic, often with a thesis and dissenting view. Style: moderate-density, terminology-introduced-on-use. Difficulty drivers: multiple scholars' views; main argument is often a synthesis. **Anchor**: Dutch tulip / speculative bubble (`rc-lsac-dutch-tulip.json`).
- **Natural_science**: biology, chemistry, physics, geology, ecology, astronomy, neuroscience. Tone: explanatory, with experimental evidence and counter-hypotheses. Style: high-density technical vocabulary defined inline. Difficulty drivers: mechanism-tracking; distinguishing correlation from causation in methodology; separating the scientific finding from the author's editorial. **Gap**: we have no pure natural_science anchor. The global-warming comparative pair is the closest; generators will need to synthesize this genre more carefully.
- **Law**: legal reasoning, case analysis, statutory interpretation, jurisprudence, legal history, policy-as-law. Tone: argumentative, exacting in language. Style: formal, often tracks a specific legal question across paragraphs. Difficulty drivers: unfamiliar terminology; following a court's or theorist's reasoning chain; distinguishing descriptive from prescriptive claims. **Anchor**: Canadian aboriginal rights (`rc-lsac-aboriginal-rights.json`).
- **Comparative**: two short passages addressing the same topic, often from different disciplines or with different stances. LSAC's RC overview explicitly names relationships: "generalization/instance, principle/application, or point/counterpoint." Questions ask about agreement, disagreement, what appears uniquely in one passage, and how they'd respond to each other. **Anchor**: IPCC / skeptic pair on global warming (`rc-lsac-global-warming-comparative.json`).

### 4.2 Question types (8 recurring)

LSAC groups these as Main Idea / Explicit / Inferred / Meaning-in-Context / Organization / Application / Author / Additional-Evidence [[LSAC RC overview](https://www.lsac.org/lsat/prepare/types-lsat-questions/reading-comprehension)]. Our taxonomy consolidates to 8:

1. **main_point** — overall thesis. Stem: "Which one of the following most accurately states the main point / primary purpose of the passage?" Traps: paragraph-level restatements; too-narrow; too-broad.
2. **author_attitude** — tone/stance. Stem: "The author's attitude toward X can best be described as...". Traps: overstating positivity/negativity; mixing two attitudes when only one is present.
3. **passage_structure** — organization. Stem: "Which one of the following most accurately describes the organization of the passage?" Traps: mis-sequencing the moves; wrong grain-size (confusing paragraph structure with sentence structure).
4. **specific_detail** — explicit content. Stem: "According to the passage, which one of the following...". Traps: distractors that slightly alter a word or qualifier; correct answer is often paraphrased.
5. **inference** — derived but not stated. Stem: "It can be inferred from the passage that..."; "The passage most strongly suggests..." Traps: overreach; correct answers are usually hedged.
6. **function** — purpose of a specific reference. Stem: "The author's discussion of X serves primarily to..." Traps: accurate content description but wrong function; rhetorical-purpose answers that mis-describe local move.
7. **strengthen_weaken_claim** — how new information would affect a claim. Stem: "Which one of the following, if true, would most support/undermine the author's position regarding...?" Traps: off-target claim; mixing up which stated position the question asks about.
8. **application** — principle/analogy matching. Stem: "Which one of the following situations most closely conforms to the principle described in the passage?"; "Which one of the following is most analogous to X as described in the passage?" Traps: surface similarity; matches on one dimension but not the principle's main operation.

### 4.3 Stylistic markers

Authentic LSAT RC passages share:

- Third-person register, usually no "I."
- Adversative turns: "however," "yet," "nonetheless," "by contrast," "even so."
- Hedges: "some scholars argue," "it has been suggested," "this view is not without difficulties."
- Summative closers: the last sentence of paragraph 1 or the final sentence of the passage often states the thesis.
- Named disputants: "Mackay argues...Garber challenges" — common structure.

---

## 5. LG taxonomy — 4 families

Logic Games were retired from the LSAT in August 2024. Our app ships them behind an opt-in toggle, so the taxonomy still matters.

### 5.1 basic_linear (sequencing)

- **Scenario shape**: exactly N entities in N ordered slots (e.g., 7 students present on 7 consecutive days).
- **Entity/position counts**: typically 5–8 of each, 1:1 mapping.
- **Common rule types**: "A is before B," "C is at position X," "D and E are in adjacent positions," "F is not at position 1," block-constraint pairs.
- **Difficulty drivers**: many floating variables (rules constrain only 2–3 entities); rules with "either A or B at position X."
- **Anchor**: `lg-june2007-game1-product-codes.json` (five-digit codes).

### 5.2 advanced_linear

- **Scenario shape**: entities assigned to slots, plus an additional dimension per slot (e.g., day AND time; position AND color). Effectively a 2D grid.
- **Entity/position counts**: 5–7 entities × 2–3 attributes.
- **Common rule types**: all basic-linear rules plus attribute-pairing rules ("whoever is on Monday wears blue").
- **Difficulty drivers**: cross-dimensional inference; conditional rules that span dimensions.

### 5.3 grouping (distribution / selection)

- **Scenario shape**: entities distributed into groups (e.g., 8 lawyers divided among 3 law firms) or selected from a pool (e.g., 5 of 8 pieces chosen).
- **Entity/position counts**: 6–10 entities, 2–4 groups, often with min/max sizes per group.
- **Common rule types**: "if A, then B is also in the group," "C and D are in different groups," "at least 2 but no more than 4 per group."
- **Difficulty drivers**: numerical distribution uncertainty; conditional rules that can force whole groups.

### 5.4 hybrid

- **Scenario shape**: combines two families. E.g., group-then-sequence (assign to teams AND order within team), or linear-plus-matching (order plus attribute).
- **Entity/position counts**: high — 7+ entities across two structures.
- **Common rule types**: any rules from the constituent families.
- **Difficulty drivers**: rules that interact across the two structures; the number of valid full configurations is often large.
- **Anchor**: `lg-june2007-game2-film-festival.json` (films shown last on 3 days; each shown at least once; each day has a last-film constraint).

### 5.5 What makes games harder (cross-family)

- Conditional rules with two antecedents or two consequents.
- Rules with "only if" or "unless" that require a careful translation.
- Rule-substitution questions: "which one of the following, if substituted for rule 3, would have the same effect on the game?" (question type `equivalent` in our schema).
- Games with very few valid worlds (forces long chains of deduction) or very many (harder to enumerate).
- Minimum/maximum questions that require optimizing under all valid worlds.

---

## 6. Wrong-answer trap catalog

Authoritative sources: PowerScore blog [[link](https://blog.powerscore.com/lsat/lsat-logical-reasoning-and-some-of-its-challenges/)], [[Natural question trap](https://blog.powerscore.com/lsat/lsat-lr-traps-how-to-avoid-the-natural-question-error/)], 7sage LR question types page [[link](https://7sage.com/lr-question-types)], LSAT Trainer question-types guide.

Ten recurring trap patterns. One concrete LR illustration per trap.

### 6.1 Sufficient/necessary swap

The answer reverses a conditional or treats a sufficient condition as necessary (or vice versa).

**Illustration** (constructed): Stimulus says "All deer are herbivores." A weaken-the-conclusion trap says "Some herbivores are not deer." That's the contrapositive of the wrong direction — doesn't contradict the stimulus at all.

### 6.2 Out of scope

Topically related but not on the argument's actual chain of reasoning.

**Illustration**: in `lr-lsac-largeprint-02.json` (hippopotamus), trap (C) "the tomb was not reentered" is out-of-scope — entry-and-exit isn't part of the breaking-the-legs inference.

### 6.3 Half-right / partial match

The answer nails one feature of the correct answer but fails another.

**Illustration**: in `lr-lsac-sample-10.json` (Carpaccio), trap (A) gets the base-rate flavor right but changes the conclusion to "lifelong habit from one painting" — different structure.

### 6.4 Opposite answer

The answer does the exact opposite of what the question requires.

**Illustration**: a weaken-question trap that strengthens. In `lr-lsac-sample-04.json` (supernova), trap (D) "several features correctly predicted by current theory" supports the theory being strengthened — i.e., strengthens the opposite conclusion.

### 6.5 Too strong (extreme language)

Absolute qualifiers ("all," "never," "always," "only") where the stimulus justifies only a hedged claim. Common in Must Be True and Most Strongly Supported.

**Illustration**: in `lr-lsac-sample-03.json` (Quebec Bridge), trap (A) claims pre-1907 bridges "were unsafe for the public to use" — the stimulus only licenses a weaker claim about construction-phase safety assurance.

### 6.6 Temporal confusion

The answer attributes a property to the wrong time period, or assumes something that was true at one time is true at another.

**Illustration** (constructed): stimulus says "in the 1960s, most pop art was parodic." Trap: "pop art is parodic" — drops the temporal qualifier.

### 6.7 Reversed causation

Stimulus argues "A caused B," trap says "B caused A" or "A and B share a third cause." Actually correct for weaken questions; a trap when offered as a strengthener or necessary assumption.

**Illustration** (from a constructed case): stimulus: "After adopting the 4-day workweek, Company X's productivity rose 20%. Therefore the workweek caused the increase." Trap for strengthen: "Productivity increases often cause companies to experiment with workweek changes." Reverses the direction.

### 6.8 Relative vs. absolute

The answer treats a comparative claim as if it were an absolute one, or vice versa. Most common in RC and stat-based LR.

**Illustration**: "Regional temperatures have risen more since 1940 than in the century before" (relative). Trap: "Regional temperatures are high" (absolute). The argument only supports the comparative.

### 6.9 Unwarranted comparison

The stimulus doesn't compare two entities; the trap introduces an unjustified comparison.

**Illustration**: Stimulus: "Print ads underperformed for us." Trap: "Print ads underperform compared to TV ads." The stimulus is silent on TV.

### 6.10 Shift in subject

The trap substitutes a closely-related subject for the one the stimulus actually discusses.

**Illustration**: `lr-lsac-sample-01.json` (Laird/Kim), trap (A) "derives significance in part from providing new technologies" — both actually agree on this point. The shift is from "most valuable" (the disagreement) to "significant" (not the disagreement).

### Additional trap category from PowerScore: "Natural question trap"

The test-writer anticipates the natural question a reader would ask, then offers an answer that responds to that natural question rather than the one actually asked. [[PowerScore blog](https://blog.powerscore.com/lsat/lsat-lr-traps-how-to-avoid-the-natural-question-error/)]

Defense: identify the exact stem task first, then pre-phrase the correct answer's role before scanning choices.

---

## 7. Difficulty anchors — 3 examples mapped to 1★/2★/3★

These are three of the sample LR questions in `docs/research/lsac-samples/`, tagged as representative of each star level. Our mapping uses the calibration from §2.

### 7.1 1★ anchor — `lr-lsac-sample-09.json` (headlights paradox)

- **Rationale**: Paradox-resolve with a clear self-selection explanation. Stimulus is two short observations; the gap is intuitive once named. A median student primed on paradox structure would land on (C) in under a minute. Estimated real-taker correctness: ~82%.
- **What makes it easy**: one confound (self-selection) is the only explanation that resolves both parts of the paradox; no other answer even engages both horns.
- **Coverage-matrix assignment**: `LR / paradox_resolve / difficulty 1`.

### 7.2 2★ anchor — `lr-lsac-sample-01.json` (Laird vs. Kim on pure research)

- **Rationale**: Point-at-issue with a subtle priority-vs-value distinction. Trap (E) "has any value apart from providing new technologies to save lives" is a genuine trap because Laird affirms it but Kim's rejection is ambiguous. Estimated real-taker correctness: ~60%.
- **What makes it 2★**: one trap is genuinely close to the line; student must read Kim's final sentence carefully to see the distinction between "most valuable" (D) and "any value" (E).
- **Coverage-matrix assignment**: `LR / point_at_issue / difficulty 2`.

### 7.3 3★ anchor — `lr-lsac-sample-07.json` (Peacock/Hacker formal poets)

- **Rationale**: Sufficient assumption with five conditional answer choices, all of which have a surface-valid feel. The correct answer (C) is the only one that forces the necessary bridge between "politically progressive" and "not performing a politically conservative act" — and even that bridge has a counterintuitive "progressive can't perform a conservative act" feel. Estimated real-taker correctness: ~40%.
- **What makes it 3★**: four of the five traps are plausible conditionals that seem to strengthen the argument; correct answer requires formalizing both the conclusion and the premises to conditional form and finding the unique gap-filler. Also includes a reversed-conditional trap (D) and a no-op-feminist trap (A).
- **Coverage-matrix assignment**: `LR / assumption_sufficient / difficulty 3`.

---

## 8. Meta-notes for downstream stages

1. **Prefer LSAC-sourced anchors for Stage 4 few-shot generation.** The 10 LR + 14 RC items sourced verbatim from LSAC's public sample pages are the highest-quality few-shot exemplars we have. Include 2–3 per Stage-4 subagent prompt.
2. **Do not use the LG anchors as verbatim few-shots.** The LG question text is adapted, not verbatim from the original LSAC LSATs. Use them for scenario/rule style, but Stage-4 generators should build their own LG questions from first principles and run the constraint solver (Stage 5 hard gate) against every output.
3. **Difficulty calibration:** 1★/2★/3★ should aim for roughly 80-100% / 50-79% / 15-49% real-taker correctness respectively. The critic pass (Stage 5) should flag any 3★ item where 4 of 5 answer choices are trivially eliminable, or any 1★ item that requires multi-step conditional inference.
4. **Trap-coverage quota:** the 10 trap types in §6 should each appear as the primary trap on at least ~5% of generated LR items. Stage-5 critic should tag `trapPattern` for statistics.
5. **Author-voice tells:** Stage-4 prompts should reference (a) hedged language over absolute language, (b) third-person register, (c) structural-signal words ("however," "moreover," "thus"), (d) named disputants in RC (the "Mackay argues / Garber challenges" pattern), (e) clipped stimulus bookending — typical LSAT LR stimuli are 40–90 words.
6. **Known gaps to backfill before Stage 4 launches:**
   - Pure natural_science RC anchor (we have none).
   - A fully-verified LG game with verified solutions and a real LSAT-style question set.
   - Additional LR subtypes with thin anchor coverage: we have 0 role_in_argument, 0 most_strongly_supported, 0 principle_conform, 0 main_point, 0 must_be_true (the Quebec Bridge inference is closest) anchors in the sample set. Stage 2 (rubric authoring) should draft synthetic exemplars for these using the stem templates in §3 and flag them clearly.

---

## Bibliography (working)

Most-cited sources, all accessed 2026-04-20:

- LSAC, "Logical Reasoning Sample Questions." https://www.lsac.org/lsat/taking-lsat/test-format/logical-reasoning/logical-reasoning-sample-questions
- LSAC, "Reading Comprehension Sample Questions." https://www.lsac.org/lsat/taking-lsat/test-format/reading-comprehension/reading-comprehension-sample-questions
- LSAC, "Reading Comprehension." https://www.lsac.org/lsat/prepare/types-lsat-questions/reading-comprehension
- LSAC, Sample Pages from Large Print LSAT (2015 PDF). https://www.lsac.org/sites/default/files/media/sample-large-print-lsat.pdf
- 7sage, "Logical Reasoning Question Types." https://7sage.com/lr-question-types
- 7sage, "LSAT Score Calculator & Converter." https://7sage.com/lsat-resources/lsat-score-calculator
- 7sage forum, "Difficulty Ratio." https://7sage.com/discussion/12933/difficulty-ratio
- 7sage forum, "Questions Difficulty." https://7sage.com/discussion/16301/questions-difficulty
- LSAT Trainer, "Logical Reasoning Question Types." https://www.trainertestprep.com/lsat/blog/logical-reasoning-question-types
- LSAT Trainer, "Four sample Logic Games from the June '07 LSAT." https://www.trainertestprep.com/lsat/blog/sample-lsat-logic-games
- PowerScore blog, "Logical Reasoning and Its Challenges." https://blog.powerscore.com/lsat/lsat-logical-reasoning-and-some-of-its-challenges/
- PowerScore blog, "LR Traps: How to Avoid the Natural Question Error." https://blog.powerscore.com/lsat/lsat-lr-traps-how-to-avoid-the-natural-question-error/
- TestMax, "LSAT Percentiles." https://testmaxprep.com/blog/lsat/lsat-percentiles
- Crush The LSAT, "Guide to LSAT Logic Games." https://crushthelsatexam.com/guide-to-lsat-logic-games/

---

*End of Stage-1 dossier. Next: Stage 2 (rubric authoring) should read this document and the sample JSONs, then produce per-type rubric cards in `docs/taxonomy/{LR,RC,LG}/` and update `frontend/taxonomy.json`.*
