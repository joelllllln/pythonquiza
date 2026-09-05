/* App shell: question flow, code running, stats, bank, auth. */

import { Runner } from './runner.js';
import { Store } from './store.js';
import { buildIndex, getQuestion, templateCount, handwrittenCount } from './bank.js';
import { firebaseEnabled } from './config.js';
import {
  START_RATING, levelStr, parSeconds, pickQuestion, feedbackAdjust,
  signature, updatePlayer, updateQuestion, weakTopics,
} from './rating.js';

const $ = (id) => document.getElementById(id);

// The light index: one small record per question. Full questions — prompt,
// tests, solution — are rebuilt from their id on demand.
const INDEX = buildIndex();
const BANK_ROWS_SHOWN = 300;

const store = new Store(render);
const runner = new Runner(onRunnerStatus);

let editor = null;
let q = null;              // current question
let session = null;        // {startedAt, failedSubmits, hints, submitted}
let tick = null;
let pyReady = false;

/* ---------------- boot ---------------- */

/** Phones get a different editor: it grows with the code and the page
 *  scrolls, rather than a small box with its own scrollbar inside a
 *  scrolling page — two nested scrollers are miserable on a touch screen. */
const touch = window.matchMedia('(max-width: 959px), (pointer: coarse)').matches;

function boot() {
  editor = CodeMirror.fromTextArea($('editor'), {
    mode: 'python',
    theme: 'default',
    lineNumbers: true,
    indentUnit: 4,
    tabSize: 4,
    indentWithTabs: false,
    autoCloseBrackets: true,
    // Wrapping means there is never a horizontal scrollbar to misplace, and
    // no sideways scrolling on a phone.
    lineWrapping: true,
    // contenteditable is much better than a hidden textarea for placing the
    // caret and dragging a selection on iOS.
    inputStyle: touch ? 'contenteditable' : 'textarea',
    viewportMargin: touch ? Infinity : 20,
    // Ctrl/Cmd+Enter is handled on the document instead, so it still works
    // once focus has moved to the Next button.
    extraKeys: { Tab: (cm) => cm.replaceSelection('    ') },
  });
  // iOS autocorrect fights with code: it capitalises keywords and swaps
  // quotes for smart ones.
  const input = editor.getInputField();
  input.setAttribute('autocorrect', 'off');
  input.setAttribute('autocapitalize', 'off');
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('spellcheck', 'false');

  editor.on('change', () => { if (q) store.draft(q.id, editor.getValue()); });

  wireUI();
  store.init().then(() => { render(); showBanner(); });
  buildTopicFilter();

  $('diff-slider').value = store.progress.offset || 0;
  paintSliderLabel();

  if (!store.progress.calibrated && store.progress.attempts === 0) askLevel();
  else nextQuestion();
  render();
}

/* ---------------- picking a starting level ---------------- */

/** First run: ask instead of guessing, so the first question is not a lottery. */
function askLevel() {
  $('calibrate').classList.remove('hidden');
}

function setLevel(rating) {
  store.progress.rating = rating;
  store.progress.calibrated = true;
  store.progress.curve.push({ at: Date.now(), rating });
  store.save();
  $('calibrate').classList.add('hidden');
  nextQuestion();
  render();
}

