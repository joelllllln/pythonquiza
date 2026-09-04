/* Generated questions: lists, sorting, searching and sequences. */

(function () {
const { GEN, py, example, sum, uniq } = window;
const S = (fn, args) => `def ${fn}(${args}):\n    `;
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const num = (r, n = 7, lo = -20, hi = 40) => r.ints(n, lo, hi);
const asc = (a) => a.slice().sort((x, y) => x - y);

/* ---- 1. one statistic over a list ---- */
GEN.add({ id: 'list_stat', topic: 'lists', variants: 76, make(r) {
  const kinds = [
    ['total', 'the sum of the list', (a) => sum(a), 'sum(nums)', 780, 0],
    ['biggest', 'the largest value, or `None` when the list is empty', (a) => (a.length ? Math.max(...a) : null), 'max(nums)', 850, null],
    ['smallest', 'the smallest value, or `None` when the list is empty', (a) => (a.length ? Math.min(...a) : null), 'min(nums)', 850, null],
    ['mean', 'the average, or `0` for an empty list', (a) => (a.length ? sum(a) / a.length : 0), 'sum(nums) / len(nums)', 950, 0],
    ['spread', 'the difference between the largest and smallest value, or `0` when empty',
      (a) => (a.length ? Math.max(...a) - Math.min(...a) : 0), 'max(nums) - min(nums)', 980, 0],
    ['product', 'the product of every value (`1` for an empty list)',
      (a) => a.reduce((x, y) => x * y, 1), 'a loop multiplying as you go', 1020, 1],
  ];
  const [fn, desc, f, hint, rating] = r.pick(kinds);
  const data = [num(r, r.int(4, 7), fn === 'product' ? -4 : -20, fn === 'product' ? 5 : 40), num(r, 3, 1, 9), []];
  const approx = fn === 'mean';
  return {
    title: cap(fn), rating,
    prompt: `Write \`${fn}(nums)\` returning ${desc}.\n\n${example(fn, [data[0]], f(data[0]))}`,
    mode: 'func', fn, starter: S(fn, 'nums'),
    tests: data.map((a) => ({ args: [a], expect: f(a), cmp: approx ? 'approx' : '' })),
    hints: [`\`${hint}\``, 'Handle the empty list before you touch the values.'],
    solution: {
      total: 'def total(nums):\n    return sum(nums)',
      biggest: 'def biggest(nums):\n    return max(nums) if nums else None',
      smallest: 'def smallest(nums):\n    return min(nums) if nums else None',
      mean: 'def mean(nums):\n    return sum(nums) / len(nums) if nums else 0',
      spread: 'def spread(nums):\n    return max(nums) - min(nums) if nums else 0',
      product: 'def product(nums):\n    out = 1\n    for n in nums:\n        out *= n\n    return out',
    }[fn],
  };
} });

/* ---- 2. filter a list ---- */
GEN.add({ id: 'list_filter', topic: 'lists', variants: 76, make(r) {
  const k = r.int(2, 12);
  const kinds = [
    ['evens', 'only the even numbers', (n) => n % 2 === 0, 'n % 2 == 0', 880],
    ['odds', 'only the odd numbers', (n) => Math.abs(n % 2) === 1, 'n % 2 != 0', 880],
    [`over_${k}`, `only the values greater than ${k}`, (n) => n > k, `n > ${k}`, 850],
    [`under_${k}`, `only the values less than ${k}`, (n) => n < k, `n < ${k}`, 850],
    [`multiples_of_${k}`, `only the multiples of ${k}`, (n) => ((n % k) + k) % k === 0, `n % ${k} == 0`, 900],
    ['positives', 'only the values above zero', (n) => n > 0, 'n > 0', 840],
  ];
  const [fn, desc, pred, hint, rating] = r.pick(kinds);
  const data = [num(r, r.int(6, 9)), num(r, 4, 1, 9), []];
  const f = (a) => a.filter(pred);
  return {
    title: cap(fn.replace(/_/g, ' ')), rating,
    prompt: `Write \`${fn}(nums)\` returning a new list with ${desc}, order kept.\n\n${example(fn, [data[0]], f(data[0]))}`,
    mode: 'func', fn, starter: S(fn, 'nums'),
    tests: data.map((a) => ({ args: [a], expect: f(a) })),
    hints: [`A list comprehension: \`[n for n in nums if ${hint}]\``],
    solution: `def ${fn}(nums):\n    return [n for n in nums if ${hint}]`,
  };
} });

/* ---- 3. transform a list ---- */
GEN.add({ id: 'list_map', topic: 'comprehensions', variants: 76, make(r) {
  const k = r.int(2, 12);
  const kinds = [
    ['squares', 'each value squared', (n) => n * n, 'n * n', 850],
    ['doubled', 'each value doubled', (n) => n * 2, 'n * 2', 800],
    [`plus_${k}`, `each value with ${k} added`, (n) => n + k, `n + ${k}`, 800],
    [`times_${k}`, `each value multiplied by ${k}`, (n) => n * k, `n * ${k}`, 800],
    ['absolutes', 'the absolute value of each number', (n) => Math.abs(n), 'abs(n)', 860],
    ['as_strings', 'each value turned into a string', (n) => String(n), 'str(n)', 880],
    ['negated', 'each value with its sign flipped', (n) => -n, '-n', 820],
  ];
  const [fn, desc, g, expr, rating] = r.pick(kinds);
  const data = [num(r, r.int(4, 7)), num(r, 3, 1, 9), []];
  const f = (a) => a.map(g);
  return {
    title: cap(fn.replace(/_/g, ' ')), rating,
    prompt: `Write \`${fn}(nums)\` returning a new list with ${desc}.\n\n${example(fn, [data[0]], f(data[0]))}`,
    mode: 'func', fn, starter: S(fn, 'nums'),
    tests: data.map((a) => ({ args: [a], expect: f(a) })),
    hints: [`\`[${expr} for n in nums]\``],
    solution: `def ${fn}(nums):\n    return [${expr} for n in nums]`,
  };
} });

/* ---- 4. count / find in a list ---- */
GEN.add({ id: 'list_find', topic: 'lists', variants: 76, make(r) {
  const kinds = [
    ['count_value', 'how many times `target` appears', (a, t) => a.filter((x) => x === t).length, 'nums.count(target)', 820],
    ['first_index', 'the index of the first `target`, or `-1` when it is missing',
      (a, t) => a.indexOf(t), 'a loop with enumerate, or `nums.index` inside a check', 950],
    ['last_index', 'the index of the last `target`, or `-1` when it is missing',
      (a, t) => a.lastIndexOf(t), 'walk backwards, or scan forwards remembering the latest hit', 1080],
    ['contains', '`True` when `target` is in the list', (a, t) => a.includes(t), 'target in nums', 780],
  ];
  const [fn, desc, f, hint, rating] = r.pick(kinds);
  const t = r.int(1, 6);
  const data = [[...num(r, 4, 1, 6), t, ...num(r, 2, 1, 6)], num(r, 4, 7, 9), []];
  return {
    title: cap(fn.replace(/_/g, ' ')), rating,
    prompt: `Write \`${fn}(nums, target)\` returning ${desc}.\n\n${example(fn, [data[0], t], f(data[0], t))}`,
    mode: 'func', fn, starter: S(fn, 'nums, target'),
    tests: data.map((a) => ({ args: [a, t], expect: f(a, t) })),
    hints: [`\`${hint}\``],
    solution: {
      count_value: 'def count_value(nums, target):\n    return nums.count(target)',
      first_index: 'def first_index(nums, target):\n    for i, n in enumerate(nums):\n        if n == target:\n            return i\n    return -1',
      last_index: 'def last_index(nums, target):\n    found = -1\n    for i, n in enumerate(nums):\n        if n == target:\n            found = i\n    return found',
      contains: 'def contains(nums, target):\n    return target in nums',
    }[fn],
  };
} });

/* ---- 5. sorting ---- */
GEN.add({ id: 'list_sort', topic: 'sorting', variants: 76, make(r) {
  const kinds = [
    ['ascending', 'sorted smallest first', (a) => asc(a), 'sorted(nums)', 830],
    ['descending', 'sorted largest first', (a) => asc(a).reverse(), 'sorted(nums, reverse=True)', 870],
    ['by_size', 'sorted by absolute value, smallest first (ties keep their original order)',
      (a) => a.map((v, i) => [v, i]).sort((x, y) => Math.abs(x[0]) - Math.abs(y[0]) || x[1] - y[1]).map((p) => p[0]),
      'sorted(nums, key=abs)', 1050],
    ['odds_first', 'sorted so every odd number comes before every even one, each group ascending',
      (a) => [...asc(a.filter((n) => Math.abs(n % 2) === 1)), ...asc(a.filter((n) => n % 2 === 0))],
      'sorted(nums, key=lambda n: (n % 2 == 0, n))', 1330],
    ['top_three', 'the three largest values, largest first (fewer if the list is shorter)',
      (a) => asc(a).reverse().slice(0, 3), 'sorted(nums, reverse=True)[:3]', 1000],
  ];
  const [fn, desc, f, hint, rating] = r.pick(kinds);
  const data = [num(r, r.int(5, 8)), num(r, 2, 1, 9), []];
  return {
    title: cap(fn.replace(/_/g, ' ')), rating,
    prompt: `Write \`${fn}(nums)\` returning a new list ${desc}. The input must not be changed.\n\n${example(fn, [data[0]], f(data[0]))}`,
    mode: 'func', fn, starter: S(fn, 'nums'),
    tests: data.map((a) => ({ args: [a], expect: f(a) })),
    hints: [`\`${hint}\``, '`sorted()` returns a new list; `.sort()` changes the one you have.'],
    solution: {
      ascending: 'def ascending(nums):\n    return sorted(nums)',
      descending: 'def descending(nums):\n    return sorted(nums, reverse=True)',
      by_size: 'def by_size(nums):\n    return sorted(nums, key=abs)',
      odds_first: 'def odds_first(nums):\n    return sorted(nums, key=lambda n: (n % 2 == 0, n))',
      top_three: 'def top_three(nums):\n    return sorted(nums, reverse=True)[:3]',
    }[fn],
  };
} });

/* ---- 6. kth largest / smallest ---- */
GEN.add({ id: 'kth_value', topic: 'sorting', variants: 76, make(r) {
  const k = r.int(2, 4);
  const largest = r.bool();
  const distinct = r.bool(0.4);
  const f = (a) => {
    let v = distinct ? uniq(a) : a.slice();
    v = asc(v);
    if (largest) v.reverse();
    return v.length >= k ? v[k - 1] : null;
  };
  const data = [r.distinct(r.int(6, 9), 1, 40), [...num(r, 4, 1, 5), ...num(r, 3, 1, 5)], num(r, 1, 1, 9)];
  return {
    title: `${k}${k === 2 ? 'nd' : k === 3 ? 'rd' : 'th'} ${largest ? 'largest' : 'smallest'}`,
    rating: distinct ? 1280 : 1150,
    prompt: `Write \`kth(nums)\` returning the ${k}${k === 2 ? 'nd' : k === 3 ? 'rd' : 'th'} ${largest ? 'largest' : 'smallest'} ` +
      (distinct ? '**distinct** ' : '') + `value, or \`None\` when there are not that many.\n\n${example('kth', [data[0]], f(data[0]))}`,
    mode: 'func', fn: 'kth', starter: S('kth', 'nums'),
    tests: data.map((a) => ({ args: [a], expect: f(a) })),
    hints: [distinct ? '`set(nums)` first, then sort.' : 'Sort, then index — but check the length first.'],
    solution: `def kth(nums):\n    values = sorted(${distinct ? 'set(nums)' : 'nums'}${largest ? ', reverse=True' : ''})\n    return values[${k - 1}] if len(values) >= ${k} else None`,
  };
} });

/* ---- 7. remove values ---- */
GEN.add({ id: 'list_remove', topic: 'lists', variants: 76, make(r) {
  const kinds = [
    ['drop_value', 'every copy of `target` removed', (a, t) => a.filter((x) => x !== t), 'n != target', 880],
    ['drop_first_copy', 'only the first copy of `target` removed',
      (a, t) => { const i = a.indexOf(t); return i < 0 ? a.slice() : [...a.slice(0, i), ...a.slice(i + 1)]; },
      'find the index, then slice around it', 1120],
    ['drop_falsy', 'every zero removed', (a) => a.filter((x) => x !== 0), 'n != 0', 860],
  ];
  const [fn, desc, f, hint, rating] = r.pick(kinds);
  const t = r.int(1, 5);
  const takesTarget = fn !== 'drop_falsy';
  const data = [[...num(r, 3, 0, 5), t, ...num(r, 3, 0, 5), t], num(r, 4, 6, 9), []];
  const call1 = takesTarget ? [data[0], t] : [data[0]];
  return {
    title: cap(fn.replace(/_/g, ' ')), rating,
    prompt: `Write \`${fn}(${takesTarget ? 'nums, target' : 'nums'})\` returning a new list with ${desc}.\n\n` +
      example(fn, call1, takesTarget ? f(data[0], t) : f(data[0])),
    mode: 'func', fn, starter: S(fn, takesTarget ? 'nums, target' : 'nums'),
    tests: data.map((a) => ({ args: takesTarget ? [a, t] : [a], expect: takesTarget ? f(a, t) : f(a) })),
    hints: [`\`${hint}\``],
    solution: {
      drop_value: 'def drop_value(nums, target):\n    return [n for n in nums if n != target]',
      drop_first_copy: 'def drop_first_copy(nums, target):\n    out = list(nums)\n    if target in out:\n        out.remove(target)\n    return out',
      drop_falsy: 'def drop_falsy(nums):\n    return [n for n in nums if n != 0]',
    }[fn],
  };
} });

/* ---- 8. dedupe ---- */
GEN.add({ id: 'dedupe_list', topic: 'lists', variants: 76, make(r) {
  const sorted = r.bool(0.35);
  const f = sorted ? (a) => asc(uniq(a)) : (a) => uniq(a);
  const data = [[...num(r, 4, 1, 6), ...num(r, 4, 1, 6)], num(r, 3, 1, 9), []];
  return {
    title: sorted ? 'Unique values, sorted' : 'Unique values, order kept', rating: sorted ? 1000 : 1120,
    prompt: `Write \`unique(items)\` returning the distinct values ` +
      (sorted ? 'sorted ascending' : 'in the order they first appear') + `.\n\n${example('unique', [data[0]], f(data[0]))}`,
    mode: 'func', fn: 'unique', starter: S('unique', 'items'),
    tests: data.map((a) => ({ args: [a], expect: f(a) })),
    hints: [sorted ? '`sorted(set(items))`' : 'A `set` of what you have seen, plus a list for the order.'],
    solution: sorted
      ? 'def unique(items):\n    return sorted(set(items))'
      : 'def unique(items):\n    seen = set()\n    out = []\n    for x in items:\n        if x not in seen:\n            seen.add(x)\n            out.append(x)\n    return out',
  };
} });

/* ---- 9. running totals / differences ---- */
GEN.add({ id: 'running', topic: 'lists', variants: 76, make(r) {
  const kinds = [
    ['running_total', 'the running total after each value',
      (a) => { let t = 0; return a.map((n) => (t += n)); }, 1150],
    ['differences', 'the difference between each pair of neighbours (one shorter than the input)',
      (a) => a.slice(1).map((n, i) => n - a[i]), 1180],
    ['running_max', 'the largest value seen so far at each position',
      (a) => { let m = -Infinity; return a.map((n) => (m = Math.max(m, n))); }, 1200],
  ];
  const [fn, desc, f, rating] = r.pick(kinds);
  const data = [num(r, r.int(5, 8), -10, 30), num(r, 2, 1, 9), []];
  return {
    title: cap(fn.replace(/_/g, ' ')), rating,
    prompt: `Write \`${fn}(nums)\` returning ${desc}.\n\n${example(fn, [data[0]], f(data[0]))}`,
    mode: 'func', fn, starter: S(fn, 'nums'),
    tests: data.map((a) => ({ args: [a], expect: f(a) })),
    hints: ['One pass, keeping a variable that carries over between steps.'],
    solution: {
      running_total: 'def running_total(nums):\n    out = []\n    total = 0\n    for n in nums:\n        total += n\n        out.append(total)\n    return out',
      differences: 'def differences(nums):\n    return [nums[i] - nums[i - 1] for i in range(1, len(nums))]',
      running_max: 'def running_max(nums):\n    out = []\n    best = None\n    for n in nums:\n        best = n if best is None else max(best, n)\n        out.append(best)\n    return out',
    }[fn],
  };
} });

/* ---- 10. chunk / rotate / reverse groups ---- */
GEN.add({ id: 'reshape', topic: 'lists', variants: 76, make(r) {
  const k = r.int(2, 4);
  const kinds = [
    ['chunk', `groups of ${k} (the last group may be shorter)`,
      (a) => { const o = []; for (let i = 0; i < a.length; i += k) o.push(a.slice(i, i + k)); return o; }, 1290],
    ['rotate', `every value moved ${k} places to the right, wrapping round`,
      (a) => { if (!a.length) return []; const s = ((k % a.length) + a.length) % a.length; return [...a.slice(a.length - s), ...a.slice(0, a.length - s)]; }, 1310],
    ['every_kth', `only the values at positions 0, ${k}, ${2 * k}, …`,
      (a) => a.filter((_, i) => i % k === 0), 1050],
    ['reverse_groups', `the list reversed inside each group of ${k}`,
      (a) => { const o = []; for (let i = 0; i < a.length; i += k) o.push(...a.slice(i, i + k).reverse()); return o; }, 1420],
  ];
  const [fn, desc, f, rating] = r.pick(kinds);
  const data = [num(r, r.int(6, 9), 1, 30), num(r, 2, 1, 9), []];
  return {
    title: `${cap(fn.replace(/_/g, ' '))} by ${k}`, rating,
    prompt: `Write \`${fn}(items)\` returning ${desc}.\n\n${example(fn, [data[0]], f(data[0]))}`,
    mode: 'func', fn, starter: S(fn, 'items'),
    tests: data.map((a) => ({ args: [a], expect: f(a) })),
    hints: [`\`range(0, len(items), ${k})\` steps group by group.`,
            fn === 'rotate' ? 'Take the modulo of the length first, and mind the empty list.' : 'Slices can be shorter than you ask for — that is fine.'],
    solution: {
      chunk: `def chunk(items):\n    return [items[i:i + ${k}] for i in range(0, len(items), ${k})]`,
      rotate: `def rotate(items):\n    if not items:\n        return []\n    k = ${k} % len(items)\n    return items[-k:] + items[:-k] if k else list(items)`,
      every_kth: `def every_kth(items):\n    return items[::${k}]`,
      reverse_groups: `def reverse_groups(items):\n    out = []\n    for i in range(0, len(items), ${k}):\n        out.extend(reversed(items[i:i + ${k}]))\n    return out`,
    }[fn],
  };
} });

/* ---- 11. two lists combined ---- */
GEN.add({ id: 'two_lists', topic: 'lists', variants: 76, make(r) {
  const kinds = [
    ['pairwise_sum', 'a list of the pairwise sums (stopping at the shorter list)',
      (a, b) => a.slice(0, Math.min(a.length, b.length)).map((x, i) => x + b[i]), '[x + y for x, y in zip(a, b)]', 1080],
    ['pairs', 'a list of `[a_value, b_value]` pairs (stopping at the shorter list)',
      (a, b) => a.slice(0, Math.min(a.length, b.length)).map((x, i) => [x, b[i]]), '[[x, y] for x, y in zip(a, b)]', 1100],
    ['interleave', 'the values taken alternately, starting with `a`; leftovers go on the end',
      (a, b) => { const o = []; for (let i = 0; i < Math.max(a.length, b.length); i++) { if (i < a.length) o.push(a[i]); if (i < b.length) o.push(b[i]); } return o; },
      'loop over the longer length and check each index', 1360],
    ['dot', 'the sum of the pairwise products (stopping at the shorter list)',
      (a, b) => sum(a.slice(0, Math.min(a.length, b.length)).map((x, i) => x * b[i])),
      'sum(x * y for x, y in zip(a, b))', 1180],
  ];
  const [fn, desc, f, hint, rating] = r.pick(kinds);
  const data = [[num(r, 4, 1, 20), num(r, 4, 1, 20)], [num(r, 5, 1, 9), num(r, 2, 1, 9)], [[], []]];
  return {
    title: cap(fn.replace(/_/g, ' ')), rating,
    prompt: `Write \`${fn}(a, b)\` returning ${desc}.\n\n${example(fn, data[0], f(...data[0]))}`,
    mode: 'func', fn, starter: S(fn, 'a, b'),
    tests: data.map((p) => ({ args: p, expect: f(...p) })),
    hints: [`\`${hint}\``, '`zip` stops at the shorter of the two.'],
    solution: {
      pairwise_sum: 'def pairwise_sum(a, b):\n    return [x + y for x, y in zip(a, b)]',
      pairs: 'def pairs(a, b):\n    return [[x, y] for x, y in zip(a, b)]',
      interleave: 'def interleave(a, b):\n    out = []\n    for i in range(max(len(a), len(b))):\n        if i < len(a):\n            out.append(a[i])\n        if i < len(b):\n            out.append(b[i])\n    return out',
      dot: 'def dot(a, b):\n    return sum(x * y for x, y in zip(a, b))',
    }[fn],
  };
} });

/* ---- 12. set operations ---- */
GEN.add({ id: 'set_ops', topic: 'sets', variants: 76, make(r) {
  const kinds = [
    ['shared', 'the values in both lists', (a, b) => asc(uniq(a.filter((x) => b.includes(x)))), 'set(a) & set(b)', 1150],
    ['combined', 'every value from either list', (a, b) => asc(uniq([...a, ...b])), 'set(a) | set(b)', 1120],
    ['only_in_a', 'the values in `a` that are not in `b`', (a, b) => asc(uniq(a.filter((x) => !b.includes(x)))), 'set(a) - set(b)', 1170],
    ['not_shared', 'the values in exactly one of the two lists',
      (a, b) => asc(uniq([...a.filter((x) => !b.includes(x)), ...b.filter((x) => !a.includes(x))])), 'set(a) ^ set(b)', 1290],
  ];
  const [fn, desc, f, hint, rating] = r.pick(kinds);
  const data = [[num(r, 5, 1, 12), num(r, 5, 1, 12)], [num(r, 3, 1, 4), num(r, 3, 5, 9)], [[], num(r, 2, 1, 5)]];
  return {
    title: cap(fn.replace(/_/g, ' ')), rating,
    prompt: `Write \`${fn}(a, b)\` returning ${desc}, sorted ascending and with no duplicates.\n\n${example(fn, data[0], f(...data[0]))}`,
    mode: 'func', fn, starter: S(fn, 'a, b'),
    tests: data.map((p) => ({ args: p, expect: f(...p) })),
    hints: [`Sets support \`&\`, \`|\`, \`-\` and \`^\` — here you want \`${hint}\`.`, 'Wrap the result in `sorted(...)`.'],
    solution: `def ${fn}(a, b):\n    return sorted(${hint})`,
  };
} });

/* ---- 13. is sorted / monotonic ---- */
GEN.add({ id: 'is_sorted', topic: 'lists', variants: 76, make(r) {
  const strict = r.bool(0.4);
  const f = (a) => a.every((n, i) => i === 0 || (strict ? a[i - 1] < n : a[i - 1] <= n));
  const good = asc(num(r, 5, 1, 30));
  const data = [good, r.shuffle([...good, 0]), [], [4, 4, 5]];
  return {
    title: strict ? 'Strictly increasing?' : 'Non-decreasing?', rating: strict ? 1150 : 1100,
    prompt: `Write \`is_sorted(nums)\` returning \`True\` when every value is ` +
      (strict ? '**strictly greater** than' : 'greater than or equal to') +
      ' the one before it. An empty or single-value list counts as sorted.',
    mode: 'func', fn: 'is_sorted', starter: S('is_sorted', 'nums'),
    tests: data.map((a) => ({ args: [a], expect: f(a) })),
    hints: ['Compare each neighbouring pair.',
            `\`all(nums[i] ${strict ? '<' : '<='} nums[i + 1] for i in range(len(nums) - 1))\``],
    solution: `def is_sorted(nums):\n    return all(nums[i] ${strict ? '<' : '<='} nums[i + 1] for i in range(len(nums) - 1))`,
  };
} });

/* ---- 14. moving average ---- */
GEN.add({ id: 'moving_avg', topic: 'lists', variants: 76, make(r) {
  const k = r.int(2, 4);
  const f = (a) => (a.length < k ? [] : a.slice(0, a.length - k + 1).map((_, i) => sum(a.slice(i, i + k)) / k));
  const data = [num(r, r.int(6, 9), 1, 40), num(r, k - 1, 1, 9), []];
  return {
    title: `Moving average over ${k}`, rating: 1400,
    prompt: `Write \`moving(nums)\` returning the average of every window of ${k} neighbouring values. ` +
      `Return \`[]\` when the list is shorter than ${k}.\n\n${example('moving', [[1, 2, 3, 4].slice(0, k + 2)], f([1, 2, 3, 4].slice(0, k + 2)))}`,
    mode: 'func', fn: 'moving', starter: S('moving', 'nums'),
    tests: data.map((a) => ({ args: [a], expect: f(a), cmp: 'approx' })),
    hints: [`Each window starts at an index from 0 to \`len(nums) - ${k}\`.`,
            'Slice the window and use `sum(...) / k`, or keep a running total.'],
    solution: `def moving(nums):\n    k = ${k}\n    return [sum(nums[i:i + k]) / k for i in range(len(nums) - k + 1)]`,
  };
} });

/* ---- 15. pairs summing to a target ---- */
GEN.add({ id: 'pair_sum', topic: 'algorithms', variants: 76, make(r) {
  const indices = r.bool(0.5);
  const base = r.distinct(r.int(5, 7), 1, 25);
  const i1 = 0, i2 = base.length - 1;
  const target = base[i1] + base[i2];
  const f = indices
    ? (a, t) => { const seen = new Map(); for (let i = 0; i < a.length; i++) { if (seen.has(t - a[i])) return [seen.get(t - a[i]), i]; seen.set(a[i], i); } return []; }
    : (a, t) => {
        const out = new Set();
        const cnt = {};
        for (const n of a) cnt[n] = (cnt[n] || 0) + 1;
        for (const n of Object.keys(cnt).map(Number)) {
          const m = t - n;
          if (cnt[m] === undefined) continue;
          if (n === m && cnt[n] < 2) continue;
          out.add(JSON.stringify([Math.min(n, m), Math.max(n, m)]));
        }
        return [...out].map(JSON.parse).sort((x, y) => x[0] - y[0] || x[1] - y[1]);
      };
  const data = [[base, target], [num(r, 4, 50, 60), 3], [[], 0]];
  return {
    title: indices ? 'Two sum (indices)' : 'All pairs hitting a target', rating: indices ? 1330 : 1470,
    prompt: indices
      ? `Write \`two_sum(nums, target)\` returning the indices \`[i, j]\` (\`i < j\`) of the first two values that add up to \`target\`, or \`[]\` if there are none.`
      : `Write \`two_sum(nums, target)\` returning every distinct pair \`[a, b]\` with \`a <= b\` and \`a + b == target\`, sorted ascending.`,
    mode: 'func', fn: 'two_sum', starter: S('two_sum', 'nums, target'),
    tests: data.map((p) => ({ args: p, expect: f(...p) })),
    hints: [indices ? 'A dict of value -> index lets you finish in one pass.' : 'Count the values first, so you can tell whether a value can pair with itself.',
            indices ? 'For each `n`, look for `target - n` among the values already seen.' : 'Collect pairs in a set to remove duplicates, then sort.'],
    solution: indices
      ? 'def two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i\n    return []'
      : 'from collections import Counter\n\n\ndef two_sum(nums, target):\n    counts = Counter(nums)\n    found = set()\n    for n in counts:\n        m = target - n\n        if m not in counts:\n            continue\n        if n == m and counts[n] < 2:\n            continue\n        found.add((min(n, m), max(n, m)))\n    return sorted([list(p) for p in found])',
  };
} });

/* ---- 16. longest increasing run ---- */
GEN.add({ id: 'longest_streak', topic: 'lists', variants: 76, make(r) {
  const wantRun = r.bool(0.4);
  const f = (a) => {
    let bs = 0, bl = 0, s = 0, l = a.length ? 1 : 0;
    for (let i = 1; i < a.length; i++) {
      if (a[i] > a[i - 1]) l++;
      else { if (l > bl) { bl = l; bs = i - l; } s = i; l = 1; }
    }
    if (l > bl) { bl = l; bs = a.length - l; }
    return wantRun ? a.slice(bs, bs + bl) : bl;
  };
  const data = [num(r, r.int(7, 10), 1, 20), asc(num(r, 5, 1, 20)), [], [3]];
  return {
    title: wantRun ? 'Longest rising run' : 'Longest rising run length', rating: 1490,
    prompt: `Write \`longest_run(nums)\` returning ${wantRun
      ? 'the longest stretch of strictly increasing neighbouring values (the earliest one on a tie)'
      : 'the length of the longest stretch of strictly increasing neighbouring values (`0` for an empty list)'}.\n\n` +
      example('longest_run', [[1, 2, 1, 4, 5, 6, 2]], f([1, 2, 1, 4, 5, 6, 2])),
    mode: 'func', fn: 'longest_run', starter: S('longest_run', 'nums'),
    tests: [...data, [1, 2, 1, 4, 5, 6, 2]].map((a) => ({ args: [a], expect: f(a) })),
    hints: ['Keep the current run length and where it started.', 'Every time the sequence drops, compare and reset.'],
    solution: wantRun
      ? 'def longest_run(nums):\n    if not nums:\n        return []\n    best_start = best_len = 0\n    start = 0\n    for i in range(1, len(nums) + 1):\n        if i == len(nums) or nums[i] <= nums[i - 1]:\n            if i - start > best_len:\n                best_len = i - start\n                best_start = start\n            start = i\n    return nums[best_start:best_start + best_len]'
      : 'def longest_run(nums):\n    if not nums:\n        return 0\n    best = run = 1\n    for i in range(1, len(nums)):\n        run = run + 1 if nums[i] > nums[i - 1] else 1\n        best = max(best, run)\n    return best',
  };
} });

/* ---- 17. max profit / best gap ---- */
GEN.add({ id: 'best_gap', topic: 'algorithms', variants: 76, make(r) {
  const f = (a) => { let lo = Infinity, best = 0; for (const n of a) { lo = Math.min(lo, n); best = Math.max(best, n - lo); } return best; };
  const data = [num(r, r.int(6, 9), 1, 60), asc(num(r, 5, 1, 40)).reverse(), [], [7]];
  return {
    title: 'Best buy-and-sell profit', rating: 1560,
    prompt: 'Prices arrive in order. Write `best_profit(prices)` returning the largest profit from buying once and ' +
      'selling later. Return `0` if no trade makes money.\n\n' + example('best_profit', [[7, 1, 5, 3, 6, 4]], 5),
    mode: 'func', fn: 'best_profit', starter: S('best_profit', 'prices'),
    tests: [...data, [7, 1, 5, 3, 6, 4]].map((a) => ({ args: [a], expect: f(a) })),
    hints: ['One pass: track the cheapest price so far.', 'At each price, the best sale today is `price - cheapest_so_far`.'],
    solution: 'def best_profit(prices):\n    best = 0\n    cheapest = None\n    for p in prices:\n        cheapest = p if cheapest is None else min(cheapest, p)\n        best = max(best, p - cheapest)\n    return best',
  };
} });

/* ---- 18. max subarray ---- */
GEN.add({ id: 'max_window_sum', topic: 'dp', variants: 76, make(r) {
  const fixed = r.bool(0.45);
  const k = r.int(2, 4);
  const fFixed = (a) => (a.length < k ? 0 : Math.max(...a.slice(0, a.length - k + 1).map((_, i) => sum(a.slice(i, i + k)))));
  const fAny = (a) => { if (!a.length) return 0; let best = a[0], cur = a[0]; for (const n of a.slice(1)) { cur = Math.max(n, cur + n); best = Math.max(best, cur); } return best; };
  const f = fixed ? fFixed : fAny;
  const data = [num(r, r.int(6, 9), -12, 20), num(r, 4, -9, -1), [], num(r, k - 1, 1, 5)];
  return {
    title: fixed ? `Best window of ${k}` : 'Maximum subarray sum', rating: fixed ? 1420 : 1620,
    prompt: fixed
      ? `Write \`best(nums)\` returning the largest sum of ${k} neighbouring values, or \`0\` when the list is shorter than ${k}.`
      : 'Write `best(nums)` returning the largest sum of any contiguous non-empty slice, or `0` for an empty list. Must run in O(n).',
    mode: 'func', fn: 'best', starter: S('best', 'nums'),
    tests: data.map((a) => ({ args: [a], expect: f(a) })),
    hints: [fixed ? 'Slide the window and keep a running total.' : 'Kadane: at each value, either extend the running sum or start fresh.',
            fixed ? `There are \`len(nums) - ${k} + 1\` windows.` : '`cur = max(n, cur + n)`'],
    solution: fixed
      ? `def best(nums):\n    k = ${k}\n    if len(nums) < k:\n        return 0\n    return max(sum(nums[i:i + k]) for i in range(len(nums) - k + 1))`
      : 'def best(nums):\n    if not nums:\n        return 0\n    best_sum = cur = nums[0]\n    for n in nums[1:]:\n        cur = max(n, cur + n)\n        best_sum = max(best_sum, cur)\n    return best_sum',
  };
} });

/* ---- 19. binary search ---- */
GEN.add({ id: 'bin_search', topic: 'algorithms', variants: 76, make(r) {
  const insertPos = r.bool(0.4);
  const data = asc(r.distinct(r.int(6, 10), 1, 60));
  const f = insertPos
    ? (a, t) => { let lo = 0, hi = a.length; while (lo < hi) { const m = (lo + hi) >> 1; if (a[m] < t) lo = m + 1; else hi = m; } return lo; }
    : (a, t) => a.indexOf(t);
  const present = r.pick(data);
  const absent = 61;
  const cases = [[data, present], [data, absent], [[], 5], [data, data[0]]];
  return {
    title: insertPos ? 'Insertion point' : 'Binary search', rating: insertPos ? 1520 : 1400,
    prompt: insertPos
      ? 'Write `search(sorted_nums, target)` returning the index where `target` should be inserted to keep the list sorted. ' +
        'If it is already there, return the index of the first copy. Must run in O(log n).'
      : 'Write `search(sorted_nums, target)` returning the index of `target`, or `-1` when it is not there. Must run in O(log n).',
    mode: 'func', fn: 'search', starter: S('search', 'sorted_nums, target'),
    tests: cases.map((p) => ({ args: p, expect: f(...p) })),
    hints: ['Keep `lo` and `hi` bounds and halve the range each step.', '`mid = (lo + hi) // 2`'],
    solution: insertPos
      ? 'def search(sorted_nums, target):\n    lo, hi = 0, len(sorted_nums)\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if sorted_nums[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid\n    return lo'
      : 'def search(sorted_nums, target):\n    lo, hi = 0, len(sorted_nums) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if sorted_nums[mid] == target:\n            return mid\n        if sorted_nums[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1',
  };
} });

/* ---- 20. merge two sorted lists ---- */
GEN.add({ id: 'merge_sorted_gen', topic: 'algorithms', variants: 76, make(r) {
  const f = (a, b) => asc([...a, ...b]);
  const a = asc(num(r, r.int(3, 5), 1, 30)), b = asc(num(r, r.int(3, 5), 1, 30));
  const data = [[a, b], [[], b], [a, []], [[], []]];
  return {
    title: 'Merge two sorted lists', rating: 1450,
    prompt: `Write \`merge(a, b)\` combining two already-sorted lists into one sorted list in O(n + m). Do not call \`sorted\`.\n\n${example('merge', [a, b], f(a, b))}`,
    mode: 'func', fn: 'merge', starter: S('merge', 'a, b'),
    tests: data.map((p) => ({ args: p, expect: f(...p) })),
    hints: ['Two index pointers; always take the smaller head.', 'Append whatever is left when one side runs out.'],
    solution: 'def merge(a, b):\n    out = []\n    i = j = 0\n    while i < len(a) and j < len(b):\n        if a[i] <= b[j]:\n            out.append(a[i])\n            i += 1\n        else:\n            out.append(b[j])\n            j += 1\n    out.extend(a[i:])\n    out.extend(b[j:])\n    return out',
  };
} });

/* ---- 21. flatten ---- */
GEN.add({ id: 'flatten_gen', topic: 'lists', variants: 76, make(r) {
  const deep = r.bool(0.4);
  const flat1 = (rows) => [].concat(...rows);
  const flatDeep = (x) => x.reduce((o, v) => o.concat(Array.isArray(v) ? flatDeep(v) : [v]), []);
  const f = deep ? flatDeep : flat1;
  const shallow = [num(r, 2, 1, 9), num(r, 3, 1, 9), []];
  const nested = [1, [2, [3, [4, 5]]], [[6]], []];
  const data = deep ? [nested, [], [[[]]], [1, 2]] : [shallow, [], [[], [1]]];
  return {
    title: deep ? 'Flatten any depth' : 'Flatten one level', rating: deep ? 1560 : 1200,
    prompt: deep
      ? `Write \`flatten(x)\` turning arbitrarily nested lists into one flat list, order kept.\n\n${example('flatten', [nested], f(nested))}`
      : `Write \`flatten(rows)\` turning a list of lists into a single list.\n\n${example('flatten', [shallow], f(shallow))}`,
    mode: 'func', fn: 'flatten', starter: S('flatten', deep ? 'x' : 'rows'),
    tests: data.map((a) => ({ args: [a], expect: f(a) })),
    hints: [deep ? 'Recurse whenever an element is itself a list.' : 'A comprehension can take two `for` clauses.',
            deep ? '`isinstance(item, list)`' : '`[x for row in rows for x in row]`'],
    solution: deep
      ? 'def flatten(x):\n    out = []\n    for item in x:\n        if isinstance(item, list):\n            out.extend(flatten(item))\n        else:\n            out.append(item)\n    return out'
      : 'def flatten(rows):\n    return [x for row in rows for x in row]',
  };
} });

/* ---- 22. partition ---- */
GEN.add({ id: 'partition_gen', topic: 'lists', variants: 76, make(r) {
  const limit = r.int(5, 30);
  const f = (a) => [a.filter((n) => n < limit), a.filter((n) => n >= limit)];
  const data = [num(r, r.int(6, 9), 1, 50), num(r, 3, 1, limit - 1), []];
  return {
    title: `Split around ${limit}`, rating: 1160,
    prompt: `Write \`split(nums)\` returning \`[below, rest]\` — the values below ${limit}, then the values ${limit} or above, ` +
      `each keeping the original order.\n\n${example('split', [data[0]], f(data[0]))}`,
    mode: 'func', fn: 'split', starter: S('split', 'nums'),
    tests: data.map((a) => ({ args: [a], expect: f(a) })),
    hints: ['One pass, appending to whichever list applies.'],
    solution: `def split(nums):\n    below, rest = [], []\n    for n in nums:\n        (below if n < ${limit} else rest).append(n)\n    return [below, rest]`,
  };
} });

/* ---- 23. move values to the end ---- */
GEN.add({ id: 'move_to_end', topic: 'lists', variants: 76, make(r) {
  const target = r.pick([0, r.int(1, 5)]);
  const f = (a) => { const keep = a.filter((n) => n !== target); return [...keep, ...Array(a.length - keep.length).fill(target)]; };
  const data = [[...num(r, 4, 1, 6), target, target, ...num(r, 2, 1, 6)], Array(4).fill(target), []];
  return {
    title: `Push ${target}s to the end`, rating: 1300,
    prompt: `Write \`shove(nums)\` returning a list with every \`${target}\` moved to the end, the other values keeping ` +
      `their relative order.\n\n${example('shove', [data[0]], f(data[0]))}`,
    mode: 'func', fn: 'shove', starter: S('shove', 'nums'),
    tests: data.map((a) => ({ args: [a], expect: f(a) })),
    hints: ['Collect everything else first, then pad the tail.'],
    solution: `def shove(nums):\n    keep = [n for n in nums if n != ${target}]\n    return keep + [${target}] * (len(nums) - len(keep))`,
  };
} });

/* ---- 24. list of names / strings ---- */
GEN.add({ id: 'name_list', topic: 'lists', variants: 76, make(r) {
  const kinds = [
    ['shout_all', 'every name in capitals', (a) => a.map((s) => s.toUpperCase()), '[n.upper() for n in names]', 830],
    ['long_names', 'only the names longer than 3 letters', (a) => a.filter((s) => s.length > 3), '[n for n in names if len(n) > 3]', 900],
    ['by_length', 'the names sorted shortest first, ties keeping their original order',
      (a) => a.map((v, i) => [v, i]).sort((x, y) => x[0].length - y[0].length || x[1] - y[1]).map((p) => p[0]),
      'sorted(names, key=len)', 1150],
    ['alphabetical', 'the names sorted alphabetically, case-insensitively',
      (a) => a.slice().sort((x, y) => (x.toLowerCase() < y.toLowerCase() ? -1 : x.toLowerCase() > y.toLowerCase() ? 1 : 0)),
      'sorted(names, key=str.lower)', 1180],
    ['joined', 'the names joined with `", "`', (a) => a.join(', '), '", ".join(names)', 950],
    ['initials_list', 'the first letter of each name', (a) => a.map((s) => s[0]), '[n[0] for n in names]', 900],
  ];
  const [fn, desc, f, hint, rating] = r.pick(kinds);
  const data = [r.names(r.int(4, 6)), [r.name()], []];
  return {
    title: cap(fn.replace(/_/g, ' ')), rating,
    prompt: `Write \`${fn}(names)\` returning ${desc}.\n\n${example(fn, [data[0]], f(data[0]))}`,
    mode: 'func', fn, starter: S(fn, 'names'),
    tests: data.map((a) => ({ args: [a], expect: f(a) })),
    hints: [`\`${hint}\``],
    solution: `def ${fn}(names):\n    return ${hint}`,
  };
} });

/* ---- 25. mode / most common value ---- */
GEN.add({ id: 'most_common_value', topic: 'lists', variants: 76, make(r) {
  const f = (a) => {
    const c = new Map();
    for (const n of a) c.set(n, (c.get(n) || 0) + 1);
    let best = null, bn = -1;
    for (const n of a) if (c.get(n) > bn) { bn = c.get(n); best = n; }
    return best;
  };
  const v = r.int(1, 6);
  const data = [[...num(r, 4, 1, 6), v, v, v], num(r, 4, 1, 4), []];
  return {
    title: 'Most common value', rating: 1290,
    prompt: 'Write `most_common(nums)` returning the value that appears most often. On a tie, return the one that ' +
      'appears **first** in the list. Return `None` for an empty list.\n\n' +
      example('most_common', [data[0]], f(data[0])),
    mode: 'func', fn: 'most_common', starter: S('most_common', 'nums'),
    tests: data.map((a) => ({ args: [a], expect: f(a) })),
    hints: ['Count first, then scan the list in order and keep the best.',
            'Scanning the original list (not the dict) is what breaks the tie correctly.'],
    solution: 'from collections import Counter\n\n\ndef most_common(nums):\n    if not nums:\n        return None\n    counts = Counter(nums)\n    best = nums[0]\n    for n in nums:\n        if counts[n] > counts[best]:\n            best = n\n    return best',
  };
} });

/* ---- 26. index arithmetic ---- */
GEN.add({ id: 'index_math', topic: 'lists', variants: 76, make(r) {
  const kinds = [
    ['sum_even_positions', 'the sum of the values at even indices (0, 2, 4, …)',
      (a) => sum(a.filter((_, i) => i % 2 === 0)), 'nums[::2]', 1050],
    ['sum_odd_positions', 'the sum of the values at odd indices (1, 3, 5, …)',
      (a) => sum(a.filter((_, i) => i % 2 === 1)), 'nums[1::2]', 1050],
    ['alternating_sum', 'the values added and subtracted alternately, starting with a plus',
      (a) => a.reduce((t, n, i) => t + (i % 2 ? -n : n), 0), 'flip the sign on odd indices', 1180],
    ['weighted_sum', 'each value multiplied by its index, then summed',
      (a) => a.reduce((t, n, i) => t + n * i, 0), 'sum(i * n for i, n in enumerate(nums))', 1200],
  ];
  const [fn, desc, f, hint, rating] = r.pick(kinds);
  const data = [num(r, r.int(5, 8), 1, 20), num(r, 1, 1, 9), []];
  return {
    title: cap(fn.replace(/_/g, ' ')), rating,
    prompt: `Write \`${fn}(nums)\` returning ${desc}.\n\n${example(fn, [data[0]], f(data[0]))}`,
    mode: 'func', fn, starter: S(fn, 'nums'),
    tests: data.map((a) => ({ args: [a], expect: f(a) })),
    hints: [`\`${hint}\``, '`enumerate(nums)` hands you the index and the value together.'],
    solution: {
      sum_even_positions: 'def sum_even_positions(nums):\n    return sum(nums[::2])',
      sum_odd_positions: 'def sum_odd_positions(nums):\n    return sum(nums[1::2])',
      alternating_sum: 'def alternating_sum(nums):\n    return sum(-n if i % 2 else n for i, n in enumerate(nums))',
      weighted_sum: 'def weighted_sum(nums):\n    return sum(i * n for i, n in enumerate(nums))',
    }[fn],
  };
} });

/* ---- 27. counting against the mean ---- */
GEN.add({ id: 'vs_mean', topic: 'lists', variants: 76, make(r) {
  const above = r.bool();
  const f = (a) => { if (!a.length) return 0; const m = sum(a) / a.length; return a.filter((n) => (above ? n > m : n < m)).length; };
  const data = [num(r, r.int(5, 8), 1, 50), num(r, 3, 5, 5), []];
  return {
    title: above ? 'How many above average' : 'How many below average', rating: 1230,
    prompt: `Write \`count(nums)\` returning how many values are strictly ${above ? 'above' : 'below'} the mean. ` +
      'An empty list gives `0`.\n\n' + example('count', [data[0]], f(data[0])),
    mode: 'func', fn: 'count', starter: S('count', 'nums'),
    tests: data.map((a) => ({ args: [a], expect: f(a) })),
    hints: ['Work the average out once, before the loop.'],
    solution: `def count(nums):\n    if not nums:\n        return 0\n    avg = sum(nums) / len(nums)\n    return sum(1 for n in nums if n ${above ? '>' : '<'} avg)`,
  };
} });

/* ---- 28. balance point ---- */
GEN.add({ id: 'balance_point', topic: 'algorithms', variants: 76, make(r) {
  const f = (a) => { const t = sum(a); let l = 0; for (let i = 0; i < a.length; i++) { if (l === t - l - a[i]) return i; l += a[i]; } return -1; };
  const data = [[1, 7, 3, 6, 5, 6], num(r, r.int(5, 8), 1, 12), [], [5]];
  return {
    title: 'Balance index', rating: 1520,
    prompt: 'Write `balance(nums)` returning the first index where the values to its left sum to the same as the values ' +
      'to its right (the value at the index itself counts for neither). Return `-1` if there is none.\n\n' +
      example('balance', [[1, 7, 3, 6, 5, 6]], 3),
    mode: 'func', fn: 'balance', starter: S('balance', 'nums'),
    tests: data.map((a) => ({ args: [a], expect: f(a) })),
    hints: ['The right-hand sum is `total - left - nums[i]` — no inner loop needed.', 'Work out the total once up front.'],
    solution: 'def balance(nums):\n    total = sum(nums)\n    left = 0\n    for i, n in enumerate(nums):\n        if left == total - left - n:\n            return i\n        left += n\n    return -1',
  };
} });

/* ---- 29. missing / duplicate value ---- */
GEN.add({ id: 'missing_number', topic: 'algorithms', variants: 76, make(r) {
  const dup = r.bool(0.4);
  const n = r.int(6, 12);
  const full = Array.from({ length: n }, (_, i) => i + 1);
  const gone = r.pick(full);
  const fMissing = (a) => { const s = new Set(a); for (let i = 1; i <= a.length + 1; i++) if (!s.has(i)) return i; return -1; };
  const fDup = (a) => { const s = new Set(); for (const x of a) { if (s.has(x)) return x; s.add(x); } return -1; };
  const f = dup ? fDup : fMissing;
  const missingList = r.shuffle(full.filter((x) => x !== gone));
  const dupList = r.shuffle([...full, gone]);
  const data = dup ? [dupList, [1, 1], [1, 2, 3]] : [missingList, [2], [1, 2, 4]];
  return {
    title: dup ? 'Find the repeat' : 'Find the missing number', rating: dup ? 1330 : 1370,
    prompt: dup
      ? `The list holds the numbers 1..n with exactly one of them appearing twice. Write \`find(nums)\` returning the repeated value, or \`-1\` when nothing repeats.`
      : `The list holds the numbers 1..n with exactly one missing. Write \`find(nums)\` returning the missing value, or \`-1\` when nothing is missing.`,
    mode: 'func', fn: 'find', starter: S('find', 'nums'),
    tests: data.map((a) => ({ args: [a], expect: f(a) })),
    hints: [dup ? 'A `set` of what you have already seen.' : 'Compare the expected total with the real one, or use a set.'],
    solution: dup
      ? 'def find(nums):\n    seen = set()\n    for n in nums:\n        if n in seen:\n            return n\n        seen.add(n)\n    return -1'
      : 'def find(nums):\n    have = set(nums)\n    for n in range(1, len(nums) + 2):\n        if n not in have:\n            return n\n    return -1',
  };
} });

/* ---- 30. list of records ---- */
GEN.add({ id: 'records', topic: 'sorting', variants: 76, make(r) {
  const field = r.pick(['score', 'age', 'price', 'weight']);
  const kinds = [
    ['best', `the name with the highest ${field} (the first on a tie), or \`""\` when empty`,
      (rows) => (rows.length ? rows.reduce((a, b) => (b[1] > a[1] ? b : a))[0] : ''), 1290],
    ['ranked', `the names sorted by ${field}, highest first, ties broken alphabetically`,
      (rows) => rows.slice().sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)).map((p) => p[0]), 1420],
    ['above', `the names whose ${field} is above the average, in the original order`,
      (rows) => { if (!rows.length) return []; const m = sum(rows.map((p) => p[1])) / rows.length; return rows.filter((p) => p[1] > m).map((p) => p[0]); }, 1450],
    ['total', `the total of every ${field}`, (rows) => sum(rows.map((p) => p[1])), 1100],
  ];
  const [fn, desc, f, rating] = r.pick(kinds);
  const mk = (n) => r.names(n).map((nm) => [nm, r.int(1, 100)]);
  const data = [mk(r.int(4, 6)), mk(2), []];
  return {
    title: `${cap(fn)} by ${field}`, rating,
    prompt: `Rows are \`[name, ${field}]\` pairs. Write \`${fn}(rows)\` returning ${desc}.\n\n${example(fn, [data[1]], f(data[1]))}`,
    mode: 'func', fn, starter: S(fn, 'rows'),
    tests: data.map((a) => ({ args: [a], expect: f(a) })),
    hints: ['Each row unpacks as `name, value`.',
            fn === 'ranked' ? '`sorted(rows, key=lambda row: (-row[1], row[0]))`' : '`max(rows, key=lambda row: row[1])` compares on the value.'],
    solution: {
      best: 'def best(rows):\n    if not rows:\n        return ""\n    return max(rows, key=lambda row: row[1])[0]',
      ranked: 'def ranked(rows):\n    return [name for name, _ in sorted(rows, key=lambda row: (-row[1], row[0]))]',
      above: 'def above(rows):\n    if not rows:\n        return []\n    avg = sum(v for _, v in rows) / len(rows)\n    return [name for name, v in rows if v > avg]',
      total: 'def total(rows):\n    return sum(v for _, v in rows)',
    }[fn],
  };
} });
})();
