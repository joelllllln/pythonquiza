#!/usr/bin/env python3
"""Negative tests for the grading harness in js/py-worker.js.

Makes sure wrong answers are actually rejected — a grader that passes
everything is worse than no grader.

    python3 tools/test_grader.py
"""
import json
import sys

from validate import load_harness

CASES = [
    # (label, code, spec, expect_pass_all, expect_error)
    ('correct function',
     'def add(a, b):\n    return a + b',
     {'mode': 'func', 'fn': 'add', 'tests': [{'args': [1, 2], 'expect': 3}]}, True, False),
    ('wrong answer',
     'def add(a, b):\n    return a - b',
     {'mode': 'func', 'fn': 'add', 'tests': [{'args': [1, 2], 'expect': 3}]}, False, False),
    ('missing function',
     'x = 1',
     {'mode': 'func', 'fn': 'add', 'tests': [{'args': [1, 2], 'expect': 3}]}, False, True),
    ('syntax error',
     'def add(a, b)\n    return a',
     {'mode': 'func', 'fn': 'add', 'tests': [{'args': [1, 2], 'expect': 3}]}, False, True),
    ('exception inside the function',
     'def add(a, b):\n    return 1 / 0',
     {'mode': 'func', 'fn': 'add', 'tests': [{'args': [1, 2], 'expect': 3}]}, False, False),
    ('tuple counts as the expected list',
     'def pair(a, b):\n    return (a, b)',
     {'mode': 'func', 'fn': 'pair', 'tests': [{'args': [1, 2], 'expect': [1, 2]}]}, True, False),
    ('float tolerance',
     'def third():\n    return 0.1 + 0.2',
     {'mode': 'func', 'fn': 'third', 'tests': [{'args': [], 'expect': 0.3}]}, True, False),
    ('approx list',
     'def vals():\n    return [1/3, 2/3]',
     {'mode': 'func', 'fn': 'vals',
      'tests': [{'args': [], 'expect': [0.3333333333, 0.6666666667], 'cmp': 'approx'}]}, True, False),
    ('set comparison ignores order',
     'def things():\n    return [2, 1]',
     {'mode': 'func', 'fn': 'things', 'tests': [{'args': [], 'expect': [1, 2], 'cmp': 'set'}]}, True, False),
    ('argument mutation cannot corrupt the next test',
     'def first(xs):\n    xs.clear()\n    return 0',
     {'mode': 'func', 'fn': 'first',
      'tests': [{'args': [[1, 2]], 'expect': 0}, {'args': [[1, 2]], 'expect': 0}]}, True, False),
    ('stdout match ignores trailing whitespace',
     'print("hi ")',
     {'mode': 'stdout', 'tests': [{'stdin': [], 'expect': 'hi'}]}, True, False),
    ('stdout mismatch fails',
     'print("bye")',
     {'mode': 'stdout', 'tests': [{'stdin': [], 'expect': 'hi'}]}, False, False),
    ('stdin is fed to input()',
     'a = int(input())\nb = int(input())\nprint(a + b)',
     {'mode': 'stdout', 'tests': [{'stdin': ['2', '3'], 'expect': '5'}]}, True, False),
    ('runaway printing is stopped',
     'while True:\n    print("x")',
     {'mode': 'stdout', 'tests': [{'stdin': [], 'expect': 'x'}]}, False, False),
]


def main():
    entry = load_harness()['_entry']
    bad = 0
    for label, code, spec, want_pass, want_error in CASES:
        out = json.loads(entry(code, json.dumps(spec)))
        got_error = bool(out.get('error'))
        got_pass = (not got_error and bool(out['results'])
                    and all(r['pass'] for r in out['results']))
        if got_pass != want_pass or got_error != want_error:
            bad += 1
            print(f'FAIL  {label}: pass={got_pass} (want {want_pass}), '
                  f'error={got_error} (want {want_error})')
        else:
            print(f'ok    {label}')
    print()
    if bad:
        print(f'{bad} grader test(s) failed')
        return 1
    print(f'all {len(CASES)} grader tests passed')
    return 0


if __name__ == '__main__':
    sys.exit(main())
