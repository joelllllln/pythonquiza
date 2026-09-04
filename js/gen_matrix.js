/* Generated questions: grids and matrices. */

(function () {
const { GEN, py, example, sum } = window;
const S = (fn, args) => `def ${fn}(${args}):\n    `;
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const grid = (r, rows, cols, lo = 1, hi = 20) =>
  Array.from({ length: rows }, () => r.ints(cols, lo, hi));
const square = (r, n, lo = 1, hi = 20) => grid(r, n, n, lo, hi);

/* ---- 1. sum of a row / column / everything ---- */
GEN.add({ id: 'grid_sum', topic: 'matrix', variants: 76, make(r) {
  const kinds = [
    ['total', 'the sum of every value', (m) => sum(m.map(sum)), 'sum(sum(row) for row in m)', 1050],
    ['row_sums', 'the sum of each row, as a list', (m) => m.map(sum), '[sum(row) for row in m]', 1080],
    ['col_sums', 'the sum of each column, as a list',
      (m) => (m.length ? m[0].map((_, c) => sum(m.map((row) => row[c]))) : []), '[sum(col) for col in zip(*m)]', 1350],
    ['biggest', 'the largest value, or `None` for an empty grid',
      (m) => (m.length && m[0].length ? Math.max(...m.map((row) => Math.max(...row))) : null), 'max of the row maxima', 1200],
  ];
  const [fn, desc, f, hint, rating] = r.pick(kinds);
  const m = grid(r, r.int(2, 3), r.int(2, 4));
  const data = [m, [[r.int(1, 9)]], []];
  return {
    title: cap(fn.replace(/_/g, ' ')) + ' of a grid', rating,
    prompt: `Write \`${fn}(m)\` returning ${desc} of a rectangular list of lists.\n\n${example(fn, [m], f(m))}`,
    mode: 'func', fn, starter: S(fn, 'm'),
    tests: data.map((x) => ({ args: [x], expect: f(x) })),
    hints: [`\`${hint}\``, '`zip(*m)` hands you the columns.'],
    solution: {
      total: 'def total(m):\n    return sum(sum(row) for row in m)',
      row_sums: 'def row_sums(m):\n    return [sum(row) for row in m]',
      col_sums: 'def col_sums(m):\n    return [sum(col) for col in zip(*m)]',
      biggest: 'def biggest(m):\n    values = [x for row in m for x in row]\n    return max(values) if values else None',
    }[fn],
  };
} });

/* ---- 2. transpose ---- */
GEN.add({ id: 'transpose_gen', topic: 'matrix', variants: 76, make(r) {
  const f = (m) => (m.length ? m[0].map((_, c) => m.map((row) => row[c])) : []);
  const m = grid(r, r.int(2, 3), r.int(2, 4));
  const data = [m, [[1]], []];
  return {
    title: 'Transpose a grid', rating: 1300,
    prompt: `Write \`transpose(m)\` swapping rows and columns.\n\n${example('transpose', [m], f(m))}`,
    mode: 'func', fn: 'transpose', starter: S('transpose', 'm'),
    tests: data.map((x) => ({ args: [x], expect: f(x) })),
    hints: ['`zip(*m)` pairs the columns up.', '`zip` yields tuples — turn each into a list.'],
    solution: 'def transpose(m):\n    return [list(col) for col in zip(*m)]',
  };
} });

/* ---- 3. rotate a square grid ---- */
GEN.add({ id: 'rotate_grid', topic: 'matrix', variants: 76, make(r) {
  const cw = r.bool();
  const f = (m) => {
    const n = m.length;
    if (!n) return [];
    return cw
      ? m[0].map((_, c) => m.map((row) => row[c]).reverse())
      : m[0].map((_, c) => m.map((row) => row[m[0].length - 1 - c]));
  };
  const m = square(r, r.int(2, 3));
  const data = [m, [[1]], []];
  return {
    title: `Rotate a square grid ${cw ? 'clockwise' : 'anticlockwise'}`, rating: 1500,
    prompt: `Write \`rotate(m)\` returning the square grid turned 90° ${cw ? 'clockwise' : 'anticlockwise'}.\n\n${example('rotate', [m], f(m))}`,
    mode: 'func', fn: 'rotate', starter: S('rotate', 'm'),
    tests: data.map((x) => ({ args: [x], expect: f(x) })),
    hints: ['Transpose first, then reverse — the order and which one you reverse decides the direction.',
            cw ? 'Clockwise: transpose, then reverse each row.' : 'Anticlockwise: reverse the rows, then transpose.'],
    solution: cw
      ? 'def rotate(m):\n    return [list(row)[::-1] for row in zip(*m)]'
      : 'def rotate(m):\n    return [list(row) for row in zip(*[r for r in m])][::-1]',
  };
} });

/* ---- 4. diagonals ---- */
GEN.add({ id: 'diagonal', topic: 'matrix', variants: 76, make(r) {
  const anti = r.bool(0.4);
  const wantSum = r.bool(0.5);
  const pick = (m) => m.map((row, i) => row[anti ? m.length - 1 - i : i]);
  const f = (m) => (m.length === 0 ? (wantSum ? 0 : []) : (wantSum ? sum(pick(m)) : pick(m)));
  const m = square(r, r.int(2, 4));
  const data = [m, [[5]], []];
  return {
    title: `${anti ? 'Anti-diagonal' : 'Main diagonal'} ${wantSum ? 'sum' : 'values'}`, rating: 1280,
    prompt: `Write \`diag(m)\` returning ${wantSum ? 'the sum of' : ''} the values on the ` +
      `${anti ? 'anti-diagonal (top-right to bottom-left)' : 'main diagonal (top-left to bottom-right)'} of a square grid` +
      `${wantSum ? '' : ', top to bottom'}.\n\n${example('diag', [m], f(m))}`,
    mode: 'func', fn: 'diag', starter: S('diag', 'm'),
    tests: data.map((x) => ({ args: [x], expect: f(x) })),
    hints: [anti ? 'Row `i` uses column `len(m) - 1 - i`.' : 'Row `i` uses column `i`.'],
    solution: `def diag(m):\n    return ${wantSum ? 'sum' : ''}(${wantSum ? '' : '['}m[i][${anti ? 'len(m) - 1 - i' : 'i'}] for i in range(len(m))${wantSum ? '' : ']'})`
      .replace('return ([', 'return [').replace('])', ']'),
  };
} });

/* ---- 5. flatten a grid ---- */
GEN.add({ id: 'grid_flatten', topic: 'matrix', variants: 76, make(r) {
  const byCol = r.bool(0.4);
  const f = (m) => (byCol
    ? (m.length ? [].concat(...m[0].map((_, c) => m.map((row) => row[c]))) : [])
    : [].concat(...m));
  const m = grid(r, r.int(2, 3), r.int(2, 3));
  const data = [m, [[1]], []];
  return {
    title: `Flatten a grid ${byCol ? 'column by column' : 'row by row'}`, rating: byCol ? 1350 : 1150,
    prompt: `Write \`flatten(m)\` returning every value in one list, reading ${byCol ? 'down each column in turn' : 'along each row in turn'}.\n\n` +
      example('flatten', [m], f(m)),
    mode: 'func', fn: 'flatten', starter: S('flatten', 'm'),
    tests: data.map((x) => ({ args: [x], expect: f(x) })),
    hints: [byCol ? '`zip(*m)` gives the columns; then flatten those.' : '`[x for row in m for x in row]`'],
    solution: byCol
      ? 'def flatten(m):\n    return [x for col in zip(*m) for x in col]'
      : 'def flatten(m):\n    return [x for row in m for x in row]',
  };
} });

/* ---- 6. build a grid ---- */
GEN.add({ id: 'grid_build', topic: 'matrix', variants: 76, make(r) {
  const kinds = [
    ['identity', 'an `n` × `n` grid with 1 on the main diagonal and 0 everywhere else',
      (n) => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))), 1280],
    ['times_table', 'an `n` × `n` grid where the value at row `i`, column `j` is `(i + 1) * (j + 1)`',
      (n) => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i + 1) * (j + 1))), 1200],
    ['counting', 'an `n` × `n` grid filled with 1, 2, 3, … reading along each row',
      (n) => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i * n + j + 1)), 1260],
  ];
  const [fn, desc, f, rating] = r.pick(kinds);
  const n = r.int(2, 4);
  const data = [n, 1, 0];
  return {
    title: cap(fn.replace(/_/g, ' ')) + ' grid', rating,
    prompt: `Write \`build(n)\` returning ${desc}.\n\n${example('build', [n], f(n))}`,
    mode: 'func', fn: 'build', starter: S('build', 'n'),
    tests: data.map((x) => ({ args: [x], expect: f(x) })),
    hints: ['A comprehension inside a comprehension builds the rows.',
            '`[[... for j in range(n)] for i in range(n)]`'],
    solution: {
      identity: 'def build(n):\n    return [[1 if i == j else 0 for j in range(n)] for i in range(n)]',
      times_table: 'def build(n):\n    return [[(i + 1) * (j + 1) for j in range(n)] for i in range(n)]',
      counting: 'def build(n):\n    return [[i * n + j + 1 for j in range(n)] for i in range(n)]',
    }[fn],
  };
} });

