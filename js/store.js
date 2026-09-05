/* Progress storage.
   Always writes to localStorage. If Firebase is configured, also signs the
   player in with Google and mirrors the same document to Firestore, so the
   same progress follows them to any device. */

import { firebaseConfig, firebaseEnabled } from './config.js';
import { START_RATING } from './rating.js';

const FB = 'https://www.gstatic.com/firebasejs/10.12.2/';
const LOCAL_KEY = 'pyquiz.progress.v1';
const DRAFT_KEY = 'pyquiz.drafts.v1';

export function blankProgress() {
  return {
    v: 1,
    rating: START_RATING,
    attempts: 0,
    solved: 0,
    streak: 0,
    bestStreak: 0,
    calibrated: false,// has the player picked a starting level?
    offset: 0,        // the "aim easier/harder" slider, in rating points
    feedback: 0,      // how many times they have said too easy / too hard
    byTopic: {},      // topic -> {attempts, solved, secs}
    byQuestion: {},   // qid   -> {attempts, solved, bestSecs, lastAt, rating}
    history: [],      // newest last: {qid, title, topic, ok, secs, at, rating, delta}
    curve: [],        // {at, rating}
    updated: 0,
  };
}

export class Store {
  constructor(onChange) {
    this.onChange = onChange || (() => {});
    this.progress = loadLocal();
    this.user = null;
    this.mode = firebaseEnabled ? 'cloud' : 'local';
    this._timer = null;
    this._fb = null;
  }

  async init() {
    if (!firebaseEnabled) return { mode: 'local' };
    try {
      const [appMod, authMod, dbMod] = await Promise.all([
        import(FB + 'firebase-app.js'),
        import(FB + 'firebase-auth.js'),
        import(FB + 'firebase-firestore.js'),
      ]);
      const app = appMod.initializeApp(firebaseConfig);
      const auth = authMod.getAuth(app);
      const db = dbMod.getFirestore(app);
      this._fb = { authMod, dbMod, auth, db };

      authMod.getRedirectResult(auth).catch(() => {});
      authMod.onAuthStateChanged(auth, async (u) => {
        this.user = u ? { uid: u.uid, name: u.displayName, photo: u.photoURL, email: u.email } : null;
        if (u) await this.pull();
        this.onChange();
      });
      return { mode: 'cloud' };
    } catch (e) {
      this.mode = 'local';
      return { mode: 'local', error: String(e) };
    }
  }

  async signIn() {
    if (!this._fb) throw new Error('Cloud sync is not configured for this deployment.');
    const { authMod, auth } = this._fb;
    const provider = new authMod.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await authMod.signInWithPopup(auth, provider);
    } catch (e) {
      // Popups are blocked in a lot of mobile browsers; fall back to redirect.
      const code = e && e.code || '';
      if (/popup|cancelled|operation-not-supported/i.test(code)) {
        await authMod.signInWithRedirect(auth, provider);
      } else {
        throw e;
      }
    }
  }

  async signOut() {
    if (this._fb) await this._fb.authMod.signOut(this._fb.auth);
    this.user = null;
    this.onChange();
  }

  /** Pull the cloud copy and merge it with whatever is in this browser. */
  async pull() {
    if (!this._fb || !this.user) return;
    const { dbMod, db } = this._fb;
    try {
      const snap = await dbMod.getDoc(dbMod.doc(db, 'users', this.user.uid));
      if (snap.exists()) {
        this.progress = merge(this.progress, snap.data());
      }
      saveLocal(this.progress);
      await this.push();
    } catch (e) {
      console.warn('cloud pull failed', e);
    }
  }

  async push() {
    if (!this._fb || !this.user) return;
    const { dbMod, db } = this._fb;
    try {
      await dbMod.setDoc(dbMod.doc(db, 'users', this.user.uid), trim(this.progress));
    } catch (e) {
      console.warn('cloud push failed', e);
    }
  }

  /** Save now locally, push to the cloud after a short quiet period. */
  save() {
    this.progress.updated = Date.now();
    saveLocal(this.progress);
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this.push(), 1200);
    this.onChange();
  }

  reset() {
    this.progress = blankProgress();
    this.save();
  }

  // --- unsubmitted code, kept per question, local only ---
  draft(qid, code) {
    const d = readJSON(DRAFT_KEY, {});
    if (code == null) return d[qid];
    d[qid] = code;
    const keys = Object.keys(d);
    if (keys.length > 200) delete d[keys[0]];
    localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
  }
}

/* ---------------- helpers ---------------- */

function readJSON(key, dflt) {
  try { return JSON.parse(localStorage.getItem(key)) ?? dflt; } catch { return dflt; }
}

function loadLocal() {
  const p = readJSON(LOCAL_KEY, null);
  if (!p || p.v !== 1) return blankProgress();
  return { ...blankProgress(), ...p };
}

function saveLocal(p) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(trim(p))); } catch {}
}

/** Keep the document small enough for a single Firestore write. */
function trim(p) {
  const q = { ...p };
  q.history = (p.history || []).slice(-250);
  q.curve = (p.curve || []).slice(-400);
  return q;
}

/** Merge two copies of the same player's progress (two devices, offline use). */
export function merge(a, b) {
  if (!b) return a;
  if (!a) return b;
  const newer = (a.updated || 0) >= (b.updated || 0) ? a : b;
  const out = blankProgress();

  out.rating = newer.rating ?? START_RATING;
  out.attempts = Math.max(a.attempts || 0, b.attempts || 0);
  out.solved = Math.max(a.solved || 0, b.solved || 0);
  out.streak = newer.streak || 0;
  out.bestStreak = Math.max(a.bestStreak || 0, b.bestStreak || 0);
  out.calibrated = Boolean(a.calibrated || b.calibrated);
  out.offset = newer.offset || 0;
  out.feedback = Math.max(a.feedback || 0, b.feedback || 0);
  out.updated = Math.max(a.updated || 0, b.updated || 0);

  for (const src of [a, b]) {
    for (const [t, s] of Object.entries(src.byTopic || {})) {
      const cur = out.byTopic[t] || { attempts: 0, solved: 0, secs: 0 };
      out.byTopic[t] = {
        attempts: Math.max(cur.attempts, s.attempts || 0),
        solved: Math.max(cur.solved, s.solved || 0),
        secs: Math.max(cur.secs, s.secs || 0),
      };
    }
    for (const [qid, s] of Object.entries(src.byQuestion || {})) {
      const cur = out.byQuestion[qid];
      if (!cur || (s.lastAt || 0) > (cur.lastAt || 0)) out.byQuestion[qid] = { ...cur, ...s };
      if (cur) {
        out.byQuestion[qid].attempts = Math.max(cur.attempts || 0, s.attempts || 0);
        out.byQuestion[qid].solved = cur.solved || s.solved;
      }
    }
  }

  const seen = new Set();
  out.history = [...(a.history || []), ...(b.history || [])]
    .filter((h) => { const k = h.at + '|' + h.qid; if (seen.has(k)) return false; seen.add(k); return true; })
    .sort((x, y) => x.at - y.at)
    .slice(-250);

  const cseen = new Set();
  out.curve = [...(a.curve || []), ...(b.curve || [])]
    .filter((c) => { if (cseen.has(c.at)) return false; cseen.add(c.at); return true; })
    .sort((x, y) => x.at - y.at)
    .slice(-400);

  return out;
}
