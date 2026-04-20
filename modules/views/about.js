// About page — project overview, coverage matrix, pipeline summary, privacy notes.

const BASE = window.location.pathname.includes('/lsatprep/') ? '/lsatprep' : '';

const LR_SUBTYPES = [
  ['Assumption — Necessary',      159, '38 / 70 / 51'],
  ['Assumption — Sufficient',     147, '32 / 64 / 51'],
  ['Strengthen',                  192, '51 / 90 / 51'],
  ['Weaken',                      191, '51 / 89 / 51'],
  ['Flaw',                        166, '38 / 77 / 51'],
  ['Parallel Reasoning',          115, '26 / 51 / 38'],
  ['Parallel Flaw',                89, '19 / 38 / 32'],
  ['Method of Reasoning',         103, '26 / 45 / 32'],
  ['Role in Argument',            103, '26 / 45 / 32'],
  ['Point at Issue',               83, '19 / 38 / 26'],
  ['Main Point',                   83, '26 / 38 / 19'],
  ['Must Be True',                128, '32 / 58 / 38'],
  ['Most Strongly Supported',     115, '32 / 51 / 32'],
  ['Principle — Conform',         103, '26 / 45 / 32'],
  ['Principle — Justify',          83, '19 / 38 / 26'],
  ['Paradox / Resolve',           140, '38 / 64 / 38']
];

const RC_GENRES = [
  ['Humanities',           247, '62 / 116 / 69'],
  ['Social Sciences',      238, '54 / 115 / 69'],
  ['Natural Science',      231, '54 / 108 / 69'],
  ['Law',                  215, '46 / 100 / 69'],
  ['Comparative Reading',  169, '38 / 85 / 46 — paired']
];

const LG_FAMILIES = [
  ['Basic Linear',     225, '71 / 103 / 51'],
  ['Advanced Linear',  212, '45 / 96 / 71'],
  ['Grouping',         237, '58 / 115 / 64'],
  ['Hybrid',           226, '39 / 116 / 71']
];

function row(cells, opts = {}) {
  const tag = opts.header ? 'th' : 'td';
  const cls = opts.sectionHead ? ' class="section-head"' : '';
  return `<tr${cls}>${cells.map((c, i) => {
    const align = (i === 0) ? 'left' : 'right';
    return `<${tag} style="text-align:${align}">${c}</${tag}>`;
  }).join('')}</tr>`;
}

