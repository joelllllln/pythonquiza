/* Generated questions: strings and text. */

(function () {
const { GEN, py, example } = window;
const S = (fn, args) => `def ${fn}(${args}):\n    `;
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* ---- 1. count a character ---- */
GEN.add({ id: 'count_char', topic: 'strings', variants: 76, make(r) {
  const ch = r.pick('abcdefglmnoprstu'.split(''));
  const ignoreCase = r.bool(0.4);
  const f = (s) => (ignoreCase ? s.toLowerCase() : s).split('').filter((c) => c === ch).length;
  const words = [r.words(3).join(' '), r.word().toUpperCase(), ch + ch + r.word()];
  return {
    title: `Count the letter "${ch}"`, rating: ignoreCase ? 900 : 830,
    prompt: `Write \`count_${ch}(s)\` returning how many times \`"${ch}"\` appears in \`s\`` +
      (ignoreCase ? ', ignoring case' : '') + `.\n\n${example('count_' + ch, [words[0]], f(words[0]))}`,
    mode: 'func', fn: `count_${ch}`, starter: S(`count_${ch}`, 's'),
    tests: [...words, ''].map((s) => ({ args: [s], expect: f(s) })),
    hints: [ignoreCase ? 'Lowercase the whole string first.' : 'Strings have a `.count()` method.'],
    solution: `def count_${ch}(s):\n    return s${ignoreCase ? '.lower()' : ''}.count("${ch}")`,
  };
} });

/* ---- 2. vowels / consonants ---- */
GEN.add({ id: 'vowel_count', topic: 'strings', variants: 76, make(r) {
  const consonants = r.bool(0.4);
  const f = (s) => s.toLowerCase().split('').filter((c) =>
    /[a-z]/.test(c) && ('aeiou'.includes(c) !== consonants)).length;
  const words = [r.words(2).join(' '), r.word().toUpperCase(), 'rhythm', ''];
  return {
    title: consonants ? 'Count consonants' : 'Count vowels', rating: consonants ? 1000 : 900,
    prompt: `Write \`count(s)\` returning how many ${consonants ? 'consonants' : 'vowels (a, e, i, o, u)'} ` +
      `\`s\` contains. Ignore case${consonants ? '; only letters count' : ''}.`,
    mode: 'func', fn: 'count', starter: S('count', 's'),
    tests: words.map((s) => ({ args: [s], expect: f(s) })),
    hints: ['`ch in "aeiou"` after lowercasing.',
            consonants ? '`ch.isalpha() and ch not in "aeiou"`' : 'A generator expression inside `sum` counts in one line.'],
    solution: consonants
      ? 'def count(s):\n    return sum(1 for c in s.lower() if c.isalpha() and c not in "aeiou")'
      : 'def count(s):\n    return sum(1 for c in s.lower() if c in "aeiou")',
  };
} });

/* ---- 3. slicing ---- */
GEN.add({ id: 'slice_str', topic: 'strings', variants: 76, make(r) {
  const kinds = [
    ['first_n', (s, n) => s.slice(0, n), 'the first `n` characters', 's[:n]', 800],
    ['last_n', (s, n) => (n === 0 ? '' : s.slice(-n)), 'the last `n` characters', 's[-n:] (careful when n is 0)', 950],
    ['drop_first', (s, n) => s.slice(n), 'everything after the first `n` characters', 's[n:]', 850],
    ['every_nth', (s, n) => s.split('').filter((_, i) => i % n === 0).join(''), 'every `n`th character, starting with the first', 's[::n]', 1000],
    ['middle_out', (s, n) => s.slice(n, s.length - n), 'the string with `n` characters removed from each end', 's[n:len(s) - n]', 1080],
  ];
  const [fn, f, desc, hint, rating] = r.pick(kinds);
  const n = fn === 'every_nth' ? r.int(2, 4) : r.int(1, 3);
  const words = [r.words(2).join(''), r.word(), 'abcdefghij'];
  return {
    title: cap(fn.replace(/_/g, ' ')), rating,
    prompt: `Write \`${fn}(s, n)\` returning ${desc}.\n\n${example(fn, [words[2], n], f(words[2], n))}`,
    mode: 'func', fn, starter: S(fn, 's, n'),
    tests: [...words.map((s) => [s, n]), ['', n]].map((a) => ({ args: a, expect: f(...a) })),
    hints: [`Slicing: \`${hint}\``],
    solution: {
      first_n: 'def first_n(s, n):\n    return s[:n]',
      last_n: 'def last_n(s, n):\n    return s[len(s) - n:]',
      drop_first: 'def drop_first(s, n):\n    return s[n:]',
      every_nth: 'def every_nth(s, n):\n    return s[::n]',
      middle_out: 'def middle_out(s, n):\n    return s[n:len(s) - n]',
    }[fn],
  };
} });

/* ---- 4. case transforms ---- */
GEN.add({ id: 'case_change', topic: 'strings', variants: 76, make(r) {
  const kinds = [
    ['shout', (s) => s.toUpperCase() + '!', 'the string in capitals with a `"!"` on the end', 's.upper() + "!"', 760],
    ['whisper', (s) => s.toLowerCase() + '…', 'the string in lowercase with `"…"` on the end', 's.lower() + "…"', 780],
    ['swap_case', (s) => s.split('').map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join(''),
      'the string with the case of every letter flipped', 's.swapcase()', 830],
    ['first_upper', (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(),
      'the string with only the first letter capitalised', 's.capitalize()', 800],
    ['alternating', (s) => s.split('').map((c, i) => (i % 2 ? c.toLowerCase() : c.toUpperCase())).join(''),
      'the string with alternating case, starting with a capital', 'enumerate and check `i % 2`', 1100],
  ];
  const [fn, f, desc, hint, rating] = r.pick(kinds);
  const words = [r.words(2).join(' '), r.word().toUpperCase(), 'MiXeD case'];
  return {
    title: cap(fn.replace(/_/g, ' ')), rating,
    prompt: `Write \`${fn}(s)\` returning ${desc}.\n\n${example(fn, [words[2]], f(words[2]))}`,
    mode: 'func', fn, starter: S(fn, 's'),
    tests: [...words, ''].map((s) => ({ args: [s], expect: f(s) })),
    hints: [`\`${hint}\``],
    solution: {
      shout: 'def shout(s):\n    return s.upper() + "!"',
      whisper: 'def whisper(s):\n    return s.lower() + "…"',
      swap_case: 'def swap_case(s):\n    return s.swapcase()',
      first_upper: 'def first_upper(s):\n    return s.capitalize()',
      alternating: 'def alternating(s):\n    return "".join(c.upper() if i % 2 == 0 else c.lower() for i, c in enumerate(s))',
    }[fn],
  };
} });

/* ---- 5. replace / remove ---- */
GEN.add({ id: 'replace_sub', topic: 'strings', variants: 76, make(r) {
  const a = r.pick(['a', 'e', 'th', 'oo', 'll', 'in', 's']);
  const b = r.pick(['-', '*', '_', '', 'X']);
  const f = (s) => s.split(a).join(b);
  const words = [r.words(3).join(' '), a + a + r.word(), r.word()];
  return {
    title: `Replace "${a}" with "${b || 'nothing'}"`, rating: 810,
    prompt: `Write \`swap(s)\` replacing every \`"${a}"\` in \`s\` with \`"${b}"\`.\n\n${example('swap', [words[0]], f(words[0]))}`,
    mode: 'func', fn: 'swap', starter: S('swap', 's'),
    tests: [...words, ''].map((s) => ({ args: [s], expect: f(s) })),
    hints: ['`s.replace(old, new)`'],
    solution: `def swap(s):\n    return s.replace("${a}", "${b}")`,
  };
} });

/* ---- 6. strip characters ---- */
GEN.add({ id: 'strip_chars', topic: 'strings', variants: 76, make(r) {
  const chars = r.pick(['*', '-', '.', '#', ' _']);
  const f = (s) => {
    let i = 0, j = s.length;
    while (i < j && chars.includes(s[i])) i++;
    while (j > i && chars.includes(s[j - 1])) j--;
    return s.slice(i, j);
  };
  const c0 = chars[0];
  const words = [c0 + c0 + r.word() + c0, r.word(), c0.repeat(3)];
  return {
    title: `Trim "${chars}" from both ends`, rating: 950,
    prompt: `Write \`trim(s)\` removing every leading and trailing character from the set \`${py(chars)}\`. ` +
      'Characters in the middle stay.\n\n' + example('trim', [words[0]], f(words[0])),
    mode: 'func', fn: 'trim', starter: S('trim', 's'),
    tests: [...words, ''].map((s) => ({ args: [s], expect: f(s) })),
    hints: ['`s.strip(chars)` strips any of the characters you pass it.'],
    solution: `def trim(s):\n    return s.strip(${py(chars)})`,
  };
} });

/* ---- 7. starts / ends / contains ---- */
GEN.add({ id: 'str_predicate', topic: 'strings', variants: 76, make(r) {
  const sub = r.pick(['py', 'ing', 'the', 'ab', 'x', 'er']);
  const kinds = [
    ['starts', (s) => s.startsWith(sub), `starts with \`"${sub}"\``, `s.startswith("${sub}")`],
    ['ends', (s) => s.endsWith(sub), `ends with \`"${sub}"\``, `s.endswith("${sub}")`],
    ['contains', (s) => s.includes(sub), `contains \`"${sub}"\` anywhere`, `"${sub}" in s`],
  ];
  const [fn, f, desc, hint] = r.pick(kinds);
  const words = [sub + r.word(), r.word() + sub, r.word(), ''];
  return {
    title: `${cap(fn)} with "${sub}"`, rating: 820,
    prompt: `Write \`${fn}(s)\` returning \`True\` when \`s\` ${desc}.`,
    mode: 'func', fn, starter: S(fn, 's'),
    tests: words.map((s) => ({ args: [s], expect: f(s) })),
    hints: [`\`${hint}\``],
    solution: `def ${fn}(s):\n    return ${hint}`,
  };
} });

/* ---- 8. split and join ---- */
GEN.add({ id: 'split_join', topic: 'strings', variants: 76, make(r) {
  const from = r.pick([',', '-', ';', '|', ' ']);
  const to = r.pick([' ', ', ', ' | ', '-']);
  const f = (s) => s.split(from).map((p) => p.trim()).filter((p) => p !== '').join(to);
  const words = [r.words(3).join(from), r.words(2).join(from + ' '), r.word()];
  return {
    title: `Re-join on "${to}"`, rating: 1080,
    prompt: `Write \`rejoin(s)\` splitting \`s\` on \`${py(from)}\`, trimming spaces around each part, ` +
      `dropping empty parts, and joining what is left with \`${py(to)}\`.\n\n${example('rejoin', [words[0]], f(words[0]))}`,
    mode: 'func', fn: 'rejoin', starter: S('rejoin', 's'),
    tests: [...words, from + from].map((s) => ({ args: [s], expect: f(s) })),
    hints: [`\`s.split(${py(from)})\` then \`.strip()\` each part.`, 'Filter out the empties before joining.'],
    solution: `def rejoin(s):\n    parts = [p.strip() for p in s.split(${py(from)})]\n    return ${py(to)}.join(p for p in parts if p)`,
  };
} });

/* ---- 9. word statistics ---- */
GEN.add({ id: 'word_stats', topic: 'strings', variants: 76, make(r) {
  const kinds = [
    ['word_count', (s) => s.split(/\s+/).filter(Boolean).length, 'how many whitespace-separated words `s` has', 'len(s.split())', 900],
    ['longest_word', (s) => { const w = s.split(/\s+/).filter(Boolean); return w.length ? w.reduce((a, b) => (b.length > a.length ? b : a)) : ''; },
      'the longest word (the first one, on a tie), or `""` for an empty string', 'max(words, key=len)', 1120],
    ['shortest_word', (s) => { const w = s.split(/\s+/).filter(Boolean); return w.length ? w.reduce((a, b) => (b.length < a.length ? b : a)) : ''; },
      'the shortest word (the first one, on a tie), or `""` for an empty string', 'min(words, key=len)', 1120],
    ['average_word_length', (s) => { const w = s.split(/\s+/).filter(Boolean); return w.length ? w.join('').length / w.length : 0; },
      'the mean word length, or `0` when there are no words', 'total letters / number of words', 1180],
    ['reverse_words', (s) => s.split(/\s+/).filter(Boolean).reverse().join(' '),
      'the words in reverse order, single-spaced', '" ".join(reversed(s.split()))', 1050],
    ['initials', (s) => s.split(/\s+/).filter(Boolean).map((w) => w[0].toUpperCase()).join(''),
      'the first letter of every word, capitalised and joined', 'w[0].upper() for each word', 1160],
  ];
  const [fn, f, desc, hint, rating] = r.pick(kinds);
  const texts = [r.words(4).join(' '), '  ' + r.words(2).join('   ') + ' ', r.word(), ''];
  const approx = fn === 'average_word_length';
  return {
    title: cap(fn.replace(/_/g, ' ')), rating,
    prompt: `Write \`${fn}(s)\` returning ${desc}.\n\n${example(fn, [texts[0]], f(texts[0]))}`,
    mode: 'func', fn, starter: S(fn, 's'),
    tests: texts.map((s) => ({ args: [s], expect: f(s), cmp: approx ? 'approx' : '' })),
    hints: ['`s.split()` already collapses runs of spaces.', `\`${hint}\``],
    solution: {
      word_count: 'def word_count(s):\n    return len(s.split())',
      longest_word: 'def longest_word(s):\n    words = s.split()\n    return max(words, key=len) if words else ""',
      shortest_word: 'def shortest_word(s):\n    words = s.split()\n    return min(words, key=len) if words else ""',
      average_word_length: 'def average_word_length(s):\n    words = s.split()\n    if not words:\n        return 0\n    return sum(len(w) for w in words) / len(words)',
      reverse_words: 'def reverse_words(s):\n    return " ".join(reversed(s.split()))',
      initials: 'def initials(s):\n    return "".join(w[0].upper() for w in s.split())',
    }[fn],
  };
} });

/* ---- 10. palindrome variants ---- */
GEN.add({ id: 'palindrome_var', topic: 'strings', variants: 76, make(r) {
  const strict = r.bool(0.35);
  const clean = (s) => strict ? s : s.toLowerCase().split('').filter((c) => /[a-z0-9]/i.test(c)).join('');
  const f = (s) => { const c = clean(s); return c === c.split('').reverse().join(''); };
  const good = r.pick(['level', 'rotator', 'deified', 'racecar']);
  const cases = strict ? [good, r.word() + 'x', '', 'aa']
    : ['A man, a plan, a canal: Panama', good.toUpperCase(), r.word() + 'zz', ''];
  return {
    title: strict ? 'Exact palindrome' : 'Palindrome, loosely', rating: strict ? 950 : 1180,
    prompt: 'Write `is_palindrome(s)` returning `True` when the string reads the same backwards. ' +
      (strict ? 'Compare exactly — case and punctuation matter.'
              : 'Ignore case, spaces and punctuation: only letters and digits count.'),
    mode: 'func', fn: 'is_palindrome', starter: S('is_palindrome', 's'),
    tests: cases.map((s) => ({ args: [s], expect: f(s) })),
    hints: ['`s[::-1]` reverses a string.', strict ? 'One comparison is enough.' : '`c.isalnum()` keeps the characters that count.'],
    solution: strict
      ? 'def is_palindrome(s):\n    return s == s[::-1]'
      : 'def is_palindrome(s):\n    clean = [c.lower() for c in s if c.isalnum()]\n    return clean == clean[::-1]',
  };
} });

/* ---- 11. caesar shift ---- */
GEN.add({ id: 'caesar_k', topic: 'strings', variants: 76, make(r) {
  const k = r.int(1, 25);
  const f = (s) => s.split('').map((c) => {
    if (!/[a-z]/i.test(c)) return c;
    const base = c === c.toLowerCase() ? 97 : 65;
    return String.fromCharCode(((c.charCodeAt(0) - base + k) % 26 + 26) % 26 + base);
  }).join('');
  const words = [r.words(2).join(' '), 'Hello, World!', 'xyz', ''];
  return {
    title: `Caesar shift by ${k}`, rating: 1330,
    prompt: `Write \`encode(s)\` shifting every letter ${k} places along the alphabet, wrapping past \`z\`. ` +
      `Case is kept; non-letters are left alone.\n\n${example('encode', ['xyz'], f('xyz'))}`,
    mode: 'func', fn: 'encode', starter: S('encode', 's'),
    tests: words.map((s) => ({ args: [s], expect: f(s) })),
    hints: ['`ord()` and `chr()` move between letters and numbers.',
            `\`(ord(c) - base + ${k}) % 26 + base\`, where base is \`ord("a")\` or \`ord("A")\`.`],
    solution: `def encode(s):\n    out = []\n    for c in s:\n        if c.isalpha():\n            base = ord("a") if c.islower() else ord("A")\n            out.append(chr((ord(c) - base + ${k}) % 26 + base))\n        else:\n            out.append(c)\n    return "".join(out)`,
  };
} });

/* ---- 12. mask a value ---- */
GEN.add({ id: 'mask', topic: 'strings', variants: 76, make(r) {
  const keep = r.int(2, 4);
  const ch = r.pick(['*', '#', 'x', '•']);
  const f = (s) => (s.length <= keep ? s : ch.repeat(s.length - keep) + s.slice(s.length - keep));
  const cases = ['1234567890123456', r.word(), 'ab', ''];
  return {
    title: `Mask all but the last ${keep}`, rating: 1090,
    prompt: `Write \`mask(s)\` replacing every character except the last ${keep} with \`"${ch}"\`. ` +
      `Strings of ${keep} characters or fewer come back unchanged.\n\n${example('mask', [cases[0]], f(cases[0]))}`,
    mode: 'func', fn: 'mask', starter: S('mask', 's'),
    tests: cases.map((s) => ({ args: [s], expect: f(s) })),
    hints: [`\`s[-${keep}:]\` is the tail you keep.`, `\`"${ch}" * (len(s) - ${keep})\` builds the cover.`],
    solution: `def mask(s):\n    if len(s) <= ${keep}:\n        return s\n    return "${ch}" * (len(s) - ${keep}) + s[-${keep}:]`,
  };
} });

/* ---- 13. padding ---- */
GEN.add({ id: 'pad', topic: 'strings', variants: 76, make(r) {
  const width = r.int(8, 20);
  const ch = r.pick([' ', '.', '0', '-']);
  const side = r.pick(['left', 'right', 'both']);
  const f = (s) => {
    if (s.length >= width) return s;
    const total = width - s.length;
    if (side === 'left') return ch.repeat(total) + s;
    if (side === 'right') return s + ch.repeat(total);
    const l = Math.floor(total / 2) + (total & width & 1);
    return ch.repeat(l) + s + ch.repeat(total - l);
  };
  const cases = [r.word(), 'x', 'a'.repeat(width + 3)];
  const method = side === 'left' ? 'rjust' : side === 'right' ? 'ljust' : 'center';
  return {
    title: `Pad to ${width} (${side})`, rating: 1010,
    prompt: `Write \`pad(s)\` padding \`s\` with \`${py(ch)}\` to exactly ${width} characters, ` +
      (side === 'both' ? 'centred (extra padding goes on the right)' : `on the ${side}`) +
      `. Longer strings are returned unchanged.\n\n${example('pad', [cases[1]], f(cases[1]))}`,
    mode: 'func', fn: 'pad', starter: S('pad', 's'),
    tests: cases.map((s) => ({ args: [s], expect: f(s) })),
    hints: [`\`s.${method}(width, fill)\` does exactly this.`],
    solution: `def pad(s):\n    return s.${method}(${width}, ${py(ch)})`,
  };
} });

/* ---- 14. camel / snake ---- */
GEN.add({ id: 'name_style', topic: 'strings', variants: 76, make(r) {
  const toSnake = r.bool();
  const words = r.words(r.int(2, 3));
  const camel = words[0] + words.slice(1).map(cap).join('');
  const snake = words.join('_');
  const f = toSnake
    ? (s) => s.replace(/([A-Z])/g, (m) => '_' + m.toLowerCase())
    : (s) => s.split('_').map((w, i) => (i ? cap(w) : w)).join('');
  const cases = toSnake ? [camel, 'x', r.word()] : [snake, 'x', r.word()];
  return {
    title: toSnake ? 'camelCase to snake_case' : 'snake_case to camelCase', rating: 1290,
    prompt: toSnake
      ? 'Write `to_snake(s)` turning `camelCase` into `snake_case`: every capital becomes an underscore plus the lowercase letter.\n\n```\nto_snake("myVarName")  ->  "my_var_name"\n```'
      : 'Write `to_camel(s)` turning `snake_case` into `camelCase`: drop the underscores and capitalise each following word. The first word stays lowercase.\n\n```\nto_camel("my_var_name")  ->  "myVarName"\n```',
    mode: 'func', fn: toSnake ? 'to_snake' : 'to_camel', starter: S(toSnake ? 'to_snake' : 'to_camel', 's'),
    tests: cases.map((s) => ({ args: [s], expect: f(s) })),
    hints: [toSnake ? 'Walk the characters; `c.isupper()` marks a boundary.' : '`s.split("_")` then capitalise all but the first part.'],
    solution: toSnake
      ? 'def to_snake(s):\n    out = []\n    for c in s:\n        if c.isupper():\n            out.append("_" + c.lower())\n        else:\n            out.append(c)\n    return "".join(out)'
      : 'def to_camel(s):\n    parts = s.split("_")\n    return parts[0] + "".join(p.capitalize() for p in parts[1:])',
  };
} });

/* ---- 15. run-length encode / decode ---- */
GEN.add({ id: 'rle', topic: 'strings', variants: 76, make(r) {
  const encode = r.bool(0.6);
  const enc = (s) => {
    if (!s) return '';
    const out = [];
    let cur = s[0], n = 1;
    for (const c of s.slice(1)) { if (c === cur) n++; else { out.push(cur + n); cur = c; n = 1; } }
    out.push(cur + n);
    return out.join('');
  };
  const dec = (s) => s.replace(/([a-z])(\d+)/g, (_, c, n) => c.repeat(Number(n)));
  const raw = r.pick(['aaabbc', 'zzzz', 'abab', 'mmmnnnooo']);
  return encode ? {
    title: 'Run-length encode', rating: 1250,
    prompt: `Write \`encode(s)\` compressing runs of the same character into the character followed by its count.\n\n${example('encode', [raw], enc(raw))}`,
    mode: 'func', fn: 'encode', starter: S('encode', 's'),
    tests: [raw, '', 'a', r.word()].map((s) => ({ args: [s], expect: enc(s) })),
    hints: ['Track the current character and how many you have seen.', 'Do not forget to flush the final run after the loop.'],
    solution: 'def encode(s):\n    if not s:\n        return ""\n    out = []\n    cur, n = s[0], 1\n    for c in s[1:]:\n        if c == cur:\n            n += 1\n        else:\n            out.append(cur + str(n))\n            cur, n = c, 1\n    out.append(cur + str(n))\n    return "".join(out)',
  } : {
    title: 'Run-length decode', rating: 1210,
    prompt: `Write \`decode(s)\` expanding a run-length encoded string back out. Counts can be more than one digit.\n\n${example('decode', [enc(raw)], raw)}`,
    mode: 'func', fn: 'decode', starter: S('decode', 's'),
    tests: [enc(raw), '', 'a1', 'x12'].map((s) => ({ args: [s], expect: dec(s) })),
    hints: ['Walk the string: a letter, then all the digits that follow it.', '`c.isdigit()` tells you where the count ends.'],
    solution: 'def decode(s):\n    out = []\n    i = 0\n    while i < len(s):\n        c = s[i]\n        i += 1\n        num = ""\n        while i < len(s) and s[i].isdigit():\n            num += s[i]\n            i += 1\n        out.append(c * int(num))\n    return "".join(out)',
  };
} });

/* ---- 16. anagram against a fixed word ---- */
GEN.add({ id: 'anagram_of', topic: 'strings', variants: 76, make(r) {
  const word = r.pick(['listen', 'stone', 'earth', 'below', 'angel', 'dusty', 'night']);
  const sorted = (s) => s.toLowerCase().replace(/\s/g, '').split('').sort().join('');
  const f = (s) => sorted(s) === sorted(word);
  const shuffled = r.shuffle(word.split('')).join('');
  const cases = [shuffled, word.toUpperCase(), word + 'x', ''];
  return {
    title: `Anagram of "${word}"?`, rating: 1120,
    prompt: `Write \`is_anagram(s)\` returning \`True\` when \`s\` uses exactly the same letters as \`"${word}"\`. ` +
      'Ignore case and spaces.',
    mode: 'func', fn: 'is_anagram', starter: S('is_anagram', 's'),
    tests: cases.map((s) => ({ args: [s], expect: f(s) })),
    hints: ['Sorting the letters makes two anagrams identical.'],
    solution: `def is_anagram(s):\n    return sorted(s.lower().replace(" ", "")) == sorted("${word}")`,
  };
} });

/* ---- 17. character frequency dict ---- */
GEN.add({ id: 'char_freq_gen', topic: 'dicts', variants: 76, make(r) {
  const lettersOnly = r.bool(0.4);
  const f = (s) => {
    const d = {};
    for (const c of s.toLowerCase()) {
      if (lettersOnly && !/[a-z]/.test(c)) continue;
      d[c] = (d[c] || 0) + 1;
    }
    return d;
  };
  const cases = [r.word(), r.words(2).join(' '), ''];
  return {
    title: lettersOnly ? 'Letter frequency' : 'Character frequency', rating: lettersOnly ? 1160 : 1060,
    prompt: `Write \`freq(s)\` returning a dict mapping each ${lettersOnly ? 'letter' : 'character'} of the ` +
      `lowercased string to how often it appears.${lettersOnly ? ' Skip anything that is not a letter.' : ''}\n\n` +
      example('freq', [cases[0]], f(cases[0])),
    mode: 'func', fn: 'freq', starter: S('freq', 's'),
    tests: cases.map((s) => ({ args: [s], expect: f(s) })),
    hints: ['`d[c] = d.get(c, 0) + 1`', lettersOnly ? '`c.isalpha()` filters the rest out.' : '`collections.Counter` also works.'],
    solution: lettersOnly
      ? 'def freq(s):\n    d = {}\n    for c in s.lower():\n        if c.isalpha():\n            d[c] = d.get(c, 0) + 1\n    return d'
      : 'def freq(s):\n    d = {}\n    for c in s.lower():\n        d[c] = d.get(c, 0) + 1\n    return d',
  };
} });

/* ---- 18. first non-repeating character ---- */
GEN.add({ id: 'first_unique_char', topic: 'strings', variants: 76, make(r) {
  const wantIndex = r.bool(0.4);
  const f = (s) => {
    for (let i = 0; i < s.length; i++) if (s.indexOf(s[i]) === s.lastIndexOf(s[i])) return wantIndex ? i : s[i];
    return wantIndex ? -1 : '';
  };
  const cases = [r.word() + r.word(), 'aabbcc', 'leetcode', ''];
  return {
    title: wantIndex ? 'First unique character index' : 'First unique character', rating: 1360,
    prompt: `Write \`first_unique(s)\` returning ${wantIndex ? 'the index of' : ''} the first character that appears exactly once` +
      `, or \`${wantIndex ? '-1' : '""'}\` when every character repeats.\n\n${example('first_unique', ['leetcode'], f('leetcode'))}`,
    mode: 'func', fn: 'first_unique', starter: S('first_unique', 's'),
    tests: cases.map((s) => ({ args: [s], expect: f(s) })),
    hints: ['Count every character first, then scan the string in order.', 'Two passes beat checking each character against the whole string.'],
    solution: wantIndex
      ? 'from collections import Counter\n\n\ndef first_unique(s):\n    counts = Counter(s)\n    for i, c in enumerate(s):\n        if counts[c] == 1:\n            return i\n    return -1'
      : 'from collections import Counter\n\n\ndef first_unique(s):\n    counts = Counter(s)\n    for c in s:\n        if counts[c] == 1:\n            return c\n    return ""',
  };
} });

/* ---- 19. count a substring ---- */
GEN.add({ id: 'count_sub', topic: 'strings', variants: 76, make(r) {
  const sub = r.pick(['ab', 'aa', 'ana', 'oo', 'xy']);
  const overlap = r.bool(0.4);
  const f = (s) => {
    let c = 0;
    for (let i = 0; i + sub.length <= s.length; i++) {
      if (s.slice(i, i + sub.length) === sub) { c++; if (!overlap) i += sub.length - 1; }
    }
    return c;
  };
  const cases = [sub + sub + r.word(), 'banana', r.word(), ''];
  return {
    title: `Count "${sub}"${overlap ? ' (overlapping)' : ''}`, rating: overlap ? 1300 : 1000,
    prompt: `Write \`count_sub(s)\` returning how many times \`"${sub}"\` appears in \`s\`` +
      (overlap ? ', **counting overlaps** (so `"aaa"` contains `"aa"` twice)' : ', without overlapping') +
      `.\n\n${example('count_sub', ['banana'], f('banana'))}`,
    mode: 'func', fn: 'count_sub', starter: S('count_sub', 's'),
    tests: cases.map((s) => ({ args: [s], expect: f(s) })),
    hints: [overlap ? 'Slide a window one character at a time and compare slices.' : '`s.count(sub)` already skips overlaps.'],
    solution: overlap
      ? `def count_sub(s):\n    sub = "${sub}"\n    return sum(1 for i in range(len(s) - len(sub) + 1) if s[i:i + len(sub)] == sub)`
      : `def count_sub(s):\n    return s.count("${sub}")`,
  };
} });

/* ---- 20. remove duplicate characters ---- */
GEN.add({ id: 'dedupe_chars', topic: 'strings', variants: 76, make(r) {
  const adjacentOnly = r.bool(0.4);
  const f = adjacentOnly
    ? (s) => s.split('').filter((c, i) => c !== s[i - 1]).join('')
    : (s) => { const seen = new Set(); return s.split('').filter((c) => (seen.has(c) ? false : (seen.add(c), true))).join(''); };
  const cases = ['aabbccdd', r.word() + r.word(), 'abc', ''];
  return {
    title: adjacentOnly ? 'Squash repeated neighbours' : 'Remove duplicate characters', rating: adjacentOnly ? 1100 : 1170,
    prompt: adjacentOnly
      ? `Write \`squash(s)\` collapsing runs of the same character down to one.\n\n${example('squash', ['aabbccdd'], f('aabbccdd'))}`
      : `Write \`squash(s)\` keeping only the first occurrence of each character, order preserved.\n\n${example('squash', ['aabbccdd'], f('aabbccdd'))}`,
    mode: 'func', fn: 'squash', starter: S('squash', 's'),
    tests: cases.map((s) => ({ args: [s], expect: f(s) })),
    hints: [adjacentOnly ? 'Compare each character with the one you kept last.' : 'A `set` of characters you have already emitted.'],
    solution: adjacentOnly
      ? 'def squash(s):\n    out = []\n    for c in s:\n        if not out or out[-1] != c:\n            out.append(c)\n    return "".join(out)'
      : 'def squash(s):\n    seen = set()\n    out = []\n    for c in s:\n        if c not in seen:\n            seen.add(c)\n            out.append(c)\n    return "".join(out)',
  };
} });

/* ---- 21. hamming distance ---- */
GEN.add({ id: 'hamming', topic: 'strings', variants: 76, make(r) {
  const f = (a, b) => a.split('').filter((c, i) => c !== b[i]).length;
  const base = r.word();
  const other = base.split('').map((c) => (r.bool(0.3) ? r.pick('xyz'.split('')) : c)).join('');
  const cases = [[base, other], [base, base], ['abc', 'xyz']];
  return {
    title: 'Hamming distance', rating: 1080,
    prompt: 'Write `hamming(a, b)` counting the positions where two equal-length strings differ.\n\n' +
      example('hamming', ['karolin', 'kathrin'], 3),
    mode: 'func', fn: 'hamming', starter: S('hamming', 'a, b'),
    tests: [...cases, ['karolin', 'kathrin']].map((a) => ({ args: a, expect: f(...a) })),
    hints: ['`zip(a, b)` pairs the characters up.'],
    solution: 'def hamming(a, b):\n    return sum(1 for x, y in zip(a, b) if x != y)',
  };
} });

/* ---- 22. title case with small words ---- */
GEN.add({ id: 'title_case_small', topic: 'strings', variants: 76, make(r) {
  const small = r.sample(['a', 'an', 'the', 'of', 'and', 'in', 'on'], r.int(2, 4)).sort();
  const f = (s) => s.toLowerCase().split(/\s+/).filter(Boolean)
    .map((w, i) => (i > 0 && small.includes(w) ? w : cap(w))).join(' ');
  const cases = ['the lord of the rings', r.words(3).join(' '), small[0], ''];
  return {
    title: 'Title case with small words', rating: 1380,
    prompt: `Write \`titleize(s)\` capitalising each word, except that ${small.map((w) => `\`"${w}"\``).join(', ')} ` +
      'stay lowercase unless they are the first word. Input may be any case; output is single-spaced.\n\n' +
      example('titleize', ['the lord of the rings'], f('the lord of the rings')),
    mode: 'func', fn: 'titleize', starter: S('titleize', 's'),
    tests: cases.map((s) => ({ args: [s], expect: f(s) })),
    hints: ['Lowercase everything first, then decide word by word.', '`enumerate` tells you which word is first.'],
    solution: `def titleize(s):\n    small = ${py(small)}\n    words = s.lower().split()\n    out = []\n    for i, w in enumerate(words):\n        out.append(w if i > 0 and w in small else w.capitalize())\n    return " ".join(out)`,
  };
} });

/* ---- 23. validate a format ---- */
GEN.add({ id: 'validate_code', topic: 'strings', variants: 76, make(r) {
  const letters = r.int(2, 3), digits = r.int(3, 4);
  const f = (s) => s.length === letters + digits &&
    /^[A-Z]+$/.test(s.slice(0, letters)) && /^[0-9]+$/.test(s.slice(letters));
  const good = 'ABCDEFG'.slice(0, letters) + '1234567'.slice(0, digits);
  const cases = [good, good.toLowerCase(), good.slice(1), 'X'.repeat(letters + digits)];
  return {
    title: `Validate ${letters} letters + ${digits} digits`, rating: 1230,
    prompt: `A code is valid when it is exactly ${letters} uppercase letters followed by ${digits} digits, ` +
      `and nothing else. Write \`valid(s)\` returning \`True\` or \`False\`.\n\n${example('valid', [good], true)}`,
    mode: 'func', fn: 'valid', starter: S('valid', 's'),
    tests: cases.map((s) => ({ args: [s], expect: f(s) })),
    hints: ['Check the length first, then the two halves separately.',
            '`part.isupper() and part.isalpha()`, and `part.isdigit()`.'],
    solution: `def valid(s):\n    if len(s) != ${letters + digits}:\n        return False\n    head, tail = s[:${letters}], s[${letters}:]\n    return head.isalpha() and head.isupper() and tail.isdigit()`,
  };
} });

/* ---- 24. acronym / abbreviation ---- */
GEN.add({ id: 'acronym', topic: 'strings', variants: 76, make(r) {
  const sep = r.pick([' ', '-', '_']);
  const f = (s) => s.split(new RegExp(`[${sep === '-' ? '\\-' : sep}]+`)).filter(Boolean)
    .map((w) => w[0].toUpperCase()).join('');
  const cases = [r.words(3).join(sep), r.word(), '', r.words(2).join(sep + sep)];
  return {
    title: `Acronym from "${sep === ' ' ? 'spaces' : sep}"-separated words`, rating: 1200,
    prompt: `Write \`acronym(s)\` returning the first letter of each part of \`s\` (split on \`${py(sep)}\`), ` +
      `capitalised and joined. Empty parts are skipped.\n\n${example('acronym', [cases[0]], f(cases[0]))}`,
    mode: 'func', fn: 'acronym', starter: S('acronym', 's'),
    tests: cases.map((s) => ({ args: [s], expect: f(s) })),
    hints: [`\`s.split(${py(sep)})\` then take \`w[0]\` from each non-empty part.`],
    solution: `def acronym(s):\n    return "".join(w[0].upper() for w in s.split(${py(sep)}) if w)`,
  };
} });

/* ---- 25. longest run of one character ---- */
GEN.add({ id: 'longest_run', topic: 'strings', variants: 76, make(r) {
  const wantChar = r.bool(0.4);
  const f = (s) => {
    let best = 0, bestC = '', cur = 0;
    for (let i = 0; i < s.length; i++) {
      cur = i && s[i] === s[i - 1] ? cur + 1 : 1;
      if (cur > best) { best = cur; bestC = s[i]; }
    }
    return wantChar ? bestC : best;
  };
  const cases = ['aaabbbbcc', r.word() + r.word(), 'a', ''];
  return {
    title: wantChar ? 'Character of the longest run' : 'Longest run length', rating: 1290,
    prompt: `Write \`longest_run(s)\` returning ${wantChar
      ? 'the character with the longest unbroken run (the earliest one on a tie), or `""` for an empty string'
      : 'the length of the longest unbroken run of the same character (`0` for an empty string)'}.\n\n` +
      example('longest_run', ['aaabbbbcc'], f('aaabbbbcc')),
    mode: 'func', fn: 'longest_run', starter: S('longest_run', 's'),
    tests: cases.map((s) => ({ args: [s], expect: f(s) })),
    hints: ['Track the current run length as you walk the string.', 'Reset the counter whenever the character changes.'],
    solution: wantChar
      ? 'def longest_run(s):\n    best = cur = 0\n    best_char = ""\n    prev = None\n    for c in s:\n        cur = cur + 1 if c == prev else 1\n        if cur > best:\n            best, best_char = cur, c\n        prev = c\n    return best_char'
      : 'def longest_run(s):\n    best = cur = 0\n    prev = None\n    for c in s:\n        cur = cur + 1 if c == prev else 1\n        best = max(best, cur)\n        prev = c\n    return best',
  };
} });

/* ---- 26. format a record ---- */
GEN.add({ id: 'format_record', topic: 'strings', variants: 76, make(r) {
  const dp = r.int(1, 3);
  const label = r.pick(['Total', 'Score', 'Balance', 'Weight', 'Price']);
  const f = (name, value) => `${name}: ${value.toFixed(dp)}`;
  const cases = [[r.name(), r.float(1, 200)], [r.name(), 0], [r.name(), r.float(1000, 5000)]];
  return {
    title: `Format to ${dp} decimal place${dp > 1 ? 's' : ''}`, rating: 1000,
    prompt: `Write \`line(name, value)\` returning \`"NAME: VALUE"\` with the value shown to exactly ${dp} decimal place${dp > 1 ? 's' : ''}.\n\n` +
      example('line', ['Ada', 3.14159], f('Ada', 3.14159)),
    mode: 'func', fn: 'line', starter: S('line', 'name, value'),
    tests: [...cases, ['Ada', 3.14159]].map((a) => ({ args: a, expect: f(...a) })),
    hints: [`f-strings take a format spec: \`f"{value:.${dp}f}"\`.`],
    solution: `def line(name, value):\n    return f"{name}: {value:.${dp}f}"`,
  };
} });
})();
