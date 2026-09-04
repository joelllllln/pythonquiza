/* Generated questions: numbers, arithmetic and maths. */

(function () {
const { GEN, py, call, example, pyDiv, pyMod, sum } = window;
const S = (fn, args) => `def ${fn}(${args}):\n    `;

/* ---- 1. two-number arithmetic ---- */
GEN.add({ id: 'arith2', topic: 'basics', variants: 76, make(r) {
  const ops = [
    ['add', 'sum', (a, b) => a + b, 'a + b', 720],
    ['difference', 'difference `a - b`', (a, b) => a - b, 'a - b', 720],
    ['product', 'product', (a, b) => a * b, 'a * b', 730],
    ['whole_divide', 'result of `a // b` (whole division, rounded down)', (a, b) => pyDiv(a, b), 'a // b', 780],
    ['remainder', 'remainder `a % b`', (a, b) => pyMod(a, b), 'a % b', 780],
    ['power', 'value of `a` to the power of `b`', (a, b) => Math.pow(a, b), 'a ** b', 760],
  ];
  const [fn, desc, f, expr, rating] = r.pick(ops);
  const small = fn === 'power';
  const mk = () => small ? [r.int(2, 9), r.int(2, 4)] : [r.int(2, 60), r.int(2, 15)];
  const t1 = mk(), t2 = mk(), t3 = [small ? r.int(1, 5) : r.int(60, 200), small ? 2 : r.int(3, 9)];
  return {
    title: `Two numbers: ${fn.replace('_', ' ')}`, rating,
    prompt: `Write \`${fn}(a, b)\` returning the ${desc}.\n\n${example(fn, t1, f(...t1))}`,
    mode: 'func', fn, starter: S(fn, 'a, b'),
    tests: [t1, t2, t3].map((a) => ({ args: a, expect: f(...a) })),
    hints: [`The expression you need is \`${expr}\`.`],
    solution: `def ${fn}(a, b):\n    return ${expr}`,
  };
} });

/* ---- 2. divisibility ---- */
GEN.add({ id: 'divisible', topic: 'basics', variants: 76, make(r) {
  const k = r.int(2, 12);
  const f = (n) => pyMod(n, k) === 0;
  const cases = [k * r.int(2, 9), k * r.int(2, 9) + r.int(1, k - 1), 0, r.int(50, 99)];
  return {
    title: `Divisible by ${k}?`, rating: 740 + k * 2,
    prompt: `Write \`divisible(n)\` returning \`True\` when \`n\` divides exactly by ${k}.`,
    mode: 'func', fn: 'divisible', starter: S('divisible', 'n'),
    tests: cases.map((n) => ({ args: [n], expect: f(n) })),
    hints: ['The remainder operator is `%`.', `\`n % ${k} == 0\``],
    solution: `def divisible(n):\n    return n % ${k} == 0`,
  };
} });

/* ---- 3. percentage of a value ---- */
GEN.add({ id: 'percent_of', topic: 'math', variants: 76, make(r) {
  const p = r.pick([5, 10, 12, 15, 20, 25, 30, 40, 50, 60, 75, 80]);
  const f = (v) => (v * p) / 100;
  const cases = [r.int(20, 400), r.int(400, 2000), 0];
  return {
    title: `${p}% of a number`, rating: 800,
    prompt: `Write \`part(value)\` returning ${p}% of \`value\` as a float.\n\n${example('part', [cases[0]], f(cases[0]))}`,
    mode: 'func', fn: 'part', starter: S('part', 'value'),
    tests: cases.map((v) => ({ args: [v], expect: f(v), cmp: 'approx' })),
    hints: [`Multiply by ${p} and divide by 100.`],
    solution: `def part(value):\n    return value * ${p} / 100`,
  };
} });

/* ---- 4. percentage change ---- */
GEN.add({ id: 'pct_change', topic: 'math', variants: 76, make(r) {
  const f = (a, b) => ((b - a) / a) * 100;
  const cases = [[r.int(20, 200), r.int(20, 400)], [100, r.int(101, 300)], [r.int(40, 80), r.int(10, 39)]];
  return {
    title: 'Percentage change', rating: 950,
    prompt: 'Write `change(old, new)` returning the percentage change from `old` to `new`. ' +
      'A rise gives a positive number, a fall a negative one.\n\n' +
      example('change', [200, 250], 25.0),
    mode: 'func', fn: 'change', starter: S('change', 'old, new'),
    tests: cases.map((a) => ({ args: a, expect: f(...a), cmp: 'approx' })),
    hints: ['`(new - old) / old`, then multiply by 100.'],
    solution: 'def change(old, new):\n    return (new - old) / old * 100',
  };
} });

/* ---- 5. simple / compound interest ---- */
GEN.add({ id: 'interest', topic: 'math', variants: 76, make(r) {
  const rate = r.int(2, 12), yrs = r.int(2, 12);
  const compound = r.bool();
  const f = compound
    ? (p) => p * Math.pow(1 + rate / 100, yrs)
    : (p) => p * (rate / 100) * yrs;
  const cases = [r.int(100, 5000), 1000, r.int(5000, 20000)];
  return {
    title: compound ? `Compound growth at ${rate}%` : `Simple interest at ${rate}%`, rating: compound ? 1060 : 900,
    prompt: compound
      ? `Write \`grow(principal)\` returning the value after ${yrs} years of ${rate}% growth compounded once a year.`
      : `Write \`interest(principal)\` returning the simple interest earned over ${yrs} years at ${rate}% a year (interest only, not the total).`,
    mode: 'func', fn: compound ? 'grow' : 'interest', starter: S(compound ? 'grow' : 'interest', 'principal'),
    tests: cases.map((p) => ({ args: [p], expect: f(p), cmp: 'approx' })),
    hints: compound ? [`Multiply by \`(1 + ${rate} / 100)\` once per year — \`**\` does that in one step.`]
                    : ['principal × rate × years, with the rate as a fraction.'],
    solution: compound
      ? `def grow(principal):\n    return principal * (1 + ${rate} / 100) ** ${yrs}`
      : `def interest(principal):\n    return principal * ${rate} / 100 * ${yrs}`,
  };
} });

/* ---- 6. temperature / unit conversion ---- */
GEN.add({ id: 'convert_unit', topic: 'math', variants: 76, make(r) {
  const kinds = [
    ['c_to_f', 'Celsius to Fahrenheit', (c) => c * 9 / 5 + 32, 'c * 9 / 5 + 32', 'temp'],
    ['f_to_c', 'Fahrenheit to Celsius', (f) => (f - 32) * 5 / 9, '(t - 32) * 5 / 9', 'temp'],
    ['km_to_miles', 'kilometres to miles', (k) => k * 0.621371, 'km * 0.621371', 'km'],
    ['kg_to_pounds', 'kilograms to pounds', (k) => k * 2.20462, 'kg * 2.20462', 'kg'],
    ['hours_to_minutes', 'hours to minutes', (h) => h * 60, 'hours * 60', 'hours'],
    ['bytes_to_kib', 'bytes to kibibytes', (b) => b / 1024, 'n / 1024', 'n'],
  ];
  const [fn, desc, f, expr, arg] = r.pick(kinds);
  const cases = [r.int(1, 100), 0, r.int(100, 900)];
  return {
    title: desc.charAt(0).toUpperCase() + desc.slice(1), rating: 790,
    prompt: `Write \`${fn}(${arg})\` converting ${desc}. Return a float.`,
    mode: 'func', fn, starter: S(fn, arg),
    tests: cases.map((v) => ({ args: [v], expect: f(v), cmp: 'approx' })),
    hints: [`\`${expr.replace(/\b(c|t|km|kg|hours|n)\b/, arg)}\``],
    solution: `def ${fn}(${arg}):\n    return ${expr.replace(/\b(c|t|km|kg|hours|n)\b/g, arg)}`,
  };
} });

/* ---- 7. area / perimeter ---- */
GEN.add({ id: 'geometry', topic: 'math', variants: 76, make(r) {
  const shapes = [
    ['rect_area', 'w, h', 'the area of a rectangle', (w, h) => w * h, 'w * h', 750],
    ['rect_perimeter', 'w, h', 'the perimeter of a rectangle', (w, h) => 2 * (w + h), '2 * (w + h)', 780],
    ['triangle_area', 'base, height', 'the area of a triangle', (b, h) => (b * h) / 2, 'base * height / 2', 800],
    ['trapezoid_area', 'a, b, h', 'the area of a trapezium with parallel sides `a` and `b`',
      (a, b, h) => ((a + b) / 2) * h, '(a + b) / 2 * h', 900],
    ['box_volume', 'w, h, d', 'the volume of a box', (w, h, d) => w * h * d, 'w * h * d', 800],
  ];
  const [fn, params, desc, f, expr, rating] = r.pick(shapes);
  const n = params.split(',').length;
  const mk = () => Array.from({ length: n }, () => r.int(1, 30));
  const cases = [mk(), mk(), mk()];
  return {
    title: desc.replace('the ', '').replace(' with parallel sides `a` and `b`', ''), rating,
    prompt: `Write \`${fn}(${params})\` returning ${desc}.`,
    mode: 'func', fn, starter: S(fn, params),
    tests: cases.map((a) => ({ args: a, expect: f(...a), cmp: 'approx' })),
    hints: [`\`${expr}\``],
    solution: `def ${fn}(${params}):\n    return ${expr}`,
  };
} });

/* ---- 8. circle maths ---- */
GEN.add({ id: 'circle', topic: 'math', variants: 76, make(r) {
  const which = r.pick([
    ['area', 'the area of a circle', (x) => Math.PI * x * x, 'math.pi * radius ** 2'],
    ['circumference', 'the circumference of a circle', (x) => 2 * Math.PI * x, '2 * math.pi * radius'],
  ]);
  const [fn, desc, f, expr] = which;
  const cases = [r.int(1, 20), 1, r.int(20, 60)];
  return {
    title: desc.replace('the ', ''), rating: 870,
    prompt: `Write \`${fn}(radius)\` returning ${desc}. Use \`math.pi\`.`,
    mode: 'func', fn, starter: `import math\n\n\ndef ${fn}(radius):\n    `,
    tests: cases.map((v) => ({ args: [v], expect: f(v), cmp: 'approx' })),
    hints: ['`import math` first, then use `math.pi`.'],
    solution: `import math\n\n\ndef ${fn}(radius):\n    return ${expr}`,
  };
} });

/* ---- 9. rounding and clamping ---- */
GEN.add({ id: 'round_clamp', topic: 'math', variants: 76, make(r) {
  const kind = r.pick(['nearest', 'clamp', 'floor_to', 'sign']);
  if (kind === 'sign') {
    const f = (n) => (n > 0 ? 1 : n < 0 ? -1 : 0);
    const cases = [r.int(1, 50), -r.int(1, 50), 0];
    return {
      title: 'Sign of a number', rating: 800,
      prompt: 'Write `sign(n)` returning `1` for positives, `-1` for negatives and `0` for zero.',
      mode: 'func', fn: 'sign', starter: S('sign', 'n'),
      tests: cases.map((n) => ({ args: [n], expect: f(n) })),
      hints: ['Two comparisons and a fallback.'],
      solution: 'def sign(n):\n    if n > 0:\n        return 1\n    if n < 0:\n        return -1\n    return 0',
    };
  }
  if (kind === 'clamp') {
    const lo = r.int(0, 20), hi = lo + r.int(10, 60);
    const f = (n) => Math.min(hi, Math.max(lo, n));
    const cases = [lo - r.int(1, 20), hi + r.int(1, 20), r.int(lo, hi)];
    return {
      title: `Clamp to ${lo}…${hi}`, rating: 880,
      prompt: `Write \`clamp(n)\` returning \`n\` pushed into the range ${lo} to ${hi} inclusive — anything lower becomes ${lo}, anything higher becomes ${hi}.`,
      mode: 'func', fn: 'clamp', starter: S('clamp', 'n'),
      tests: cases.map((n) => ({ args: [n], expect: f(n) })),
      hints: [`\`min(${hi}, max(${lo}, n))\``],
      solution: `def clamp(n):\n    return min(${hi}, max(${lo}, n))`,
    };
  }
  const k = r.pick([5, 10, 20, 25, 50, 100]);
  const down = kind === 'floor_to';
  const f = down ? (n) => Math.floor(n / k) * k : (n) => Math.round(n / k) * k;
  const cases = [k * r.int(1, 9) + r.int(1, k - 1), k * r.int(1, 9), r.int(1, k - 1)];
  return {
    title: down ? `Round down to ${k}` : `Round to nearest ${k}`, rating: down ? 900 : 940,
    prompt: down
      ? `Write \`snap(n)\` rounding a non-negative \`n\` **down** to the nearest multiple of ${k}.`
      : `Write \`snap(n)\` rounding a non-negative \`n\` to the nearest multiple of ${k}. Halfway values round up.`,
    mode: 'func', fn: 'snap', starter: S('snap', 'n'),
    tests: cases.map((n) => ({ args: [n], expect: f(n) })),
    hints: down ? [`\`n // ${k} * ${k}\``] : [`\`(n + ${k / 2}) // ${k} * ${k}\` avoids Python's banker's rounding.`],
    solution: down ? `def snap(n):\n    return n // ${k} * ${k}`
                   : `def snap(n):\n    return int((n + ${k / 2}) // ${k} * ${k})`,
  };
} });

/* ---- 10. digits of a number ---- */
GEN.add({ id: 'digits', topic: 'math', variants: 76, make(r) {
  const kinds = [
    ['digit_count', 'how many digits `n` has', (n) => String(n).length, 'len(str(n))', 850],
    ['digit_sum', 'the sum of the digits of `n`', (n) => sum(String(n).split('').map(Number)),
      'sum(int(c) for c in str(n))', 1000],
    ['digit_product', 'the product of the digits of `n`',
      (n) => String(n).split('').map(Number).reduce((a, b) => a * b, 1),
      'a loop multiplying each digit', 1080],
    ['reverse_digits', 'the digits of `n` in reverse, as an integer',
      (n) => Number(String(n).split('').reverse().join('')), 'int(str(n)[::-1])', 1040],
    ['largest_digit', 'the largest digit in `n`', (n) => Math.max(...String(n).split('').map(Number)),
      'max(int(c) for c in str(n))', 1010],
  ];
  const [fn, desc, f, hint, rating] = r.pick(kinds);
  const cases = [r.int(100, 9999), r.int(10, 99), r.int(100000, 999999)];
  const sols = {
    digit_count: 'def digit_count(n):\n    return len(str(n))',
    digit_sum: 'def digit_sum(n):\n    return sum(int(c) for c in str(n))',
    digit_product: 'def digit_product(n):\n    out = 1\n    for c in str(n):\n        out *= int(c)\n    return out',
    reverse_digits: 'def reverse_digits(n):\n    return int(str(n)[::-1])',
    largest_digit: 'def largest_digit(n):\n    return max(int(c) for c in str(n))',
  };
  return {
    title: fn.replace('_', ' ').replace(/^./, (c) => c.toUpperCase()), rating,
    prompt: `Write \`${fn}(n)\` returning ${desc}. \`n\` is a positive integer.\n\n${example(fn, [cases[0]], f(cases[0]))}`,
    mode: 'func', fn, starter: S(fn, 'n'),
    tests: cases.map((n) => ({ args: [n], expect: f(n) })),
    hints: ['`str(n)` turns the number into its digits.', `\`${hint}\``],
    solution: sols[fn],
  };
} });

/* ---- 11. sum of multiples ---- */
GEN.add({ id: 'multiples_sum', topic: 'loops', variants: 76, make(r) {
  const k = r.int(2, 15);
  const f = (n) => { let t = 0; for (let i = k; i < n; i += k) t += i; return t; };
  const cases = [r.int(20, 100), k, r.int(100, 500)];
  return {
    title: `Sum the multiples of ${k}`, rating: 990,
    prompt: `Write \`total(n)\` summing every multiple of ${k} that is **strictly below** \`n\`.\n\n${example('total', [cases[0]], f(cases[0]))}`,
    mode: 'func', fn: 'total', starter: S('total', 'n'),
    tests: cases.map((n) => ({ args: [n], expect: f(n) })),
    hints: [`\`range(${k}, n, ${k})\` walks exactly those numbers.`],
    solution: `def total(n):\n    return sum(range(${k}, n, ${k}))`,
  };
} });

/* ---- 12. arithmetic / geometric sequences ---- */
GEN.add({ id: 'sequence_term', topic: 'math', variants: 76, make(r) {
  const geo = r.bool(0.4);
  const a0 = r.int(1, 12), step = geo ? r.int(2, 4) : r.int(2, 15);
  const f = geo ? (n) => a0 * Math.pow(step, n) : (n) => a0 + step * n;
  const cases = [0, 1, r.int(2, geo ? 8 : 30)];
  return {
    title: geo ? `Geometric term (×${step})` : `Arithmetic term (+${step})`, rating: geo ? 1010 : 900,
    prompt: geo
      ? `A sequence starts at ${a0} and multiplies by ${step} each step. Write \`term(n)\` returning the term at index \`n\` (index 0 is the first term).`
      : `A sequence starts at ${a0} and adds ${step} each step. Write \`term(n)\` returning the term at index \`n\` (index 0 is the first term).`,
    mode: 'func', fn: 'term', starter: S('term', 'n'),
    tests: cases.map((n) => ({ args: [n], expect: f(n) })),
    hints: [geo ? `\`${a0} * ${step} ** n\`` : `\`${a0} + ${step} * n\``],
    solution: geo ? `def term(n):\n    return ${a0} * ${step} ** n` : `def term(n):\n    return ${a0} + ${step} * n`,
  };
} });

/* ---- 13. sequence list ---- */
GEN.add({ id: 'sequence_list', topic: 'loops', variants: 76, make(r) {
  const a = r.int(0, 6), b = r.int(1, 8);
  const f = (n) => { const o = []; let x = a, y = b; for (let i = 0; i < n; i++) { o.push(x); [x, y] = [y, x + y]; } return o; };
  const cases = [6, 0, 1, r.int(8, 14)];
  return {
    title: `Fibonacci-style from ${a}, ${b}`, rating: 1130,
    prompt: `A sequence starts \`${a}, ${b}\` and each later term is the sum of the two before it. ` +
      `Write \`seq(n)\` returning the first \`n\` terms as a list.\n\n${example('seq', [6], f(6))}`,
    mode: 'func', fn: 'seq', starter: S('seq', 'n'),
    tests: cases.map((n) => ({ args: [n], expect: f(n) })),
    hints: ['Two variables and `a, b = b, a + b`.'],
    solution: `def seq(n):\n    out = []\n    a, b = ${a}, ${b}\n    for _ in range(n):\n        out.append(a)\n        a, b = b, a + b\n    return out`,
  };
} });

/* ---- 14. collatz ---- */
GEN.add({ id: 'collatz', topic: 'loops', variants: 76, make(r) {
  const wantList = r.bool(0.4);
  const steps = (n) => { let c = 0; while (n !== 1) { n = n % 2 === 0 ? n / 2 : 3 * n + 1; c++; } return c; };
  const listOf = (n) => { const o = [n]; while (n !== 1) { n = n % 2 === 0 ? n / 2 : 3 * n + 1; o.push(n); } return o; };
  const f = wantList ? listOf : steps;
  const cases = [r.int(2, 30), 1, r.int(30, 90)];
  return {
    title: wantList ? 'Collatz sequence' : 'Collatz step count', rating: wantList ? 1240 : 1190,
    prompt: 'Repeatedly halve an even number, or triple it and add one if it is odd, until you reach 1.\n\n' +
      (wantList
        ? 'Write `collatz(n)` returning the whole sequence as a list, starting with `n` and ending with `1`.'
        : 'Write `collatz(n)` returning how many steps it takes to reach 1. `collatz(1)` is `0`.') +
      `\n\n${example('collatz', [6], f(6))}`,
    mode: 'func', fn: 'collatz', starter: S('collatz', 'n'),
    tests: cases.map((n) => ({ args: [n], expect: f(n) })),
    hints: ['A `while n != 1:` loop.', 'Integer division `n // 2` keeps it an int.'],
    solution: wantList
      ? 'def collatz(n):\n    out = [n]\n    while n != 1:\n        n = n // 2 if n % 2 == 0 else 3 * n + 1\n        out.append(n)\n    return out'
      : 'def collatz(n):\n    steps = 0\n    while n != 1:\n        n = n // 2 if n % 2 == 0 else 3 * n + 1\n        steps += 1\n    return steps',
  };
} });

/* ---- 15. factors and primes ---- */
GEN.add({ id: 'factors', topic: 'math', variants: 76, make(r) {
  const kinds = [
    ['divisors', 'every divisor of `n`, ascending, including 1 and `n`',
      (n) => { const o = []; for (let i = 1; i <= n; i++) if (n % i === 0) o.push(i); return o; }, 1130],
    ['divisor_count', 'how many divisors `n` has',
      (n) => { let c = 0; for (let i = 1; i <= n; i++) if (n % i === 0) c++; return c; }, 1090],
    ['prime_factors', 'the prime factors of `n`, ascending, repeated as often as they divide',
      (n) => { const o = []; let d = 2; while (d * d <= n) { while (n % d === 0) { o.push(d); n /= d; } d++; } if (n > 1) o.push(n); return o; }, 1350],
    ['is_perfect', '`True` when `n` equals the sum of its divisors below itself',
      (n) => { let t = 0; for (let i = 1; i < n; i++) if (n % i === 0) t += i; return t === n; }, 1220],
  ];
  const [fn, desc, f, rating] = r.pick(kinds);
  const cases = [r.int(12, 90), r.pick([6, 28, 12, 16, 30]), r.int(90, 200)];
  const sols = {
    divisors: 'def divisors(n):\n    return [i for i in range(1, n + 1) if n % i == 0]',
    divisor_count: 'def divisor_count(n):\n    return sum(1 for i in range(1, n + 1) if n % i == 0)',
    prime_factors: 'def prime_factors(n):\n    out = []\n    d = 2\n    while d * d <= n:\n        while n % d == 0:\n            out.append(d)\n            n //= d\n        d += 1\n    if n > 1:\n        out.append(n)\n    return out',
    is_perfect: 'def is_perfect(n):\n    return sum(i for i in range(1, n) if n % i == 0) == n',
  };
  return {
    title: fn.replace('_', ' ').replace(/^./, (c) => c.toUpperCase()), rating,
    prompt: `Write \`${fn}(n)\` returning ${desc}. \`n\` is at least 2.\n\n${example(fn, [cases[0]], f(cases[0]))}`,
    mode: 'func', fn, starter: S(fn, 'n'),
    tests: cases.map((n) => ({ args: [n], expect: f(n) })),
    hints: ['Loop the candidate divisors and test `n % i == 0`.'],
    solution: sols[fn],
  };
} });

/* ---- 16. gcd / lcm ---- */
GEN.add({ id: 'gcd_lcm', topic: 'math', variants: 76, make(r) {
  const lcm = r.bool(0.4);
  const g = (a, b) => (b ? g(b, a % b) : a);
  const f = lcm ? (a, b) => (a * b) / g(a, b) : g;
  const cases = [[r.int(4, 60), r.int(4, 60)], [r.int(2, 20) * 6, 6], [r.int(3, 40), 1]];
  return {
    title: lcm ? 'Lowest common multiple' : 'Greatest common divisor', rating: lcm ? 1330 : 1290,
    prompt: `Write \`${lcm ? 'lcm' : 'gcd'}(a, b)\` for two positive integers. Do not import \`math\`.\n\n` +
      example(lcm ? 'lcm' : 'gcd', cases[0], f(...cases[0])),
    mode: 'func', fn: lcm ? 'lcm' : 'gcd', starter: S(lcm ? 'lcm' : 'gcd', 'a, b'),
    tests: cases.map((a) => ({ args: a, expect: f(...a) })),
    hints: ['Euclid: `gcd(a, b) == gcd(b, a % b)`, stopping when `b` is 0.',
            lcm ? '`a * b // gcd(a, b)`' : 'A `while b:` loop with `a, b = b, a % b`.'],
    solution: lcm
      ? 'def lcm(a, b):\n    x, y = a, b\n    while y:\n        x, y = y, x % y\n    return a * b // x'
      : 'def gcd(a, b):\n    while b:\n        a, b = b, a % b\n    return a',
  };
} });

/* ---- 17. base conversion ---- */
GEN.add({ id: 'to_base', topic: 'math', variants: 76, make(r) {
  const base = r.pick([2, 8, 16, 3, 5, 7]);
  const f = (n) => (n === 0 ? '0' : n.toString(base).toUpperCase());
  const cases = [r.int(1, 60), 0, r.int(60, 1000)];
  return {
    title: `Convert to base ${base}`, rating: 1300,
    prompt: `Write \`convert(n)\` returning the base-${base} digits of a non-negative integer as a string ` +
      (base === 16 ? '(uppercase A–F for 10–15)' : '') + `. \`convert(0)\` is \`"0"\`. Do not use \`bin\`, \`hex\` or \`format\`.\n\n` +
      example('convert', [cases[0]], f(cases[0])),
    mode: 'func', fn: 'convert', starter: S('convert', 'n'),
    tests: cases.map((n) => ({ args: [n], expect: f(n) })),
    hints: [`Repeatedly take \`n % ${base}\` and \`n //= ${base}\`.`, 'The digits come out backwards — reverse at the end.'],
    solution: `def convert(n):\n    if n == 0:\n        return "0"\n    digits = "0123456789ABCDEF"\n    out = []\n    while n:\n        out.append(digits[n % ${base}])\n        n //= ${base}\n    return "".join(reversed(out))`,
  };
} });

/* ---- 18. bit tricks ---- */
GEN.add({ id: 'bits', topic: 'math', variants: 76, make(r) {
  const kinds = [
    ['count_bits', 'how many 1 bits `n` has in binary', (n) => n.toString(2).split('').filter((c) => c === '1').length, 1240],
    ['is_power_of_two', '`True` when `n` is a power of two (1, 2, 4, 8, …)', (n) => n > 0 && (n & (n - 1)) === 0, 1310],
    ['lowest_set_bit', 'the value of the lowest set bit of `n`, or 0 when `n` is 0', (n) => n & -n, 1400],
  ];
  const [fn, desc, f, rating] = r.pick(kinds);
  const cases = [r.int(1, 255), r.pick([1, 2, 4, 8, 16, 64]), 0, r.int(256, 4096)];
  const sols = {
    count_bits: 'def count_bits(n):\n    count = 0\n    while n:\n        count += n & 1\n        n >>= 1\n    return count',
    is_power_of_two: 'def is_power_of_two(n):\n    return n > 0 and n & (n - 1) == 0',
    lowest_set_bit: 'def lowest_set_bit(n):\n    return n & -n',
  };
  return {
    title: fn.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase()), rating,
    prompt: `Write \`${fn}(n)\` returning ${desc}. \`n\` is non-negative.`,
    mode: 'func', fn, starter: S(fn, 'n'),
    tests: cases.map((n) => ({ args: [n], expect: f(n) })),
    hints: ['`&`, `|` and `>>` work on the bits directly.',
            fn === 'is_power_of_two' ? '`n & (n - 1)` clears the lowest set bit.' : 'Shift right until nothing is left.'],
    solution: sols[fn],
  };
} });

/* ---- 19. prime check ---- */
GEN.add({ id: 'prime_check', topic: 'math', variants: 76, make(r) {
  const isP = (n) => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
  const upTo = r.bool(0.35);
  const primesBelow = (n) => { const o = []; for (let i = 2; i < n; i++) if (isP(i)) o.push(i); return o; };
  const nthPrime = (k) => { let c = 0, i = 1; while (c < k) { i++; if (isP(i)) c++; } return i; };
  if (upTo) {
    const cases = [r.int(10, 60), 2, r.int(60, 200)];
    return {
      title: 'Primes below n', rating: 1420,
      prompt: `Write \`primes(n)\` returning every prime strictly below \`n\`, ascending.\n\n${example('primes', [12], primesBelow(12))}`,
      mode: 'func', fn: 'primes', starter: S('primes', 'n'),
      tests: cases.map((n) => ({ args: [n], expect: primesBelow(n) })),
      hints: ['Test each candidate, or cross off multiples with a sieve.', 'Divisors only need checking up to the square root.'],
      solution: 'def primes(n):\n    out = []\n    for c in range(2, n):\n        if all(c % d for d in range(2, int(c ** 0.5) + 1)):\n            out.append(c)\n    return out',
    };
  }
  const k = r.int(3, 25);
  const cases = [k, 1, r.int(2, 20)];
  return {
    title: `The ${k}th prime`, rating: 1460,
    prompt: `Write \`nth_prime(k)\` returning the \`k\`th prime number, counting from 1 — so \`nth_prime(1)\` is \`2\`.\n\n${example('nth_prime', [k], nthPrime(k))}`,
    mode: 'func', fn: 'nth_prime', starter: S('nth_prime', 'k'),
    tests: cases.map((n) => ({ args: [n], expect: nthPrime(n) })),
    hints: ['Write a small `is_prime` helper, then count upwards until you have `k` of them.'],
    solution: 'def is_prime(n):\n    if n < 2:\n        return False\n    d = 2\n    while d * d <= n:\n        if n % d == 0:\n            return False\n        d += 1\n    return True\n\n\ndef nth_prime(k):\n    count = 0\n    n = 1\n    while count < k:\n        n += 1\n        if is_prime(n):\n            count += 1\n    return n',
  };
} });

/* ---- 20. leap year / calendar ---- */
GEN.add({ id: 'calendar_bits', topic: 'basics', variants: 76, make(r) {
  const kinds = [
    ['is_leap', '`True` when `year` is a leap year: divisible by 4, except centuries, unless divisible by 400',
      (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0, 'year', 1070],
    ['days_in_month', 'the number of days in month `m` of a non-leap year (1 = January)',
      (m) => [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1], 'm', 950],
    ['to_hms', 'the time `[hours, minutes, seconds]` for a count of seconds',
      (s) => [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60], 'seconds', 1020],
  ];
  const [fn, desc, f, arg, rating] = r.pick(kinds);
  const cases = fn === 'is_leap' ? [r.pick([2000, 1900, 2024, 2023, 2100]), r.int(1990, 2100), 2400]
    : fn === 'days_in_month' ? [r.int(1, 12), 2, 12]
    : [r.int(100, 100000), 0, 3661];
  return {
    title: fn.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase()), rating,
    prompt: `Write \`${fn}(${arg})\` returning ${desc}.\n\n${example(fn, [cases[0]], f(cases[0]))}`,
    mode: 'func', fn, starter: S(fn, arg),
    tests: cases.map((v) => ({ args: [v], expect: f(v) })),
    hints: fn === 'to_hms' ? ['`divmod(seconds, 3600)` splits off the hours in one step.']
      : fn === 'is_leap' ? ['Three divisibility checks combined with `and` / `or`.']
      : ['A list of the twelve lengths is simplest.'],
    solution: fn === 'is_leap'
      ? 'def is_leap(year):\n    return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)'
      : fn === 'days_in_month'
      ? 'def days_in_month(m):\n    return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1]'
      : 'def to_hms(seconds):\n    hours, rest = divmod(seconds, 3600)\n    minutes, secs = divmod(rest, 60)\n    return [hours, minutes, secs]',
  };
} });

/* ---- 21. fizzbuzz variants ---- */
GEN.add({ id: 'fizzbuzz_var', topic: 'loops', variants: 76, make(r) {
  const a = r.int(2, 6), b = r.int(a + 1, 11);
  const wa = r.pick(['Fizz', 'Ping', 'Tick', 'Foo', 'Red']);
  const wb = r.pick(['Buzz', 'Pong', 'Tock', 'Bar', 'Blue']);
  const one = (i) => (i % a === 0 && i % b === 0) ? wa + wb : i % a === 0 ? wa : i % b === 0 ? wb : String(i);
  const f = (n) => Array.from({ length: n }, (_, i) => one(i + 1));
  const cases = [r.int(8, 20), 1, a * b];
  return {
    title: `${wa}${wb} on ${a} and ${b}`, rating: 1150,
    prompt: `Write \`play(n)\` returning a list of strings for \`1..n\`:\n` +
      `- multiples of both ${a} and ${b} -> \`"${wa}${wb}"\`\n- multiples of ${a} -> \`"${wa}"\`\n` +
      `- multiples of ${b} -> \`"${wb}"\`\n- anything else -> the number as a string\n\n${example('play', [10], f(10))}`,
    mode: 'func', fn: 'play', starter: S('play', 'n'),
    tests: cases.map((n) => ({ args: [n], expect: f(n) })),
    hints: ['Check the both-case first, or it never fires.'],
    solution: `def play(n):\n    out = []\n    for i in range(1, n + 1):\n        if i % ${a} == 0 and i % ${b} == 0:\n            out.append("${wa}${wb}")\n        elif i % ${a} == 0:\n            out.append("${wa}")\n        elif i % ${b} == 0:\n            out.append("${wb}")\n        else:\n            out.append(str(i))\n    return out`,
  };
} });

/* ---- 22. accumulate until a threshold ---- */
GEN.add({ id: 'accumulate_until', topic: 'loops', variants: 76, make(r) {
  const limit = r.int(20, 200);
  const nums = r.ints(r.int(6, 10), 1, 40);
  const f = (xs) => { let t = 0; for (let i = 0; i < xs.length; i++) { t += xs[i]; if (t >= limit) return i + 1; } return -1; };
  const other = r.ints(8, 1, 9);
  return {
    title: `How many until ${limit}?`, rating: 1180,
    prompt: `Write \`how_many(nums)\` returning how many values from the start of the list you must add ` +
      `before the running total reaches ${limit} or more. Return \`-1\` if the whole list never gets there.\n\n${example('how_many', [nums], f(nums))}`,
    mode: 'func', fn: 'how_many', starter: S('how_many', 'nums'),
    tests: [{ args: [nums], expect: f(nums) }, { args: [other], expect: f(other) }, { args: [[]], expect: -1 }],
    hints: ['Keep a running total and `return` as soon as it is big enough.'],
    solution: `def how_many(nums):\n    total = 0\n    for i, n in enumerate(nums):\n        total += n\n        if total >= ${limit}:\n            return i + 1\n    return -1`,
  };
} });

/* ---- 23. roman numerals ---- */
GEN.add({ id: 'roman', topic: 'strings', variants: 76, make(r) {
  const toRoman = (n) => {
    const t = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
               [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
    let out = '';
    for (const [v, s] of t) while (n >= v) { out += s; n -= v; }
    return out;
  };
  const fromRoman = (s) => {
    const v = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    let t = 0;
    for (let i = 0; i < s.length; i++) t += (i + 1 < s.length && v[s[i]] < v[s[i + 1]]) ? -v[s[i]] : v[s[i]];
    return t;
  };
  const encode = r.bool();
  const nums = [r.int(1, 3999), r.int(1, 40), r.pick([4, 9, 40, 90, 400, 1994, 2024])];
  return encode ? {
    title: 'Number to Roman numeral', rating: 1600,
    prompt: `Write \`to_roman(n)\` converting an integer from 1 to 3999 into a Roman numeral.\n\n${example('to_roman', [nums[0]], toRoman(nums[0]))}`,
    mode: 'func', fn: 'to_roman', starter: S('to_roman', 'n'),
    tests: nums.map((n) => ({ args: [n], expect: toRoman(n) })),
    hints: ['A table of value/symbol pairs, largest first — including `CM`, `CD`, `XC`, `XL`, `IX`, `IV`.',
            'Subtract the largest value that still fits, repeatedly.'],
    solution: 'def to_roman(n):\n    table = [(1000, "M"), (900, "CM"), (500, "D"), (400, "CD"), (100, "C"),\n             (90, "XC"), (50, "L"), (40, "XL"), (10, "X"), (9, "IX"),\n             (5, "V"), (4, "IV"), (1, "I")]\n    out = []\n    for value, sym in table:\n        while n >= value:\n            out.append(sym)\n            n -= value\n    return "".join(out)',
  } : {
    title: 'Roman numeral to number', rating: 1450,
    prompt: `Write \`from_roman(s)\` converting a valid Roman numeral to an integer.\n\n${example('from_roman', [toRoman(nums[0])], nums[0])}`,
    mode: 'func', fn: 'from_roman', starter: S('from_roman', 's'),
    tests: nums.map((n) => ({ args: [toRoman(n)], expect: fromRoman(toRoman(n)) })),
    hints: ['Map each letter to its value.', 'A letter worth less than the next one is subtracted.'],
    solution: 'def from_roman(s):\n    vals = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}\n    total = 0\n    for i, c in enumerate(s):\n        if i + 1 < len(s) and vals[c] < vals[s[i + 1]]:\n            total -= vals[c]\n        else:\n            total += vals[c]\n    return total',
  };
} });

/* ---- 24. number to words (small) ---- */
GEN.add({ id: 'num_words', topic: 'strings', variants: 76, make(r) {
  const ones = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
    'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const f = (n) => (n < 20 ? ones[n] : tens[Math.floor(n / 10)] + (n % 10 ? '-' + ones[n % 10] : ''));
  const cases = [r.int(0, 19), r.int(20, 99), r.pick([30, 42, 99, 20])];
  return {
    title: 'Number in words (0–99)', rating: 1390,
    prompt: 'Write `in_words(n)` spelling out a number from 0 to 99 in lowercase English. ' +
      'Compound numbers are hyphenated.\n\n```\nin_words(7)   ->  "seven"\nin_words(42)  ->  "forty-two"\nin_words(30)  ->  "thirty"\n```',
    mode: 'func', fn: 'in_words', starter: S('in_words', 'n'),
    tests: cases.map((n) => ({ args: [n], expect: f(n) })),
    hints: ['Everything below 20 needs its own word — put them in a list.',
            'From 20 up: the tens word, then a hyphen and the units word only when it is not zero.'],
    solution: 'def in_words(n):\n    ones = ["zero", "one", "two", "three", "four", "five", "six", "seven",\n            "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen",\n            "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"]\n    tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy",\n            "eighty", "ninety"]\n    if n < 20:\n        return ones[n]\n    word = tens[n // 10]\n    if n % 10:\n        word += "-" + ones[n % 10]\n    return word',
  };
} });

/* ---- 25. change making with fixed coins ---- */
GEN.add({ id: 'change_coins', topic: 'loops', variants: 76, make(r) {
  const coins = r.pick([[25, 10, 5, 1], [50, 20, 10, 5, 2, 1], [100, 50, 20, 10], [20, 10, 5, 1]]);
  const f = (n) => { const o = []; for (const c of coins) { o.push(Math.floor(n / c)); n %= c; } return o; };
  const cases = [r.int(7, 300), 0, coins[0] * r.int(1, 4)];
  return {
    title: `Change with ${coins.join('/')}`, rating: 1240,
    prompt: `Coins come in ${coins.join(', ')}. Write \`change(amount)\` returning how many of each coin a ` +
      `greedy till hands back, in that same order.\n\n${example('change', [cases[0]], f(cases[0]))}`,
    mode: 'func', fn: 'change', starter: S('change', 'amount'),
    tests: cases.map((n) => ({ args: [n], expect: f(n) })),
    hints: ['Take as many of the biggest coin as fit, then move on.', '`divmod(amount, coin)` gives both numbers at once.'],
    solution: `def change(amount):\n    out = []\n    for coin in ${py(coins)}:\n        count, amount = divmod(amount, coin)\n        out.append(count)\n    return out`,
  };
} });

/* ---- 26. average / grade boundaries ---- */
GEN.add({ id: 'grade_band', topic: 'basics', variants: 76, make(r) {
  const bands = r.pick([
    [[90, 'A'], [80, 'B'], [70, 'C'], [60, 'D']],
    [[70, 'Distinction'], [55, 'Merit'], [40, 'Pass']],
    [[85, 'gold'], [65, 'silver'], [45, 'bronze']],
  ]);
  const fail = bands.length === 4 ? 'F' : bands[0][1] === 'gold' ? 'none' : 'Fail';
  const f = (s) => { for (const [cut, name] of bands) if (s >= cut) return name; return fail; };
  const cases = [bands[0][0] + r.int(0, 9), bands[bands.length - 1][0] - r.int(1, 20), r.int(45, 89)];
  return {
    title: 'Grade from a score', rating: 950,
    prompt: 'Write `grade(score)` returning:\n' +
      bands.map(([c, n]) => `- \`${c}\` or more -> \`"${n}"\``).join('\n') +
      `\n- anything lower -> \`"${fail}"\``,
    mode: 'func', fn: 'grade', starter: S('grade', 'score'),
    tests: cases.map((s) => ({ args: [s], expect: f(s) })),
    hints: ['Check the highest boundary first — `elif` handles the rest.'],
    solution: 'def grade(score):\n' +
      bands.map(([c, n], i) => `    ${i ? 'elif' : 'if'} score >= ${c}:\n        return "${n}"`).join('\n') +
      `\n    return "${fail}"`,
  };
} });

/* ---- 27. distance / pythagoras ---- */
GEN.add({ id: 'distance', topic: 'math', variants: 76, make(r) {
  const manhattan = r.bool(0.4);
  const f = manhattan
    ? (x1, y1, x2, y2) => Math.abs(x1 - x2) + Math.abs(y1 - y2)
    : (x1, y1, x2, y2) => Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
  const mk = () => [r.int(-20, 20), r.int(-20, 20), r.int(-20, 20), r.int(-20, 20)];
  const cases = [mk(), [0, 0, 3, 4], mk()];
  return {
    title: manhattan ? 'Manhattan distance' : 'Straight-line distance', rating: manhattan ? 950 : 1010,
    prompt: `Write \`distance(x1, y1, x2, y2)\` returning the ${manhattan ? 'Manhattan (grid) ' : 'straight-line '}distance between two points.\n\n` +
      example('distance', [0, 0, 3, 4], f(0, 0, 3, 4)),
    mode: 'func', fn: 'distance', starter: S('distance', 'x1, y1, x2, y2'),
    tests: cases.map((a) => ({ args: a, expect: f(...a), cmp: 'approx' })),
    hints: [manhattan ? '`abs()` on each axis, then add.' : '`(dx ** 2 + dy ** 2) ** 0.5`'],
    solution: manhattan
      ? 'def distance(x1, y1, x2, y2):\n    return abs(x1 - x2) + abs(y1 - y2)'
      : 'def distance(x1, y1, x2, y2):\n    return ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5',
  };
} });

/* ---- 28. recursion drills ---- */
GEN.add({ id: 'recursion_drill', topic: 'recursion', variants: 76, make(r) {
  const kinds = [
    ['countdown', 'a list counting down from `n` to 1, written **recursively** (no loops)',
      (n) => Array.from({ length: n }, (_, i) => n - i), 1240,
      'def countdown(n):\n    if n <= 0:\n        return []\n    return [n] + countdown(n - 1)'],
    ['power', 'the value of `base` to the power `n` computed **recursively** (no `**`, no loops)',
      null, 1300, null],
    ['sum_to', 'the sum of `1..n` computed **recursively** (no loops, no formula)',
      (n) => (n * (n + 1)) / 2, 1230,
      'def sum_to(n):\n    if n <= 0:\n        return 0\n    return n + sum_to(n - 1)'],
    ['count_digits_rec', 'how many digits `n` has, computed **recursively** without `str`',
      (n) => String(n).length, 1330,
      'def count_digits_rec(n):\n    if n < 10:\n        return 1\n    return 1 + count_digits_rec(n // 10)'],
  ];
  const [fn, desc, f, rating, sol] = r.pick(kinds);
  if (fn === 'power') {
    const g = (b, n) => Math.pow(b, n);
    const cases = [[r.int(2, 6), r.int(2, 6)], [r.int(2, 9), 0], [2, 10]];
    return {
      title: 'Power, recursively', rating,
      prompt: `Write \`power(base, n)\` returning ${desc}. \`n\` is non-negative.`,
      mode: 'func', fn: 'power', starter: S('power', 'base, n'),
      tests: cases.map((a) => ({ args: a, expect: g(...a) })),
      hints: ['`base ** 0` is 1 — that is your base case.', '`power(base, n) == base * power(base, n - 1)`'],
      solution: 'def power(base, n):\n    if n == 0:\n        return 1\n    return base * power(base, n - 1)',
    };
  }
  const cases = fn === 'count_digits_rec' ? [r.int(1, 9), r.int(100, 99999), r.int(10, 99)]
                                          : [r.int(3, 10), 0, r.int(11, 25)];
  return {
    title: fn.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase()), rating,
    prompt: `Write \`${fn}(n)\` returning ${desc}.`,
    mode: 'func', fn, starter: S(fn, 'n'),
    tests: cases.map((n) => ({ args: [n], expect: f(n) })),
    hints: ['Every recursion needs a base case that returns without calling itself.',
            'Then handle `n` in terms of a smaller `n`.'],
    solution: sol,
  };
} });
})();
