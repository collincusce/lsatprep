// Prompt builders for Stage-4 (generation) and Stage-5 (critic) subagents.
//
// The parent session reads coverage-matrix.json, calls buildGeneratorPrompt per
// batch to produce an Agent prompt string, dispatches, collects outputs, then
// calls buildCriticPrompt for each raw output file.
//
// CRITICAL: critic prompts do NOT include the generator's rubric-reasoning or
// few-shot bundle — only the rubric card + the raw questions. Critic must judge
// the questions cold, seeing what a student would see plus the authenticity bar.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');

const DOMAINS = [
  'medicine', 'ethics', 'economics', 'law', 'environmental science',
  'technology', 'linguistics', 'history', 'policy', 'arts'
];

function readRel(path) {
  return readFileSync(join(ROOT, path), 'utf8');
}

function rubricPathFor(cell) {
  const slot = cell.subtype || cell.genre || cell.family;
  return `docs/taxonomy/${cell.section}/${slot}.md`;
}

function fewShotPathFor(cell) {
  const slot = cell.subtype || cell.genre || cell.family;
  const prefix = cell.section === 'LR' ? '' : cell.section.toLowerCase() + '-';
  return `generation/few-shot/${prefix}${slot}.json`;
}

function lgSolverBlock() {
  return `
## LG: MANDATORY solver verification

Every game you produce MUST include a \`verifiedSolutions\` array produced by running \`generation/scripts/lg-solver.mjs\`. Workflow per game:

1. Draft the scenario + entities + positions + rules.
2. Run the solver via a one-liner:
   \`\`\`bash
   node -e "import('./generation/scripts/lg-solver.mjs').then(({solveGame}) => { const s = solveGame({ entities:[...], positions:[...], rules:[...] }); console.log('count', s.length); console.log(JSON.stringify(s)); })"
   \`\`\`
3. If solutions count is 0 → rules are unsatisfiable; revise the game.
4. If solutions count is huge (>100) → game is too loose; tighten rules.
5. Record the full solutions array as \`verifiedSolutions\` on the game record.
6. For each question: if it has \`localRules\`, re-run the solver with concat(rules, localRules) and filter-verify the declared \`correctAnswer\`:
   - \`must_be_true\`: every solution in filtered set satisfies the asserted fact
   - \`could_be_true\`: at least one solution satisfies
   - \`cannot_be_true\`: no solution satisfies
   - \`must_be_false\`: every solution fails
7. If the declared \`correctAnswer\` fails verification, fix it before emitting.

## LG: Supported rule types ONLY

The solver's \`rules\` array accepts ONLY these \`type\` values: \`at\`, \`not_at\`, \`before\`, \`after\`, \`adjacent\`, \`not_adjacent\`, \`same_group\`, \`different_group\`, \`conditional\`, \`exactly_one_of\`, \`exactly_n_in_group\`.

Do NOT use: \`between\` (no primitive — decompose into before+after), range rules like "at least 2 but no more than 4" (no range primitive — use conditional chains), or any novel rule type.

\`before\`/\`after\`/\`adjacent\`/\`not_adjacent\` compare position values with arithmetic. Positions MUST be integers (1, 2, 3, …) for these rules to behave correctly. Do NOT use compound labels like \`"1-oak"\` with these rules.
`;
}

function rcShapeBlock() {
  return `
## RC: Output shape

The output file is a JSON array where each element is ONE passage record with nested questions:

\`\`\`json
{
  "id": "rc-passage-<slug>-<idx>",                       // placeholder; parent renumbers
  "section": "RC",
  "genre": "<genre>",
  "difficulty": <1|2|3>,
  "passage": "<400–500 words of passage prose>",
  "comparativeBPassage": "<only if genre === 'comparative'>",
  "questions": [
    {
      "id": "rc-<slug>-<idx>-q<n>",                      // placeholder; parent renumbers
      "section": "RC",
      "passageId": "rc-passage-<slug>-<idx>",            // must match outer id
      "questionType": "main_point | author_attitude | passage_structure | specific_detail | inference | function | strengthen_weaken_claim | application",
      "difficulty": <1|2|3>,
      "questionStem": "…",
      "choices": [ { "label": "A", "text": "…" }, …5 total ],
      "correctAnswer": "A|B|C|D|E",
      "explanations": { "correct": "…", "A": "…", "B": "…", "C": "…", "D": "…", "E": "…" },
      "tags": [ "…" ],
      "source": { "pipelineVersion": "1.0", "generator": "claude-code-subagent", "fewShotRefs": [ "…" ] }
    }
  ]
}
\`\`\`

Each passage carries ~7 questions. Comparative passages always carry both \`passage\` and \`comparativeBPassage\`; their questions often compare the two.
`;
}