function wireUI() {
  document.querySelectorAll('.tab').forEach((b) => {
    b.onclick = () => {
      document.querySelectorAll('.tab').forEach((x) => x.classList.toggle('on', x === b));
      for (const v of ['practice', 'stats', 'bank']) {
        $('view-' + v).classList.toggle('hidden', v !== b.dataset.view);
      }
      if (b.dataset.view === 'stats') renderStats();
      if (b.dataset.view === 'bank') renderBank();
      // CodeMirror does not lay out while it is hidden, so it comes back
      // showing whatever it last painted. Nudge it once it is visible.
      if (b.dataset.view === 'practice') editor.refresh();
    };
  });

  $('run').onclick = doRun;
  $('submit').onclick = doSubmit;
  $('skip').onclick = () => { endSession(false); nextQuestion(); };
  $('next').onclick = () => { nextQuestion(); };
  $('reset-code').onclick = () => { editor.setValue(q.starter || ''); editor.focus(); };
  $('show-sol').onclick = showSolution;
  $('hint-btn').onclick = showHint;
  $('big-hint').onclick = showBigHint;
  $('reveal').onclick = revealAnswer;

  // The slider is only useful if it does something now: dragging it re-picks
  // the question straight away, unless you have already solved this one.
  $('diff-slider').oninput = paintSliderLabel;
  $('diff-slider').onchange = () => {
    store.progress.offset = Number($('diff-slider').value || 0);
    store.save();
    if (!session || !session.done) {
      nextQuestion();
      toast(`Aiming at Lv ${levelStr(target())}`);
    }
  };

  $('too-easy').onclick = () => rateDifficulty(false);
  $('too-hard').onclick = () => rateDifficulty(true);

  document.querySelectorAll('.lvl').forEach((b) => {
    b.onclick = () => setLevel(Number(b.dataset.rating));
  });
  $('cal-skip').onclick = () => setLevel(START_RATING);
  $('recalibrate').onclick = () => {
    $('calibrate').classList.remove('hidden');
    document.querySelector('.tab[data-view="practice"]').click();
  };

  $('signin').onclick = async () => {
    try { await store.signIn(); }
    catch (e) { alert('Sign-in failed: ' + (e.message || e)); }
  };
  $('signout').onclick = () => store.signOut();

  $('export').onclick = () => {
    const blob = new Blob([JSON.stringify(store.progress, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'pyquiz-progress.json';
    a.click();
  };
  $('reset-progress').onclick = () => {
    if (!confirm('Erase all progress on this account?')) return;
    store.reset();
    $('diff-slider').value = 0;
    paintSliderLabel();
    renderStats();
    render();
    askLevel();
    document.querySelector('.tab[data-view="practice"]').click();
  };

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter'
        && !document.getElementById('view-practice').classList.contains('hidden')
        && $('calibrate').classList.contains('hidden')) {
      e.preventDefault();
      submitOrNext();
    }
  });

  $('bank-search').oninput = renderBank;
  $('bank-topic').onchange = renderBank;
  $('bank-state').onchange = renderBank;
}

function onRunnerStatus(kind, msg) {
  const out = $('output');
  const showingError = out.classList.contains('err');
  if (kind === 'ready') {
    pyReady = true;
    if (showingError) $('run-status').textContent = 'Python restarted';
    else { out.textContent = 'Python ready. Write your code and hit Run.'; $('run-status').textContent = ''; }
  } else if (kind === 'loading') {
    pyReady = false;
    if (!showingError) out.textContent = msg || 'Loading Python…';
  } else if (kind === 'restarting') {
    pyReady = false;
  } else if (kind === 'fatal') {
    pyReady = false;
    $('output').textContent = 'Could not start Python: ' + msg;
    $('output').classList.add('err');
  }
}

function showBanner() {
  const b = $('banner');
  if (!firebaseEnabled) {
    b.className = 'banner';
    b.innerHTML = 'Progress is saved in this browser only. Add a Firebase project in <code>js/config.js</code> to sign in with Google and sync every device — see the README.';
    b.classList.remove('hidden');
  }
}

/* ---------------- question flow ---------------- */

function target() {
  return store.progress.rating + Number($('diff-slider').value || 0);
}

function paintSliderLabel() {
  const v = Number($('diff-slider').value || 0);
  $('diff-val').textContent = (v >= 0 ? '+' : '') + (v / 100).toFixed(1);
  updateTargetLabel();
}

function updateTargetLabel() {
  $('target-label').textContent =
    `you: Lv ${levelStr(store.progress.rating)} · aiming at Lv ${levelStr(target())}`;
}

/** A short message that fades itself out. */
let toastTimer = null;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 2600);
}

/**
 * "Too easy" / "too hard" on the question in front of you: move the level,
 * remember not to show this one again for a while, and hand over a new
 * question at the corrected level immediately.
 */
