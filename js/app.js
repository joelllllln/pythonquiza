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

/* ---------------- appearance ---------------- */

const THEME_KEY = 'pyquiz.theme';

/** '' means follow the system; otherwise 'light' or 'dark'. */
function storedTheme() {
  try { return localStorage.getItem(THEME_KEY) || ''; } catch { return ''; }
}

function systemIsLight() {
  return window.matchMedia('(prefers-color-scheme: light)').matches;
}

function isLight() {
  const t = storedTheme();
  return t ? t === 'light' : systemIsLight();
}

function applyTheme() {
  const t = storedTheme();
  if (t) document.documentElement.dataset.theme = t;
  else delete document.documentElement.dataset.theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', isLight() ? '#F7F4EC' : '#12110E');
  const btn = document.getElementById('theme-btn');
  if (btn) btn.textContent = isLight() ? 'Dark mode' : 'Light mode';
}

function toggleTheme() {
  try { localStorage.setItem(THEME_KEY, isLight() ? 'dark' : 'light'); } catch {}
  applyTheme();
  closeSheets();
  if (editor) editor.refresh();
}

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

  applyTheme();
  window.matchMedia('(prefers-color-scheme: light)')
    .addEventListener('change', applyTheme);

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
  document.querySelectorAll('[data-view]').forEach((b) => {
    b.onclick = () => show(b.dataset.view);
  });

  // Two sheets hold everything that is not the question: the menu and the
  // difficulty control. Tap outside to dismiss.
  $('menu-btn').onclick = () => openSheet('sheet-menu');
  $('level-chip').onclick = () => { paintSliderLabel(); openSheet('sheet-level'); };
  document.querySelectorAll('.sheet').forEach((sheet) => {
    sheet.onclick = (e) => { if (e.target === sheet && sheet.id !== 'calibrate') closeSheets(); };
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSheets();
  });

  $('run').onclick = doRun;
  $('submit').onclick = doSubmit;
  $('skip').onclick = () => { closeSheets(); endSession(false); nextQuestion(); };
  $('next').onclick = () => { nextQuestion(); };
  $('reset-code').onclick = () => { closeSheets(); editor.setValue(q.starter || ''); editor.focus(); };
  $('hint-btn').onclick = nextHelp;

  // The slider is only useful if it does something now: dragging it re-picks
  // the question straight away, unless you have already solved this one.
  $('diff-slider').oninput = paintSliderLabel;
  $('diff-slider').onchange = () => {
    store.progress.offset = Number($('diff-slider').value || 0);
    store.save();
    if (!session || !session.done) nextQuestion();
    // Get out of the way so the new question is visible.
    closeSheets();
  };

  $('too-easy').onclick = () => { closeSheets(); rateDifficulty(false); };
  $('too-hard').onclick = () => { closeSheets(); rateDifficulty(true); };

  document.querySelectorAll('.lvl').forEach((b) => {
    b.onclick = () => setLevel(Number(b.dataset.rating));
  });
  $('cal-skip').onclick = () => setLevel(START_RATING);
  $('recalibrate').onclick = () => { closeSheets(); show('practice'); askLevel(); };
  $('theme-btn').onclick = toggleTheme;

  $('signin').onclick = async () => {
    closeSheets();
    try { await store.signIn(); }
    catch (e) { alert('Sign-in failed: ' + (e.message || e)); }
  };
  $('signout').onclick = () => { closeSheets(); store.signOut(); };

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
    show('practice');
    askLevel();
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

/** Switch the whole screen. Only one view exists at a time. */
function show(view) {
  closeSheets();
  for (const v of ['practice', 'stats', 'bank']) {
    $('view-' + v).classList.toggle('hidden', v !== view);
  }
  if (view === 'stats') renderStats();
  if (view === 'bank') renderBank();
  // CodeMirror does not lay out while hidden; nudge it once it is back.
  if (view === 'practice') editor.refresh();
}

function openSheet(id) {
  closeSheets();
  $(id).classList.remove('hidden');
}

function closeSheets() {
  document.querySelectorAll('.sheet').forEach((sheet) => {
    if (sheet.id !== 'calibrate') sheet.classList.add('hidden');
  });
}

function onRunnerStatus(kind) {
  if (kind === 'ready') pyReady = true;
  else if (kind === 'loading' || kind === 'restarting') pyReady = false;
  else if (kind === 'fatal') { pyReady = false; say('Python could not start. Reload the page.', true); }
}

/** The output box only exists when there is something to say. */
function say(text, isError) {
  const out = $('output');
  out.textContent = text || '';
  out.classList.toggle('err', Boolean(isError));
  out.classList.toggle('hidden', !text);
}

function showBanner() { /* nothing to announce: sign-in lives in the menu */ }

/* ---------------- question flow ---------------- */

function target() {
  return store.progress.rating + Number($('diff-slider').value || 0);
}

/** The sheet shows one number: the level you are aiming at. */
function paintSliderLabel() {
  $('lvl-big').textContent = 'Lv ' + levelStr(target());
}

function updateTargetLabel() { paintSliderLabel(); }

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

  $('q-title').textContent = q.title;
  $('q-body').innerHTML = md(q.prompt);
  $('q-tests').innerHTML = renderTests(q);
  $('examples').open = false;
  $('examples').classList.toggle('hidden', !(q.tests || []).length);
  $('hint-box').innerHTML = '';
  $('hint-box').classList.add('hidden');
  $('hint-btn').textContent = 'Hint';
  $('hint-btn').disabled = false;
  say('');
  $('results').innerHTML = '';
  $('next').classList.add('hidden');
  $('submit').classList.remove('hidden');

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

