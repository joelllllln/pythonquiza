/* Fine-grained difficulty engine.

   Every question carries an Elo-style rating (roughly 700 = absolute
   beginner, 2600 = hard interview question). The player carries the same
   kind of number, and it moves in small steps after every attempt, so
   progress is measured continuously instead of in three coarse buckets.
   Displayed as a level: rating / 100, to two decimals (Lv 12.43).          */

export const START_RATING = 1000;
export const MIN_RATING = 600;
export const MAX_RATING = 2700;

export const toLevel = (r) => (r / 100);
export const levelStr = (r) => toLevel(r).toFixed(2);

/** Seconds a solid solver should need, derived from the question rating. */
export function parSeconds(q) {
  if (q.par) return q.par;
  return Math.round(50 + Math.max(0, q.rating - 700) * 0.26);
}

/** Expected score (0..1) for a player of `pr` facing a question of `qr`. */
export function expected(pr, qr) {
  return 1 / (1 + Math.pow(10, (qr - pr) / 400));
}

/** K-factor: move fast while we know little about the player. */
export function kFactor(attempts) {
  if (attempts < 10) return 44;
  if (attempts < 30) return 32;
  if (attempts < 80) return 24;
  return 18;
}

/**
 * Score an attempt in 0..1.
 *  - clean first-try solve  -> 1.0 (+ up to .08 speed bonus, capped at 1)
 *  - each failed submit     -> -0.15
 *  - each hint revealed     -> -0.12
 *  - gave up / skipped      -> 0
 */
export function attemptScore({ solved, failedSubmits = 0, hints = 0, secs = 0, par = 120 }) {
  if (!solved) return 0;
  let s = 1 - 0.15 * failedSubmits - 0.12 * hints;
  if (failedSubmits === 0 && hints === 0 && secs > 0 && secs < par * 0.6) s += 0.08;
  if (secs > par * 3) s -= 0.08;
  return Math.max(0.05, Math.min(1, s));
}

/**
 * Returns { rating, delta, score } — the player's new rating after an attempt.
 * Deltas are typically 2–25 points, i.e. 0.02–0.25 of a level.
 */
export function updatePlayer(playerRating, question, attempt, totalAttempts) {
  const score = attemptScore({ ...attempt, par: parSeconds(question) });
  const e = expected(playerRating, question.rating);
  const k = kFactor(totalAttempts);
  let delta = k * (score - e);
  // Never punish a solve, never reward a give-up.
  if (attempt.solved && delta < 0.5) delta = 0.5;
  if (!attempt.solved && delta > -0.5) delta = -0.5;
  const next = clamp(playerRating + delta, MIN_RATING, MAX_RATING);
  return { rating: round2(next), delta: round2(next - playerRating), score: round2(score) };
}

/** Small local recalibration of a question's own rating. */
export function updateQuestion(qRating, playerRating, score) {
  const e = expected(qRating, playerRating);
  const d = 6 * ((1 - score) - e);
  return clamp(round2(qRating + d), 500, MAX_RATING);
}

/**
 * Pick the next question.
 * Gaussian weighting around (player rating + slider offset), with boosts for
 * unseen questions and weak topics, and heavy damping for recent solves.
 */
export function pickQuestion(bank, prog, opts = {}) {
  const target = (opts.target ?? START_RATING);
  const spread = opts.spread ?? 130;
  const now = Date.now();
  const weak = weakTopics(prog);
  const pool = [];
  let total = 0;

  for (const q of bank) {
    if (opts.excludeId && q.id === opts.excludeId) continue;
    const st = prog.byQuestion[q.id];
    const qr = st && st.rating ? st.rating : q.rating;
    let w = Math.exp(-Math.pow((qr - target) / spread, 2));

    if (!st) w *= 1.9;                                   // unseen: prefer
    else if (!st.solved) w *= 1.25;                      // seen, never solved
    else {
      const days = (now - (st.lastAt || 0)) / 86400000;
      w *= days < 1 ? 0.03 : days < 4 ? 0.2 : days < 14 ? 0.5 : 0.85;
    }
    if (weak.has(q.topic)) w *= 1.7;
    if (opts.topic && q.topic !== opts.topic) w *= 0.02;

    w = Math.max(w, 1e-6);
    pool.push([q, w]);
    total += w;
  }
  if (!pool.length) return bank[0];

  let r = Math.random() * total;
  for (const [q, w] of pool) { r -= w; if (r <= 0) return q; }
  return pool[pool.length - 1][0];
}

/** Topics with >=3 attempts and accuracy under 60%. */
export function weakTopics(prog) {
  const out = new Set();
  for (const [t, s] of Object.entries(prog.byTopic || {})) {
    if (s.attempts >= 3 && s.solved / s.attempts < 0.6) out.add(t);
  }
  return out;
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const round2 = (v) => Math.round(v * 100) / 100;