function lgShapeBlock() {
  return `
## LG: Output shape

The output file is a JSON array where each element is ONE game record with nested questions:

\`\`\`json
{
  "id": "lg-game-<slug>-<idx>",                          // placeholder; parent renumbers
  "section": "LG",
  "family": "<family>",
  "difficulty": <1|2|3>,
  "scenario": "<prose describing the game setup>",
  "entities": ["Alice", "Bob", …],
  "positions": [1, 2, 3, 4, …],                          // integers when using before/after/adjacent
  "rules": [
    { "type": "before", "a": "Alice", "b": "Bob" },
    { "type": "at", "entity": "Carol", "position": 3 },
    …
  ],
  "verifiedSolutions": [                                 // produced by lg-solver.mjs
    { "Alice": 1, "Bob": 2, "Carol": 3, "Dan": 4 },
    …
  ],
  "questions": [
    {
      "id": "lg-<slug>-<idx>-q<n>",
      "section": "LG",
      "gameId": "lg-game-<slug>-<idx>",
      "questionType": "orientation_question | could_be_true | must_be_true | cannot_be_true | must_be_false | rule_substitution | equivalent",
      "difficulty": <1|2|3>,
      "questionStem": "…",
      "localRules": [ … optional — same rule-type vocabulary as the game's rules ],
      "choices": [ { "label": "A", "text": "…" }, …5 ],
      "correctAnswer": "A|B|C|D|E",
      "explanations": { "correct": "…", "A": "…", "B": "…", "C": "…", "D": "…", "E": "…" },
      "tags": [ "…" ],
      "source": { "pipelineVersion": "1.0", "generator": "claude-code-subagent", "fewShotRefs": [ "…" ] }
    }
  ]
}
\`\`\`

Each game carries 5–7 questions. Each question that introduces a hypothetical ("if Alice is in position 2, then…") encodes that hypothetical as \`localRules\`, and its \`correctAnswer\` is verified against solver output with those local rules applied.
`;
}

function lrShapeBlock() {
  return `
## LR: Output shape

The output file is a JSON array of FLAT LR question records. One record per question:

\`\`\`json
{
  "id": "lr-<slug>-<idx>",                               // placeholder; parent renumbers
  "section": "LR",
  "subtype": "<subtype>",
  "difficulty": <1|2|3>,
  "difficultyReason": "<1 sentence explaining why this difficulty>",
  "stimulus": "<the prose argument or passage>",
  "questionStem": "<the prompt, matching rubric stem templates>",
  "choices": [ { "label": "A", "text": "…" }, …5 total ],
  "correctAnswer": "A|B|C|D|E",
  "explanations": {
    "correct": "<why this is the right answer>",
    "A": "<why A is wrong — name the trap pattern>",
    "B": "<…>",
    "C": "<…>",
    "D": "<…>",
    "E": "<…>"
  },
  "tags": [ "<concept>", … ],
  "source": { "pipelineVersion": "1.0", "generator": "claude-code-subagent", "fewShotRefs": [ "<filenames>" ] }
}
\`\`\`
`;
}

/**
 * Build the prompt for a Stage-4 generator subagent.
 *
 * @param {object} cell - coverage-matrix cell; has section, subtype|genre|family, difficulty, etc.
 * @param {number} batchCount - how many questions/passages/games THIS batch should produce
 * @param {string} batchSlug - short identifier for output path, e.g. "strengthen-d2-b0"
 * @param {string} outputPath - path where the agent must write its JSON array
 * @returns {string}
 */
