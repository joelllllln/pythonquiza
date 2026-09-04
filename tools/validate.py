#!/usr/bin/env python3
"""Check the whole question bank.

Expands every question — hand-written and generated — and runs each
reference solution through the exact grading harness the browser uses
(lifted straight out of js/py-worker.js). Reports anything that does not
pass its own tests, plus schema problems and duplicate ids.

    python3 tools/validate.py            # everything
    python3 tools/validate.py --stride 5 # every 5th generated variant
"""
import argparse
import json
import os
import re
import subprocess
import sys
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NDJSON = os.path.join(ROOT, 'tools', 'bank.ndjson')


def check_js_syntax():
    """Every shipped .js file must actually parse — the browser will not
    tell you nearly as clearly as node does."""
    bad = []
    for name in sorted(os.listdir(os.path.join(ROOT, 'js'))):
        if not name.endswith('.js'):
            continue
        path = os.path.join(ROOT, 'js', name)
        # ES modules use import/export, which `node --check` rejects in CJS mode.
        src = open(path, encoding='utf-8').read()
        args = ['node', '--input-type=module', '--check'] if ('import ' in src or 'export ' in src) \
            else ['node', '--check', path]
        if args[1] == '--input-type=module':
            proc = subprocess.run(args, input=src, capture_output=True, text=True)
        else:
            proc = subprocess.run(args, capture_output=True, text=True)
        if proc.returncode:
            bad.append((name, proc.stderr.strip().splitlines()[:3]))
    return bad


def dump_bank(stride):
    subprocess.run(
        ['node', os.path.join(ROOT, 'tools', 'dump_questions.js'), NDJSON, str(stride)],
        check=True)


def iter_bank():
    with open(NDJSON, encoding='utf-8') as fh:
        for line in fh:
            line = line.strip()
            if line:
                yield json.loads(line)


def load_harness():
    src = open(os.path.join(ROOT, 'js', 'py-worker.js'), encoding='utf-8').read()
    m = re.search(r'const HARNESS = String\.raw`(.*?)`;', src, re.S)
    if not m:
        sys.exit('could not find the HARNESS block in js/py-worker.js')
    ns = {}
    exec(compile(m.group(1), 'harness.py', 'exec'), ns)
    return ns


def spec_for(q):
    spec = {'mode': q.get('mode', 'func')}
    if q.get('setup'):
        spec['setup'] = q['setup']
    if q.get('mode') == 'stdout':
        spec['tests'] = q['tests']
        return spec
    spec.update({'fn': q['fn'], 'tests': q['tests'], 'cmp': q.get('cmp', '')})
    if q.get('wrap'):
        spec['wrap'] = q['wrap']
    return spec


def check_schema(q):
    problems = []
    for field in ('id', 'title', 'topic', 'rating', 'prompt', 'tests', 'solution', 'starter'):
        if not q.get(field) and q.get(field) != 0:
            problems.append('missing ' + field)
    if q.get('mode') != 'stdout' and not q.get('fn'):
        problems.append('missing fn')
    if not isinstance(q.get('rating'), (int, float)) or not 500 <= q.get('rating', 0) <= 2700:
        problems.append('rating out of range: %s' % q.get('rating'))
    if len(q.get('tests') or []) < 1:
        problems.append('no tests')
    if q.get('mode') != 'stdout':
        for t in q.get('tests') or []:
            if 'expect' not in t:
                problems.append('test without expect')
    if q.get('mode') != 'stdout' and q.get('fn') and \
            ('def %s' % q['fn']) not in q['solution'] and 'class ' not in q['solution']:
        problems.append("solution does not define %s" % q['fn'])
    return problems


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--stride', type=int, default=1,
                    help='check every Nth generated variant (1 = all)')
    ap.add_argument('--only', default='', help='only ids containing this string')
    ap.add_argument('--max-report', type=int, default=40)
    args = ap.parse_args()

    js_problems = check_js_syntax()
    for name, detail in js_problems:
        print(f'JS SYNTAX  js/{name}')
        for line in detail:
            print('    ' + line)

    dump_bank(args.stride)
    entry = load_harness()['_entry']

    failures = len(js_problems)
    reported = 0
    total = 0
    seen = set()
    ratings = []
    topics = Counter()
    templates = set()
    broken_templates = Counter()

    def report(msg, template):
        nonlocal reported
        broken_templates[template] += 1
        if reported < args.max_report:
            print(msg)
            reported += 1
        elif reported == args.max_report:
            print('… further problems suppressed (see the summary)')
            reported += 1

    for q in iter_bank():
        if args.only and args.only not in q['id']:
            continue
        total += 1
        label = q.get('id', '<no id>')
        tmpl = q.get('template', label)
        if q.get('template'):
            templates.add(q['template'])
        if label in seen:
            failures += 1
            report(f'DUPLICATE ID: {label}', tmpl)
        seen.add(label)
        ratings.append(q.get('rating', 0))
        topics[q.get('topic', '?')] += 1

        for p in check_schema(q):
            failures += 1
            report(f'SCHEMA  {label}: {p}', tmpl)

        payload = json.loads(entry(q['solution'], json.dumps(spec_for(q))))
        if payload.get('error'):
            failures += 1
            report(f'ERROR   {label}: {payload["error"].strip().splitlines()[-1]}', tmpl)
            continue
        bad = [r for r in payload['results'] if not r['pass']]
        if bad:
            failures += 1
            report(f'FAIL    {label}: {len(bad)}/{len(payload["results"])} tests fail', tmpl)
            for rr in bad[:2]:
                report(f'          {rr["name"]}  expected {rr["expected"]}  got {rr["got"]}', tmpl)
                if rr.get('error'):
                    report('          ' + rr['error'].strip().splitlines()[-1], tmpl)

    ratings.sort()
    print()
    print(f'{total} questions checked ({len(templates)} templates), '
          f'ratings {ratings[0]}–{ratings[-1]}, {len(topics)} topics')
    print('  topics: ' + ', '.join(f'{t}:{n}' for t, n in topics.most_common()))
    if failures:
        print(f'\n{failures} problem(s) across {len(broken_templates)} source(s):')
        for name, n in broken_templates.most_common(20):
            print(f'  {name}: {n}')
        return 1
    print('all reference solutions pass their own tests')
    return 0


if __name__ == '__main__':
    sys.exit(main())