function rateDifficulty(tooHard) {
  const p = store.progress;
  const st = p.byQuestion[q.id];
  const qRating = st && st.rating ? st.rating : q.rating;
  const { rating, delta } = feedbackAdjust(p.rating, qRating, tooHard, p.feedback);

  p.rating = rating;
  p.feedback += 1;
  p.curve.push({ at: Date.now(), rating });
  p.byQuestion[q.id] = {
    attempts: 0, solved: false, bestSecs: null, rating: qRating,
    ...(st || {}), lastAt: Date.now(), feedback: tooHard ? 'hard' : 'easy',
  };
  // Nudge the question itself the other way, so the bank calibrates too.
  p.byQuestion[q.id].rating = updateQuestion(qRating, rating, tooHard ? 0 : 1);
  store.save();

  session.done = true;   // this one no longer counts as attempted
  clearInterval(tick);
  nextQuestion();
  toast(`${tooHard ? 'Easier' : 'Harder'} it is — you are now Lv ${levelStr(rating)} ` +
        `(${delta >= 0 ? '+' : ''}${(delta / 100).toFixed(2)})`);
  render();
}

function nextQuestion(forcedId) {
  endSession(false);
  const chosen = forcedId
    ? getQuestion(forcedId)
    : getQuestion(pickQuestion(INDEX, store.progress, { target: target(), excludeId: q && q.id }).id);
  q = chosen;
  rememberShown(q);
  session = { startedAt: Date.now(), failedSubmits: 0, hints: 0, shown: 0,
              bigHint: false, submitted: false, solved: false, done: false };

  const st = store.progress.byQuestion[q.id];
  const shownRating = st && st.rating ? st.rating : q.rating;

  $('q-title').textContent = q.title;
  $('q-topic').textContent = q.topic;
  $('q-diff').textContent = 'Lv ' + levelStr(shownRating);
  $('q-body').innerHTML = md(q.prompt);
  $('q-tests').innerHTML = renderTests(q);
  $('hint-box').innerHTML = '';
  $('hint-box').classList.add('hidden');
  $('hint-btn').disabled = !(q.hints && q.hints.length);
  $('hint-btn').textContent = 'Hint';
  $('big-hint').disabled = false;
  $('big-hint').textContent = 'Big hint';
  $('output').textContent = pyReady ? 'Ready.' : 'Loading Python…';
  $('output').classList.remove('err');
  $('results').innerHTML = '';
  $('next-row').classList.add('hidden');
  $('run-status').textContent = '';

  editor.setValue(store.draft(q.id) || q.starter || '');
  editor.clearHistory();
  editor.refresh();
  updateTargetLabel();
  startTimer();
  if (!touch) editor.focus();
  document.getElementById('view-practice').scrollTop = 0;
}

/** The checks your answer will be run against — no surprises at submit time. */
function renderTests(question) {
  const all = question.tests || [];
  if (!all.length) return '';
  const head = '<div class="tests-head">Checked against</div>';

  // A program's expected output is usually several lines, so give it room
  // rather than truncating it to something meaningless.
  if (question.mode === 'stdout') {
    const rows = all.slice(0, 3).map((t) => {
      const input = (t.stdin || []).join(' ⏎ ');
      return `<div class="ttest">
        <div class="dim">${input ? 'input: ' + esc(clip(input, 60)) : 'no input'}</div>
        <pre>${esc(clip(t.expect, 240))}</pre>
      </div>`;
    }).join('');
    return head + rows + more(all.length - Math.min(3, all.length));
  }

  const rows = all.slice(0, 6).map((t) => {
    const call = t.args_py
      ? `${question.fn}(${t.args_py.join(', ')})`
      : `${question.fn}(${(t.args || []).map(window.py).join(', ')})`;
    return `<div class="trow-test"><span>${esc(clip(call, 80))}</span>` +
           `<span class="dim">→ ${esc(clip(window.py(t.expect), 60))}</span></div>`;
  }).join('');
  return head + rows + more(all.length - Math.min(6, all.length));
}

const more = (n) => (n > 0 ? `<div class="dim tiny">and ${n} more</div>` : '');

const clip = (s, n) => (String(s).length > n ? String(s).slice(0, n - 1) + '…' : String(s));