/* ---- 7. count in a grid ---- */
GEN.add({ id: 'grid_count', topic: 'matrix', variants: 76, make(r) {
  const target = r.int(0, 3);
  const kinds = [
    ['count_value', `how many cells hold \`${target}\``, (m) => sum(m.map((row) => row.filter((x) => x === target).length)), 1100],
    ['positions', `every \`[row, col]\` holding \`${target}\`, reading row by row`,
      (m) => { const o = []; m.forEach((row, i) => row.forEach((v, j) => { if (v === target) o.push([i, j]); })); return o; }, 1330],
  ];
  const [fn, desc, f, rating] = r.pick(kinds);
  const m = grid(r, r.int(2, 3), r.int(2, 3), 0, 3);
  const data = [m, [[target]], []];
  return {
    title: cap(fn.replace(/_/g, ' ')) + ` of ${target}`, rating,
    prompt: `Write \`${fn}(m)\` returning ${desc}.\n\n${example(fn, [m], f(m))}`,
    mode: 'func', fn, starter: S(fn, 'm'),
    tests: data.map((x) => ({ args: [x], expect: f(x) })),
    hints: ['`enumerate` over the rows, then over each row, gives you both indices.'],
    solution: fn === 'count_value'
      ? `def count_value(m):\n    return sum(row.count(${target}) for row in m)`
      : `def positions(m):\n    out = []\n    for i, row in enumerate(m):\n        for j, v in enumerate(row):\n            if v == ${target}:\n                out.append([i, j])\n    return out`,
  };
} });

