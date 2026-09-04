/* App shell: question flow, code running, stats, bank, auth. */

import { Runner } from './runner.js';
import { Store } from './store.js';
import { firebaseEnabled } from './config.js';
import {
  START_RATING, levelStr, parSeconds, pickQuestion,
  updatePlayer, updateQuestion, weakTopics,
} from './rating.js';

const $ = (id) => document.getElementById(id);
const BANK = window.QUESTIONS || [];

const store = new Store(render);
const runner = new Runner(onRunnerStatus);

let editor = null;
let q = null;              // current question
let session = null;        // {startedAt, failedSubmits, hints, submitted}
let tick = null;
let pyReady = false;

/* ---------------- boot ---------------- */

function boot() {
  editor = CodeMirror.fromTextArea($('editor'), {
    mode: 'python',
    theme: 'material-darker',
    lineNumbers: true,
    indentUnit: 4,
    tabSize: 4,
    indentWithTabs: false,
    autoCloseBrackets: true,
    viewportMargin: Infinity,
    extraKeys: {
      'Ctrl-Enter': () => doSubmit(),
      'Cmd-Enter': () => doSubmit(),
      Tab: (cm) => cm.replaceSelection('    '),
    },
  });
  editor.on('change', () => { if (q) store.draft(q.id, editor.getValue()); });

  wireUI();
  store.init().then(() => { render(); showBanner(); });
  buildTopicFilter();
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
    };
  });

  $('run').onclick = doRun;
  $('submit').onclick = doSubmit;
  $('skip').onclick = () => { endSession(false); nextQuestion(); };
  $('next').onclick = () => { nextQuestion(); };
  $('reset-code').onclick = () => { editor.setValue(q.starter || ''); editor.focus(); };
  $('show-sol').onclick = showSolution;
  $('hint-btn').onclick = showHint;

  $('diff-slider').oninput = (e) => {
    $('diff-val').textContent = (e.target.value >= 0 ? '+' : '') + (e.target.value / 100).toFixed(1);
    updateTargetLabel();
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
    if (confirm('Erase all progress on this account?')) { store.reset(); renderStats(); render(); }
  };

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
    b.className = 'banner warn';
    b.innerHTML = 'Progress is saved in this browser only. Add a Firebase project in <code>js/config.js</code> to sign in with Google and sync every device — see the README.';
    b.classList.remove('hidden');
  }
}

/* ---------------- question flow ---------------- */

function target() {
  return store.progress.rating + Number($('diff-slider').value || 0);
}

function updateTargetLabel() {
  $('target-label').textContent = `aiming at Lv ${levelStr(target())}`;
}