/** Keep a short memory of what has been on screen, so it does not recur. */
function rememberShown(question) {
  const p = store.progress;
  p.recent = (p.recent || []).filter((sig) => sig !== signature(question));
  p.recent.push(signature(question));
  if (p.recent.length > 60) p.recent = p.recent.slice(-60);
  store.save();
}

function startTimer() {
  clearInterval(tick);
  const paint = () => {
    const s = Math.floor((Date.now() - session.startedAt) / 1000);
    $('q-timer').textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };
  paint();
  tick = setInterval(paint, 1000);
}

function elapsed() { return Math.round((Date.now() - session.startedAt) / 1000); }

function addHint(html) {
  const box = $('hint-box');
  const d = document.createElement('div');
  d.innerHTML = html;
  box.appendChild(d);
  box.classList.remove('hidden');
}

/** A nudge. Costs a little rating; there are one to three per question. */
function showHint() {
  const hints = q.hints || [];
  if (session.shown >= hints.length) return;
  addHint(md(hints[session.shown]));
  session.shown++;
  session.hints++;
  $('hint-btn').textContent = session.shown < hints.length ? `Hint ${session.shown + 1}` : 'No more hints';
  $('hint-btn').disabled = session.shown >= hints.length;
}

/**
 * Most of the answer, one step short of giving it away: the opening lines of
 * the model answer, or — when it is only two or three lines long — the whole
 * shape with the key expression blanked out. Costs as much as two hints.
 */
function bigHintFor(question) {
  const lines = String(question.solution || '').replace(/\s+$/, '').split('\n');
  if (lines.length <= 3) {
    const last = lines[lines.length - 1];
    const m = last.match(/^(\s*)(return |[a-zA-Z_][\w.]* = )(.+)$/);
    if (m) {
      return {
        text: [...lines.slice(0, -1), m[1] + m[2] + '_____'].join('\n'),
        note: 'The shape of the answer. Work out what belongs in the blank.',
      };
    }
  }
  const keep = Math.max(2, Math.ceil(lines.length / 2));
  return {
    text: lines.slice(0, keep).join('\n') + '\n    …',
    note: 'How the model answer starts. Carry it on from there.',
  };
}

function showBigHint() {
  if (session.bigHint) return;
  const { text, note } = bigHintFor(q);
  addHint(`${esc(note)}<pre>${esc(text)}</pre>`);
  session.bigHint = true;
  session.hints += 2;
  $('big-hint').disabled = true;
  $('big-hint').textContent = 'Big hint shown';
}

/** The whole model answer, on demand. Counts the question as a miss. */
function revealAnswer() {
  if (!session.done) {
    session.submitted = true;   // asking for the answer settles the question
    endSession(false);
  }
  showSolution();
  toast('Answer shown — counted as a miss');
  render();
}

function showSolution() {
  if (!session.done) endSession(false);
  $('results').innerHTML =
    `<div class="verdict fail">Model answer</div><pre class="out">${esc(q.solution)}</pre>`;
  $('next-row').classList.remove('hidden');
}

/**
 * Run, without grading. For a program question that means running it on the
 * first example's input. For a function question it means actually calling
 * your function on the first example — running the file alone would just
 * define the function and print nothing, which is what it used to do.
 */
async function doRun() {
  if (!(await ensurePy())) return;
  busy(true, 'running…');
  const first = (q.tests || [])[0];
  const out = $('output');

  if (q.mode === 'stdout' || !first) {
    const r = await runner.run(editor.getValue(),
      { mode: 'plain', stdin: (first && first.stdin) || [], setup: q.setup });
    busy(false);
    out.classList.toggle('err', Boolean(r.error));
    out.textContent = r.error || r.stdout || '(no output)';
    $('run-status').textContent = r.error ? '' : 'first example’s input · not graded';
    return;
  }

  const r = await runner.run(editor.getValue(),
    { mode: 'func', fn: q.fn, tests: [first], cmp: q.cmp || '', setup: q.setup, wrap: q.wrap });
  busy(false);
  const row = r.results && r.results[0];
  out.classList.toggle('err', Boolean(r.error || (row && row.error)));
  if (r.error) out.textContent = r.error;
  else if (!row) out.textContent = r.stdout || '(no output)';
  else if (row.error) out.textContent = row.error;
  else out.textContent = (r.stdout ? r.stdout.replace(/\n?$/, '\n') : '') +
    `${row.name}\n→ ${row.got}` + (row.pass ? '' : `\n  expected ${row.expected}`);
  $('run-status').textContent = 'one example · not graded';
}

