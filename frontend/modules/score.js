// Approximate raw-to-scaled mapping for LSAT. Published official curves vary
// slightly per form; this is a reasonable midrange curve synthesized from
// public blogs. UI labels this as an approximation — not an LSAC score.
//
// Assumes ~75 scored questions across two LR (50) + one RC (27 -> truncated
// to 25 for this curve's typical size) or similar. The function clamps and
// interpolates.

const CURVE = [
  { raw: 0,  scaled: 120 },
  { raw: 10, scaled: 120 },
  { raw: 20, scaled: 128 },
  { raw: 30, scaled: 136 },
  { raw: 40, scaled: 143 },
  { raw: 50, scaled: 150 },
  { raw: 55, scaled: 155 },
  { raw: 60, scaled: 160 },
  { raw: 65, scaled: 165 },
  { raw: 70, scaled: 171 },
  { raw: 75, scaled: 177 },
  { raw: 80, scaled: 180 },
  { raw: 100, scaled: 180 }
];

export function rawToScaled(rawScore) {
  if (rawScore <= 0) return 120;
  for (let i = 0; i < CURVE.length - 1; i++) {
    const a = CURVE[i];
    const b = CURVE[i + 1];
    if (rawScore >= a.raw && rawScore <= b.raw) {
      const t = (rawScore - a.raw) / (b.raw - a.raw || 1);
      return Math.round(a.scaled + t * (b.scaled - a.scaled));
    }
  }
  return 180;
}
