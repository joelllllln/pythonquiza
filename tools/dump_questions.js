/* Loads the question files with a fake `window` and prints them as JSON,
   so the Python validator can check every reference solution. */
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const root = path.join(__dirname, '..');
const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ['js/questions.js', 'js/questions_extra.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
}
process.stdout.write(JSON.stringify(ctx.window.QUESTIONS, null, 1));