function submitOrNext() {
  if (session && session.solved) nextQuestion();
  else doSubmit();
}

async function doSubmit() {
  if (!(await ensurePy())) return;
  busy(true, 'checking…');
  const spec = q.mode === 'stdout'
    ? { mode: 'stdout', tests: q.tests, setup: q.setup }
    : { mode: 'func', fn: q.fn, tests: q.tests, cmp: q.cmp || '', setup: q.setup, wrap: q.wrap };
  const r = await runner.run(editor.getValue(), spec);
  busy(false);
  session.submitted = true;

  const out = $('output');
  out.classList.toggle('err', Boolean(r.error));
  out.textContent = r.error ? r.error : (r.stdout || '(no output)');

  if (r.error) {
    session.failedSubmits++;
    $('results').innerHTML = '<div class="verdict fail">Your code did not run</div>';
    return;
  }

  const passed = r.results.filter((t) => t.pass).length;
  const allPass = passed === r.results.length && r.results.length > 0;
  renderCases(r.results, passed, allPass);

  if (allPass) {
    session.solved = true;
    const moved = endSession(true);
    if (moved) {
      const sign = moved.delta >= 0 ? '+' : '';
      const v = $('results').querySelector('.verdict');
      if (v) v.textContent += `  ·  ${sign}${(moved.delta / 100).toFixed(2)} → Lv ${levelStr(moved.rating)}`;
    }
    $('next-row').classList.remove('hidden');
    $('next').focus();
  } else {
    session.failedSubmits++;
  }
}

function renderCases(rows, passed, allPass) {
  const head = `<div class="verdict ${allPass ? 'pass' : 'fail'}">` +
    (allPass ? `All ${rows.length} tests passed` : `${passed} / ${rows.length} tests passed`) + '</div>';
  const body = rows.map((t) => `
    <div class="tcase ${t.pass ? 'pass' : 'fail'}">
      <span class="mark">${t.pass ? '✓' : '✗'}</span>
      <div class="body">
        <div class="mono">${esc(t.name)}</div>
        ${t.pass ? '' : `<pre>expected: ${esc(t.expected)}\ngot:      ${esc(t.got)}</pre>`}
        ${t.error ? `<pre>${esc(t.error)}</pre>` : ''}
      </div>
    </div>`).join('');
  $('results').innerHTML = head + body;
}

/** Close out the current question and fold the result into the player's rating. */
function endSession(solved) {
  if (!session || session.done) return;
  // Leaving a question you never submitted to costs nothing.
  if (!solved && !session.submitted) { clearInterval(tick); return; }

  session.done = true;
  clearInterval(tick);

  const p = store.progress;
  const secs = elapsed();
  const before = p.rating;
  const { rating, delta, score } = updatePlayer(
    before, q, { solved, failedSubmits: session.failedSubmits, hints: session.hints, secs }, p.attempts);

  p.rating = rating;
  p.attempts += 1;
  if (solved) { p.solved += 1; p.streak += 1; p.bestStreak = Math.max(p.bestStreak, p.streak); }
  else p.streak = 0;

  const t = p.byTopic[q.topic] || { attempts: 0, solved: 0, secs: 0 };
  t.attempts += 1; t.solved += solved ? 1 : 0; t.secs += secs;
  p.byTopic[q.topic] = t;

  const s = p.byQuestion[q.id] || { attempts: 0, solved: false, bestSecs: null, rating: q.rating };
  s.attempts += 1;
  s.solved = s.solved || solved;
  if (solved && (s.bestSecs == null || secs < s.bestSecs)) s.bestSecs = secs;
  s.lastAt = Date.now();
  s.rating = updateQuestion(s.rating || q.rating, before, score);
  p.byQuestion[q.id] = s;

  p.history.push({ qid: q.id, title: q.title, topic: q.topic, ok: solved, secs,
                   at: Date.now(), rating, delta });
  p.curve.push({ at: Date.now(), rating });

  store.save();
  flashDelta(delta);
  return { rating, delta };
}