export function buildGeneratorPrompt({ cell, batchCount, batchSlug, outputPath }) {
  const { section, difficulty } = cell;
  const slot = cell.subtype || cell.genre || cell.family;
  const slotKey = cell.subtype ? 'subtype' : cell.genre ? 'genre' : 'family';

  const rubricPath = rubricPathFor(cell);
  const fewShotPath = fewShotPathFor(cell);
  const rubric = readRel(rubricPath);
  const fewShot = readRel(fewShotPath);

  const unit =
    section === 'LR' ? `${batchCount} LR questions`
    : section === 'RC' ? `${batchCount} RC passages (each with ~7 questions)`
    : `${batchCount} LG games (each with 5–7 questions)`;

  const shapeBlock =
    section === 'LR' ? lrShapeBlock()
    : section === 'RC' ? rcShapeBlock()
    : lgShapeBlock();

  const lgExtras = section === 'LG' ? lgSolverBlock() : '';

  return `You are an expert LSAT question writer producing authentic content for the lsatprep project. Produce EXACTLY ${unit} for this coverage-matrix slot.

## Slot

- Section: ${section}
- ${slotKey[0].toUpperCase() + slotKey.slice(1)}: ${slot}
- Difficulty: ${difficulty}
- Batch: ${batchSlug}

## Rubric (${rubricPath})

Read this carefully. It is your primary source for voice, structure, trap patterns, and difficulty calibration. Every question you produce must honor it.

${rubric}

## Few-shot anchors (${fewShotPath})

Authentic LSAC-sourced examples for voice calibration. **Do NOT copy them verbatim — emulate their tone, prose rhythm, and question-structure patterns.** Invent fresh scenarios.

${fewShot}

## Domain diversity (MANDATORY)

Vary stimulus domains across the batch. Choose from: ${DOMAINS.join(', ')}. **No more than 2 ${section === 'RC' ? 'passages' : section === 'LG' ? 'games' : 'stimuli'} on the same domain in this batch of ${batchCount}.**

${shapeBlock}
${lgExtras}

## Quality bar

- Wrong answers implement the specific trap patterns named in the rubric. Not random plausibility.
- Explanations analyze trap patterns — they do NOT reveal your own reasoning or meta-comment on the question.
- Prose matches authentic LSAT voice per the rubric's "Style tells". Avoid: "In today's world", "It is important to note", "Recent studies have shown", generic AI flavor.
- Each question genuinely fits the declared ${slotKey} — do not misclassify.
- Calibrate difficulty to the anchors in the rubric. A "3★" that's actually a "1★" gets flagged in Stage 5.
- **Do NOT include a \`criticNotes\` field** — that's populated in Stage 5.
${section === 'LG' ? '- **Every game includes \`verifiedSolutions\` from running the solver.** Games without it are discarded.\n' : ''}

## Output

Write a JSON array (not an object) to: **${outputPath}**

The array must contain EXACTLY ${batchCount} top-level elements (${section === 'LR' ? 'one per question' : section === 'RC' ? 'one per passage' : 'one per game'}).

Use the \`Write\` tool to save the file. Ensure it parses as valid JSON (no trailing commas, no comments).

## Done when

${outputPath} exists with ${batchCount} valid elements, and you return a short (≤150 word) summary covering:
- Count produced
- ${section === 'LG' ? 'Solver verification results: how many games were drafted then regenerated for zero-solution failures; final count with valid verifiedSolutions' : 'Any questions where you struggled with the rubric; any domain-diversity compromises'}
- Any rubric points you consciously ignored and why
`;
}

/**
 * Build the prompt for a Stage-5 critic subagent.
 *
 * Critic sees ONLY the rubric + the raw questions. Never the generator's
 * reasoning, the few-shot bundle, or the generator's fewShotRefs.
 */
