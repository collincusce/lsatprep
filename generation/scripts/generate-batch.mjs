// Direct Anthropic API generator using tool-use for guaranteed-valid JSON.
// One invocation = one batch of questions.
//
// Usage:
//   node generate-batch.mjs <section> <slot> <difficulty> <count> <batchIdx>
//
// Output: generation/raw-draft/<section>-<slot>-d<difficulty>-b<batchIdx>.json

import Anthropic from '/home/ccusce/lsatprep/lambda/node_modules/@anthropic-ai/sdk/index.mjs';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = '/home/ccusce/lsatprep';

function readEnv() {
  const env = {};
  for (const line of readFileSync(join(ROOT, '.env'), 'utf8').split('\n')) {
    const m = /^([A-Z_]+)=(.*)$/.exec(line);
    if (m) env[m[1]] = m[2];
  }
  return env;
}
const env = readEnv();
const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

function pickModel(difficulty, section) {
  // Opus for LG — needs strongest reasoning to emit solver-valid rules + solutions.
  // Haiku for 1★ LR/RC. Sonnet for everything else.
  if (section === 'LG') return 'claude-opus-4-7';
  if (difficulty === 1) return 'claude-haiku-4-5-20251001';
  return 'claude-sonnet-4-6';
}

const DOMAINS = [
  'medicine', 'ethics', 'economics', 'law', 'environmental science',
  'technology', 'linguistics', 'history', 'policy', 'arts'
];

function rubricPath(section, slot) {
  return join(ROOT, `docs/taxonomy/${section}/${slot}.md`);
}
function fewShotPath(section, slot) {
  const prefix = section === 'LR' ? '' : section.toLowerCase() + '-';
  return join(ROOT, `generation/few-shot/${prefix}${slot}.json`);
}

// Tool schemas per section. Tool use forces the model to emit structured JSON
// matching the input_schema — no parse errors, no markdown fences, no drift.

function lrTool(slot, difficulty, batchIdx, count) {
  return {
    name: 'submit_questions',
    description: `Submit exactly ${count} LR ${slot} questions at difficulty ${difficulty}.`,
    input_schema: {
      type: 'object',
      required: ['questions'],
      properties: {
        questions: {
          type: 'array',
          minItems: count,
          maxItems: count,
          items: {
            type: 'object',
            required: ['id', 'section', 'subtype', 'difficulty', 'difficultyReason', 'stimulus', 'questionStem', 'choices', 'correctAnswer', 'explanations', 'tags'],
            properties: {
              id: { type: 'string' },
              section: { const: 'LR' },
              subtype: { const: slot },
              difficulty: { const: difficulty },
              difficultyReason: { type: 'string' },
              stimulus: { type: 'string' },
              questionStem: { type: 'string' },
              choices: {
                type: 'array',
                minItems: 5, maxItems: 5,
                items: {
                  type: 'object',
                  required: ['label', 'text'],
                  properties: {
                    label: { enum: ['A', 'B', 'C', 'D', 'E'] },
                    text: { type: 'string' }
                  }
                }
              },
              correctAnswer: { enum: ['A', 'B', 'C', 'D', 'E'] },
              explanations: {
                type: 'object',
                required: ['correct', 'A', 'B', 'C', 'D', 'E'],
                properties: {
                  correct: { type: 'string' },
                  A: { type: 'string' }, B: { type: 'string' },
                  C: { type: 'string' }, D: { type: 'string' }, E: { type: 'string' }
                }
              },
              tags: { type: 'array', items: { type: 'string' } }
            }
          }
        }
      }
    }
  };
}

function rcTool(slot, difficulty, batchIdx, count) {
  const passageProps = {
    id: { type: 'string' },
    section: { const: 'RC' },
    genre: { const: slot },
    difficulty: { const: difficulty },
    passage: { type: 'string' },
    questions: {
      type: 'array',
      minItems: 7, maxItems: 7,
      items: {
        type: 'object',
        required: ['id', 'section', 'passageId', 'questionType', 'difficulty', 'questionStem', 'choices', 'correctAnswer', 'explanations'],
        properties: {
          id: { type: 'string' },
          section: { const: 'RC' },
          passageId: { type: 'string' },
          questionType: { enum: ['main_point', 'author_attitude', 'passage_structure', 'specific_detail', 'inference', 'function', 'strengthen_weaken_claim', 'application'] },
          difficulty: { const: difficulty },
          questionStem: { type: 'string' },
          choices: {
            type: 'array',
            minItems: 5, maxItems: 5,
            items: { type: 'object', required: ['label', 'text'], properties: { label: { enum: ['A','B','C','D','E'] }, text: { type: 'string' } } }
          },
          correctAnswer: { enum: ['A', 'B', 'C', 'D', 'E'] },
          explanations: {
            type: 'object',
            required: ['correct', 'A', 'B', 'C', 'D', 'E'],
            properties: { correct: { type: 'string' }, A: { type: 'string' }, B: { type: 'string' }, C: { type: 'string' }, D: { type: 'string' }, E: { type: 'string' } }
          },
          tags: { type: 'array', items: { type: 'string' } }
        }
      }
    }
  };
  if (slot === 'comparative') {
    passageProps.comparativeBPassage = { type: 'string' };
  }
  return {
    name: 'submit_passages',
    description: `Submit exactly ${count} RC ${slot} passages at difficulty ${difficulty}, each with 7 questions.`,
    input_schema: {
      type: 'object',
      required: ['passages'],
      properties: {
        passages: {
          type: 'array',
          minItems: count, maxItems: count,
          items: {
            type: 'object',
            required: slot === 'comparative'
              ? ['id', 'section', 'genre', 'difficulty', 'passage', 'comparativeBPassage', 'questions']
              : ['id', 'section', 'genre', 'difficulty', 'passage', 'questions'],
            properties: passageProps
          }
        }
      }
    }
  };
}

