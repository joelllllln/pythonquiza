/* Generated questions: dictionaries and grouping. */

(function () {
const { GEN, py, example, sum } = window;
const S = (fn, args) => `def ${fn}(${args}):\n    `;
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const dictOf = (r, n, lo, hi) => {
  const out = {};
  for (const k of r.sample(['alpha', 'beta', 'gamma', 'delta', 'echo', 'fox', 'gulf', 'hotel'], n)) {
    out[k] = r.int(lo, hi);
  }
  return out;
};

/* ---- 1. read a dict safely ---- */
GEN.add({ id: 'dict_get', topic: 'dicts', variants: 76, make(r) {
  const dflt = r.pick([0, -1, 'missing', null]);
  const f = (d, k) => (Object.prototype.hasOwnProperty.call(d, k) ? d[k] : dflt);
  const d = dictOf(r, 3, 1, 50);
  const keys = Object.keys(d);
  return {
    title: `Lookup with default ${py(dflt)}`, rating: 900,
    prompt: `Write \`lookup(d, key)\` returning \`d[key]\`, or \`${py(dflt)}\` when the key is not there. ` +
      'Do not let it raise.',
    mode: 'func', fn: 'lookup', starter: S('lookup', 'd, key'),
    tests: [[d, keys[0]], [d, 'nope'], [{}, 'x']].map((p) => ({ args: p, expect: f(...p) })),
    hints: ['`d.get(key, default)` never raises.'],
    solution: `def lookup(d, key):\n    return d.get(key, ${py(dflt)})`,
  };
} });

/* ---- 2. sum / max over dict values ---- */
GEN.add({ id: 'dict_stat', topic: 'dicts', variants: 76, make(r) {
  const kinds = [
    ['total', 'the sum of every value', (d) => sum(Object.values(d)), 'sum(d.values())', 950],
    ['biggest_key', 'the key with the largest value (the first, on a tie), or `""` when empty',
      (d) => { const e = Object.entries(d); return e.length ? e.reduce((a, b) => (b[1] > a[1] ? b : a))[0] : ''; },
      'max(d, key=d.get)', 1250],
    ['average', 'the mean of the values, or `0` when empty',
      (d) => { const v = Object.values(d); return v.length ? sum(v) / v.length : 0; }, 'sum / len', 1080],
    ['count_over', 'how many values are above `limit`',
      (d, limit) => Object.values(d).filter((v) => v > limit).length, 'a comprehension over d.values()', 1050],
  ];
  const [fn, desc, f, hint, rating] = r.pick(kinds);
  const takesLimit = fn === 'count_over';
  const limit = r.int(10, 40);
  const data = [dictOf(r, r.int(3, 5), 1, 60), dictOf(r, 1, 5, 5), {}];
  const approx = fn === 'average';
  return {
    title: cap(fn.replace(/_/g, ' ')), rating,
    prompt: `Write \`${fn}(d${takesLimit ? ', limit' : ''})\` returning ${desc}.\n\n` +
      example(fn, takesLimit ? [data[0], limit] : [data[0]], takesLimit ? f(data[0], limit) : f(data[0])),
    mode: 'func', fn, starter: S(fn, takesLimit ? 'd, limit' : 'd'),
    tests: data.map((d) => ({ args: takesLimit ? [d, limit] : [d], expect: takesLimit ? f(d, limit) : f(d), cmp: approx ? 'approx' : '' })),
    hints: [`\`${hint}\``, '`d.values()` and `d.items()` are what you loop over.'],
    solution: {
      total: 'def total(d):\n    return sum(d.values())',
      biggest_key: 'def biggest_key(d):\n    if not d:\n        return ""\n    return max(d, key=lambda k: d[k])',
      average: 'def average(d):\n    return sum(d.values()) / len(d) if d else 0',
      count_over: 'def count_over(d, limit):\n    return sum(1 for v in d.values() if v > limit)',
    }[fn],
  };
} });

/* ---- 3. filter a dict ---- */
GEN.add({ id: 'dict_filter', topic: 'dicts', variants: 76, make(r) {
  const limit = r.int(10, 50);
  const above = r.bool();
  const f = (d) => Object.fromEntries(Object.entries(d).filter(([, v]) => (above ? v >= limit : v < limit)));
  const data = [dictOf(r, r.int(3, 5), 1, 80), dictOf(r, 2, 1, 5), {}];
  return {
    title: `Keep values ${above ? '≥' : '<'} ${limit}`, rating: 1240,
    prompt: `Write \`keep(d)\` returning a new dict holding only the entries whose value is ${above ? `${limit} or more` : `below ${limit}`}.\n\n` +
      example('keep', [data[0]], f(data[0])),
    mode: 'func', fn: 'keep', starter: S('keep', 'd'),
    tests: data.map((d) => ({ args: [d], expect: f(d) })),
    hints: ['A dict comprehension: `{k: v for k, v in d.items() if …}`'],
    solution: `def keep(d):\n    return {k: v for k, v in d.items() if v ${above ? '>=' : '<'} ${limit}}`,
  };
} });

/* ---- 4. invert a dict ---- */
GEN.add({ id: 'dict_invert', topic: 'dicts', variants: 76, make(r) {
  const f = (d) => Object.fromEntries(Object.entries(d).map(([k, v]) => [v, k]));
  const mk = (n) => {
    const keys = r.sample(['a', 'b', 'c', 'd', 'e'], n);
    const vals = r.sample(['x', 'y', 'z', 'w', 'v'], n);
    return Object.fromEntries(keys.map((k, i) => [k, vals[i]]));
  };
  const data = [mk(r.int(2, 4)), mk(1), {}];
  return {
    title: 'Flip keys and values', rating: 1130,
    prompt: `Write \`flip(d)\` returning a new dict with the keys and values swapped. The values are all unique strings.\n\n` +
      example('flip', [data[0]], f(data[0])),
    mode: 'func', fn: 'flip', starter: S('flip', 'd'),
    tests: data.map((d) => ({ args: [d], expect: f(d) })),
    hints: ['`{v: k for k, v in d.items()}`'],
    solution: 'def flip(d):\n    return {v: k for k, v in d.items()}',
  };
} });

/* ---- 5. merge dicts ---- */
GEN.add({ id: 'dict_merge', topic: 'dicts', variants: 76, make(r) {
  const rule = r.pick(['second', 'first', 'sum', 'max']);
  const f = (a, b) => {
    const out = { ...a };
    for (const [k, v] of Object.entries(b)) {
      if (!(k in out)) out[k] = v;
      else if (rule === 'second') out[k] = v;
      else if (rule === 'first') { /* keep */ }
      else if (rule === 'sum') out[k] = out[k] + v;
      else out[k] = Math.max(out[k], v);
    }
    return out;
  };
  const a = dictOf(r, 3, 1, 20), b = dictOf(r, 3, 1, 20);
  const data = [[a, b], [a, {}], [{}, b]];
  const desc = { second: 'the value from `b` wins', first: 'the value from `a` wins',
                 sum: 'the two values are added', max: 'the larger of the two wins' }[rule];
  return {
    title: `Merge dicts (${rule} wins)`, rating: rule === 'second' ? 1080 : 1330,
    prompt: `Write \`merge(a, b)\` returning a new dict with every entry from both. Where a key is in both, ${desc}. ` +
      'Neither input may be changed.\n\n' + example('merge', [{ x: 1, y: 2 }, { y: 10, z: 3 }], f({ x: 1, y: 2 }, { y: 10, z: 3 })),
    mode: 'func', fn: 'merge', starter: S('merge', 'a, b'),
    tests: [...data, [{ x: 1, y: 2 }, { y: 10, z: 3 }]].map((p) => ({ args: p, expect: f(...p) })),
    hints: ['`dict(a)` makes a copy you can safely change.', rule === 'second' ? '`out.update(b)` finishes it in one line.' : 'Loop `b.items()` and decide per key.'],
    solution: {
      second: 'def merge(a, b):\n    out = dict(a)\n    out.update(b)\n    return out',
      first: 'def merge(a, b):\n    out = dict(b)\n    out.update(a)\n    return out',
      sum: 'def merge(a, b):\n    out = dict(a)\n    for k, v in b.items():\n        out[k] = out.get(k, 0) + v\n    return out',
      max: 'def merge(a, b):\n    out = dict(a)\n    for k, v in b.items():\n        out[k] = max(out[k], v) if k in out else v\n    return out',
    }[rule],
  };
} });

/* ---- 6. count items into a dict ---- */
GEN.add({ id: 'tally', topic: 'dicts', variants: 76, make(r) {
  const f = (items) => { const d = {}; for (const x of items) d[x] = (d[x] || 0) + 1; return d; };
  const pool = r.sample(['red', 'blue', 'green', 'pink', 'grey'], 3);
  const items = Array.from({ length: r.int(5, 9) }, () => r.pick(pool));
  const data = [items, [pool[0]], []];
  return {
    title: 'Tally the items', rating: 1080,
    prompt: `Write \`tally(items)\` returning a dict counting how often each item appears.\n\n${example('tally', [items], f(items))}`,
    mode: 'func', fn: 'tally', starter: S('tally', 'items'),
    tests: data.map((a) => ({ args: [a], expect: f(a) })),
    hints: ['`d[x] = d.get(x, 0) + 1`', '`collections.Counter(items)` does it in one line — but a dict is what you must return.'],
    solution: 'def tally(items):\n    d = {}\n    for x in items:\n        d[x] = d.get(x, 0) + 1\n    return d',
  };
} });

/* ---- 7. group words ---- */
GEN.add({ id: 'group_words', topic: 'dicts', variants: 76, make(r) {
  const kinds = [
    ['first letter', (w) => w[0], 'their first letter'],
    ['last letter', (w) => w[w.length - 1], 'their last letter'],
    ['length', (w) => String(w.length), 'their length, as a string key'],
  ];
  const [name, keyOf, desc] = r.pick(kinds);
  const f = (words) => { const d = {}; for (const w of words) (d[keyOf(w)] = d[keyOf(w)] || []).push(w); return d; };
  const words = r.words(r.int(4, 6));
  const data = [words, [words[0]], []];
  return {
    title: `Group words by ${name}`, rating: 1330,
    prompt: `Write \`group(words)\` returning a dict grouping the words by ${desc}. Each group keeps the input order.\n\n` +
      example('group', [data[1]], f(data[1])),
    mode: 'func', fn: 'group', starter: S('group', 'words'),
    tests: data.map((a) => ({ args: [a], expect: f(a) })),
    hints: ['`d.setdefault(key, []).append(word)` creates the list the first time.',
            '`collections.defaultdict(list)` is the tidier version.'],
    solution: `def group(words):\n    out = {}\n    for w in words:\n        out.setdefault(${name === 'length' ? 'str(len(w))' : name === 'first letter' ? 'w[0]' : 'w[-1]'}, []).append(w)\n    return out`,
  };
} });

/* ---- 8. dict from two lists ---- */
GEN.add({ id: 'zip_dict_gen', topic: 'dicts', variants: 76, make(r) {
  const f = (k, v) => Object.fromEntries(k.slice(0, Math.min(k.length, v.length)).map((x, i) => [x, v[i]]));
  const keys = r.sample(['a', 'b', 'c', 'd', 'e'], r.int(2, 4));
  const vals = r.ints(keys.length, 1, 50);
  const data = [[keys, vals], [keys, vals.slice(0, 1)], [[], []]];
  return {
    title: 'Pair two lists into a dict', rating: 1090,
    prompt: `Write \`pair_up(keys, values)\` returning a dict pairing them position by position. Extra items on either ` +
      `side are dropped.\n\n${example('pair_up', [keys, vals], f(keys, vals))}`,
    mode: 'func', fn: 'pair_up', starter: S('pair_up', 'keys, values'),
    tests: data.map((p) => ({ args: p, expect: f(...p) })),
    hints: ['`dict(zip(keys, values))` — `zip` stops at the shorter one.'],
    solution: 'def pair_up(keys, values):\n    return dict(zip(keys, values))',
  };
} });

/* ---- 9. sort a dict into pairs ---- */
GEN.add({ id: 'dict_rank', topic: 'sorting', variants: 76, make(r) {
  const desc = r.bool(0.6);
  const f = (d) => Object.entries(d)
    .sort((a, b) => (desc ? b[1] - a[1] : a[1] - b[1]) || (a[0] < b[0] ? -1 : 1))
    .map(([k, v]) => [k, v]);
  const data = [dictOf(r, r.int(3, 5), 1, 30), { a: 2, b: 2 }, {}];
  return {
    title: `Rank a dict by value (${desc ? 'high' : 'low'} first)`, rating: 1440,
    prompt: `Write \`ranked(d)\` returning \`[key, value]\` pairs sorted by value ${desc ? 'descending' : 'ascending'}, ` +
      `ties broken by key alphabetically.\n\n${example('ranked', [{ b: 2, a: 2, c: 5 }], f({ b: 2, a: 2, c: 5 }))}`,
    mode: 'func', fn: 'ranked', starter: S('ranked', 'd'),
    tests: [...data, { b: 2, a: 2, c: 5 }].map((x) => ({ args: [x], expect: f(x) })),
    hints: ['A tuple key sorts on several fields at once.', `\`key=lambda kv: (${desc ? '-kv[1]' : 'kv[1]'}, kv[0])\``],
    solution: `def ranked(d):\n    pairs = sorted(d.items(), key=lambda kv: (${desc ? '-kv[1]' : 'kv[1]'}, kv[0]))\n    return [[k, v] for k, v in pairs]`,
  };
} });

/* ---- 10. top N from a text ---- */
GEN.add({ id: 'top_words', topic: 'dicts', variants: 76, make(r) {
  const n = r.int(1, 3);
  const f = (text) => {
    const counts = {};
    for (const w of text.toLowerCase().split(/\s+/).filter(Boolean)) counts[w] = (counts[w] || 0) + 1;
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
      .slice(0, n).map(([w, c]) => [w, c]);
  };
  const w = r.words(3);
  const text = [w[0], w[1], w[0], w[2], w[1], w[0]].join(' ');
  const data = [text, w[0], ''];
  return {
    title: `Top ${n} word${n > 1 ? 's' : ''}`, rating: 1530,
    prompt: `Write \`top(text)\` returning the ${n} most common word${n > 1 ? 's' : ''} as \`[word, count]\` pairs, ` +
      'most frequent first, ties broken alphabetically. Lowercase everything; split on whitespace.\n\n' +
      example('top', [text], f(text)),
    mode: 'func', fn: 'top', starter: S('top', 'text'),
    tests: data.map((t) => ({ args: [t], expect: f(t) })),
    hints: ['`collections.Counter(text.lower().split())` counts in one line.',
            '`sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))` then slice.'],
    solution: `from collections import Counter\n\n\ndef top(text):\n    counts = Counter(text.lower().split())\n    pairs = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))\n    return [[w, c] for w, c in pairs[:${n}]]`,
  };
} });

/* ---- 11. nested lookup ---- */
GEN.add({ id: 'nested_get', topic: 'dicts', variants: 76, make(r) {
  const dflt = r.pick([null, 0, 'unknown']);
  const f = (d, a, b) => (d[a] && typeof d[a] === 'object' && b in d[a] ? d[a][b] : dflt);
  const outer = r.pick(['user', 'config', 'stats']), inner = r.pick(['name', 'size', 'level']);
  const d = { [outer]: { [inner]: r.int(1, 50), other: 1 }, spare: { x: 2 } };
  const data = [[d, outer, inner], [d, outer, 'nope'], [d, 'nope', inner], [{}, 'a', 'b']];
  return {
    title: 'Two-level lookup', rating: 1290,
    prompt: `Write \`dig(d, outer, inner)\` returning \`d[outer][inner]\`, or \`${py(dflt)}\` when either key is missing. ` +
      'It must never raise.\n\n' + example('dig', [d, outer, inner], f(d, outer, inner)),
    mode: 'func', fn: 'dig', starter: S('dig', 'd, outer, inner'),
    tests: data.map((p) => ({ args: p, expect: f(...p) })),
    hints: [`\`d.get(outer, {})\` gives you something safe to look in.`, `Then \`.get(inner, ${py(dflt)})\` on that.`],
    solution: `def dig(d, outer, inner):\n    return d.get(outer, {}).get(inner, ${py(dflt)})`,
  };
} });

/* ---- 12. keys sorted / listed ---- */
GEN.add({ id: 'dict_keys', topic: 'dicts', variants: 76, make(r) {
  const kinds = [
    ['sorted_keys', 'the keys sorted alphabetically', (d) => Object.keys(d).sort(), 'sorted(d)', 900],
    ['keys_with', 'the keys whose value equals `target`, sorted alphabetically',
      (d, t) => Object.entries(d).filter(([, v]) => v === t).map(([k]) => k).sort(), 'a comprehension over d.items()', 1180],
    ['pairs_list', 'the entries as `[key, value]` pairs, sorted by key',
      (d) => Object.entries(d).sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([k, v]) => [k, v]), 'sorted(d.items())', 1100],
  ];
  const [fn, desc, f, hint, rating] = r.pick(kinds);
  const takesTarget = fn === 'keys_with';
  const t = r.int(1, 5);
  const d = { ...dictOf(r, 3, 1, 5), zed: t };
  const data = [d, { one: t }, {}];
  return {
    title: cap(fn.replace(/_/g, ' ')), rating,
    prompt: `Write \`${fn}(d${takesTarget ? ', target' : ''})\` returning ${desc}.\n\n` +
      example(fn, takesTarget ? [d, t] : [d], takesTarget ? f(d, t) : f(d)),
    mode: 'func', fn, starter: S(fn, takesTarget ? 'd, target' : 'd'),
    tests: data.map((x) => ({ args: takesTarget ? [x, t] : [x], expect: takesTarget ? f(x, t) : f(x) })),
    hints: [`\`${hint}\``, 'Iterating a dict gives you its keys.'],
    solution: {
      sorted_keys: 'def sorted_keys(d):\n    return sorted(d)',
      keys_with: 'def keys_with(d, target):\n    return sorted(k for k, v in d.items() if v == target)',
      pairs_list: 'def pairs_list(d):\n    return [[k, v] for k, v in sorted(d.items())]',
    }[fn],
  };
} });

/* ---- 13. inventory updates ---- */
GEN.add({ id: 'inventory', topic: 'dicts', variants: 76, make(r) {
  const floorAtZero = r.bool(0.5);
  const f = (stock, moves) => {
    const out = { ...stock };
    for (const [item, delta] of moves) {
      out[item] = (out[item] || 0) + delta;
      if (floorAtZero && out[item] < 0) out[item] = 0;
    }
    return out;
  };
  const items = r.sample(['nails', 'screws', 'bolts', 'nuts'], 3);
  const stock = Object.fromEntries(items.slice(0, 2).map((i) => [i, r.int(1, 20)]));
  const moves = [[items[0], r.int(1, 10)], [items[1], -r.int(1, 30)], [items[2], r.int(1, 5)]];
  return {
    title: `Apply stock movements${floorAtZero ? ' (never below zero)' : ''}`, rating: 1470,
    prompt: `\`stock\` maps item to quantity; \`moves\` is a list of \`[item, change]\` pairs. Write \`apply(stock, moves)\` ` +
      `returning a new dict with every change applied. Unknown items start at 0` +
      (floorAtZero ? ', and no quantity may go below 0' : '') + '. `stock` must not be changed.\n\n' +
      example('apply', [stock, moves], f(stock, moves)),
    mode: 'func', fn: 'apply', starter: S('apply', 'stock, moves'),
    tests: [[stock, moves], [stock, []], [{}, moves]].map((p) => ({ args: p, expect: f(...p) })),
    hints: ['`dict(stock)` copies it so the original is untouched.', '`out.get(item, 0) + change`'],
    solution: `def apply(stock, moves):\n    out = dict(stock)\n    for item, change in moves:\n        out[item] = out.get(item, 0) + change\n${floorAtZero ? '        if out[item] < 0:\n            out[item] = 0\n' : ''}    return out`,
  };
} });

/* ---- 14. dict of lists -> summary ---- */
GEN.add({ id: 'scores_by_name', topic: 'dicts', variants: 76, make(r) {
  const kinds = [
    ['averages', 'the mean of each list', (v) => sum(v) / v.length, 1350],
    ['bests', 'the largest value in each list', (v) => Math.max(...v), 1280],
    ['counts', 'how many values each list holds', (v) => v.length, 1180],
    ['totals', 'the sum of each list', (v) => sum(v), 1220],
  ];
  const [fn, desc, g, rating] = r.pick(kinds);
  const f = (d) => Object.fromEntries(Object.entries(d).map(([k, v]) => [k, v.length ? g(v) : 0]));
  const names = r.names(r.int(2, 4));
  const d = Object.fromEntries(names.map((n) => [n, r.ints(r.int(2, 4), 1, 100)]));
  const data = [d, { [names[0]]: [5] }, {}];
  const approx = fn === 'averages';
  return {
    title: cap(fn) + ' per key', rating,
    prompt: `\`d\` maps a name to a list of numbers. Write \`${fn}(d)\` returning a dict with ${desc}. ` +
      'An empty list gives `0`.\n\n' + example(fn, [data[1]], f(data[1])),
    mode: 'func', fn, starter: S(fn, 'd'),
    tests: data.map((x) => ({ args: [x], expect: f(x), cmp: approx ? 'approx' : '' })),
    hints: ['A dict comprehension over `d.items()`.', 'Guard the empty list before dividing or calling `max`.'],
    solution: {
      averages: 'def averages(d):\n    return {k: (sum(v) / len(v) if v else 0) for k, v in d.items()}',
      bests: 'def bests(d):\n    return {k: (max(v) if v else 0) for k, v in d.items()}',
      counts: 'def counts(d):\n    return {k: len(v) for k, v in d.items()}',
      totals: 'def totals(d):\n    return {k: sum(v) for k, v in d.items()}',
    }[fn],
  };
} });
})();