function nextQuestion(forced) {
  endSession(false);
  q = forced || pickQuestion(BANK, store.progress, { target: target(), excludeId: q && q.id });
  session = { startedAt: Date.now(), failedSubmits: 0, hints: 0, submitted: false, done: false };

  const st = store.progress.byQuestion[q.id];
  const shownRating = st && st.rating ? st.rating : q.rating;

  $('q-title').textContent = q.title;
  $('q-topic').textContent = q.topic;
  $('q-diff').textContent = 'Lv ' + levelStr(shownRating);
  $('q-body').innerHTML = md(q.prompt);
  $('hint-box').innerHTML = '';
  $('hint-box').classList.add('hidden');
  $('hint-btn').disabled = !(q.hints && q.hints.length);
  $('hint-btn').textContent = 'Hint';
  $('output').textContent = pyReady ? 'Ready.' : 'Loading Python…';
  $('output').classList.remove('err');
  $('results').innerHTML = '';
  $('next-row').classList.add('hidden');
  $('run-status').textContent = '';

  editor.setValue(store.draft(q.id) || q.starter || '');
  editor.clearHistory();
  updateTargetLabel();
  startTimer();
  window.scrollTo({ top: 0, behavior: 'smooth' });
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

function showHint() {
  const hints = q.hints || [];
  if (session.hints >= hints.length) return;
  const box = $('hint-box');
  const d = document.createElement('div');
  d.innerHTML = md(hints[session.hints]);
  box.appendChild(d);
  box.classList.remove('hidden');
  session.hints++;
  $('hint-btn').textContent = session.hints < hints.length ? `Hint ${session.hints + 1}` : 'No more hints';
  $('hint-btn').disabled = session.hints >= hints.length;
}

function showSolution() {
  if (!session.done) endSession(false);
  $('results').innerHTML =
    `<div class="verdict fail">Model answer</div><pre class="output">${esc(q.solution)}</pre>`;
  $('next-row').classList.remove('hidden');
}

async function doRun() {
  if (!(await ensurePy())) return;
  busy(true, 'running…');
  const spec = q.mode === 'stdout'
    ? { mode: 'plain', stdin: (q.tests[0] && q.tests[0].stdin) || [] }
    : { mode: 'plain', stdin: [] };
  const r = await runner.run(editor.getValue(), spec);
  busy(false);
  const out = $('output');
  out.classList.toggle('err', Boolean(r.error));
  out.textContent = (r.error ? r.error : (r.stdout || '(no output)'));
  if (!r.error && q.mode === 'stdout' && q.tests[0] && q.tests[0].stdin) {
    $('run-status').textContent = 'ran with the first test input';
  }
}

async function doSubmit() {
  if (!(await ensurePy())) return;
  busy(true, 'checking…');
  const spec = q.mode === 'stdout'
    ? { mode: 'stdout', tests: q.tests }
    : { mode: 'func', fn: q.fn, tests: q.tests, cmp: q.cmp || '' };
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
    endSession(true);
    $('next-row').classList.remove('hidden');
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
        <span>${esc(t)}${weak.has(t) ? ' <span class="muted small">· needs work</span>' : ''}</span>
        <span class="bar"><i class="${cls}" style="width:${pct}%"></i></span>
        <span class="muted small">${pct}% · ${s.attempts}</span>
      </div>`;
    }).join('');
  $('topics').innerHTML = rows || '<div class="muted">No attempts yet.</div>';

  $('history').innerHTML = p.history.slice(-40).reverse().map((h) => `
    <div class="hrow ${h.ok ? 'pass' : 'fail'}">
      <span>${h.ok ? '✓' : '✗'} ${esc(h.title || h.qid)}</span>
      <span class="t">${fmtSecs(h.secs)} · ${h.delta >= 0 ? '+' : ''}${(h.delta / 100).toFixed(2)}</span>
    </div>`).join('') || '<div class="muted">Nothing yet — go solve something.</div>';
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
  const topics = [...new Set(BANK.map((x) => x.topic))].sort();
  $('bank-topic').innerHTML = '<option value="">All topics</option>' +
    topics.map((t) => `<option>${esc(t)}</option>`).join('');
}

function renderBank() {
  const term = $('bank-search').value.toLowerCase().trim();
  const topic = $('bank-topic').value;
  const state = $('bank-state').value;
  const p = store.progress;

  const rows = BANK
    .filter((x) => !topic || x.topic === topic)
    .filter((x) => !term || (x.title + ' ' + x.topic + ' ' + x.prompt).toLowerCase().includes(term))
    .filter((x) => {
      const s = p.byQuestion[x.id];
      if (state === 'unseen') return !s;
      if (state === 'solved') return s && s.solved;
      if (state === 'failed') return s && !s.solved;
      return true;
    })
    .sort((a, b) => a.rating - b.rating);

  $('bank-list').innerHTML = rows.map((x) => {
    const s = p.byQuestion[x.id];
    const st = !s ? '<span class="st un">unseen</span>'
      : s.solved ? '<span class="st ok">solved</span>' : '<span class="st no">unsolved</span>';
    return `<div class="brow" data-id="${x.id}">
      <span>${esc(x.title)} <span class="muted small">· ${esc(x.topic)}</span></span>
      ${st}<span class="muted small">Lv ${levelStr(s && s.rating ? s.rating : x.rating)}</span>
    </div>`;
  }).join('') || '<div class="muted">Nothing matches.</div>';

  $('bank-list').querySelectorAll('.brow').forEach((el) => {
    el.onclick = () => {
      nextQuestion(BANK.find((x) => x.id === el.dataset.id));
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
