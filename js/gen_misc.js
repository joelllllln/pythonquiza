/* Generated questions: programs that print, classes, functions, errors,
   generators and small simulations. */

(function () {
const { GEN, py, example, sum } = window;
const S = (fn, args) => `def ${fn}(${args}):\n    `;
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* ---- 1. countdown / count-up program ---- */
GEN.add({ id: 'count_program', topic: 'loops', variants: 76, make(r) {
  const down = r.bool();
  const step = r.int(1, 3);
  const tail = r.pick(['Done!', 'Liftoff!', 'Finished.', 'Go!']);
  const f = (n) => {
    const out = [];
    if (down) for (let i = n; i >= 1; i -= step) out.push(i);
    else for (let i = 1; i <= n; i += step) out.push(i);
    out.push(tail);
    return out.join('\n');
  };
  const cases = [r.int(5, 9), 1, r.int(10, 14)];
  return {
    title: `Count ${down ? 'down' : 'up'} in ${step}s`, rating: 1050, mode: 'stdout',
    prompt: `Read one integer \`n\` with \`input()\`, then print ` +
      (down ? `\`n\`, \`n - ${step}\`, … down to 1 or as close as you get without going below it`
            : `1, ${1 + step}, … up to \`n\` without going past it`) +
      `, one per line. Finish with \`${tail}\`.`,
    starter: 'n = int(input())\n',
    tests: cases.map((n) => ({ stdin: [String(n)], expect: f(n) })),
    hints: [`\`range\` takes a step: \`range(${down ? `n, 0, -${step}` : `1, n + 1, ${step}`})\`.`],
    solution: `n = int(input())\nfor i in range(${down ? `n, 0, -${step}` : `1, n + 1, ${step}`}):\n    print(i)\nprint("${tail}")`,
  };
} });

/* ---- 2. multiplication table ---- */
GEN.add({ id: 'times_table_program', topic: 'loops', variants: 76, make(r) {
  const upto = r.int(5, 12);
  const sep = r.pick([' x ', ' * ', ' times ']);
  const f = (n) => Array.from({ length: upto }, (_, i) => `${n}${sep}${i + 1} = ${n * (i + 1)}`).join('\n');
  const cases = [r.int(2, 9), 1, r.int(10, 15)];
  return {
    title: `Times table to ${upto}`, rating: 1100, mode: 'stdout',
    prompt: `Read one integer \`n\`, then print its times table from 1 to ${upto}, one line each, ` +
      `formatted as \`n${sep}i = result\`.\n\n\`\`\`\n${f(3).split('\n').slice(0, 3).join('\n')}\n…\n\`\`\``,
    starter: 'n = int(input())\n',
    tests: cases.map((n) => ({ stdin: [String(n)], expect: f(n) })),
    hints: ['`for i in range(1, ' + (upto + 1) + '):`', 'An f-string builds the line: `f"{n}' + sep + '{i} = {n * i}"`'],
    solution: `n = int(input())\nfor i in range(1, ${upto + 1}):\n    print(f"{n}${sep}{i} = {n * i}")`,
  };
} });

/* ---- 3. shape patterns ---- */
GEN.add({ id: 'pattern_program', topic: 'loops', variants: 76, make(r) {
  const ch = r.pick(['*', '#', '@', '+']);
  const kind = r.pick(['triangle', 'reverse', 'square', 'staircase']);
  const f = (n) => {
    const rows = [];
    for (let i = 1; i <= n; i++) {
      if (kind === 'triangle') rows.push(ch.repeat(i));
      else if (kind === 'reverse') rows.push(ch.repeat(n - i + 1));
      else if (kind === 'square') rows.push(ch.repeat(n));
      else rows.push(' '.repeat(n - i) + ch.repeat(i));
    }
    return rows.join('\n');
  };
  const cases = [r.int(3, 6), 1, r.int(7, 9)];
  const shown = f(4).split('\n').map((l) => l.replace(/ /g, '·')).join('\n');
  return {
    title: `${cap(kind)} of ${ch}`, rating: kind === 'staircase' ? 1290 : 1150, mode: 'stdout',
    prompt: `Read one integer \`n\`, then print an \`n\`-line ${kind} made of \`"${ch}"\`.` +
      (kind === 'staircase' ? ' Each line is right-aligned to width `n` using spaces.' : '') +
      `\n\nFor \`n = 4\` (dots shown here are ordinary spaces):\n\`\`\`\n${shown}\n\`\`\``,
    starter: 'n = int(input())\n',
    tests: cases.map((n) => ({ stdin: [String(n)], expect: f(n) })),
    hints: ['`"' + ch + '" * i` repeats a string.',
            kind === 'staircase' ? '`" " * (n - i)` pads the front.' : 'One `print` per row.'],
    solution: {
      triangle: `n = int(input())\nfor i in range(1, n + 1):\n    print("${ch}" * i)`,
      reverse: `n = int(input())\nfor i in range(n, 0, -1):\n    print("${ch}" * i)`,
      square: `n = int(input())\nfor _ in range(n):\n    print("${ch}" * n)`,
      staircase: `n = int(input())\nfor i in range(1, n + 1):\n    print(" " * (n - i) + "${ch}" * i)`,
    }[kind],
  };
} });

/* ---- 4. read n lines and summarise ---- */
GEN.add({ id: 'read_lines_program', topic: 'loops', variants: 76, make(r) {
  const kinds = [
    ['total', 'their total', (v) => `Total: ${sum(v)}`],
    ['largest', 'the largest', (v) => `Largest: ${Math.max(...v)}`],
    ['average', 'their average to one decimal place', (v) => `Average: ${(sum(v) / v.length).toFixed(1)}`],
    ['count_even', 'how many are even', (v) => `Even: ${v.filter((x) => x % 2 === 0).length}`],
  ];
  const [kind, desc, line] = r.pick(kinds);
  const f = (v) => line(v);
  // Averages that land exactly on a rounding tie format differently in
  // Python (half to even) than in JS, so keep the test data clear of one.
  const mk = (n) => {
    for (let tries = 0; tries < 40; tries++) {
      const v = r.ints(n, 1, 60);
      const mean = sum(v) / v.length;
      if (Math.abs(((mean * 10) % 1) - 0.5) > 1e-6) return v;
    }
    return r.ints(n, 1, 9).map((x) => x * 10);
  };
  const a = mk(r.int(3, 5)), b = mk(1), c = mk(4);
  const stdinOf = (v) => [String(v.length), ...v.map(String)];
  return {
    title: `Read numbers, report ${kind.replace('_', ' ')}`, rating: 1290, mode: 'stdout',
    prompt: `Read an integer \`n\`, then \`n\` more lines each holding one integer. Print ${desc} on a single line, ` +
      `formatted exactly as \`${line([2, 4])}\` is for the numbers 2 and 4.`,
    starter: 'n = int(input())\n',
    tests: [a, b, c].map((v) => ({ stdin: stdinOf(v), expect: f(v) })),
    hints: ['Loop `n` times, calling `input()` each time and converting with `int()`.',
            'Collect them in a list first, then work out the answer.'],
    solution: 'n = int(input())\nvalues = [int(input()) for _ in range(n)]\n' + {
      total: 'print(f"Total: {sum(values)}")',
      largest: 'print(f"Largest: {max(values)}")',
      average: 'print(f"Average: {sum(values) / len(values):.1f}")',
      count_even: 'print(f"Even: {sum(1 for v in values if v % 2 == 0)}")',
    }[kind],
  };
} });

/* ---- 5. name/score report ---- */
GEN.add({ id: 'report_program', topic: 'strings', variants: 76, make(r) {
  const pass = r.int(40, 70);
  const f = (rows) => rows.map(([n, s]) => `${n}: ${s} (${s >= pass ? 'PASS' : 'FAIL'})`).join('\n');
  const mk = (n) => r.names(n).map((nm) => [nm, r.int(10, 100)]);
  const a = mk(3), b = mk(1);
  const stdinOf = (rows) => [String(rows.length), ...rows.map(([n, s]) => `${n} ${s}`)];
  return {
    title: `Pass/fail report (pass mark ${pass})`, rating: 1380, mode: 'stdout',
    prompt: `Read an integer \`n\`, then \`n\` lines of \`name score\`. For each, print \`NAME: SCORE (PASS)\` when the ` +
      `score is ${pass} or more, otherwise \`NAME: SCORE (FAIL)\`.`,
    starter: 'n = int(input())\n',
    tests: [a, b].map((rows) => ({ stdin: stdinOf(rows), expect: f(rows) })),
    hints: ['`name, raw = input().split()` then `int(raw)`.',
            'A conditional expression fits inside the f-string.'],
    solution: `n = int(input())\nfor _ in range(n):\n    name, raw = input().split()\n    score = int(raw)\n    verdict = "PASS" if score >= ${pass} else "FAIL"\n    print(f"{name}: {score} ({verdict})")`,
  };
} });

/* ---- 6. simple class ---- */
GEN.add({ id: 'simple_class', topic: 'classes', variants: 76, make(r) {
  const kinds = [
    ['Counter', 'count', ['bump', 'value'], 'a counter that starts at 0, `bump()` adds one, `value()` returns the count'],
    ['Purse', 'money', ['add', 'value'], 'a purse that starts at 0, `add(n)` puts money in, `value()` returns the balance'],
    ['Tally', 'score', ['add', 'value'], 'a tally that starts at 0, `add(n)` adds to it, `value()` returns the total'],
  ];
  const [cls, , methods, desc] = r.pick(kinds);
  const bumpArgs = cls === 'Counter' ? [] : [r.int(1, 20)];
  const nOps = r.int(2, 4);
  const ops = Array.from({ length: nOps }, () => (cls === 'Counter' ? [methods[0]] : [methods[0], r.int(1, 20)]));
  const f = (list) => {
    let v = 0;
    for (const op of list) v += op.length > 1 ? op[1] : 1;
    return v;
  };
  return {
    title: `A ${cls} class`, rating: 1450,
    prompt: `Build a class \`${cls}\`: ${desc}.\n\nThen write \`run(ops)\` which creates one \`${cls}\`, applies every ` +
      `operation in \`ops\` (each is \`["${methods[0]}"${bumpArgs.length ? ', amount' : ''}]\`), and returns \`value()\` at the end.\n\n` +
      example('run', [ops], f(ops)),
    mode: 'func', fn: 'run', starter: `class ${cls}:\n    def __init__(self):\n        `,
    tests: [{ args: [ops], expect: f(ops) }, { args: [[]], expect: 0 },
            { args: [ops.slice(0, 1)], expect: f(ops.slice(0, 1)) }],
    hints: ['`__init__` sets the starting state on `self`.', 'Each method takes `self` as its first parameter.'],
    solution: cls === 'Counter'
      ? `class Counter:\n    def __init__(self):\n        self.n = 0\n\n    def bump(self):\n        self.n += 1\n\n    def value(self):\n        return self.n\n\n\ndef run(ops):\n    c = Counter()\n    for op in ops:\n        c.bump()\n    return c.value()`
      : `class ${cls}:\n    def __init__(self):\n        self.n = 0\n\n    def add(self, amount):\n        self.n += amount\n\n    def value(self):\n        return self.n\n\n\ndef run(ops):\n    obj = ${cls}()\n    for op in ops:\n        obj.add(op[1])\n    return obj.value()`,
  };
} });

/* ---- 7. class with several attributes ---- */
GEN.add({ id: 'record_class', topic: 'classes', variants: 76, make(r) {
  const cls = r.pick(['Book', 'Song', 'Product', 'Player']);
  const fieldB = r.pick(['pages', 'length', 'price', 'score']);
  const factor = r.int(2, 5);
  const f = (name, v) => `${name} (${v * factor})`;
  const rows = [[r.name(), r.int(1, 50)], [r.name(), 0], [r.name(), r.int(50, 200)]];
  return {
    title: `A ${cls} class with a method`, rating: 1520,
    prompt: `Build a class \`${cls}\` taking \`name\` and \`${fieldB}\` in its constructor, storing both, and offering ` +
      `\`label()\` which returns \`"NAME (X)"\` where X is \`${fieldB}\` multiplied by ${factor}.\n\n` +
      `Then write \`run(name, ${fieldB})\` returning \`label()\` for a new instance.\n\n` +
      example('run', rows[0], f(...rows[0])),
    mode: 'func', fn: 'run', starter: `class ${cls}:\n    def __init__(self, name, ${fieldB}):\n        `,
    tests: rows.map((p) => ({ args: p, expect: f(...p) })),
    hints: ['`self.name = name` inside `__init__` keeps the value on the object.',
            `\`f"{self.name} ({self.${fieldB} * ${factor}})"\``],
    solution: `class ${cls}:\n    def __init__(self, name, ${fieldB}):\n        self.name = name\n        self.${fieldB} = ${fieldB}\n\n    def label(self):\n        return f"{self.name} ({self.${fieldB} * ${factor}})"\n\n\ndef run(name, ${fieldB}):\n    return ${cls}(name, ${fieldB}).label()`,
  };
} });

/* ---- 8. try / except ---- */
GEN.add({ id: 'try_except', topic: 'errors', variants: 76, make(r) {
  const bad = r.pick(['bad', 'error', 'none', '?']);
  const kinds = [
    ['to_int', `turn each item into an int, replacing anything that will not convert with \`"${bad}"\``,
      (items) => items.map((x) => (/^-?\d+$/.test(String(x).trim()) ? parseInt(String(x).trim(), 10) : bad)), 1420],
    ['safe_divide', `divide 100 by each item, using \`"${bad}"\` when that is impossible`,
      (items) => items.map((x) => (typeof x === 'number' && x !== 0 ? 100 / x : bad)), 1470],
  ];
  const [fn, desc, f, rating] = r.pick(kinds);
  const data = fn === 'to_int'
    ? [['12', 'x', ' 7 ', '', '-3'], [], ['0']]
    : [[2, 0, 5, 'x'], [], [4]];
  const approx = fn === 'safe_divide';
  return {
    title: cap(fn.replace(/_/g, ' ')) + ' safely', rating,
    prompt: `Write \`${fn}(items)\` returning a list where you ${desc}. Use \`try\` / \`except\` — the function must ` +
      `never raise.\n\n${example(fn, [data[0]], f(data[0]))}`,
    mode: 'func', fn, starter: S(fn, 'items'),
    tests: data.map((a) => ({ args: [a], expect: f(a), cmp: approx ? 'approx' : '' })),
    hints: [fn === 'to_int' ? '`int("x")` raises `ValueError`.' : 'Dividing by 0 raises `ZeroDivisionError`; a string raises `TypeError`.',
            'Catch the specific exceptions, not a bare `except`.'],
    solution: fn === 'to_int'
      ? `def to_int(items):\n    out = []\n    for x in items:\n        try:\n            out.append(int(x))\n        except (ValueError, TypeError):\n            out.append("${bad}")\n    return out`
      : `def safe_divide(items):\n    out = []\n    for x in items:\n        try:\n            out.append(100 / x)\n        except (ZeroDivisionError, TypeError):\n            out.append("${bad}")\n    return out`,
  };
} });

/* ---- 9. raise on bad input ---- */
GEN.add({ id: 'validate_raise', topic: 'errors', variants: 76, make(r) {
  const lo = r.int(0, 10), hi = lo + r.int(10, 90);
  const f = (n) => (n >= lo && n <= hi ? 'ok' : 'rejected');
  const cases = [r.int(lo, hi), hi + r.int(1, 20), lo - r.int(1, 5)];
  return {
    title: `Reject outside ${lo}…${hi}`, rating: 1490,
    prompt: `Write \`check(n)\` which raises \`ValueError\` unless \`n\` is between ${lo} and ${hi} inclusive, and returns ` +
      `\`"ok"\` when it is.\n\nThen write \`guard(n)\` which calls \`check\` and returns \`"rejected"\` instead of letting ` +
      'the error escape.',
    mode: 'func', fn: 'guard', starter: `def check(n):\n    `,
    tests: cases.map((n) => ({ args: [n], expect: f(n) })),
    hints: ['`raise ValueError("out of range")`', '`try: return check(n)` / `except ValueError: return "rejected"`'],
    solution: `def check(n):\n    if n < ${lo} or n > ${hi}:\n        raise ValueError("out of range")\n    return "ok"\n\n\ndef guard(n):\n    try:\n        return check(n)\n    except ValueError:\n        return "rejected"`,
  };
} });

/* ---- 10. generator functions ---- */
GEN.add({ id: 'generator_take', topic: 'generators', variants: 76, make(r) {
  const kinds = [
    ['squares', 'the squares 1, 4, 9, …', (i) => (i + 1) * (i + 1), 'i * i', 1620],
    ['triangles', 'the triangular numbers 1, 3, 6, 10, …', (i) => ((i + 1) * (i + 2)) / 2, 'a running total', 1690],
    ['powers', 'the powers of two 1, 2, 4, 8, …', (i) => Math.pow(2, i), 'double each time', 1600],
    ['evens', 'the positive even numbers 2, 4, 6, …', (i) => (i + 1) * 2, 'step by 2', 1560],
  ];
  const [name, desc, g, hint, rating] = r.pick(kinds);
  const f = (n) => Array.from({ length: n }, (_, i) => g(i));
  const cases = [r.int(4, 8), 0, 1];
  return {
    title: `Generate ${name}`, rating,
    prompt: `Write a **generator function** \`${name}()\` that yields ${desc} forever, then \`take(n)\` returning the ` +
      `first \`n\` of them as a list.\n\n${example('take', [5], f(5))}`,
    mode: 'func', fn: 'take', starter: `def ${name}():\n    `,
    tests: cases.map((n) => ({ args: [n], expect: f(n) })),
    hints: ['A generator uses `yield` inside `while True:`.',
            '`itertools.islice(gen(), n)` takes the first `n` values without looping forever.', `Each value: ${hint}.`],
    solution: `from itertools import islice\n\n\ndef ${name}():\n    i = 1\n    ${name === 'triangles' ? 'total = 0\n    while True:\n        total += i\n        yield total\n        i += 1'
      : name === 'powers' ? 'value = 1\n    while True:\n        yield value\n        value *= 2'
      : name === 'evens' ? 'while True:\n        yield i * 2\n        i += 1'
      : 'while True:\n        yield i * i\n        i += 1'}\n\n\ndef take(n):\n    return list(islice(${name}(), n))`,
  };
} });

/* ---- 11. lambda / key functions ---- */
GEN.add({ id: 'sort_key', topic: 'functions', variants: 76, make(r) {
  const kinds = [
    ['by_second', 'sorted by the second value in each pair, ascending',
      (rows) => rows.slice().sort((a, b) => a[1] - b[1]), 'key=lambda row: row[1]', 1230],
    ['by_second_desc', 'sorted by the second value in each pair, descending',
      (rows) => rows.slice().sort((a, b) => b[1] - a[1]), 'key=lambda row: -row[1]', 1250],
    ['by_last_letter', 'sorted by the last letter of the first value',
      (rows) => rows.slice().sort((a, b) => (a[0].slice(-1) < b[0].slice(-1) ? -1 : a[0].slice(-1) > b[0].slice(-1) ? 1 : 0)),
      'key=lambda row: row[0][-1]', 1330],
    ['by_length_then_name', 'sorted by the length of the first value, then alphabetically',
      (rows) => rows.slice().sort((a, b) => a[0].length - b[0].length || (a[0] < b[0] ? -1 : 1)),
      'key=lambda row: (len(row[0]), row[0])', 1450],
  ];
  const [fn, desc, f, hint, rating] = r.pick(kinds);
  const mk = (n) => r.names(n).map((nm) => [nm, r.int(1, 60)]);
  const data = [mk(r.int(3, 5)), mk(1), []];
  return {
    title: cap(fn.replace(/_/g, ' ')), rating,
    prompt: `Rows are \`[name, number]\` pairs. Write \`${fn}(rows)\` returning a new list ${desc}. ` +
      'Python\'s sort is stable, so equal items keep their order.\n\n' + example(fn, [data[0]], f(data[0])),
    mode: 'func', fn, starter: S(fn, 'rows'),
    tests: data.map((a) => ({ args: [a], expect: f(a) })),
    hints: [`\`sorted(rows, ${hint})\``, 'A tuple key sorts on several fields at once.'],
    solution: `def ${fn}(rows):\n    return sorted(rows, ${hint})`,
  };
} });

/* ---- 12. *args and defaults ---- */
GEN.add({ id: 'flexible_args', topic: 'functions', variants: 76, make(r) {
  const kinds = [
    ['total_all', 'sums every number it is given, returning `0` when given none', (a) => sum(a), 1250],
    ['biggest_all', 'returns the largest number it is given, or `None` when given none',
      (a) => (a.length ? Math.max(...a) : null), 1290],
    ['average_all', 'returns the mean of the numbers it is given, or `0` when given none',
      (a) => (a.length ? sum(a) / a.length : 0), 1330],
  ];
  const [fn, desc, f, rating] = r.pick(kinds);
  const a = r.ints(4, 1, 40), b = r.ints(1, 1, 40);
  const approx = fn === 'average_all';
  return {
    title: cap(fn.replace(/_/g, ' ')) + ' with *args', rating,
    prompt: `Write \`${fn}(*nums)\` which ${desc}.\n\nThen write \`run(values)\` which unpacks the list \`values\` into ` +
      `\`${fn}\` and returns the result — use \`*values\`, not a loop.\n\n${example('run', [a], f(a))}`,
    mode: 'func', fn: 'run', starter: `def ${fn}(*nums):\n    `,
    tests: [a, b, []].map((x) => ({ args: [x], expect: f(x), cmp: approx ? 'approx' : '' })),
    hints: ['`*nums` collects every positional argument into a tuple.',
            '`' + fn + '(*values)` spreads a list back out into arguments.'],
    solution: {
      total_all: 'def total_all(*nums):\n    return sum(nums)\n\n\ndef run(values):\n    return total_all(*values)',
      biggest_all: 'def biggest_all(*nums):\n    return max(nums) if nums else None\n\n\ndef run(values):\n    return biggest_all(*values)',
      average_all: 'def average_all(*nums):\n    return sum(nums) / len(nums) if nums else 0\n\n\ndef run(values):\n    return average_all(*values)',
    }[fn],
  };
} });

/* ---- 13. closures ---- */
GEN.add({ id: 'closure', topic: 'functions', variants: 76, make(r) {
  const step = r.int(1, 10);
  const f = (n) => Array.from({ length: n }, (_, i) => (i + 1) * step);
  const cases = [r.int(3, 6), 0, 1];
  return {
    title: `A counter closure (+${step})`, rating: 1580,
    prompt: `Write \`make_counter()\` returning a function that, each time it is called, returns the running total ` +
      `after adding ${step} — so the first call gives ${step}, the second ${2 * step}, and so on.\n\n` +
      `Then write \`run(n)\` which makes one counter, calls it \`n\` times, and returns the list of results.\n\n` +
      example('run', [3], f(3)),
    mode: 'func', fn: 'run', starter: 'def make_counter():\n    ',
    tests: cases.map((n) => ({ args: [n], expect: f(n) })),
    hints: ['Define an inner function and return it — it can see the outer variables.',
            '`nonlocal total` lets the inner function change the outer one.'],
    solution: `def make_counter():\n    total = 0\n\n    def bump():\n        nonlocal total\n        total += ${step}\n        return total\n\n    return bump\n\n\ndef run(n):\n    counter = make_counter()\n    return [counter() for _ in range(n)]`,
  };
} });

/* ---- 14. decorator ---- */
GEN.add({ id: 'decorator_gen', topic: 'functions', variants: 76, make(r) {
  const kinds = [
    ['doubled', 'doubles whatever the wrapped function returns', (v) => v * 2, 1620],
    ['squared', 'squares whatever the wrapped function returns', (v) => v * v, 1620],
    ['stringified', 'turns whatever the wrapped function returns into a string', (v) => String(v), 1600],
  ];
  const [name, desc, g, rating] = r.pick(kinds);
  const k = r.int(2, 9);
  const f = (n) => g(n + k);
  const cases = [r.int(1, 20), 0, r.int(20, 50)];
  return {
    title: `A @${name} decorator`, rating,
    prompt: `Write a decorator \`${name}\` that ${desc}.\n\nThen write \`run(n)\` which applies it to a function ` +
      `adding ${k} to its argument, and returns the decorated result for \`n\`.\n\n${example('run', [cases[0]], f(cases[0]))}`,
    mode: 'func', fn: 'run', starter: `def ${name}(fn):\n    `,
    tests: cases.map((n) => ({ args: [n], expect: f(n) })),
    hints: ['A decorator takes a function and returns a replacement function.',
            'The inner `wrapper(*args, **kwargs)` calls the original and changes the result.'],
    solution: `import functools\n\n\ndef ${name}(fn):\n    @functools.wraps(fn)\n    def wrapper(*args, **kwargs):\n        return ${name === 'doubled' ? 'fn(*args, **kwargs) * 2' : name === 'squared' ? 'fn(*args, **kwargs) ** 2' : 'str(fn(*args, **kwargs))'}\n    return wrapper\n\n\ndef run(n):\n    @${name}\n    def add_${k}(x):\n        return x + ${k}\n\n    return add_${k}(n)`,
  };
} });

/* ---- 15. comprehension drills ---- */
GEN.add({ id: 'comprehension_drill', topic: 'comprehensions', variants: 76, make(r) {
  const k = r.int(2, 9);
  const kinds = [
    ['squares_of_odds', 'the squares of the odd values, in order',
      (a) => a.filter((n) => Math.abs(n % 2) === 1).map((n) => n * n), '[n * n for n in nums if n % 2]', 1090],
    [`over_${k}_doubled`, `every value above ${k}, doubled`,
      (a) => a.filter((n) => n > k).map((n) => n * 2), `[n * 2 for n in nums if n > ${k}]`, 1050],
    ['lengths', 'the length of each string',
      (a) => a.map((s) => String(s).length), '[len(s) for s in items]', 950],
    ['pairs_grid', 'every `[a, b]` pair with `a` from the list and `b` from `[0, 1]`',
      (a) => [].concat(...a.map((n) => [[n, 0], [n, 1]])), 'two `for` clauses in one comprehension', 1330],
  ];
  const [fn, desc, f, hint, rating] = r.pick(kinds);
  const strings = fn === 'lengths';
  const data = strings ? [r.words(4), [r.word()], []] : [r.ints(6, 1, 20), r.ints(2, 1, 5), []];
  const arg = strings ? 'items' : 'nums';
  return {
    title: cap(fn.replace(/_/g, ' ')), rating,
    prompt: `Write \`${fn}(${arg})\` returning ${desc}, using a **single list comprehension**.\n\n${example(fn, [data[0]], f(data[0]))}`,
    mode: 'func', fn, starter: `def ${fn}(${arg}):\n    return `,
    tests: data.map((a) => ({ args: [a], expect: f(a) })),
    hints: [`\`${hint}\``],
    solution: `def ${fn}(${arg}):\n    return ` + ({
      squares_of_odds: '[n * n for n in nums if n % 2]',
      lengths: '[len(s) for s in items]',
      pairs_grid: '[[a, b] for a in nums for b in [0, 1]]',
    }[fn] || `[n * 2 for n in nums if n > ${k}]`),
  };
} });

/* ---- 16. robot / position simulation ---- */
GEN.add({ id: 'walk_sim', topic: 'loops', variants: 76, make(r) {
  const startX = r.int(-5, 5), startY = r.int(-5, 5);
  const step = r.int(1, 3);
  const f = (moves) => {
    let x = startX, y = startY;
    for (const m of moves) {
      if (m === 'U') y += step;
      else if (m === 'D') y -= step;
      else if (m === 'L') x -= step;
      else if (m === 'R') x += step;
    }
    return [x, y];
  };
  const mk = (n) => Array.from({ length: n }, () => r.pick(['U', 'D', 'L', 'R'])).join('');
  const data = [mk(r.int(4, 8)), 'UUDD', '', mk(3)];
  return {
    title: `Walk from (${startX}, ${startY})`, rating: 1350,
    prompt: `A walker starts at \`[${startX}, ${startY}]\`. Each letter of \`moves\` shifts it ${step} in a direction: ` +
      '`U` up, `D` down, `L` left, `R` right. Write `walk(moves)` returning the final `[x, y]`.\n\n' +
      example('walk', [data[0]], f(data[0])),
    mode: 'func', fn: 'walk', starter: S('walk', 'moves'),
    tests: data.map((m) => ({ args: [m], expect: f(m) })),
    hints: ['Track `x` and `y`, then loop the characters.',
            'A dict from letter to `(dx, dy)` avoids a chain of `if`s.'],
    solution: `def walk(moves):\n    x, y = ${startX}, ${startY}\n    deltas = {"U": (0, ${step}), "D": (0, ${-step}), "L": (${-step}, 0), "R": (${step}, 0)}\n    for m in moves:\n        dx, dy = deltas[m]\n        x += dx\n        y += dy\n    return [x, y]`,
  };
} });

/* ---- 17. bank account simulation ---- */
GEN.add({ id: 'balance_sim', topic: 'loops', variants: 76, make(r) {
  const start = r.int(50, 500);
  const allowNegative = r.bool(0.4);
  const f = (moves) => {
    let bal = start;
    for (const m of moves) {
      if (!allowNegative && bal + m < 0) continue;
      bal += m;
    }
    return bal;
  };
  const mk = (n) => Array.from({ length: n }, () => r.int(-300, 300));
  const data = [mk(r.int(4, 7)), [], mk(3)];
  return {
    title: `Balance from ${start}${allowNegative ? '' : ' (no overdraft)'}`, rating: allowNegative ? 1180 : 1400,
    prompt: `An account starts at ${start}. Write \`balance(moves)\` applying each amount in turn ` +
      (allowNegative ? '' : '— but skipping any that would take the balance below zero ') +
      'and returning the final balance.\n\n' + example('balance', [data[0]], f(data[0])),
    mode: 'func', fn: 'balance', starter: S('balance', 'moves'),
    tests: data.map((m) => ({ args: [m], expect: f(m) })),
    hints: [allowNegative ? '`sum(moves)` plus the starting amount.' : 'Check the result of each move before you commit to it.'],
    solution: allowNegative
      ? `def balance(moves):\n    return ${start} + sum(moves)`
      : `def balance(moves):\n    total = ${start}\n    for m in moves:\n        if total + m >= 0:\n            total += m\n    return total`,
  };
} });

/* ---- 18. queue / stack of operations ---- */
GEN.add({ id: 'stack_ops', topic: 'classes', variants: 76, make(r) {
  const queue = r.bool(0.45);
  const f = (ops) => {
    const items = [];
    const out = [];
    for (const op of ops) {
      if (op[0] === 'push') items.push(op[1]);
      else if (op[0] === 'pop') out.push(items.length ? (queue ? items.shift() : items.pop()) : null);
      else if (op[0] === 'peek') out.push(items.length ? (queue ? items[0] : items[items.length - 1]) : null);
      else out.push(items.length);
    }
    return out;
  };
  const ops = [['push', r.int(1, 9)], ['push', r.int(1, 9)], ['pop'], ['size'], ['peek']];
  return {
    title: queue ? 'A queue' : 'A stack', rating: 1490,
    prompt: `Build a ${queue ? 'queue (first in, first out)' : 'stack (last in, first out)'} with \`push(x)\`, ` +
      `\`pop()\`, \`peek()\` and \`size()\`. \`pop\` and \`peek\` return \`None\` when it is empty.\n\n` +
      'Then write `run(ops)` applying each operation and returning the results of every `pop`, `peek` and `size`, in order.\n\n' +
      example('run', [ops], f(ops)),
    mode: 'func', fn: 'run', starter: 'class Store:\n    def __init__(self):\n        self.items = []\n\n\ndef run(ops):\n    ',
    tests: [{ args: [ops], expect: f(ops) }, { args: [[['pop']]], expect: [null] },
            { args: [[]], expect: [] }],
    hints: [queue ? '`collections.deque` pops from the left cheaply — a list works too.' : 'A list is already a stack: `append` and `pop`.',
            'Only `push` produces no output.'],
    solution: `class Store:\n    def __init__(self):\n        self.items = []\n\n    def push(self, x):\n        self.items.append(x)\n\n    def pop(self):\n        if not self.items:\n            return None\n        return self.items.pop(${queue ? '0' : ''})\n\n    def peek(self):\n        if not self.items:\n            return None\n        return self.items[${queue ? '0' : '-1'}]\n\n    def size(self):\n        return len(self.items)\n\n\ndef run(ops):\n    store = Store()\n    out = []\n    for op in ops:\n        if op[0] == "push":\n            store.push(op[1])\n        else:\n            out.append(getattr(store, op[0])())\n    return out`,
  };
} });

/* ---- 19. any / all checks ---- */
GEN.add({ id: 'any_all', topic: 'functions', variants: 76, make(r) {
  const k = r.int(3, 20);
  const kinds = [
    ['all_positive', 'every value is above zero', (a) => a.every((n) => n > 0), 'all(n > 0 for n in nums)', 1010],
    [`any_over_${k}`, `at least one value is above ${k}`, (a) => a.some((n) => n > k), `any(n > ${k} for n in nums)`, 1010],
    ['all_same', 'every value is the same', (a) => a.every((n) => n === a[0]), 'all(n == nums[0] for n in nums)', 1130],
    ['none_negative', 'no value is below zero', (a) => !a.some((n) => n < 0), 'not any(n < 0 for n in nums)', 1090],
  ];
  const [fn, desc, f, hint, rating] = r.pick(kinds);
  const data = [r.ints(5, 1, 30), r.ints(4, -20, -1), Array(3).fill(r.int(1, 9)), []];
  return {
    title: cap(fn.replace(/_/g, ' ')), rating,
    prompt: `Write \`${fn}(nums)\` returning \`True\` when ${desc}. An empty list gives \`True\`.`,
    mode: 'func', fn, starter: S(fn, 'nums'),
    tests: data.map((a) => ({ args: [a], expect: f(a) })),
    hints: ['`all(...)` and `any(...)` take a generator expression.', `\`${hint}\``],
    solution: `def ${fn}(nums):\n    return ${hint}`,
  };
} });

/* ---- 20. enumerate with an offset ---- */
GEN.add({ id: 'numbered', topic: 'strings', variants: 76, make(r) {
  const start = r.int(1, 5);
  const sep = r.pick(['. ', ') ', ' - ', ': ']);
  const f = (items) => items.map((s, i) => `${i + start}${sep}${s}`);
  const data = [r.words(r.int(3, 5)), [r.word()], []];
  return {
    title: `Number a list from ${start}`, rating: 1120,
    prompt: `Write \`numbered(items)\` returning each item prefixed with its position, starting at ${start}, ` +
      `formatted as \`"1${sep}item"\`.\n\n${example('numbered', [data[0]], f(data[0]))}`,
    mode: 'func', fn: 'numbered', starter: S('numbered', 'items'),
    tests: data.map((a) => ({ args: [a], expect: f(a) })),
    hints: [`\`enumerate(items, ${start})\` starts the count where you want it.`],
    solution: `def numbered(items):\n    return [f"{i}${sep}{item}" for i, item in enumerate(items, ${start})]`,
  };
} });

/* ---- 21. recursion over nested structures ---- */
GEN.add({ id: 'nested_sum', topic: 'recursion', variants: 76, make(r) {
  const kinds = [
    ['deep_sum', 'the sum of every number, however deeply nested',
      (x) => x.reduce((t, v) => t + (Array.isArray(v) ? kindsSum(v) : v), 0), 1520],
    ['deep_count', 'how many numbers there are in total, however deeply nested',
      (x) => x.reduce((t, v) => t + (Array.isArray(v) ? kindsCount(v) : 1), 0), 1480],
    ['deep_max', 'the largest number, or `None` when there are none',
      null, 1620],
  ];
  function kindsSum(x) { return x.reduce((t, v) => t + (Array.isArray(v) ? kindsSum(v) : v), 0); }
  function kindsCount(x) { return x.reduce((t, v) => t + (Array.isArray(v) ? kindsCount(v) : 1), 0); }
  function kindsMax(x) {
    let best = null;
    for (const v of x) {
      const c = Array.isArray(v) ? kindsMax(v) : v;
      if (c !== null && (best === null || c > best)) best = c;
    }
    return best;
  }
  const [fn, desc, , rating] = r.pick(kinds);
  const f = fn === 'deep_sum' ? kindsSum : fn === 'deep_count' ? kindsCount : kindsMax;
  const nested = [r.int(1, 9), [r.int(1, 9), [r.int(1, 9)]], [[r.int(1, 9), r.int(1, 9)]]];
  const data = [nested, [], [[[]]], [r.int(1, 20)]];
  return {
    title: cap(fn.replace(/_/g, ' ')), rating,
    prompt: `Write \`${fn}(items)\` returning ${desc}. Lists can be nested to any depth.\n\n${example(fn, [nested], f(nested))}`,
    mode: 'func', fn, starter: S(fn, 'items'),
    tests: data.map((a) => ({ args: [a], expect: f(a) })),
    hints: ['`isinstance(item, list)` tells you when to recurse.',
            'Handle the empty list — it is the case that stops the recursion.'],
    solution: {
      deep_sum: 'def deep_sum(items):\n    total = 0\n    for item in items:\n        total += deep_sum(item) if isinstance(item, list) else item\n    return total',
      deep_count: 'def deep_count(items):\n    total = 0\n    for item in items:\n        total += deep_count(item) if isinstance(item, list) else 1\n    return total',
      deep_max: 'def deep_max(items):\n    best = None\n    for item in items:\n        value = deep_max(item) if isinstance(item, list) else item\n        if value is not None and (best is None or value > best):\n            best = value\n    return best',
    }[fn],
  };
} });

/* ---- 22. string formatting to a table ---- */
GEN.add({ id: 'table_program', topic: 'strings', variants: 76, make(r) {
  const w1 = r.int(6, 10), w2 = r.int(4, 8);
  const f = (rows) => rows.map(([n, v]) => n.padEnd(w1) + String(v).padStart(w2)).join('\n');
  const mk = (n) => r.names(n).map((nm) => [nm, r.int(1, 999)]);
  const a = mk(3), b = mk(1);
  const stdinOf = (rows) => [String(rows.length), ...rows.map(([n, v]) => `${n} ${v}`)];
  return {
    title: `Aligned table (${w1}/${w2})`, rating: 1440, mode: 'stdout',
    prompt: `Read an integer \`n\`, then \`n\` lines of \`name value\`. Print each row with the name left-aligned in ` +
      `${w1} characters and the value right-aligned in ${w2}, with no gap between the two fields.`,
    starter: 'n = int(input())\n',
    tests: [a, b].map((rows) => ({ stdin: stdinOf(rows), expect: f(rows) })),
    hints: [`\`f"{name:<${w1}}{value:>${w2}}"\` does both alignments.`,
            '`.ljust()` and `.rjust()` are the method version.'],
    solution: `n = int(input())\nfor _ in range(n):\n    name, value = input().split()\n    print(f"{name:<${w1}}{value:>${w2}}")`,
  };
} });
})();
