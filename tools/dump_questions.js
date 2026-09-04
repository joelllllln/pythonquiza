/* Expands the whole bank — hand-written questions plus every generated
   variant — and writes it as NDJSON (one question per line) so the Python
   validator can stream it without holding 10k questions in memory.

     node tools/dump_questions.js [outfile]        (default: all questions)
     node tools/dump_questions.js out.ndjson 5     (every 5th variant)      */

const fs = require('fs');
const vm = require('vm');
const path = require('path');

const root = path.join(__dirname, '..');
const out = process.argv[2] || path.join(root, 'tools', 'bank.ndjson');
const stride = Number(process.argv[3] || 1);

const FILES = fs.readFileSync(path.join(root, 'index.html'), 'utf8')
  .split('\n')
  .map((l) => (l.match(/<script src="(js\/[^"]+)"><\/script>/) || [])[1])
  .filter(Boolean);

const ctx = { window: {}, console };
ctx.window.window = ctx.window;
vm.createContext(ctx);
// The data files assign onto `window`; the generator core also exports a few
// helpers onto it, so run them in the order index.html loads them.
for (const f of FILES) {
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
}

const w = ctx.window;
const stream = fs.createWriteStream(out);
let n = 0;

for (const q of w.QUESTIONS || []) {
  stream.write(JSON.stringify(q) + '\n');
  n++;
}
for (const t of w.GENERATORS || []) {
  for (let seed = 0; seed < t.variants; seed += stride) {
    const q = t.make(w.rngFor(t.id, seed), seed);
    q.id = `g:${t.id}:${seed}`;
    q.topic = q.topic || t.topic;
    q.template = t.id;
    stream.write(JSON.stringify(q) + '\n');
    n++;
  }
}
stream.end();
stream.on('finish', () => {
  process.stderr.write(`${n} questions -> ${out}\n`);
});
