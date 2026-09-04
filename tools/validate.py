#!/usr/bin/env python3
"""Check every question in the bank.

Runs each reference solution through the exact grading harness the browser
uses (lifted straight out of js/py-worker.js) and reports anything that does
not pass its own tests, plus schema problems and duplicate ids.

    python3 tools/validate.py
"""
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load_questions():
    out = subprocess.run(
        ['node', os.path.join(ROOT, 'tools', 'dump_questions.js')],
        capture_output=True, text=True, check=True)
    return json.loads(out.stdout)


def load_harness():
    src = open(os.path.join(ROOT, 'js', 'py-worker.js'), encoding='utf-8').read()
    m = re.search(r'const HARNESS = String\.raw`(.*?)`;', src, re.S)
    if not m:
        sys.exit('could not find the HARNESS block in js/py-worker.js')
    ns = {}
    exec(compile(m.group(1), 'harness.py', 'exec'), ns)
    return ns


def spec_for(q):
    if q.get('mode') == 'stdout':
        return {'mode': 'stdout', 'tests': q['tests']}
    return {'mode': 'func', 'fn': q['fn'], 'tests': q['tests'], 'cmp': q.get('cmp', '')}


def check_schema(q):
    problems = []
    for field in ('id', 'title', 'topic', 'rating', 'prompt', 'tests', 'solution', 'starter'):
        if not q.get(field) and q.get(field) != 0:
            problems.append('missing ' + field)
    if q.get('mode') != 'stdout' and not q.get('fn'):
        problems.append('missing fn')
    if not isinstance(q.get('rating'), (int, float)) or not 500 <= q['rating'] <= 2600:
        problems.append('rating out of range')
    if len(q.get('tests') or []) < 1:
        problems.append('no tests')
    if q.get('mode') != 'stdout':
        for t in q.get('tests') or []:
            if 'expect' not in t:
                problems.append('test without expect')
    return problems


def main():
    questions = load_questions()
    harness = load_harness()
    entry = harness['_entry']

    failures = 0
    seen = set()
    for q in questions:
        label = q.get('id', '<no id>')
        if label in seen:
            print(f'DUPLICATE ID: {label}')
            failures += 1
        seen.add(label)

        for p in check_schema(q):
            print(f'SCHEMA  {label}: {p}')
            failures += 1

        payload = json.loads(entry(q['solution'], json.dumps(spec_for(q))))
        if payload.get('error'):
            print(f'ERROR   {label}: {payload["error"].strip().splitlines()[-1]}')
            failures += 1
            continue
        bad = [r for r in payload['results'] if not r['pass']]
        if bad:
            failures += 1
            print(f'FAIL    {label}: {len(bad)}/{len(payload["results"])} tests fail')
            for r in bad[:3]:
                print(f'          {r["name"]}  expected {r["expected"]}  got {r["got"]}')
                if r.get('error'):
                    print('          ' + r['error'].strip().splitlines()[-1])

    ratings = sorted(q['rating'] for q in questions)
    print()
    print(f'{len(questions)} questions, ratings {ratings[0]}–{ratings[-1]}, '
          f'{len(set(q["topic"] for q in questions))} topics')
    if failures:
        print(f'{failures} problem(s)')
        return 1
    print('all reference solutions pass their own tests')
    return 0


if __name__ == '__main__':
    sys.exit(main())