export function buildCriticPrompt({ cell, rawOutputPath, criticOutputPath }) {
  const { section } = cell;
  const slot = cell.subtype || cell.genre || cell.family;
  const rubricPath = rubricPathFor(cell);
  const rubric = readRel(rubricPath);
  const sectionEvalNote =
    section === 'LG'
      ? '\nFor LG: ALSO re-run the solver against each game. Run `node -e "import(\'./generation/scripts/lg-solver.mjs\').then(({solveGame}) => console.log(JSON.stringify(solveGame({ entities:[...], positions:[...], rules:[...] })).length))"` with the game\'s entities/positions/rules. Compare the result length to the game\'s `verifiedSolutions.length`. If they disagree — or if the declared `correctAnswer` fails verification against the filtered solution set for its question type — flag `lg_solver_disagrees`. For rigor, spot-check at least 3 questions per game.\n'
      : '';

  return `You are an independent LSAT authenticity critic for the lsatprep project. You have NO knowledge of who generated these questions or what reasoning went into them. Judge the questions purely on what appears in the question text.

## Rubric (${rubricPath})

${rubric}

## Questions to evaluate

Read the raw output at: **${rawOutputPath}**

Score every question in the file. For RC and LG: score EACH nested question inside each passage/game (plus the passage/game as a whole where applicable).

## Scoring output (JSON array)

For each question, produce a record:

\`\`\`json
{
  "id": "<id>",
  "authenticityScore": <0.5–5.0, one decimal>,
  "trapQuality": <0.5–5.0, one decimal>,
  "difficultyVerdict": "matches" | "too_easy" | "too_hard",
  "flagsRaised": [ "<flag>", … ],
  "notes": "<one-sentence explanation>"
}
\`\`\`

## Scoring bands

**authenticityScore** — would this appear on a real LSAT?
- 5.0: indistinguishable from a real LSAC question
- 4.0–4.9: slight AI tells but credible
- 3.5: FLOOR — anything below this is regenerated
- 3.0–3.4: noticeable AI patterns; reads like machine text
- 2.0–2.9: clearly AI-generated
- 1.0–1.9: structurally broken

**trapQuality** — do the wrong answers implement rubric-named traps?
- 5.0: each wrong answer is a distinct named trap pattern
- 4.0–4.9: most wrong answers are plausible traps
- 3.0–3.9: plausible but not systematic
- 2.0–2.9: randomly plausible
- 1.0–1.9: obviously-wrong wrong answers

## Flag vocabulary

- \`conditional_logic_error\` — a must / some / all claim is technically wrong
- \`ambiguous_stem\` — the stem could reasonably take multiple answers
- \`duplicate_phrasing\` — echoes another question in this batch
- \`generic_domain\` — stimulus reads like AI filler, not a specific plausible scenario
- \`trap_mismatch\` — wrong answers don't share trap patterns with the rubric
- \`explanation_leaks_generator\` — explanation reveals intent / meta-comments on the question
- \`out_of_scope\` — relies on knowledge outside the stimulus
- \`difficulty_mismatch\` — feels easier/harder than declared
- \`style_inauthentic\` — prose doesn't match authentic LSAT voice per rubric's style tells
- \`lg_solver_disagrees\` — (LG) verifiedSolutions wrong/missing, or correctAnswer fails solver check
- \`domain_violation\` — more than 2 questions/passages/games in the batch on the same domain

${sectionEvalNote}

## Output

Write your full critic array to: **${criticOutputPath}**

Use the \`Write\` tool. The file must parse as valid JSON.

## Independence

You see ONLY the rubric above and the raw questions at \`${rawOutputPath}\`. Do NOT try to infer the generator's intent. Score the text on the page. Do NOT rubber-stamp — if the batch is weak, say so with low scores.

## Done when

${criticOutputPath} exists with one record per question, and you return a ≤150-word summary covering:
- Count evaluated
- Average authenticityScore
- Count below 3.5 (the regen threshold)
- Top 3 flag types raised
- ${section === 'LG' ? 'Count of games where the solver disagreed with declared verifiedSolutions' : 'Any systemic issues you spotted (pattern of the same trap-mismatch, etc.)'}
`;
}

// Handy CLI: print a prompt for a given cell so a human can inspect shape.
// Usage:  node generation/scripts/gen-prompt.mjs LR strengthen 2 10 strengthen-d2-b0 out.json
if (import.meta.url === `file://${process.argv[1]}`) {
  const [section, slot, difficulty, batchCount, batchSlug, outputPath] = process.argv.slice(2);
  const cell = { section, difficulty: Number(difficulty) };
  cell[section === 'LR' ? 'subtype' : section === 'RC' ? 'genre' : 'family'] = slot;
  console.log(buildGeneratorPrompt({
    cell,
    batchCount: Number(batchCount),
    batchSlug,
    outputPath: outputPath || `generation/raw/${section.toLowerCase()}-${slot}-d${difficulty}-${batchSlug}.json`
  }));
}