function lgTool(slot, difficulty, batchIdx, count) {
  // Discriminated rule schemas — force Sonnet into canonical solver shapes.
  const ruleOneOf = {
    oneOf: [
      { type: 'object', required: ['type', 'entity', 'position'], properties: { type: { const: 'at' }, entity: { type: 'string' }, position: { type: 'integer' } }, additionalProperties: false },
      { type: 'object', required: ['type', 'entity', 'position'], properties: { type: { const: 'not_at' }, entity: { type: 'string' }, position: { type: 'integer' } }, additionalProperties: false },
      { type: 'object', required: ['type', 'a', 'b'], properties: { type: { const: 'before' }, a: { type: 'string' }, b: { type: 'string' } }, additionalProperties: false },
      { type: 'object', required: ['type', 'a', 'b'], properties: { type: { const: 'after' }, a: { type: 'string' }, b: { type: 'string' } }, additionalProperties: false },
      { type: 'object', required: ['type', 'a', 'b'], properties: { type: { const: 'adjacent' }, a: { type: 'string' }, b: { type: 'string' } }, additionalProperties: false },
      { type: 'object', required: ['type', 'a', 'b'], properties: { type: { const: 'not_adjacent' }, a: { type: 'string' }, b: { type: 'string' } }, additionalProperties: false },
      { type: 'object', required: ['type', 'a', 'b'], properties: { type: { const: 'same_group' }, a: { type: 'string' }, b: { type: 'string' } }, additionalProperties: false },
      { type: 'object', required: ['type', 'a', 'b'], properties: { type: { const: 'different_group' }, a: { type: 'string' }, b: { type: 'string' } }, additionalProperties: false },
      { type: 'object', required: ['type', 'entities', 'position'], properties: { type: { const: 'exactly_one_of' }, entities: { type: 'array', items: { type: 'string' } }, position: { type: 'integer' } }, additionalProperties: false },
      { type: 'object', required: ['type', 'group', 'n'], properties: { type: { const: 'exactly_n_in_group' }, group: { type: ['string', 'integer'] }, n: { type: 'integer' } }, additionalProperties: false }
    ]
  };
  const solutionSchema = {
    type: 'object',
    description: 'Flat entity→position map. Each entity maps to ONE integer position. Keys are entity names (no _track / _color suffixes).',
    additionalProperties: { type: 'integer' }
  };
  return {
    name: 'submit_games',
    description: `Submit exactly ${count} LG ${slot} games at difficulty ${difficulty}, each with 5 questions and solver-compatible verifiedSolutions.`,
    input_schema: {
      type: 'object',
      required: ['games'],
      properties: {
        games: {
          type: 'array',
          minItems: count, maxItems: count,
          items: {
            type: 'object',
            required: ['id', 'section', 'family', 'difficulty', 'scenario', 'entities', 'positions', 'rules', 'verifiedSolutions', 'questions'],
            properties: {
              id: { type: 'string' },
              section: { const: 'LG' },
              family: { const: slot },
              difficulty: { const: difficulty },
              scenario: { type: 'string' },
              entities: { type: 'array', items: { type: 'string' }, minItems: 3 },
              positions: { type: 'array', items: { type: 'integer' }, minItems: 3 },
              rules: { type: 'array', items: ruleOneOf, minItems: 2 },
              verifiedSolutions: { type: 'array', items: solutionSchema, minItems: 1 },
              questions: {
                type: 'array',
                minItems: 5, maxItems: 5,
                items: {
                  type: 'object',
                  required: ['id', 'section', 'gameId', 'questionType', 'difficulty', 'questionStem', 'choices', 'correctAnswer', 'explanations'],
                  properties: {
                    id: { type: 'string' },
                    section: { const: 'LG' },
                    gameId: { type: 'string' },
                    questionType: { enum: ['orientation_question', 'could_be_true', 'must_be_true', 'cannot_be_true', 'must_be_false'] },
                    difficulty: { const: difficulty },
                    questionStem: { type: 'string' },
                    localRules: { type: 'array' },
                    choices: {
                      type: 'array',
                      minItems: 5, maxItems: 5,
                      items: { type: 'object', required: ['label', 'text'], properties: { label: { enum: ['A','B','C','D','E'] }, text: { type: 'string' } } }
                    },
                    correctAnswer: { enum: ['A', 'B', 'C', 'D', 'E'] },
                    explanations: {
                      type: 'object',
                      required: ['correct', 'A', 'B', 'C', 'D', 'E'],
                      properties: { correct: { type: 'string' }, A: { type: 'string' }, B: { type: 'string' }, C: { type: 'string' }, D: { type: 'string' }, E: { type: 'string' } }
                    },
                    tags: { type: 'array', items: { type: 'string' } }
                  }
                }
              }
            }
          }
        }
      }
    }
  };
}