function flashDelta(delta) {
  const chip = $('level-chip');
  const sign = delta >= 0 ? '+' : '';
  chip.textContent = `Lv ${levelStr(store.progress.rating)}  ${sign}${(delta / 100).toFixed(2)}`;
  chip.style.color = delta >= 0 ? 'var(--ok)' : 'var(--bad)';
  setTimeout(() => { chip.style.color = ''; render(); }, 2600);
}

async function ensurePy() {
  if (pyReady) return true;
  $('output').textContent = 'Python is still loading — one moment…';
  const ok = await runner.whenReady();
  if (!ok) { $('output').textContent = 'Python failed to load. Check your connection and reload.'; }
  return ok;
}

function busy(on, label) {
  $('run').disabled = on; $('submit').disabled = on;
  $('run-status').textContent = on ? (label || '…') : '';
}

/* ---------------- header / stats / bank ---------------- */

function render() {
  const p = store.progress;
  $('level-chip').textContent = 'Lv ' + levelStr(p.rating);
  const u = store.user;
  $('signin').classList.toggle('hidden', Boolean(u) || !firebaseEnabled);
  $('account').classList.toggle('hidden', !u);
  if (u) {
    $('avatar').src = u.photo || '';
    $('avatar').title = u.name || u.email || '';
  }
  if (Number($('diff-slider').value) !== (store.progress.offset || 0)) {
    $('diff-slider').value = store.progress.offset || 0;
    paintSliderLabel();
  }
  updateTargetLabel();
}

function renderStats() {
  const p = store.progress;
  const acc = p.attempts ? Math.round((p.solved / p.attempts) * 100) : 0;
  const times = p.history.filter((h) => h.ok).map((h) => h.secs).sort((a, b) => a - b);
  const med = times.length ? times[Math.floor(times.length / 2)] : 0;

  $('s-level').textContent = levelStr(p.rating);
  $('s-acc').textContent = p.attempts ? acc + '%' : '—';
  $('s-streak').textContent = p.streak + (p.bestStreak ? ` / ${p.bestStreak}` : '');
  $('s-solved').textContent = p.solved;
  $('s-attempts').textContent = p.attempts;
  $('s-time').textContent = med ? `${Math.floor(med / 60)}:${String(med % 60).padStart(2, '0')}` : '—';

  drawChart(p.curve);

  const weak = weakTopics(p);
  const rows = Object.entries(p.byTopic)
    .sort((a, b) => (b[1].attempts - a[1].attempts))
    .map(([t, s]) => {
      const pct = s.attempts ? Math.round((s.solved / s.attempts) * 100) : 0;
      const cls = pct < 50 ? 'weak' : pct < 75 ? 'mid' : '';
      return `<div class="trow">
        <span>${esc(t)}${weak.has(t) ? ' <span class="dim tiny">· needs work</span>' : ''}</span>
        <span class="bar-track"><i class="${cls}" style="width:${pct}%"></i></span>
        <span class="dim tiny">${pct}% · ${s.attempts}</span>
      </div>`;
    }).join('');
  $('topics').innerHTML = rows || '<div class="dim">No attempts yet.</div>';

  $('history').innerHTML = p.history.slice(-40).reverse().map((h) => `
    <div class="hrow ${h.ok ? 'pass' : 'fail'}">
      <span>${h.ok ? '✓' : '✗'} ${esc(h.title || h.qid)}</span>
      <span class="t">${fmtSecs(h.secs)} · ${h.delta >= 0 ? '+' : ''}${(h.delta / 100).toFixed(2)}</span>
    </div>`).join('') || '<div class="dim">Nothing yet — go solve something.</div>';
}

