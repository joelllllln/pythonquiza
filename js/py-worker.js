/* Pyodide sandbox worker. Runs user Python off the main thread so a runaway
   loop can be killed by terminating the worker. */

const PYODIDE = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';

let pyodide = null;

const HARNESS = String.raw`
import json, sys, io, math, copy, builtins, traceback

_real_input = builtins.input

def _short(s, n=600):
    s = str(s)
    return s if len(s) <= n else s[:n] + ' …(truncated)'

def _fmt(v):
    try:
        return repr(v)
    except Exception:
        return '<unrepresentable>'

def _close(a, b):
    try:
        return math.isclose(float(a), float(b), rel_tol=1e-6, abs_tol=1e-9)
    except Exception:
        return False

def _eq(got, exp, cmp):
    if cmp == 'set':
        try:
            return set(got) == set(exp)
        except Exception:
            return False
    if cmp == 'sorted':
        try:
            return sorted(got) == sorted(exp)
        except Exception:
            return False
    if cmp == 'approx':
        if isinstance(exp, (list, tuple)):
            try:
                if len(got) != len(exp):
                    return False
                return all(_close(g, e) for g, e in zip(got, exp))
            except Exception:
                return False
        return _close(got, exp)
    if cmp == 'text':
        return _norm(got) == _norm(exp)
    if isinstance(exp, float) or isinstance(got, float):
        if isinstance(exp, (int, float)) and isinstance(got, (int, float)):
            return _close(got, exp)
    if isinstance(exp, list) and isinstance(got, tuple):
        got = list(got)
    return got == exp

def _norm(s):
    return '\n'.join(line.rstrip() for line in str(s).strip().splitlines())

class _Cap(io.StringIO):
    limit = 20000
    def write(self, s):
        if self.tell() > self.limit:
            raise RuntimeError('too much output (possible infinite loop)')
        return super().write(s)

def _exec_user(code, ns, feed):
    """Run the user's module-level code, capturing stdout."""
    buf = _Cap()
    old_out, old_err, old_in = sys.stdout, sys.stderr, builtins.input
    lines = list(feed)
    def _fake_input(prompt=''):
        if prompt:
            sys.stdout.write(str(prompt))
        if not lines:
            raise EOFError('no more input')
        v = lines.pop(0)
        return v
    sys.stdout = buf
    sys.stderr = buf
    builtins.input = _fake_input
    try:
        exec(compile(code, 'solution.py', 'exec'), ns)
        return buf.getvalue(), None
    except BaseException:
        return buf.getvalue(), traceback.format_exc(limit=6)
    finally:
        sys.stdout, sys.stderr, builtins.input = old_out, old_err, old_in

def run(code, spec):
    spec = json.loads(spec)
    mode = spec.get('mode', 'plain')
    out = {'results': [], 'stdout': '', 'error': None}

    if mode in ('plain', 'stdout'):
        cases = spec.get('tests') or [{}]
        if mode == 'plain':
            cases = [{'stdin': spec.get('stdin', [])}]
        first = True
        for i, t in enumerate(cases):
            ns = {'__name__': '__main__'}
            printed, err = _exec_user(code, ns, t.get('stdin', []))
            if first:
                out['stdout'] = _short(printed, 4000)
                first = False
            if mode == 'plain':
                out['error'] = err
                return out
            ok = (err is None) and _eq(printed, t.get('expect', ''), 'text')
            out['results'].append({
                'name': t.get('name') or ('input: ' + ', '.join(map(str, t.get('stdin', []))) if t.get('stdin') else 'run program'),
                'pass': bool(ok),
                'expected': _short(_norm(t.get('expect', ''))),
                'got': _short(_norm(printed)) if err is None else 'error',
                'error': _short(err) if err else None,
                'hidden': bool(t.get('hidden')),
            })
        return out

    # ---- function mode ----
    fname = spec['fn']
    ns = {'__name__': '__main__'}
    printed, err = _exec_user(code, ns, [])
    out['stdout'] = _short(printed, 4000)
    if err:
        out['error'] = _short(err)
        return out
    fn = ns.get(fname)
    if not callable(fn):
        out['error'] = "Define a function called '%s'." % fname
        return out

    for t in spec.get('tests', []):
        args = copy.deepcopy(t.get('args', []))
        kwargs = copy.deepcopy(t.get('kwargs', {}))
        cmp = t.get('cmp') or spec.get('cmp') or ''
        call = '%s(%s)' % (fname, ', '.join(
            [_fmt(a) for a in t.get('args', [])] +
            ['%s=%s' % (k, _fmt(v)) for k, v in t.get('kwargs', {}).items()]))
        buf = _Cap()
        old = sys.stdout
        sys.stdout = buf
        try:
            got = fn(*args, **kwargs)
            ok = _eq(got, t['expect'], cmp)
            row = {'name': _short(call, 160), 'pass': bool(ok),
                   'expected': _short(_fmt(t['expect'])), 'got': _short(_fmt(got)),
                   'error': None, 'hidden': bool(t.get('hidden'))}
        except BaseException:
            row = {'name': _short(call, 160), 'pass': False,
                   'expected': _short(_fmt(t['expect'])), 'got': 'error',
                   'error': _short(traceback.format_exc(limit=4)),
                   'hidden': bool(t.get('hidden'))}
        finally:
            sys.stdout = old
        out['results'].append(row)
    return out

def _entry(code, spec):
    try:
        return json.dumps(run(code, spec))
    except BaseException:
        return json.dumps({'results': [], 'stdout': '',
                           'error': 'harness error: ' + traceback.format_exc(limit=3)})
`;

async function boot() {
  try {
    importScripts(PYODIDE + 'pyodide.js');
    postMessage({ type: 'status', msg: 'Downloading Python…' });
    pyodide = await loadPyodide({ indexURL: PYODIDE });
    pyodide.runPython(HARNESS);
    postMessage({ type: 'ready' });
  } catch (e) {
    postMessage({ type: 'fatal', msg: String(e) });
  }
}

onmessage = async (ev) => {
  const m = ev.data;
  if (m.type === 'init') return boot();
  if (m.type === 'run') {
    if (!pyodide) return postMessage({ type: 'result', id: m.id, payload: { results: [], stdout: '', error: 'Python is still loading.' } });
    let payload;
    try {
      const entry = pyodide.globals.get('_entry');
      const json = entry(m.code, JSON.stringify(m.spec));
      entry.destroy();
      payload = JSON.parse(json);
    } catch (e) {
      payload = { results: [], stdout: '', error: String(e && e.message || e) };
    }
    postMessage({ type: 'result', id: m.id, payload });
  }
};

boot();
