// About page — written for LSAT test-takers. Explains what this kit gives you,
// how to use it, and the bits you should know about question quality + privacy.

const BASE = window.location.pathname.includes('/lsatprep/') ? '/lsatprep' : '';

const LR_SUBTYPES = [
  ['Assumption — Necessary',      240, '80 / 120 / 40'],
  ['Assumption — Sufficient',     120, '40 / 60 / 20'],
  ['Strengthen',                  240, '80 / 120 / 40'],
  ['Weaken',                      240, '80 / 120 / 40'],
  ['Flaw',                        200, '60 / 100 / 40'],
  ['Parallel Reasoning',          120, '20 / 60 / 40'],
  ['Parallel Flaw',               100, '20 / 60 / 20'],
  ['Method of Reasoning',         100, '40 / 40 / 20'],
  ['Role in Argument',            120, '40 / 60 / 20'],
  ['Point at Issue',              100, '40 / 40 / 20'],
  ['Main Point',                  100, '60 / 40 / 0'],
  ['Must Be True',                140, '40 / 80 / 20'],
  ['Most Strongly Supported',     120, '40 / 60 / 20'],
  ['Principle — Conform',          60, '20 / 30 / 10'],
  ['Principle — Justify',          60, '20 / 30 / 10'],
  ['Paradox / Resolve',            60, '20 / 20 / 20']
];

const RC_GENRES = [
  ['Humanities',           280, '40 passages'],
  ['Social Sciences',      280, '40 passages'],
  ['Natural Science',      280, '40 passages'],
  ['Law',                  140, '20 passages'],
  ['Comparative Reading',  120, '20 passages — paired']
];

const LG_FAMILIES = [
  ['Basic Linear',     200, '30 games'],
  ['Advanced Linear',  260, '40 games'],
  ['Grouping',         240, '40 games'],
  ['Hybrid',           220, '30 games']
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
    row(['<strong>Logical Reasoning</strong>', '<strong>~2,000</strong>', '16 subtypes'], { sectionHead: true }),
    ...LR_SUBTYPES.map(r => row([`&nbsp;&nbsp;${r[0]}`, r[1], r[2]])),
    row(['<strong>Reading Comprehension</strong>', '<strong>~1,100</strong>', '~160 passages × ~7 Q'], { sectionHead: true }),
    ...RC_GENRES.map(r => row([`&nbsp;&nbsp;${r[0]}`, r[1], r[2]])),
    row(['<strong>Logic Games</strong>', '<strong>~900</strong>', '~140 games × ~6–7 Q'], { sectionHead: true }),
    ...LG_FAMILIES.map(r => row([`&nbsp;&nbsp;${r[0]}`, r[1], r[2]])),
    row(['<strong>Grand total</strong>', '<strong>~4,000</strong>', ''], { sectionHead: true })
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
      <p class="muted" style="font-size:var(--text-lg)">A practice kit built to help you drill every LSAT question type, take timed sections or full-length tests, practice the Writing Sample, and get a real explanation the moment you want one.</p>
    </section>

    <section class="card">
      <h2>What you get</h2>
      <ul>
        <li><strong>~4,000 practice questions</strong> across Logical Reasoning, Reading Comprehension, and Logic Games — calibrated to 1★ / 2★ / 3★ difficulty against what real LSAT takers find easy, medium, or hard.</li>
        <li><strong>Three study modes.</strong> Drill (one question at a time, instant feedback), timed section (one 35-minute section, scored at the end), and full-length test (four sections with a break, end-of-test scoring).</li>
        <li><strong>Realistic difficulty mix.</strong> Any timed section, full-length test, or drill (where you haven't pinned a difficulty) is sampled at roughly <strong>30% easy · 45% medium · 25% hard</strong> — the same mix real LSAT sections are built on — and ordered randomly within the section.</li>
        <li><strong>Writing Sample practice.</strong> 30 LSAC-style prompts. You write for 35 minutes, then get a rubric grade (A–F) with feedback on organization, argument strength, evidence use, and clarity.</li>
        <li><strong>AI tutor on every question.</strong> When you miss one, you can ask for a tailored explanation or open a coach chat that hints at what you missed rather than just handing you the answer.</li>
        <li><strong>Progress tracking</strong> with a diagnostic weakness report that reads your attempts and tells you which subtypes to focus on next.</li>
      </ul>
    </section>

    <section class="card">
      <h2>How to use it</h2>
      <ol>
        <li><strong>Warm up with Drill mode.</strong> Pick a section and subtype, keep the difficulty at 1★ if you're learning a new type. Read each explanation — even on questions you got right.</li>
        <li><strong>Move to 2★ once a subtype is consistent.</strong> The jump from 1★ to 2★ is where trap answers start to look plausible. This is the real work.</li>
        <li><strong>Use the coach.</strong> When a question stumps you, open the coach instead of just revealing the answer. A good tutor conversation is worth five explanations.</li>
        <li><strong>Timed sections weekly.</strong> 35 minutes per section, no feedback until done. That's how you learn pace.</li>
        <li><strong>Full-length tests monthly.</strong> Simulate a real LSAT. Afterwards, run a diagnostic and come back to drill the weakest subtypes.</li>
      </ol>
    </section>

    <section class="card">
      <h2>What the question bank covers</h2>
      <p class="muted">Questions are stratified across section, subtype, and difficulty so you never run out of practice in any slot.</p>
      ${matrixTable()}
      <p class="muted" style="font-size:var(--text-sm);margin-top:var(--space-3)">Difficulty 1★ ≈ 80–100% of real LSAT takers get it right · 2★ ≈ 50–79% · 3★ ≈ under 50%. This is our mapping based on public LSAC percentile data and 7sage / LSAT Hacks commentary — not an official LSAC curve.</p>
    </section>

    <section class="card">
      <h2>About the questions</h2>
      <p>Every question is written by AI, calibrated to feel like real LSAT content — same voice, same trap patterns, same difficulty anchors against actual test-taker performance. Topics are varied across medicine, ethics, law, economics, history, the sciences, and the arts so you don't see the same kind of argument twice in a row.</p>
      <p class="muted" style="font-size:var(--text-sm)">These are practice questions, not official LSAC content. They're calibrated to feel like the real thing, but only what's on test day counts for a score.</p>
    </section>

    <section class="card">
      <h2>Privacy</h2>
      <ul>
        <li>Your attempts, session history, writing samples, and coach conversations stay in your browser. Nothing is uploaded, analyzed, or shared.</li>
        <li>AI features (coach, explanations, writing-sample grading, diagnostics) only send the question you're on and your answer to the AI — and only when you click the button that triggers them.</li>
        <li>No accounts, no cookies, no analytics, no trackers.</li>
        <li>You can export or import your progress as a JSON file from <a href="${BASE}/settings">Settings</a> — useful for moving between devices or keeping a backup.</li>
      </ul>
    </section>

    <section class="card">
      <h2>A note from Collin</h2>
      <p class="muted">This site is a friend-project. I built it because I wanted my friend to have a serious amount of quality practice material without a subscription. If anything in the bank feels off — a question that seems broken, a trap answer that's actually right, a passage that reads wrong — tell me and I'll fix it.</p>
    </section>
  `;
}
