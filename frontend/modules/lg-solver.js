// LG constraint solver. Used at generation time to validate games and at
// runtime in the browser as defense in depth. No external deps; works in
// both Node (ES modules) and the browser when imported as a module.
//
// Two modes:
//   - Linear (positions): each entity is assigned to one position, 1:1 unless
//     entities and positions sizes differ (then subsets are handled).
//   - Grouping (groups + groupSize): each entity is assigned to one group;
//     each group must have exactly `groupSize` entities.
//
// A solution is an object { entityName: positionOrGroup, ... }.

const linearRuleCheckers = {
  at: (s, r) => s[r.entity] === r.position,
  not_at: (s, r) => s[r.entity] !== r.position,
  before: (s, r) => s[r.a] < s[r.b],
  after: (s, r) => s[r.a] > s[r.b],
  adjacent: (s, r) => Math.abs(s[r.a] - s[r.b]) === 1,
  not_adjacent: (s, r) => Math.abs(s[r.a] - s[r.b]) !== 1,
  exactly_one_of: (s, r) => {
    const atPos = r.entities.filter(e => s[e] === r.position).length;
    return atPos === 1;
  },
  exactly_n_in_group: (s, r) => {
    const n = r.entities.filter(e => s[e] === r.group).length;
    return n === r.n;
  },
  same_group: (s, r) => s[r.a] === s[r.b],
  different_group: (s, r) => s[r.a] !== s[r.b],
  conditional: (s, r) => {
    const premise = evalRule(s, r.ifRule);
    if (!premise) return true;
    return evalRule(s, r.thenRule);
  }
};

function evalRule(solution, rule) {
  const checker = linearRuleCheckers[rule.type];
  if (!checker) throw new Error(`Unknown rule type: ${rule.type}`);
  return checker(solution, rule);
}

function* permutations(items) {
  if (items.length <= 1) {
    yield items.slice();
    return;
  }
  for (let i = 0; i < items.length; i++) {
    const rest = items.slice(0, i).concat(items.slice(i + 1));
    for (const p of permutations(rest)) {
      yield [items[i], ...p];
    }
  }
}

function isLinear(game) {
  return Array.isArray(game.positions);
}

function* enumerateLinearAssignments(entities, positions) {
  // Each entity gets one position, all distinct. Requires positions.length >= entities.length.
  // If equal, it's permutations. If positions > entities, we pick a subset (rare).
  if (positions.length === entities.length) {
    for (const perm of permutations(positions)) {
      const s = {};
      entities.forEach((e, i) => (s[e] = perm[i]));
      yield s;
    }
    return;
  }
  // Subset case (not used in current tests but supported): pick an ordered subset of positions.
  const chooseInto = (remaining, idx, current) => {
    if (idx === entities.length) {
      const s = {};
      entities.forEach((e, i) => (s[e] = current[i]));
      return [s];
    }
    const out = [];
    for (const p of remaining) {
      const next = remaining.filter(x => x !== p);
      out.push(...chooseInto(next, idx + 1, [...current, p]));
    }
    return out;
  };
  for (const s of chooseInto(positions, 0, [])) yield s;
}

function* enumerateGroupingAssignments(entities, groups, groupSize) {
  const assigns = {};
  const totalSlots = groups.length * groupSize;
  if (entities.length !== totalSlots) {
    // Allow free-count groups if groupSize is null (permissive mode).
    if (groupSize != null) {
      // Invariant: entities must exactly fill groups.
      return;
    }
  }

  function* recurse(i, counts) {
    if (i === entities.length) {
      if (groupSize != null) {
        for (const g of groups) {
          if ((counts[g] || 0) !== groupSize) return;
        }
      }
      yield { ...assigns };
      return;
    }
    const e = entities[i];
    for (const g of groups) {
      if (groupSize != null && (counts[g] || 0) >= groupSize) continue;
      assigns[e] = g;
      counts[g] = (counts[g] || 0) + 1;
      yield* recurse(i + 1, counts);
      counts[g]--;
      delete assigns[e];
    }
  }

  yield* recurse(0, {});
}

export function solveGame(game) {
  const rules = game.rules || [];
  const satisfies = s => rules.every(r => evalRule(s, r));
  const out = [];
  const gen = isLinear(game)
    ? enumerateLinearAssignments(game.entities, game.positions)
    : enumerateGroupingAssignments(game.entities, game.groups, game.groupSize ?? null);
  for (const s of gen) {
    if (satisfies(s)) out.push(s);
  }
  return out;
}

// Verify whether a question's answer holds under the game's base rules plus
// any localRules specified by the question, given the answer's kind.
//   kind ∈ { must_be_true, could_be_true, cannot_be_true, must_be_false }
//   assertion is a rule object the answer claims holds.
export function verifyAnswer(game, localRules, answer) {
  const combined = {
    ...game,
    rules: [...(game.rules || []), ...(localRules || [])]
  };
  const solutions = solveGame(combined);
  if (solutions.length === 0) {
    // Contradiction in local rules: by convention, any claim is vacuously true
    // for must-not and must-be; choose conservative.
    return answer.kind === 'cannot_be_true' || answer.kind === 'must_be_false';
  }
  const allSatisfy = solutions.every(s => evalRule(s, answer.assertion));
  const anySatisfy = solutions.some(s => evalRule(s, answer.assertion));
  switch (answer.kind) {
    case 'must_be_true':
      return allSatisfy;
    case 'could_be_true':
      return anySatisfy;
    case 'cannot_be_true':
      return !anySatisfy;
    case 'must_be_false':
      return !anySatisfy;
    default:
      throw new Error(`Unknown answer kind: ${answer.kind}`);
  }
}