function buildSystem(section, slot) {
  const rubric = readFileSync(rubricPath(section, slot), 'utf8');
  const fewShot = readFileSync(fewShotPath(section, slot), 'utf8');
  const questionTypesBlock = section === 'RC'
    ? `\n## Question types (for nested RC questions)\n\n${readFileSync(rubricPath('RC', 'question_types'), 'utf8')}\n`
    : '';
  const solverBlock = section === 'LG'
    ? `\n## Solver rule vocabulary (STRICT — this is the ONLY shape that works)

Rules must use EXACTLY these shapes. Any other shape causes the game to be rejected.

### Binary ordering (integer positions only)
- \`{ "type": "before", "a": "Alice", "b": "Bob" }\`   — Alice's position < Bob's
- \`{ "type": "after", "a": "Alice", "b": "Bob" }\`    — Alice's position > Bob's
- \`{ "type": "adjacent", "a": "Alice", "b": "Bob" }\`     — |posA - posB| = 1
- \`{ "type": "not_adjacent", "a": "Alice", "b": "Bob" }\` — |posA - posB| != 1

### Fixed assignment
- \`{ "type": "at", "entity": "Alice", "position": 3 }\`
- \`{ "type": "not_at", "entity": "Alice", "position": 3 }\`

### Grouping (positions are groups)
- \`{ "type": "same_group", "a": "Alice", "b": "Bob" }\`
- \`{ "type": "different_group", "a": "Alice", "b": "Bob" }\`
- \`{ "type": "exactly_n_in_group", "group": "Red", "n": 3 }\`

### Disjunction
- \`{ "type": "exactly_one_of", "entities": ["Alice","Bob","Carol"], "position": 1 }\`

### FORBIDDEN
- NO \`entity\` + \`relativeTo\` fields — use \`a\` and \`b\` for binary rules.
- NO \`description\` field inside rules.
- NO rule types other than the list above.
- NO between — decompose as before + after.
- NO compound suffixes in verifiedSolutions keys (e.g. "Alice_track") — solution keys are JUST entity names, values are integers.

### verifiedSolutions shape

Each solution is a flat map \`{ "Alice": 1, "Bob": 2, "Carol": 3, ... }\`. Every entity appears once; values are integers from the positions array. No nested objects.

### Pre-emission self-check (do this mentally)

For each claimed solution, verify EVERY rule holds. If ANY rule is violated in ANY claimed solution, revise the rules or solutions before emitting.
`
    : '';
  return `You are an expert LSAT question writer. Produce authentic LSAT content that could pass for real published LSAC material.

## Rubric (honor every section)

${rubric}
${questionTypesBlock}
## Authentic few-shot anchors (voice calibration — do NOT copy verbatim)

${fewShot}
${solverBlock}
## Domain diversity (mandatory)

Vary stimulus domains across: ${DOMAINS.join(', ')}. No more than 2 from the same domain per batch.

## Voice (non-negotiable)

- Authentic LSAT prose per the rubric's "Style tells."
- NO generic AI filler. Forbidden: "In today's world", "Recent studies have shown", "It is important to note", "In an increasingly X world", "At the end of the day".
- Wrong answers implement rubric trap patterns — not random plausibility.
- Explanations analyze why a choice is wrong (name the trap); they do NOT meta-comment on the question.

## Submission

Call the submit tool with the complete payload. Do not emit prose alongside the tool call.`;
}

function toolFor(section, slot, difficulty, batchIdx, count) {
  if (section === 'LR') return lrTool(slot, difficulty, batchIdx, count);
  if (section === 'RC') return rcTool(slot, difficulty, batchIdx, count);
  if (section === 'LG') return lgTool(slot, difficulty, batchIdx, count);
  throw new Error(`unknown section ${section}`);
}

