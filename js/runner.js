/* Main-thread wrapper around the Pyodide worker: one call in, one result out,
   with a hard timeout that kills and restarts the worker. */

const TIMEOUT_MS = 10000;

export class Runner {
  constructor(onStatus) {
    this.onStatus = onStatus || (() => {});
    this.seq = 0;
    this.pending = null;
    this.ready = false;
    this.spawn();
  }

  spawn() {
    const restart = Boolean(this.worker);
    if (this.worker) this.worker.terminate();
    this.ready = false;
    if (restart) this.onStatus('restarting');
    this.worker = new Worker('js/py-worker.js');
    this.worker.onmessage = (ev) => {
      const m = ev.data;
      if (m.type === 'ready') {
        this.ready = true;
        this.onStatus('ready');
      } else if (m.type === 'status') {
        this.onStatus('loading', m.msg);
      } else if (m.type === 'fatal') {
        this.onStatus('fatal', m.msg);
      } else if (m.type === 'result' && this.pending && this.pending.id === m.id) {
        const p = this.pending;
        this.pending = null;
        clearTimeout(p.timer);
        p.resolve(m.payload);
      }
    };
    this.worker.onerror = (e) => this.onStatus('fatal', e.message || 'worker error');
    this.worker.postMessage({ type: 'init' });
  }

  /** Wait until Pyodide has finished loading (or fail after ~90s). */
  whenReady() {
    if (this.ready) return Promise.resolve(true);
    return new Promise((res) => {
      const t0 = Date.now();
      const tick = setInterval(() => {
        if (this.ready) { clearInterval(tick); res(true); }
        else if (Date.now() - t0 > 90000) { clearInterval(tick); res(false); }
      }, 100);
    });
  }

  async run(code, spec) {
    // A previous timeout may have restarted the worker — wait for it again.
    if (!this.ready) {
      const ok = await this.whenReady();
      if (!ok) return { results: [], stdout: '', error: 'Python failed to load. Check your connection and reload.' };
    }
    if (this.pending) {
      clearTimeout(this.pending.timer);
      this.pending.resolve({ results: [], stdout: '', error: 'cancelled' });
      this.pending = null;
      this.spawn();
    }
    const id = ++this.seq;
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        if (this.pending && this.pending.id === id) {
          this.pending = null;
          this.spawn();
          resolve({
            results: [], stdout: '',
            error: `Timed out after ${TIMEOUT_MS / 1000}s — probably an infinite loop.`,
            timeout: true,
          });
        }
      }, TIMEOUT_MS);
      this.pending = { id, resolve, timer };
      this.worker.postMessage({ type: 'run', id, code, spec });
    });
  }
}
