# PyQuiz

Practice Python coding questions in the browser. Real Python runs on your
device (Pyodide/WebAssembly), tests grade your answer, and your level moves
in small steps after every attempt.

**Play:** https://joelllllln.github.io/pythonquiza/

No build step, no server. It is plain HTML/CSS/JS — open `index.html` and it
works.

## What it does

- **84 questions**, levels 6.8 to 22.5, across 17 topics.
- **Fine-grained difficulty.** Every question and every player carries an
  Elo-style rating. A solve or a fail moves you a few hundredths of a level
  at a time, and the next question is drawn near wherever you now sit. The
  slider lets you aim easier or harder in 0.1-level steps.
- **A real Python terminal.** Pyodide runs CPython 3.12 in a Web Worker, so
  an infinite loop gets killed after 10 seconds instead of freezing the page.
- **Automatic grading.** Function questions call your function with real
  arguments and compare the return value; program questions feed `input()`
  and compare what you printed. Failures show expected vs. got.
- **Progress tracking.** Attempts, pass/fail, time taken, hints used, level
  history, per-topic accuracy, current and best streak.
- **Weak-topic targeting.** Topics you are under 60% on come up more often.
- **Google sign-in** (optional, see below) so the same progress follows you
  to your phone, laptop and tablet.

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
js/questions.js       question bank, part 1
js/questions_extra.js question bank, part 2
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
2250 ≈ hard interview question) — it is displayed as `rating / 100`.

## Tests

```bash
python3 tools/validate.py      # every reference solution passes its own tests
cd tools && python3 test_grader.py   # the grader rejects wrong answers
```

`validate.py` lifts the grading harness straight out of `js/py-worker.js`, so
it checks the code that actually ships.
