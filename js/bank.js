/* The question bank.

   Two sources feed it:
     - hand-written questions on `window.QUESTIONS`
     - templates on `window.GENERATORS`, each expanded into `variants`
       concrete questions by a seeded PRNG

   Only a light index (id, title, topic, rating) is kept in memory. The full
   question — prompt, tests, solution — is rebuilt on demand from its id, and
   a small cache keeps the last few around. Because the PRNG is seeded from
   the id, `get('g:digits:41')` is the same question forever.               */

const STATIC = window.QUESTIONS || [];
const TEMPLATES = window.GENERATORS || [];
const byId = new Map(STATIC.map((q) => [q.id, q]));
const templateById = new Map(TEMPLATES.map((t) => [t.id, t]));

const cache = new Map();
const CACHE_MAX = 300;

/** Build one generated question from its template id and seed. */
function generate(tmplId, seed) {
  const t = templateById.get(tmplId);
  if (!t) return null;
  const q = t.make(window.rngFor(tmplId, seed), seed);
  q.id = `g:${tmplId}:${seed}`;
  q.topic = q.topic || t.topic;
  q.generated = true;
  return q;
}

/** Full question for an id, or null. */
export function getQuestion(id) {
  if (byId.has(id)) return byId.get(id);
  if (cache.has(id)) return cache.get(id);
  const m = /^g:(.+):(\d+)$/.exec(id);
  if (!m) return null;
  const q = generate(m[1], Number(m[2]));
  if (!q) return null;
  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value);
  cache.set(id, q);
  return q;
}

/** The light index every other part of the app works against. */
export function buildIndex() {
  const index = STATIC.map((q) => ({
    id: q.id, title: q.title, topic: q.topic, rating: q.rating, handwritten: true,
  }));
  for (const t of TEMPLATES) {
    for (let seed = 0; seed < t.variants; seed++) {
      const q = generate(t.id, seed);
      index.push({ id: q.id, title: q.title, topic: q.topic, rating: q.rating });
    }
  }
  return index;
}

export const templateCount = TEMPLATES.length;
export const handwrittenCount = STATIC.length;
