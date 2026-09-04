# PyQuiz

Practice Python coding questions in the browser. Real Python runs on your
device (Pyodide/WebAssembly), tests grade your answer, and your level moves
in small steps after every attempt.

**Play:** https://joelllllln.github.io/pythonquiza/

No build step, no server. It is plain HTML/CSS/JS — open `index.html` and it
works.

## What it does

- **10,239 questions**, levels 6.8 to 26.2, across 32 topics — 207 written by
  hand (including a 123-question interview set) and the rest generated from
  132 parameterised templates.
- **Fine-grained difficulty.** Every question and every player carries an
  Elo-style rating. A solve or a fail moves you a few hundredths of a level
  at a time, and the next question is drawn near wherever you now sit. The
  slider lets you aim easier or harder in 0.1-level steps.
- **A real Python terminal.** Pyodide runs CPython 3.12 in a Web Worker, so
  an infinite loop gets killed after 10 seconds instead of freezing the page.
- **Automatic grading.** Function questions call your function with real
  arguments and compare the return value; program questions feed `input()`
  and compare what you printed. Linked-list, tree and design questions get
  their node classes prepared for them and are graded on the structure they
  return. Failures show expected vs. got.
- **Progress tracking.** Attempts, pass/fail, time taken, hints used, level
  history, per-topic accuracy, current and best streak.
- **Weak-topic targeting.** Topics you are under 60% on come up more often.
- **Google sign-in** (optional, see below) so the same progress follows you
  to your phone, laptop and tablet.

## Where the questions come from

Two sources, both graded identically:

**Hand-written (207).** `js/questions.js` and `js/questions_extra.js` hold the
teaching set — basics through intermediate. `js/questions_leet.js` and
`js/questions_leet2.js` hold 123 interview-style problems: two pointers,
sliding windows, monotonic stacks, binary search on the answer, linked lists,
trees and BSTs, tries, graphs, backtracking and dynamic programming, up to
Lv 26.2 (regex matching, median of two sorted arrays, maximum path sum).

**Generated (10,032).** Ten thousand hand-written questions is not a thing
anyone should do, so most of the bank comes from 132 parameterised templates
in `js/gen_*.js`. Each template knows a family of related problems, and a
seeded PRNG turns `(template, index)` into one specific question — the same
one, every time, on every device. The numbers, data, wording and often the
whole task differ between variants: one `list_stat` variant asks for the
mean, another for the product; one `slice_str` variant wants the first `n`
characters, another every `n`th. They are drills, and they are what makes the
difficulty ladder dense enough to climb one small step at a time.

Every one of the 10,239 is checked by `tools/validate.py` before it ships.

## Playing without setup

It works immediately. Progress is stored in that browser's `localStorage`.
No account, no sync.

## Turning on Google sign-in and cross-device sync (~5 minutes)

1. Go to https://console.firebase.google.com and **Add project** (free Spark
   plan is plenty).
2. **Build → Authentication → Get started → Google → Enable**, then save.
3. **Build → Firestore Database → Create database** → production mode, pick a
   region.
4. Open the **Rules** tab and paste the contents of [`firestore.rules`](firestore.rules),
   then **Publish**. This is what stops one player reading another's data.
5. **Project settings → Your apps → Web (`</>`)** → register the app. Copy the
   `apiKey`, `authDomain`, `projectId` and `appId` values into
   [`js/config.js`](js/config.js).
6. **Authentication → Settings → Authorized domains → Add domain** and add
   `joelllllln.github.io` (plus `localhost` for local testing).

Commit and push, and the sign-in button starts working. The API key in
`config.js` is public by design — Firebase keys identify the project, they do
not grant access; the security rules do that.

## Hosting

GitHub Pages serves it as-is: **Settings → Pages → Source: Deploy from a
branch → `main` / root**. Any static host works too — there is nothing to
build.

## Layout

```
index.html            page shell
css/styles.css        all styling (dark, responsive, phone-friendly)
js/config.js          Firebase keys (empty = local-only mode)
js/questions*.js      hand-written questions, including the interview set
js/gen_core.js        seeded PRNG and the template registry
js/gen_*.js           132 question templates (numbers, strings, lists,
                      dicts, matrices, misc)
js/bank.js            the index, and rebuilding a question from its id
js/rating.js          Elo difficulty engine and question picker
js/py-worker.js       Pyodide worker + the Python grading harness
js/runner.js          main-thread wrapper with the 10s timeout
js/store.js           progress model, localStorage, Firestore sync
js/app.js             UI, question flow, stats, bank
firestore.rules       per-user database security rules
tools/                validators (see below)
```

## Adding a question

Append an object to `window.QUESTIONS` in `js/questions_extra.js`:

```js
{
  id:'my_question', title:'Short name', topic:'lists', rating:1150,
  prompt:'Write `thing(xs)` that ...',
  mode:'func', fn:'thing', starter:'def thing(xs):\n    ',
  tests:[{args:[[1,2]], expect:3}],
  hints:['First nudge.', 'Bigger nudge.'],
  solution:'def thing(xs):\n    return sum(xs)'
}
```

`mode:'stdout'` questions run the whole file instead: give
`tests:[{stdin:['3'], expect:'printed text'}]`.

`cmp` on a test loosens the comparison: `'approx'` for floats, `'set'` or
`'sorted'` when order should not matter.

Rating is the difficulty on the Elo scale (700 ≈ absolute beginner,
2600 ≈ hard interview question) — it is displayed as `rating / 100`.

`setup` holds Python run before the player's code (this is how `TreeNode` and
`ListNode` get defined); a test's `args_py` builds its arguments with those
helpers, and `wrap` converts what the function returned before comparing —
`'_dump(_r)'` turns a returned tree back into a list.

## Adding a generator

Append a template in one of the `js/gen_*.js` files:

```js
GEN.add({
  id: 'my_template', topic: 'lists', variants: 76,
  make(r) {                       // r is the seeded Rng
    const k = r.int(2, 9);
    const data = r.ints(6, 1, 20);
    return {
      title: `Multiples of ${k}`, rating: 900 + k * 10,
      prompt: `Write \`keep(nums)\` returning the multiples of ${k}.`,
      mode: 'func', fn: 'keep', starter: 'def keep(nums):\n    ',
      tests: [{ args: [data], expect: data.filter((n) => n % k === 0) }],
      hints: [`\`n % ${k} == 0\``],
      solution: `def keep(nums):\n    return [n for n in nums if n % ${k} == 0]`,
    };
  },
});
```

Expected values are computed in JavaScript, so anything where Python differs
(floor division and modulo on negatives, `round`'s banker's rounding,
`str.center`'s padding bias, `.1f` formatting on an exact tie) has to be
mirrored carefully — `tools/validate.py` runs every variant through real
CPython and will tell you when you got it wrong.

## Tests

```bash
python3 tools/validate.py              # all 10,239 — takes a few minutes
python3 tools/validate.py --stride 10  # every 10th variant, much faster
python3 tools/validate.py --only lc_   # just the interview set
cd tools && python3 test_grader.py     # the grader rejects wrong answers
```

`validate.py` lifts the grading harness straight out of `js/py-worker.js`, so
it checks the code that actually ships. It also `node --check`s every
JavaScript file, expands the whole bank, and reports schema problems,
duplicate ids and any reference solution that fails its own tests.
