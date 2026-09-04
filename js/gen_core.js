/* Generator core.

   Hand-writing ten thousand questions is not a thing anyone should do. So
   most of the bank is built from parameterised templates: each template
   knows how to produce a family of related questions, and a seeded PRNG
   turns (template, index) into one specific question — the same one, every
   time, on every device. That matters: progress is stored against the id
   `g:<template>:<index>`, so the question behind an id must never drift.

   A template looks like:

     GEN.add({
       id: 'list_stat', topic: 'lists', variants: 76,
       make(r) { return { title, rating, prompt, mode, fn, starter,
                          tests, hints, solution }; }
     });

   `r` is the seeded Rng below. Everything else matches the shape of a
   hand-written question in questions.js.                                  */

window.GENERATORS = [];
window.GEN = {
  add(t) {
    if (!t.id || !t.make) throw new Error('generator needs id and make()');
    window.GENERATORS.push({ variants: 76, ...t });
  },
};

/* ---------- seeded randomness ---------- */

function hashStr(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

class Rng {
  constructor(seedStr) {
    this.next = mulberry32(hashStr(seedStr));
  }
  float(lo = 0, hi = 1) { return lo + this.next() * (hi - lo); }
  int(lo, hi) { return lo + Math.floor(this.next() * (hi - lo + 1)); }
  bool(p = 0.5) { return this.next() < p; }
  pick(arr) { return arr[this.int(0, arr.length - 1)]; }
  /** n values from lo..hi, duplicates allowed. */
  ints(n, lo, hi) { return Array.from({ length: n }, () => this.int(lo, hi)); }
  /** n distinct values from lo..hi (n must fit). */
  distinct(n, lo, hi) {
    const seen = new Set();
    while (seen.size < n) seen.add(this.int(lo, hi));
    return [...seen];
  }
  shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  /** k distinct members of arr, in random order. */
  sample(arr, k) { return this.shuffle(arr).slice(0, k); }
  word() { return this.pick(WORDS); }
  words(n) { return Array.from({ length: n }, () => this.word()); }
  name() { return this.pick(NAMES); }
  names(n) { return this.sample(NAMES, n); }
}

window.Rng = Rng;
window.rngFor = (tmplId, i) => new Rng(tmplId + '#' + i);

const WORDS = ('apple bridge candle dragon ember forest garden hammer island jungle kettle ladder ' +
  'meadow needle orange puzzle quartz ribbon saddle temple umbrella velvet window yellow zebra ' +
  'anchor basket cactus dolphin engine falcon glacier harbour igloo jacket kernel lantern ' +
  'marble nectar ocean pebble quiver rocket signal tunnel unicorn valley walnut ' +
  'cat dog bird fish tree rock star moon sun rain wind snow leaf seed root').split(' ');

const NAMES = ('Ada Bo Cy Dee Eli Fern Gus Hana Ivo Jo Kai Lena Max Nia Omar Pia Quinn Rae ' +
  'Sam Tara Uma Vic Wren Xan Yuki Zed Ana Ben Cleo Dara Enzo Faye Gil Hugo Iris Jude ' +
  'Kim Liv Milo Noor Otis Pax Rhea Sol Tia Ugo Vera Wes Yara Zane').split(' ');

/* ---------- rendering helpers shared by every template ---------- */

/** A Python literal for a JS value — used in prompts, tests and solutions. */
function py(v) {
  if (v === null || v === undefined) return 'None';
  if (v === true) return 'True';
  if (v === false) return 'False';
  if (typeof v === 'number') {
    if (Number.isInteger(v)) return String(v);
    return String(Number(v.toFixed(10)));
  }
  if (typeof v === 'string') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(py).join(', ') + ']';
  if (typeof v === 'object') {
    return '{' + Object.entries(v).map(([k, x]) => `${JSON.stringify(k)}: ${py(x)}`).join(', ') + '}';
  }
  return String(v);
}

/** `fn(arg, arg)` written the way Python would write it. */
function call(fn, args) { return `${fn}(${args.map(py).join(', ')})`; }

/** One worked example line for a prompt. */
function example(fn, args, out) { return '```\n' + call(fn, args) + '  ->  ' + py(out) + '\n```'; }

/* Python semantics that JavaScript does not share. */
const pyDiv = (a, b) => Math.floor(a / b);
const pyMod = (a, b) => ((a % b) + b) % b;
/** Python 3 round(): banker's rounding, ties go to the even digit. */
function pyRound(x, nd = 0) {
  const m = Math.pow(10, nd);
  const v = x * m;
  const f = Math.floor(v);
  const diff = v - f;
  let r;
  if (Math.abs(diff - 0.5) < 1e-9) r = (f % 2 === 0) ? f : f + 1;
  else r = Math.round(v);
  return r / m;
}
const sum = (a) => a.reduce((x, y) => x + y, 0);
const uniq = (a) => [...new Set(a)];
const range = (n) => Array.from({ length: n }, (_, i) => i);

Object.assign(window, { py, call, example, pyDiv, pyMod, pyRound, sum, uniq, range });