/* ---- 8. neighbours ---- */
GEN.add({ id: 'neighbours', topic: 'matrix', variants: 76, make(r) {
  const diagonal = r.bool(0.4);
  const deltas = diagonal
    ? [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
    : [[-1, 0], [1, 0], [0, -1], [0, 1]];
  const f = (m, y, x) => {
    let t = 0;
    for (const [dy, dx] of deltas) {
      const ny = y + dy, nx = x + dx;
      if (ny >= 0 && ny < m.length && nx >= 0 && nx < m[0].length) t += m[ny][nx];
    }
    return t;
  };
  const m = grid(r, 3, 3);
  const data = [[m, 1, 1], [m, 0, 0], [m, 2, 2]];
  return {
    title: `Sum the ${diagonal ? '8' : '4'} neighbours`, rating: 1560,
    prompt: `Write \`around(m, row, col)\` returning the sum of the cells ${diagonal
      ? 'touching `(row, col)` in all eight directions' : 'directly above, below, left and right of `(row, col)`'}. ` +
      'Cells off the edge of the grid count as nothing.\n\n' + example('around', [m, 1, 1], f(m, 1, 1)),
    mode: 'func', fn: 'around', starter: S('around', 'm, row, col'),
    tests: data.map((p) => ({ args: p, expect: f(...p) })),
    hints: [`Keep the ${diagonal ? 'eight' : 'four'} offsets in a list and loop them.`,
            'Check `0 <= ny < len(m)` and `0 <= nx < len(m[0])` before reading.'],
    solution: `def around(m, row, col):\n    deltas = ${py(deltas)}\n    total = 0\n    for dy, dx in deltas:\n        y, x = row + dy, col + dx\n        if 0 <= y < len(m) and 0 <= x < len(m[0]):\n            total += m[y][x]\n    return total`,
  };
} });

/* ---- 9. matrix arithmetic ---- */
GEN.add({ id: 'grid_math', topic: 'matrix', variants: 76, make(r) {
  const k = r.int(2, 9);
  const kinds = [
    ['add_grids', 'the two same-shaped grids added cell by cell',
      (a, b) => a.map((row, i) => row.map((v, j) => v + b[i][j])), true, 1310],
    ['scale', `every value multiplied by ${k}`, (a) => a.map((row) => row.map((v) => v * k)), false, 1150],
    ['clip', `every value above ${k * 3} replaced by ${k * 3}`,
      (a) => a.map((row) => row.map((v) => Math.min(v, k * 3))), false, 1220],
  ];
  const [fn, desc, f, two, rating] = r.pick(kinds);
  const a = grid(r, 2, 3), b = grid(r, 2, 3);
  const data = two ? [[a, b], [[[1]], [[2]]], [[], []]] : [[a], [[[1]]], [[]]];
  return {
    title: cap(fn.replace(/_/g, ' ')), rating,
    prompt: `Write \`${fn}(${two ? 'a, b' : 'm'})\` returning a new grid with ${desc}.\n\n` +
      example(fn, two ? [a, b] : [a], two ? f(a, b) : f(a)),
    mode: 'func', fn, starter: S(fn, two ? 'a, b' : 'm'),
    tests: data.map((p) => ({ args: p, expect: f(...p) })),
    hints: ['A comprehension over the rows, and another over the values inside each row.'],
    solution: {
      add_grids: 'def add_grids(a, b):\n    return [[x + y for x, y in zip(ra, rb)] for ra, rb in zip(a, b)]',
      scale: `def scale(m):\n    return [[v * ${k} for v in row] for row in m]`,
      clip: `def clip(m):\n    return [[min(v, ${k * 3}) for v in row] for row in m]`,
    }[fn],
  };
} });

/* ---- 10. row / column extremes ---- */
GEN.add({ id: 'grid_extremes', topic: 'matrix', variants: 76, make(r) {
  const kinds = [
    ['row_maxima', 'the largest value in each row', (m) => m.map((row) => Math.max(...row)), 1150],
    ['row_minima', 'the smallest value in each row', (m) => m.map((row) => Math.min(...row)), 1150],
    ['brightest_row', 'the index of the row with the largest total (the first, on a tie), or `-1` when empty',
      (m) => { if (!m.length) return -1; let bi = 0, bv = sum(m[0]); m.forEach((row, i) => { if (sum(row) > bv) { bv = sum(row); bi = i; } }); return bi; }, 1400],
  ];
  const [fn, desc, f, rating] = r.pick(kinds);
  const m = grid(r, r.int(2, 3), r.int(2, 4));
  const data = [m, [[7]], []];
  return {
    title: cap(fn.replace(/_/g, ' ')), rating,
    prompt: `Write \`${fn}(m)\` returning ${desc}.\n\n${example(fn, [m], f(m))}`,
    mode: 'func', fn, starter: S(fn, 'm'),
    tests: data.map((x) => ({ args: [x], expect: f(x) })),
    hints: ['`max(row)` per row, or `max(range(len(m)), key=...)` for the index.'],
    solution: {
      row_maxima: 'def row_maxima(m):\n    return [max(row) for row in m]',
      row_minima: 'def row_minima(m):\n    return [min(row) for row in m]',
      brightest_row: 'def brightest_row(m):\n    if not m:\n        return -1\n    return max(range(len(m)), key=lambda i: sum(m[i]))',
    }[fn],
  };
} });

/* ---- 11. symmetry checks ---- */
GEN.add({ id: 'grid_check', topic: 'matrix', variants: 76, make(r) {
  const kinds = [
    ['is_symmetric', 'the grid is the same as its transpose',
      (m) => m.every((row, i) => row.every((v, j) => v === m[j][i])), 1420],
    ['is_rectangular', 'every row has the same length',
      (m) => m.every((row) => row.length === m[0].length), 1180],
    ['all_positive', 'every value is greater than zero',
      (m) => m.every((row) => row.every((v) => v > 0)), 1150],
  ];
  const [fn, desc, f, rating] = r.pick(kinds);
  const m = square(r, 3);
  const sym = m.map((row, i) => row.map((_, j) => (i <= j ? m[i][j] : m[j][i])));
  const data = [m, sym, [[1, 2], [3]], []];
  return {
    title: cap(fn.replace(/_/g, ' ')), rating,
    prompt: `Write \`${fn}(m)\` returning \`True\` when ${desc}. An empty grid counts as \`True\`.`,
    mode: 'func', fn, starter: S(fn, 'm'),
    tests: data.map((x) => ({ args: [x], expect: f(x) })),
    hints: ['`all(...)` over a generator expression says it in one line.',
            fn === 'is_symmetric' ? 'Compare `m[i][j]` with `m[j][i]`.' : 'Compare each row with the first one.'],
    solution: {
      is_symmetric: 'def is_symmetric(m):\n    return all(m[i][j] == m[j][i] for i in range(len(m)) for j in range(len(m)))',
      is_rectangular: 'def is_rectangular(m):\n    return all(len(row) == len(m[0]) for row in m)',
      all_positive: 'def all_positive(m):\n    return all(v > 0 for row in m for v in row)',
    }[fn],
  };
} });

/* ---- 12. spiral / border ---- */
GEN.add({ id: 'grid_border', topic: 'matrix', variants: 76, make(r) {
  const spiral = r.bool(0.45);
  const border = (m) => {
    if (!m.length) return [];
    const rows = m.length, cols = m[0].length, out = [];
    for (let c = 0; c < cols; c++) out.push(m[0][c]);
    for (let rr = 1; rr < rows; rr++) out.push(m[rr][cols - 1]);
    if (rows > 1) for (let c = cols - 2; c >= 0; c--) out.push(m[rows - 1][c]);
    if (cols > 1) for (let rr = rows - 2; rr >= 1; rr--) out.push(m[rr][0]);
    return out;
  };
  const spiralOf = (m) => {
    if (!m.length) return [];
    const out = [];
    let top = 0, bot = m.length - 1, left = 0, right = m[0].length - 1;
    while (top <= bot && left <= right) {
      for (let c = left; c <= right; c++) out.push(m[top][c]);
      top++;
      for (let rr = top; rr <= bot; rr++) out.push(m[rr][right]);
      right--;
      if (top <= bot) { for (let c = right; c >= left; c--) out.push(m[bot][c]); bot--; }
      if (left <= right) { for (let rr = bot; rr >= top; rr--) out.push(m[rr][left]); left++; }
    }
    return out;
  };
  const f = spiral ? spiralOf : border;
  const m = grid(r, 3, 3);
  const data = [m, [[1, 2]], [[1], [2], [3]], []];
  return {
    title: spiral ? 'Spiral order' : 'Walk the border', rating: spiral ? 1700 : 1520,
    prompt: spiral
      ? `Write \`walk(m)\` reading the grid clockwise in a spiral from the top-left.\n\n${example('walk', [m], f(m))}`
      : `Write \`walk(m)\` returning the values around the outside edge, clockwise from the top-left, each cell once.\n\n${example('walk', [m], f(m))}`,
    mode: 'func', fn: 'walk', starter: S('walk', 'm'),
    tests: data.map((x) => ({ args: [x], expect: f(x) })),
    hints: ['Keep four bounds — top, bottom, left, right.',
            'After walking a row or column, shrink the bound and re-check it has not crossed.'],
    solution: spiral
      ? 'def walk(m):\n    if not m:\n        return []\n    out = []\n    top, bot = 0, len(m) - 1\n    left, right = 0, len(m[0]) - 1\n    while top <= bot and left <= right:\n        for c in range(left, right + 1):\n            out.append(m[top][c])\n        top += 1\n        for rr in range(top, bot + 1):\n            out.append(m[rr][right])\n        right -= 1\n        if top <= bot:\n            for c in range(right, left - 1, -1):\n                out.append(m[bot][c])\n            bot -= 1\n        if left <= right:\n            for rr in range(bot, top - 1, -1):\n                out.append(m[rr][left])\n            left += 1\n    return out'
      : 'def walk(m):\n    if not m:\n        return []\n    rows, cols = len(m), len(m[0])\n    out = [m[0][c] for c in range(cols)]\n    out += [m[r][cols - 1] for r in range(1, rows)]\n    if rows > 1:\n        out += [m[rows - 1][c] for c in range(cols - 2, -1, -1)]\n    if cols > 1:\n        out += [m[r][0] for r in range(rows - 2, 0, -1)]\n    return out',
  };
} });
})();