function matrixTable() {
  const head = row(['Section / Type', 'Count', 'By difficulty 1 / 2 / 3'], { header: true });
  const body = [
    row(['<strong>Logical Reasoning</strong>', '<strong>2,000</strong>', '16 subtypes × difficulty'], { sectionHead: true }),
    ...LR_SUBTYPES.map(r => row([`&nbsp;&nbsp;${r[0]}`, r[1], r[2]])),
    row(['<strong>Reading Comprehension</strong>', '<strong>1,100</strong>', '~157 passages × ~7 Q'], { sectionHead: true }),
    ...RC_GENRES.map(r => row([`&nbsp;&nbsp;${r[0]}`, r[1], r[2]])),
    row(['<strong>Logic Games</strong>', '<strong>900</strong>', '~138 games × ~6–7 Q'], { sectionHead: true }),
    ...LG_FAMILIES.map(r => row([`&nbsp;&nbsp;${r[0]}`, r[1], r[2]])),
    row(['<strong>Grand total</strong>', '<strong>4,000</strong>', ''], { sectionHead: true })
  ].join('');
  return `
    <div class="matrix-wrap">
      <table class="matrix">
        <thead>${head}</thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
}

export function renderAbout(mainEl) {
  mainEl.innerHTML = `
    <section class="card">
      <h1>About LSAT Prep</h1>
      <p class="muted">A single-user study kit for a friend preparing for the LSAT. Covers Logical Reasoning and Reading Comprehension (the current LSAT) plus the retired Logic Games section behind an opt-in toggle.</p>
    </section>

    <section class="card">
      <h2>How it's built</h2>
      <ul>
        <li><strong>Frontend:</strong> vanilla JavaScript ES modules — no framework, no build step. Runs directly from GitHub Pages.</li>
        <li><strong>State:</strong> your attempts, sessions, writing samples, and coach threads live in <code>localStorage</code> only. Nothing leaves your browser except explicit AI calls.</li>
        <li><strong>AI features</strong> (writing-sample grading, tailored wrong-answer explanations, per-question coach chat, diagnostic weakness reports) call a tiny AWS Lambda that proxies to Anthropic's Claude API. The API key lives on the Lambda, never in the browser.</li>
        <li><strong>Question bank</strong> is a static 4,000-question JSON file, generated offline through a 6-stage pipeline (research → taxonomy → coverage → generate → critic → assemble) using parallel Claude Code subagents.</li>
      </ul>
    </section>

    <section class="card">
      <h2>Coverage matrix</h2>
      <p class="muted">The 4,000 questions are stratified across section, subtype, and difficulty per <code>generation/coverage-matrix.json</code> — the same file the Phase 4 generator subagents fan out on. Counts below are exact targets; the per-run generation report records the actual delivered distribution after any drops or backfills.</p>
      ${matrixTable()}
      <p class="muted" style="font-size:var(--text-sm);margin-top:var(--space-3)">Difficulty 1 ≈ 80–100% of real LSAT takers get it right · 2 ≈ 50–79% · 3 ≈ under 50%. Calibration anchors extrapolated from LSAC percentile data and public 7sage / LSAT Hacks commentary — our mapping, not an official LSAC curve.</p>
    </section>

    <section class="card">
      <h2>Generation pipeline</h2>
      <ol>
        <li><strong>Research</strong> — a Claude Code subagent fetches LSAC's free public samples, 7sage difficulty commentary, and PowerScore / LSAT Trainer taxonomies. Produces a dossier and a corpus of authentic LSAT-style anchors.</li>
        <li><strong>Taxonomy</strong> — human-readable rubric cards (per LR subtype, RC genre, LG family) authored from the dossier, mirrored to a machine-readable <code>taxonomy.json</code>.</li>
        <li><strong>Coverage matrix</strong> — the table above, as JSON, summing to ~4,000.</li>
        <li><strong>Parallel generation</strong> — ~40–50 generator subagents fan out, each handling one matrix cell. Every prompt includes a mandatory domain-diversity requirement (medicine, ethics, economics, law, environmental science, technology, linguistics, history, policy, arts).</li>
        <li><strong>Independent critic pass</strong> — fresh subagents grade every question cold, seeing only the rubric and the question text (never the generator's reasoning). Authenticity floor: 3.5 / 5. Logic Games additionally run through a JavaScript constraint solver that enumerates valid permutations and verifies the stated correct answer is actually valid.</li>
        <li><strong>Regenerate + assemble</strong> — flagged questions go back for up to 2 regeneration passes. Survivors are merged into <code>questions.json</code>, versioned by date, and shipped. A generation report captures averages, flag counts, and a stratified sample for human review.</li>
      </ol>
    </section>

    <section class="card">
      <h2>AI model slotting</h2>
      <div class="row" style="align-items:flex-start">
        <div class="card" style="flex:1;margin:0;min-width:200px">
          <h3 style="margin-top:0">Opus 4.7</h3>
          <p class="muted" style="margin:0">Writing Sample grading — rubric-based scoring across organization, argument strength, evidence use, clarity.</p>
        </div>
        <div class="card" style="flex:1;margin:0;min-width:200px">
          <h3 style="margin-top:0">Sonnet 4.6</h3>
          <p class="muted" style="margin:0">Diagnostic weakness reports — reads up to 500 attempts and surfaces patterns.</p>
        </div>
        <div class="card" style="flex:1;margin:0;min-width:200px">
          <h3 style="margin-top:0">Haiku 4.5</h3>
          <p class="muted" style="margin:0">Per-question explanations and streaming coach chat — fast, cheap, tailored to your specific wrong answer.</p>
        </div>
      </div>
      <p class="muted" style="font-size:var(--text-sm);margin-top:var(--space-3)">System prompts are cached across requests via Anthropic's prompt-caching beta.</p>
    </section>

    <section class="card">
      <h2>Privacy &amp; data</h2>
      <ul>
        <li>All attempts, session history, writing samples, and coach conversations live in <code>localStorage</code> under the single key <code>lsatprep:v1:state</code>.</li>
        <li>Nothing is sent to a server except when you explicitly trigger an AI feature (coach, explain, writing grade, diagnostic). Those requests include the question text, your answer, and relevant history — and go only to the project's own Lambda, which forwards to Anthropic.</li>
        <li>No analytics, no cookies, no third-party scripts.</li>
        <li>Export / import JSON from <a href="${BASE}/settings">Settings</a> — that's how you move progress between devices or back it up.</li>
      </ul>
    </section>

    <section class="card">
      <h2>Cost &amp; abuse posture</h2>
      <ul>
        <li>AWS Lambda: within the always-free tier at single-user scale.</li>
        <li>Anthropic usage: capped at $10 / month as a hard ceiling set by Anthropic.</li>
        <li>The Lambda has reserved concurrency of 3 and a shared-secret header; CORS is restricted to the site's own origin.</li>
      </ul>
    </section>

    <section class="card">
      <h2>Source &amp; further reading</h2>
      <ul>
        <li>Repo: <a href="https://github.com/collincusce/lsatprep">github.com/collincusce/lsatprep</a></li>
        <li>Design doc and implementation plan live under <code>docs/plans/</code> in the repo.</li>
        <li>Research dossier (methodology + cited sources): <code>docs/research/lsat-research-dossier.md</code>.</li>
      </ul>
    </section>
  `;
}