function buildUser(section, slot, difficulty, count, batchIdx) {
  const unit =
    section === 'LR' ? `${count} LR questions (subtype: ${slot})`
    : section === 'RC' ? `${count} RC passages (genre: ${slot}), each carrying exactly 7 questions`
    : `${count} LG games (family: ${slot}), each with 5 questions`;
  const idPattern =
    section === 'LR' ? `ids: lr-gen-${slot}-d${difficulty}-b${batchIdx}-01 through -${String(count).padStart(2,'0')}`
    : section === 'RC' ? `passage ids: rc-passage-gen-${slot}-d${difficulty}-b${batchIdx}-NN; nested question ids: rc-gen-${slot}-d${difficulty}-b${batchIdx}-<passageIdx>-qN`
    : `game ids: lg-game-gen-${slot}-d${difficulty}-b${batchIdx}-NN; nested question ids: lg-gen-${slot}-d${difficulty}-b${batchIdx}-<gameIdx>-qN`;
  return `Generate ${unit} at difficulty ${difficulty}. ${idPattern}. Call submit_${section === 'LR' ? 'questions' : section === 'RC' ? 'passages' : 'games'} with the full payload.`;
}

async function generate({ section, slot, difficulty, count, batchIdx }) {
  const model = pickModel(difficulty, section);
  const system = buildSystem(section, slot);
  const tool = toolFor(section, slot, difficulty, batchIdx, count);
  const userMsg = buildUser(section, slot, difficulty, count, batchIdx);

  const resp = await client.messages.create({
    model,
    max_tokens: section === 'RC' ? 32000 : section === 'LG' ? 24000 : 16000,
    system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
    tools: [tool],
    tool_choice: { type: 'tool', name: tool.name },
    messages: [{ role: 'user', content: userMsg }]
  });

  const toolBlock = resp.content.find(b => b.type === 'tool_use');
  if (!toolBlock) {
    throw new Error(`no tool_use in response: ${JSON.stringify(resp.content).slice(0, 300)}`);
  }

  let arr;
  if (section === 'LR') arr = toolBlock.input.questions;
  else if (section === 'RC') arr = toolBlock.input.passages;
  else arr = toolBlock.input.games;

  // Sonnet occasionally stringifies array-valued tool inputs. Parse if needed.
  if (typeof arr === 'string') {
    try { arr = JSON.parse(arr); } catch { /* fallthrough to error below */ }
  }
  if (!Array.isArray(arr)) {
    // Save raw input for post-mortem.
    try {
      const debugPath = join(ROOT, `generation/raw-draft/_DEBUG-${section}-${slot}-d${difficulty}-b${batchIdx}.json`);
      writeFileSync(debugPath, JSON.stringify({ stopReason: resp.stop_reason, usage: resp.usage, toolInput: toolBlock.input }, null, 2));
    } catch {}
    throw new Error(`expected array, got ${typeof arr} (debug dumped)`);
  }

  // Stamp source block and post-normalize fields the schema didn't cover.
  for (const item of arr) {
    if (!item.source) {
      item.source = { pipelineVersion: '1.0', generator: 'anthropic-api', fewShotRefs: [`${section === 'LR' ? '' : section.toLowerCase() + '-'}${slot}.json`] };
    }
    if (section === 'RC' || section === 'LG') {
      const nested = section === 'RC' ? item.questions : item.questions;
      for (const q of nested || []) {
        if (!q.source) q.source = item.source;
      }
    }
  }

  const outPath = join(ROOT, `generation/raw-draft/${section.toLowerCase()}-${slot}-d${difficulty}-b${batchIdx}.json`);
  writeFileSync(outPath, JSON.stringify(arr, null, 2) + '\n');

  return {
    outPath,
    count: arr.length,
    inputTokens: resp.usage.input_tokens,
    outputTokens: resp.usage.output_tokens,
    cacheReadTokens: resp.usage.cache_read_input_tokens || 0,
    cacheWriteTokens: resp.usage.cache_creation_input_tokens || 0,
    model,
    stopReason: resp.stop_reason
  };
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const [section, slot, difficultyStr, countStr, batchIdxStr] = process.argv.slice(2);
  if (!section || !slot || !difficultyStr || !countStr || !batchIdxStr) {
    console.error('usage: node generate-batch.mjs <section> <slot> <difficulty> <count> <batchIdx>');
    process.exit(1);
  }
  generate({
    section,
    slot,
    difficulty: Number(difficultyStr),
    count: Number(countStr),
    batchIdx: Number(batchIdxStr)
  })
    .then(r => console.log(JSON.stringify(r)))
    .catch(err => {
      console.error(`FAIL ${section}/${slot}/d${difficultyStr}/b${batchIdxStr}: ${err.message}`);
      process.exit(1);
    });
}

export { generate };
