// Expand frontend/prompts.json with authentic LSAT-style Writing Sample prompts.
//
// LSAT Writing Sample format: scenario describing a decision to be made, two
// options, factual considerations that argue both ways. No right answer.
// User picks one option and writes an essay defending the choice.
//
// Usage:
//   node generate-writing-prompts.mjs <countToAdd>

import Anthropic from '/home/ccusce/lsatprep/lambda/node_modules/@anthropic-ai/sdk/index.mjs';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = '/home/ccusce/lsatprep';
const OUT = join(ROOT, 'frontend/prompts.json');

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

const TOPICS = [
  'city council budget priority',
  'company product launch decision',
  'museum exhibition programming',
  'university athletic facility investment',
  'hospital service expansion',
  'town waste-management approach',
  'public library staffing',
  'small business expansion path',
  'school district calendar',
  'nonprofit fundraising event format',
  'county emergency-services upgrade',
  'research-lab equipment purchase',
  'film festival venue selection',
  'animal shelter program focus',
  'tech startup go-to-market',
  'neighborhood association landscaping',
  'arts council grant allocation',
  'national park infrastructure plan',
  'retirement community amenity',
  'apartment-complex renovation',
  'historical-society digitization',
  'farm cooperative equipment-sharing',
  'municipal parking strategy',
  'youth sports league rule change',
  'food bank distribution network',
  'community theater season programming',
  'local-news outlet revenue model'
];

const SCHEMA = {
  type: 'object',
  required: ['prompts'],
  properties: {
    prompts: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'title', 'scenario', 'considerations', 'optionA', 'optionB'],
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          scenario: { type: 'string' },
          considerations: {
            type: 'array',
            minItems: 2,
            maxItems: 4,
            items: { type: 'string' }
          },
          optionA: {
            type: 'object',
            required: ['name', 'description'],
            properties: {
              name: { type: 'string' },
              description: { type: 'string' }
            }
          },
          optionB: {
            type: 'object',
            required: ['name', 'description'],
            properties: {
              name: { type: 'string' },
              description: { type: 'string' }
            }
          }
        }
      }
    }
  }
};

const SYSTEM = `You are an authoritative LSAT Writing Sample prompt author. Produce prompts matching the LSAC Writing Sample format precisely.

FORMAT:
- A scenario: a decision-maker (individual, small group, board, council) must choose between TWO options.
- 2-4 factual considerations establishing what the decision-maker values or must balance.
- Two specific, concrete options. Each option must have some advantages AND some disadvantages relative to the stated considerations.
- No right answer. A thoughtful person could defend either choice with different weights on the considerations.
- Neutral tone; no leading language favoring either option.

AUTHENTIC VOICE:
- Short, dense prose.
- Avoid generic AI flavor ("In today's world", "Recent studies have shown").
- Invent a plausible setting (name a city / organization / individual). Dates are usually current or near-future.
- Each option description is 2-3 sentences, specific and material.

EXAMPLES OF GOOD LSAT WRITING SAMPLE TOPICS:
- A school board choosing between two approaches to reduce absenteeism
- A museum deciding between two exhibit acquisitions
- A nonprofit picking between two fundraising models
- A city selecting between two road-infrastructure projects

Call submit_writing_prompts with the full payload.`;

async function generateBatch(count, startId) {
  // Sample topics without replacement
  const shuffled = [...TOPICS].sort(() => Math.random() - 0.5).slice(0, count);

  const userMsg = `Generate ${count} distinct LSAT-style Writing Sample prompts. Assign ids ws-${String(startId).padStart(4,'0')} through ws-${String(startId+count-1).padStart(4,'0')} in order. Draw loose inspiration from these topic areas (distinct per prompt): ${shuffled.join('; ')}. Make each prompt's scenario distinctive — different stakeholders, different decision types, different time horizons.`;

  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 16000,
    system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
    tools: [{
      name: 'submit_writing_prompts',
      description: `Submit exactly ${count} LSAT-style Writing Sample prompts.`,
      input_schema: SCHEMA
    }],
    tool_choice: { type: 'tool', name: 'submit_writing_prompts' },
    messages: [{ role: 'user', content: userMsg }]
  });

  const toolBlock = resp.content.find(b => b.type === 'tool_use');
  if (!toolBlock) throw new Error('no tool_use in response');
  return toolBlock.input.prompts;
}

async function main() {
  const countArg = Number(process.argv[2]);
  if (!countArg || countArg < 1) {
    console.error('usage: node generate-writing-prompts.mjs <count>');
    process.exit(1);
  }

  const existing = JSON.parse(readFileSync(OUT, 'utf8'));
  const currentLen = existing.prompts?.length || 0;
  const startId = currentLen + 1;

  console.log(`Existing prompts: ${currentLen}`);
  console.log(`Generating ${countArg} new prompts (ids ws-${String(startId).padStart(4,'0')}..)...`);

  // Generate in chunks of 10 per call to stay within output limits
  const chunkSize = 10;
  const newPrompts = [];
  let nextId = startId;
  while (newPrompts.length < countArg) {
    const take = Math.min(chunkSize, countArg - newPrompts.length);
    console.log(`  chunk: ${take} (starting ws-${String(nextId).padStart(4,'0')})...`);
    const batch = await generateBatch(take, nextId);
    // Renumber ids to be safe
    for (let i = 0; i < batch.length; i++) {
      batch[i].id = `ws-${String(nextId + i).padStart(4, '0')}`;
    }
    newPrompts.push(...batch);
    nextId += take;
  }

  existing.prompts = [...(existing.prompts || []), ...newPrompts];
  writeFileSync(OUT, JSON.stringify(existing, null, 2) + '\n');
  console.log(`Wrote ${OUT} (now ${existing.prompts.length} prompts)`);
}

main().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