/** Time is recorded for the stats page; it is not shown while you work. */
function startTimer() { clearInterval(tick); }

function elapsed() { return Math.round((Date.now() - session.startedAt) / 1000); }

function addHint(html) {
  const box = $('hint-box');
  const d = document.createElement('div');
  d.innerHTML = html;
  box.appendChild(d);
  box.classList.remove('hidden');
}

/**
 * One button, pressed as many times as you need: the question's own hints
 * first, then most of the answer, then all of it. The label always says what
 * the next press will give you.
 */
function nextHelp() {
  const hints = q.hints || [];
  if (session.shown < hints.length) {
    addHint(md(hints[session.shown]));
    session.shown++;
    session.hints++;
  } else if (!session.bigHint) {
    showBigHint();
  } else {
    revealAnswer();
    return;
  }
  $('hint-btn').textContent =
    session.shown < hints.length ? 'Hint' : session.bigHint ? 'Answer' : 'More';
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
}

/** The whole model answer, on demand. Counts the question as a miss. */
function revealAnswer() {
  if (!session.done) {
    session.submitted = true;   // asking for the answer settles the question
    endSession(false);
  }
  showSolution();
  $('hint-btn').disabled = true;
  toast('Answer shown — counted as a miss');
  render();
}

function showSolution() {
  if (!session.done) endSession(false);
  addHint(`<pre>${esc(q.solution)}</pre>`);
  $('submit').classList.add('hidden');
  $('next').classList.remove('hidden');
  $('next').focus();
}

/**
 * Run, without grading. For a program question that means running it on the
 * first example's input. For a function question it means actually calling
 * your function on the first example — running the file alone would just
 * define the function and print nothing, which is what it used to do.
 */
async function doRun() {
  if (!(await ensurePy())) return;
  busy(true);
  const first = (q.tests || [])[0];

  if (q.mode === 'stdout' || !first) {
    const r = await runner.run(editor.getValue(),
      { mode: 'plain', stdin: (first && first.stdin) || [], setup: q.setup });
    busy(false);
    say(r.error || r.stdout || 'no output', Boolean(r.error));
    return;
  }

  const r = await runner.run(editor.getValue(),
    { mode: 'func', fn: q.fn, tests: [first], cmp: q.cmp || '', setup: q.setup, wrap: q.wrap });
  busy(false);
  const row = r.results && r.results[0];
  if (r.error) say(r.error, true);
  else if (!row) say(r.stdout || 'no output');
  else if (row.error) say(row.error, true);
  else say((r.stdout ? r.stdout.replace(/\n?$/, '\n') : '') +
    `${row.name}\n→ ${row.got}` + (row.pass ? '' : `\n  want ${row.expected}`), !row.pass);
}

function submitOrNext() {
  if (session && session.solved) nextQuestion();
  else doSubmit();
}

async function doSubmit() {
  if (!(await ensurePy())) return;
  busy(true);
  const spec = q.mode === 'stdout'
    ? { mode: 'stdout', tests: q.tests, setup: q.setup }
    : { mode: 'func', fn: q.fn, tests: q.tests, cmp: q.cmp || '', setup: q.setup, wrap: q.wrap };
  const r = await runner.run(editor.getValue(), spec);
  busy(false);
  session.submitted = true;

  if (r.error) {
    session.failedSubmits++;
    say(r.error, true);
    $('results').innerHTML = '<div class="verdict fail">It did not run</div>';
    return;
  }
  say(r.stdout || '');

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
    $('submit').classList.add('hidden');
    $('next').classList.remove('hidden');
    $('next').focus();
  } else {
    session.failedSubmits++;
  }
}

/** Only what went wrong. A pass needs one line, not a list of ticks. */
function renderCases(rows, passed, allPass) {
  const head = `<div class="verdict ${allPass ? 'pass' : 'fail'}">` +
    (allPass ? 'Passed' : `${rows.length - passed} of ${rows.length} failed`) + '</div>';
  const body = allPass ? '' : rows.filter((t) => !t.pass).slice(0, 4).map((t) => `
    <div class="tcase">
      <div class="body">
        <div>${esc(t.name)}</div>
        <pre>got  ${esc(t.got)}\nwant ${esc(t.expected)}</pre>
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
  say('Starting Python…');
  const ok = await runner.whenReady();
  say(ok ? '' : 'Python failed to load. Check your connection and reload.', !ok);
  return ok;
}

function busy(on) {
  $('run').disabled = on;
  $('submit').disabled = on;
}

/* ---------------- header / stats / bank ---------------- */

function render() {
  const p = store.progress;
  $('level-chip').textContent = 'Lv ' + levelStr(p.rating);
  const u = store.user;
  $('signin').classList.toggle('hidden', Boolean(u) || !firebaseEnabled);
  $('signout').classList.toggle('hidden', !u);
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

  // Ten thousand rows would choke the DOM — show a slice.
  const shown = rows.slice(0, BANK_ROWS_SHOWN);
  $('bank-list').innerHTML = shown.map((x) => {
    const s = p.byQuestion[x.id];
    const st = !s ? '<span class="st un">·</span>'
      : s.solved ? '<span class="st ok">✓</span>' : '<span class="st no">✗</span>';
    return `<div class="brow" data-id="${x.id}">
      <span>${esc(x.title)}</span>${st}
    </div>`;
  }).join('') || '<div class="dim">Nothing matches.</div>';

  $('bank-list').querySelectorAll('.brow').forEach((el) => {
    el.onclick = () => {
      nextQuestion(el.dataset.id);
      show('practice');
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