function drawChart(curve) {
  const svg = $('chart');
  const pts = curve.slice(-120);
  if (pts.length < 2) {
    svg.innerHTML = '<text x="300" y="95" fill="#8b98a8" font-size="13" text-anchor="middle">Answer a few questions to see your curve.</text>';
    $('chart-note').textContent = '';
    return;
  }
  const vals = pts.map((p) => p.rating);
  const lo = Math.min(...vals) - 15, hi = Math.max(...vals) + 15;
  const x = (i) => (i / (pts.length - 1)) * 580 + 10;
  const y = (v) => 165 - ((v - lo) / (hi - lo || 1)) * 150;
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.rating).toFixed(1)}`).join(' ');
  const area = `${d} L590,175 L10,175 Z`;
  svg.innerHTML =
    `<path d="${area}" fill="#4d9fff22"/>` +
    `<path d="${d}" fill="none" stroke="#4d9fff" stroke-width="2"/>` +
    `<circle cx="${x(pts.length - 1).toFixed(1)}" cy="${y(vals[vals.length - 1]).toFixed(1)}" r="3.5" fill="#4d9fff"/>`;
  $('chart-note').textContent =
    `Lv ${(lo / 100).toFixed(2)} – ${(hi / 100).toFixed(2)} over the last ${pts.length} attempts.`;
}

function buildTopicFilter() {
  $('bank-note').textContent =
    `${INDEX.length.toLocaleString()} questions — ${handwrittenCount} written by hand, ` +
    `the rest generated from ${templateCount} templates, each a fixed question you can come back to.`;
  const topics = [...new Set(INDEX.map((x) => x.topic))].sort();
  $('bank-topic').innerHTML = '<option value="">All topics</option>' +
    topics.map((t) => `<option>${esc(t)}</option>`).join('');
}

function renderBank() {
  const term = $('bank-search').value.toLowerCase().trim();
  const topic = $('bank-topic').value;
  const state = $('bank-state').value;
  const p = store.progress;

  const rows = INDEX
    .filter((x) => !topic || x.topic === topic)
    .filter((x) => !term || (x.title + ' ' + x.topic).toLowerCase().includes(term))
    .filter((x) => {
      const s = p.byQuestion[x.id];
      if (state === 'unseen') return !s;
      if (state === 'solved') return s && s.solved;
      if (state === 'failed') return s && !s.solved;
      return true;
    })
    .sort((a, b) => a.rating - b.rating);

  // Ten thousand rows would choke the DOM — show a slice and say so.
  const shown = rows.slice(0, BANK_ROWS_SHOWN);
  const head = `<div class="dim tiny">${rows.length.toLocaleString()} question${rows.length === 1 ? '' : 's'} match` +
    (rows.length > shown.length ? ` — showing the ${shown.length} easiest; search or filter to narrow it down` : '') + '</div>';

  $('bank-list').innerHTML = (rows.length ? head : '') + (shown.map((x) => {
    const s = p.byQuestion[x.id];
    const st = !s ? '<span class="st un">unseen</span>'
      : s.solved ? '<span class="st ok">solved</span>' : '<span class="st no">unsolved</span>';
    return `<div class="brow" data-id="${x.id}">
      <span>${esc(x.title)} <span class="dim tiny">· ${esc(x.topic)}</span></span>
      ${st}<span class="dim tiny">Lv ${levelStr(s && s.rating ? s.rating : x.rating)}</span>
    </div>`;
  }).join('') || '<div class="dim">Nothing matches.</div>');

  $('bank-list').querySelectorAll('.brow').forEach((el) => {
    el.onclick = () => {
      nextQuestion(el.dataset.id);
      document.querySelector('.tab[data-view="practice"]').click();
    };
  });
}

/* ---------------- little helpers ---------------- */

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function fmtSecs(s) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** Just enough markdown for the question prompts. */
function md(src) {
  const blocks = [];
  let s = esc(src).replace(/```(?:python)?\n?([\s\S]*?)```/g, (_, code) => {
    blocks.push(code.replace(/\n$/, ''));
    return `@@CB${blocks.length - 1}@@`;
  });
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>')
       .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  s = s.replace(/(?:^|\n)((?:- .*(?:\n|$))+)/g, (_, list) =>
    '\n<ul>' + list.trim().split('\n').map((l) => `<li>${l.replace(/^- /, '')}</li>`).join('') + '</ul>');
  return s.replace(/@@CB(\d+)@@/g, (_, i) => `<pre>${blocks[i]}</pre>`);
}

boot();
