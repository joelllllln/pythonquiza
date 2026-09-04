/* Question bank, part 2 — intermediate through hard.
   Same shape as questions.js; pushed onto the same array.                  */

window.QUESTIONS.push(
{
  id:'valid_parens_gen', title:'Generate valid parentheses', topic:'recursion', rating:1550,
  prompt:'Write `gen(n)` returning every well-formed string of `n` pairs of parentheses, sorted ascending.\n\n```\ngen(2)  ->  ["(())", "()()"]\n```',
  mode:'func', fn:'gen', starter:'def gen(n):\n    ',
  tests:[{args:[2],expect:['(())','()()']},{args:[0],expect:['']},{args:[1],expect:['()']},
         {args:[3],expect:['((()))','(()())','(())()','()(())','()()()']}],
  hints:['Backtrack: you may open while `open < n`, and close while `close < open`.','Sort the finished list before returning.'],
  solution:'def gen(n):\n    out = []\n\n    def go(s, o, c):\n        if len(s) == 2 * n:\n            out.append(s)\n            return\n        if o < n:\n            go(s + "(", o + 1, c)\n        if c < o:\n            go(s + ")", o, c + 1)\n\n    go("", 0, 0)\n    return sorted(out)'
},
{
  id:'max_subarray', title:'Maximum subarray sum', topic:'dp', rating:1570,
  prompt:'Write `max_sum(nums)` returning the largest sum of any **contiguous non-empty** slice. Return `0` for an empty list. O(n).',
  mode:'func', fn:'max_sum', starter:'def max_sum(nums):\n    ',
  tests:[{args:[[-2,1,-3,4,-1,2,1,-5,4]],expect:6},{args:[[-3,-1,-2]],expect:-1},{args:[[]],expect:0},{args:[[5]],expect:5}],
  hints:['Kadane: at each step, extend the running sum or restart from this element.','`cur = max(n, cur + n)`'],
  solution:'def max_sum(nums):\n    if not nums:\n        return 0\n    best = cur = nums[0]\n    for n in nums[1:]:\n        cur = max(n, cur + n)\n        best = max(best, cur)\n    return best'
},
{
  id:'memo_fib', title:'Fibonacci with memoisation', topic:'recursion', rating:1590,
  prompt:'Write `fib(n)` returning the nth Fibonacci number (`fib(0) == 0`). It must answer `fib(75)` instantly — plain recursion will time out.',
  mode:'func', fn:'fib', starter:'def fib(n):\n    ',
  tests:[{args:[0],expect:0},{args:[10],expect:55},{args:[75],expect:2111485077978050},{args:[1],expect:1}],
  hints:['`functools.lru_cache` on a recursive function, or just loop.'],
  solution:'from functools import lru_cache\n\n\n@lru_cache(maxsize=None)\ndef fib(n):\n    if n < 2:\n        return n\n    return fib(n - 1) + fib(n - 2)'
},
{
  id:'matrix_spiral', title:'Spiral order', topic:'lists', rating:1610,
  prompt:'Write `spiral(m)` reading a rectangular matrix clockwise from the top-left.\n\n```\nspiral([[1,2,3],[4,5,6],[7,8,9]])  ->  [1,2,3,6,9,8,7,4,5]\n```',
  mode:'func', fn:'spiral', starter:'def spiral(m):\n    ',
  tests:[{args:[[[1,2,3],[4,5,6],[7,8,9]]],expect:[1,2,3,6,9,8,7,4,5]},
         {args:[[]],expect:[]},{args:[[[1,2]]],expect:[1,2]},
         {args:[[[1],[2],[3]]],expect:[1,2,3]}],
  hints:['Keep four bounds — top, bottom, left, right — and shrink them.','After walking a row or column, check the bounds have not crossed.'],
  solution:'def spiral(m):\n    if not m:\n        return []\n    out = []\n    top, bot = 0, len(m) - 1\n    left, right = 0, len(m[0]) - 1\n    while top <= bot and left <= right:\n        for c in range(left, right + 1):\n            out.append(m[top][c])\n        top += 1\n        for r in range(top, bot + 1):\n            out.append(m[r][right])\n        right -= 1\n        if top <= bot:\n            for c in range(right, left - 1, -1):\n                out.append(m[bot][c])\n            bot -= 1\n        if left <= right:\n            for r in range(bot, top - 1, -1):\n                out.append(m[r][left])\n            left += 1\n    return out'
},
{
  id:'group_anagrams', title:'Group anagrams', topic:'dicts', rating:1630,
  prompt:'Write `groups(words)` grouping anagrams together. Each group is sorted alphabetically, and the groups themselves are sorted by their first word.\n\n```\ngroups(["eat","tea","tan"])  ->  [["eat","tea"],["tan"]]\n```',
  mode:'func', fn:'groups', starter:'def groups(words):\n    ',
  tests:[{args:[['eat','tea','tan','ate','nat','bat']],expect:[['ate','eat','tea'],['bat'],['nat','tan']]},
         {args:[[]],expect:[]},{args:[['a']],expect:[['a']]}],
  hints:['The sorted letters make a good dict key.','Sort inside each group, then sort the list of groups.'],
  solution:'def groups(words):\n    buckets = {}\n    for w in words:\n        buckets.setdefault("".join(sorted(w)), []).append(w)\n    return sorted([sorted(g) for g in buckets.values()])'
},
{
  id:'coin_change', title:'Fewest coins', topic:'dp', rating:1650,
  prompt:'Write `fewest(coins, amount)` returning the smallest number of coins summing to `amount`, or `-1` if impossible. Coins may be reused.\n\n```\nfewest([1,5,10], 12)  ->  3\n```',
  mode:'func', fn:'fewest', starter:'def fewest(coins, amount):\n    ',
  tests:[{args:[[1,5,10],12],expect:3},{args:[[2],3],expect:-1},{args:[[1],0],expect:0},{args:[[1,3,4],6],expect:2}],
  hints:['Bottom-up DP over every amount from 0 to `amount`.','`dp[a] = min(dp[a - c] + 1 for c in coins if c <= a)`'],
  solution:'def fewest(coins, amount):\n    INF = float("inf")\n    dp = [0] + [INF] * amount\n    for a in range(1, amount + 1):\n        for c in coins:\n            if c <= a and dp[a - c] + 1 < dp[a]:\n                dp[a] = dp[a - c] + 1\n    return -1 if dp[amount] == INF else dp[amount]'
},
{
  id:'gen_squares', title:'Write a generator', topic:'generators', rating:1670,
  prompt:'Write `take(n)` returning the first `n` squares of `1, 2, 3, …` as a list — but produce them with a **generator function** called `squares()` that yields forever, and take `n` from it.',
  mode:'func', fn:'take', starter:'def squares():\n    ',
  tests:[{args:[5],expect:[1,4,9,16,25]},{args:[0],expect:[]},{args:[1],expect:[1]}],
  hints:['`itertools.islice(squares(), n)` slices an infinite generator.','`while True: yield i * i`'],
  solution:'from itertools import islice\n\n\ndef squares():\n    i = 1\n    while True:\n        yield i * i\n        i += 1\n\n\ndef take(n):\n    return list(islice(squares(), n))'
},
{
  id:'decorator_count', title:'Write a decorator', topic:'functions', rating:1690,
  prompt:'Write a decorator `counted` that records how many times the wrapped function was called on an attribute `calls`, then write `run(n)` that applies it to a function and returns `[result_of_last_call, call_count]` after calling it `n` times with the value `2`.\n\nThe wrapped function should double its argument.',
  mode:'func', fn:'run', starter:'def counted(fn):\n    ',
  tests:[{args:[3],expect:[4,3]},{args:[1],expect:[4,1]},{args:[0],expect:[null,0]}],
  hints:['Define an inner `wrapper(*args, **kwargs)` and set `wrapper.calls`.','Increment the counter before calling through.'],
  solution:'import functools\n\n\ndef counted(fn):\n    @functools.wraps(fn)\n    def wrapper(*args, **kwargs):\n        wrapper.calls += 1\n        return fn(*args, **kwargs)\n    wrapper.calls = 0\n    return wrapper\n\n\ndef run(n):\n    @counted\n    def double(x):\n        return x * 2\n\n    out = None\n    for _ in range(n):\n        out = double(2)\n    return [out, double.calls]'
},
{
  id:'binary_str', title:'Binary representation', topic:'math', rating:1710,
  prompt:'Write `to_binary(n)` returning the binary digits of a non-negative integer as a string, without a `0b` prefix and without leading zeros. `to_binary(0)` is `"0"`. Do not use `bin()` or `format()`.',
  mode:'func', fn:'to_binary', starter:'def to_binary(n):\n    ',
  tests:[{args:[0],expect:'0'},{args:[5],expect:'101'},{args:[1],expect:'1'},{args:[255],expect:'11111111'}],
  hints:['Repeatedly take `n % 2` and `n //= 2`.','The digits come out backwards — reverse at the end.'],
  solution:'def to_binary(n):\n    if n == 0:\n        return "0"\n    bits = []\n    while n:\n        bits.append(str(n % 2))\n        n //= 2\n    return "".join(reversed(bits))'
},
{
  id:'validate_ip', title:'Validate an IPv4 address', topic:'strings', rating:1730,
  prompt:'Write `valid_ip(s)` — `True` only for four dot-separated decimal parts, each `0`–`255`, with no leading zeros (`"01"` is invalid) and no empty part.',
  mode:'func', fn:'valid_ip', starter:'def valid_ip(s):\n    ',
  tests:[{args:['192.168.0.1'],expect:true},{args:['256.1.1.1'],expect:false},{args:['1.1.1'],expect:false},
         {args:['01.1.1.1'],expect:false},{args:['0.0.0.0'],expect:true},{args:['1.1.1.1.1'],expect:false},
         {args:['a.b.c.d'],expect:false},{args:['1..1.1'],expect:false}],
  hints:['`s.split(".")` must give exactly four parts.','`part.isdigit()` rules out signs and spaces; then check the leading zero.'],
  solution:'def valid_ip(s):\n    parts = s.split(".")\n    if len(parts) != 4:\n        return False\n    for p in parts:\n        if not p.isdigit():\n            return False\n        if len(p) > 1 and p[0] == "0":\n            return False\n        if int(p) > 255:\n            return False\n    return True'
},
{
  id:'merge_intervals', title:'Merge intervals', topic:'algorithms', rating:1750,
  prompt:'Write `merge(intervals)` combining every overlapping or touching `[start, end]` pair, output sorted by start.\n\n```\nmerge([[1,3],[2,6],[8,10]])  ->  [[1,6],[8,10]]\n```',
  mode:'func', fn:'merge', starter:'def merge(intervals):\n    ',
  tests:[{args:[[[1,3],[2,6],[8,10]]],expect:[[1,6],[8,10]]},{args:[[]],expect:[]},
         {args:[[[1,4],[4,5]]],expect:[[1,5]]},{args:[[[5,6],[1,2]]],expect:[[1,2],[5,6]]}],
  hints:['Sort by start first — then you only ever compare with the last kept interval.','Overlap means `start <= last_end`.'],
  solution:'def merge(intervals):\n    out = []\n    for s, e in sorted(intervals):\n        if out and s <= out[-1][1]:\n            out[-1][1] = max(out[-1][1], e)\n        else:\n            out.append([s, e])\n    return out'
},
{
  id:'quicksort', title:'Write quicksort', topic:'sorting', rating:1770,
  prompt:'Write `qsort(nums)` returning a sorted copy using quicksort. Do not call `sorted` or `.sort()`.',
  mode:'func', fn:'qsort', starter:'def qsort(nums):\n    ',
  tests:[{args:[[3,1,4,1,5,9,2,6]],expect:[1,1,2,3,4,5,6,9]},{args:[[]],expect:[]},
         {args:[[2,2,2]],expect:[2,2,2]},{args:[[5,4,3,2,1]],expect:[1,2,3,4,5]}],
  hints:['Pick a pivot, split into less / equal / greater, recurse on the outer two.'],
  solution:'def qsort(nums):\n    if len(nums) <= 1:\n        return list(nums)\n    pivot = nums[len(nums) // 2]\n    less = [n for n in nums if n < pivot]\n    same = [n for n in nums if n == pivot]\n    more = [n for n in nums if n > pivot]\n    return qsort(less) + same + qsort(more)'
},
{
  id:'lru_cache_class', title:'LRU cache', topic:'classes', rating:1790,
  prompt:'Write `run(cap, ops)`. Build an LRU cache of capacity `cap` with `get(k)` (returns `-1` when missing) and `put(k, v)`. Reading or writing a key makes it the most recently used; a full cache evicts the least recently used. Return the list of `get` results.\n\n```\nrun(2, [["put",1,1],["put",2,2],["get",1],["put",3,3],["get",2]])  ->  [1, -1]\n```',
  mode:'func', fn:'run', starter:'from collections import OrderedDict\n\n\ndef run(cap, ops):\n    ',
  tests:[{args:[2,[['put',1,1],['put',2,2],['get',1],['put',3,3],['get',2]]],expect:[1,-1]},
         {args:[1,[['put',1,1],['put',2,2],['get',1],['get',2]]],expect:[-1,2]},
         {args:[2,[['get',9]]],expect:[-1]}],
  hints:['`OrderedDict.move_to_end(k)` marks a key as fresh.','`popitem(last=False)` drops the oldest entry.'],
  solution:'from collections import OrderedDict\n\n\ndef run(cap, ops):\n    cache = OrderedDict()\n    out = []\n    for op in ops:\n        if op[0] == "get":\n            k = op[1]\n            if k in cache:\n                cache.move_to_end(k)\n                out.append(cache[k])\n            else:\n                out.append(-1)\n        else:\n            _, k, v = op\n            if k in cache:\n                cache.move_to_end(k)\n            cache[k] = v\n            if len(cache) > cap:\n                cache.popitem(last=False)\n    return out'
},
{
  id:'deep_get', title:'Nested lookup', topic:'dicts', rating:1810,
  prompt:'Write `deep_get(data, path, default=None)` reading a dotted path out of nested dicts and lists.\n\n```\ndeep_get({"a": {"b": [10, 20]}}, "a.b.1")  ->  20\n```\nReturn `default` if any step is missing.',
  mode:'func', fn:'deep_get', starter:'def deep_get(data, path, default=None):\n    ',
  tests:[{args:[{a:{b:[10,20]}},'a.b.1'],expect:20},
         {args:[{a:{b:1}},'a.c'],expect:null},
         {args:[{a:[1]},'a.5','x'],expect:'x'},
         {args:[{a:1},'a'],expect:1},
         {args:[{},'a.b.c',0],expect:0}],
  hints:['Split the path, then walk one step at a time.','On a list, the key has to be turned into an int — and may be out of range.'],
  solution:'def deep_get(data, path, default=None):\n    cur = data\n    for part in path.split("."):\n        if isinstance(cur, dict):\n            if part not in cur:\n                return default\n            cur = cur[part]\n        elif isinstance(cur, list):\n            if not part.lstrip("-").isdigit():\n                return default\n            i = int(part)\n            if not -len(cur) <= i < len(cur):\n                return default\n            cur = cur[i]\n        else:\n            return default\n    return cur'
},
{
  id:'levenshtein', title:'Edit distance', topic:'dp', rating:1830,
  prompt:'Write `distance(a, b)` returning the Levenshtein edit distance — the fewest single-character inserts, deletes or substitutions turning `a` into `b`.\n\n```\ndistance("kitten", "sitting")  ->  3\n```',
  mode:'func', fn:'distance', starter:'def distance(a, b):\n    ',
  tests:[{args:['kitten','sitting'],expect:3},{args:['','abc'],expect:3},{args:['same','same'],expect:0},
         {args:['flaw','lawn'],expect:2}],
  hints:['A table where `dp[i][j]` is the distance between the first i and first j characters.','Cost is 0 when the characters match, otherwise 1 plus the best of the three neighbours.'],
  solution:'def distance(a, b):\n    prev = list(range(len(b) + 1))\n    for i, ca in enumerate(a, 1):\n        cur = [i]\n        for j, cb in enumerate(b, 1):\n            cost = 0 if ca == cb else 1\n            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost))\n        prev = cur\n    return prev[-1]'
},
{
  id:'topo_sort', title:'Course order', topic:'graphs', rating:1850,
  prompt:'Write `order(n, prereqs)`. Courses are `0..n-1`; each `[a, b]` means `b` must come before `a`. Return a valid order (ties broken by the **smallest** course number first), or `[]` if the prerequisites are circular.',
  mode:'func', fn:'order', starter:'def order(n, prereqs):\n    ',
  tests:[{args:[2,[[1,0]]],expect:[0,1]},{args:[2,[[1,0],[0,1]]],expect:[]},
         {args:[4,[[1,0],[2,0],[3,1],[3,2]]],expect:[0,1,2,3]},{args:[3,[]],expect:[0,1,2]}],
  hints:['Kahn\'s algorithm: repeatedly take a node with no remaining prerequisites.','Use `heapq` as the ready-set so the smallest number comes out first.'],
  solution:'import heapq\n\n\ndef order(n, prereqs):\n    indeg = [0] * n\n    adj = [[] for _ in range(n)]\n    for a, b in prereqs:\n        adj[b].append(a)\n        indeg[a] += 1\n    ready = [i for i in range(n) if indeg[i] == 0]\n    heapq.heapify(ready)\n    out = []\n    while ready:\n        node = heapq.heappop(ready)\n        out.append(node)\n        for nxt in adj[node]:\n            indeg[nxt] -= 1\n            if indeg[nxt] == 0:\n                heapq.heappush(ready, nxt)\n    return out if len(out) == n else []'
},
{
  id:'grid_paths', title:'Paths through a grid', topic:'dp', rating:1880,
  prompt:'Write `paths(grid)` counting the routes from the top-left to the bottom-right, moving only right or down. `1` marks a blocked cell.\n\n```\npaths([[0,0],[0,0]])  ->  2\n```',
  mode:'func', fn:'paths', starter:'def paths(grid):\n    ',
  tests:[{args:[[[0,0],[0,0]]],expect:2},{args:[[[0,1],[0,0]]],expect:1},
         {args:[[[1]]],expect:0},{args:[[[0,0,0],[0,1,0],[0,0,0]]],expect:2}],
  hints:['`dp[r][c] = dp[r-1][c] + dp[r][c-1]`, and 0 on a blocked cell.','Watch the start cell — it can be blocked too.'],
  solution:'def paths(grid):\n    rows, cols = len(grid), len(grid[0])\n    dp = [[0] * cols for _ in range(rows)]\n    for r in range(rows):\n        for c in range(cols):\n            if grid[r][c] == 1:\n                continue\n            if r == 0 and c == 0:\n                dp[r][c] = 1\n            else:\n                dp[r][c] = (dp[r - 1][c] if r else 0) + (dp[r][c - 1] if c else 0)\n    return dp[-1][-1]'
},
{
  id:'island_count', title:'Count islands', topic:'graphs', rating:1900,
  prompt:'Write `islands(grid)` counting connected groups of `1`s in a grid of `0`/`1`. Cells connect up, down, left and right — not diagonally.',
  mode:'func', fn:'islands', starter:'def islands(grid):\n    ',
  tests:[{args:[[[1,1,0],[0,1,0],[0,0,1]]],expect:2},{args:[[[0,0],[0,0]]],expect:0},
         {args:[[[1]]],expect:1},{args:[[[1,0,1],[0,0,0],[1,0,1]]],expect:4}],
  hints:['Scan for an unvisited 1, then flood-fill everything reachable from it.','An explicit stack avoids recursion-depth problems on big grids.'],
  solution:'def islands(grid):\n    if not grid:\n        return 0\n    rows, cols = len(grid), len(grid[0])\n    seen = set()\n    count = 0\n    for r in range(rows):\n        for c in range(cols):\n            if grid[r][c] != 1 or (r, c) in seen:\n                continue\n            count += 1\n            stack = [(r, c)]\n            seen.add((r, c))\n            while stack:\n                y, x = stack.pop()\n                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n                    ny, nx = y + dy, x + dx\n                    if 0 <= ny < rows and 0 <= nx < cols and grid[ny][nx] == 1 and (ny, nx) not in seen:\n                        seen.add((ny, nx))\n                        stack.append((ny, nx))\n    return count'
},
{
  id:'context_manager', title:'Write a context manager', topic:'classes', rating:1930,
  prompt:'Write `run()`. Build a context manager `collect()` that gathers strings appended inside the `with` block and, on exit, joins them with `", "` into `collect.result`. Then use it to collect `"a"`, `"b"`, `"c"` and return the joined string.\n\nThe manager must also swallow a `ValueError` raised inside the block.',
  mode:'func', fn:'run', starter:'class collect:\n    ',
  tests:[{args:[],expect:'a, b, c'}],
  hints:['`__enter__` returns the object the `as` name binds to; `__exit__` runs on the way out.','Returning `True` from `__exit__` suppresses the exception.'],
  solution:'class collect:\n    result = ""\n\n    def __enter__(self):\n        self.items = []\n        return self.items\n\n    def __exit__(self, exc_type, exc, tb):\n        collect.result = ", ".join(self.items)\n        return exc_type is ValueError\n\n\ndef run():\n    with collect() as items:\n        items.append("a")\n        items.append("b")\n        items.append("c")\n        raise ValueError("ignored")\n    return collect.result'
},
{
  id:'json_flatten', title:'Flatten nested keys', topic:'dicts', rating:1960,
  prompt:'Write `flat(d)` turning nested dicts into one level with dotted keys.\n\n```\nflat({"a": {"b": 1, "c": {"d": 2}}, "e": 3})\n  ->  {"a.b": 1, "a.c.d": 2, "e": 3}\n```\nEmpty dicts disappear.',
  mode:'func', fn:'flat', starter:'def flat(d):\n    ',
  tests:[{args:[{a:{b:1,c:{d:2}},e:3}],expect:{'a.b':1,'a.c.d':2,e:3}},
         {args:[{}],expect:{}},{args:[{a:{}}],expect:{}},{args:[{a:1}],expect:{a:1}}],
  hints:['Recurse with a prefix argument.','Only recurse when the value is itself a dict.'],
  solution:'def flat(d, prefix=""):\n    out = {}\n    for k, v in d.items():\n        key = prefix + k\n        if isinstance(v, dict):\n            out.update(flat(v, key + "."))\n        else:\n            out[key] = v\n    return out'
},
{
  id:'longest_common_sub', title:'Longest common subsequence', topic:'dp', rating:1990,
  prompt:'Write `lcs(a, b)` returning the length of the longest subsequence present in both strings. Characters need not be adjacent, but order matters.\n\n```\nlcs("abcde", "ace")  ->  3\n```',
  mode:'func', fn:'lcs', starter:'def lcs(a, b):\n    ',
  tests:[{args:['abcde','ace'],expect:3},{args:['abc','abc'],expect:3},{args:['abc','def'],expect:0},
         {args:['',''],expect:0},{args:['bl','yby'],expect:1}],
  hints:['Table over prefixes of both strings.','Match -> `1 + dp[i-1][j-1]`; otherwise the best of dropping one character.'],
  solution:'def lcs(a, b):\n    prev = [0] * (len(b) + 1)\n    for ca in a:\n        cur = [0]\n        for j, cb in enumerate(b, 1):\n            cur.append(prev[j - 1] + 1 if ca == cb else max(prev[j], cur[j - 1]))\n        prev = cur\n    return prev[-1]'
},
{
  id:'expr_eval', title:'Evaluate an expression', topic:'algorithms', rating:2020,
  prompt:'Write `calc(s)` evaluating a string of non-negative integers with `+ - * /` and spaces, honouring precedence. Division truncates toward zero. No parentheses. Do not use `eval`.\n\n```\ncalc("3+2*2")   ->  7\ncalc(" 14/3/2") ->  2\n```',
  mode:'func', fn:'calc', starter:'def calc(s):\n    ',
  tests:[{args:['3+2*2'],expect:7},{args:[' 3/2 '],expect:1},{args:['3+5 / 2'],expect:5},
         {args:['42'],expect:42},{args:['2*3-4/2'],expect:4}],
  hints:['Keep a stack of terms; `*` and `/` fold into the last term straight away.','Sum the stack at the end.'],
  solution:'def calc(s):\n    stack = []\n    num = 0\n    op = "+"\n    s = s.replace(" ", "")\n    for i, c in enumerate(s):\n        if c.isdigit():\n            num = num * 10 + int(c)\n        if not c.isdigit() or i == len(s) - 1:\n            if op == "+":\n                stack.append(num)\n            elif op == "-":\n                stack.append(-num)\n            elif op == "*":\n                stack.append(stack.pop() * num)\n            else:\n                stack.append(int(stack.pop() / num))\n            op = c\n            num = 0\n    return sum(stack)'
},
{
  id:'word_ladder', title:'Word ladder length', topic:'graphs', rating:2050,
  prompt:'Write `ladder(begin, end, words)` returning the number of words in the shortest chain from `begin` to `end`, changing one letter at a time, where every intermediate word is in `words`. Return `0` if there is no chain. The chain length counts both ends.\n\n```\nladder("hit", "cog", ["hot","dot","dog","lot","log","cog"])  ->  5\n```',
  mode:'func', fn:'ladder', starter:'def ladder(begin, end, words):\n    ',
  tests:[{args:['hit','cog',['hot','dot','dog','lot','log','cog']],expect:5},
         {args:['hit','cog',['hot','dot','dog','lot','log']],expect:0},
         {args:['a','c',['b','c']],expect:2},
         {args:['ab','ab',['ab']],expect:1}],
  hints:['Breadth-first search over words, one letter changed per step.','Building `h*t`-style wildcard buckets keeps neighbour lookup cheap.'],
  solution:'from collections import deque\n\n\ndef ladder(begin, end, words):\n    pool = set(words)\n    if end not in pool and end != begin:\n        return 0\n    q = deque([(begin, 1)])\n    seen = {begin}\n    letters = "abcdefghijklmnopqrstuvwxyz"\n    while q:\n        word, steps = q.popleft()\n        if word == end:\n            return steps\n        for i in range(len(word)):\n            for ch in letters:\n                nxt = word[:i] + ch + word[i + 1:]\n                if nxt in pool and nxt not in seen:\n                    seen.add(nxt)\n                    q.append((nxt, steps + 1))\n    return 0'
},
{
  id:'median_stream', title:'Running median', topic:'algorithms', rating:2080,
  prompt:'Write `medians(nums)` returning the median after each number is added, as a list of floats. Must handle 100k values — sorting on every step is too slow.\n\n```\nmedians([1, 2, 3])  ->  [1.0, 1.5, 2.0]\n```',
  mode:'func', fn:'medians', starter:'import heapq\n\n\ndef medians(nums):\n    ',
  tests:[{args:[[1,2,3]],expect:[1.0,1.5,2.0],cmp:'approx'},
         {args:[[]],expect:[]},
         {args:[[5,15,1,3]],expect:[5.0,10.0,5.0,4.0],cmp:'approx'}],
  hints:['Two heaps: a max-heap of the lower half, a min-heap of the upper half.','Python only has min-heaps — negate the values for the lower half.'],
  solution:'import heapq\n\n\ndef medians(nums):\n    low, high = [], []   # low is a max-heap (negated)\n    out = []\n    for n in nums:\n        heapq.heappush(low, -n)\n        heapq.heappush(high, -heapq.heappop(low))\n        if len(high) > len(low):\n            heapq.heappush(low, -heapq.heappop(high))\n        out.append(float(-low[0]) if len(low) > len(high) else (-low[0] + high[0]) / 2)\n    return out'
},
{
  id:'meta_str', title:'A class with dunder methods', topic:'classes', rating:2110,
  prompt:'Write `run()`. Build a `Money` class holding `amount` and `currency` that supports `+` between the same currency (raising `ValueError` otherwise), compares equal by value, sorts by amount, and prints as `"12.50 GBP"`.\n\nReturn `[str(a + b), sorted_amounts, a == c]` where `a = Money(10, "GBP")`, `b = Money(2.5, "GBP")`, `c = Money(10, "GBP")` and `sorted_amounts` is the amounts of `sorted([b, a])`.',
  mode:'func', fn:'run', starter:'class Money:\n    ',
  tests:[{args:[],expect:['12.50 GBP',[2.5,10],true]}],
  hints:['`__add__`, `__eq__`, `__lt__` and `__str__`.','`f"{self.amount:.2f} {self.currency}"`'],
  solution:'class Money:\n    def __init__(self, amount, currency):\n        self.amount = amount\n        self.currency = currency\n\n    def __add__(self, other):\n        if self.currency != other.currency:\n            raise ValueError("currency mismatch")\n        return Money(self.amount + other.amount, self.currency)\n\n    def __eq__(self, other):\n        return (self.amount, self.currency) == (other.amount, other.currency)\n\n    def __lt__(self, other):\n        return self.amount < other.amount\n\n    def __str__(self):\n        return f"{self.amount:.2f} {self.currency}"\n\n\ndef run():\n    a, b, c = Money(10, "GBP"), Money(2.5, "GBP"), Money(10, "GBP")\n    return [str(a + b), [m.amount for m in sorted([b, a])], a == c]'
},
{
  id:'trap_rain', title:'Trapping rain water', topic:'algorithms', rating:2150,
  prompt:'Write `trapped(heights)` returning how much water is held between the bars of a histogram.\n\n```\ntrapped([0,1,0,2,1,0,1,3,2,1,2,1])  ->  6\n```',
  mode:'func', fn:'trapped', starter:'def trapped(heights):\n    ',
  tests:[{args:[[0,1,0,2,1,0,1,3,2,1,2,1]],expect:6},{args:[[]],expect:0},
         {args:[[3,0,3]],expect:3},{args:[[1,2,3]],expect:0}],
  hints:['Water above a bar = min(tallest to the left, tallest to the right) − its height.','Two pointers moving inwards do it in O(n) with O(1) memory.'],
  solution:'def trapped(heights):\n    if not heights:\n        return 0\n    lo, hi = 0, len(heights) - 1\n    left_max = right_max = total = 0\n    while lo < hi:\n        if heights[lo] < heights[hi]:\n            left_max = max(left_max, heights[lo])\n            total += left_max - heights[lo]\n            lo += 1\n        else:\n            right_max = max(right_max, heights[hi])\n            total += right_max - heights[hi]\n            hi -= 1\n    return total'
},
{
  id:'n_queens', title:'N queens count', topic:'recursion', rating:2200,
  prompt:'Write `queens(n)` counting the ways to place `n` non-attacking queens on an `n × n` board. `queens(8)` must finish quickly.',
  mode:'func', fn:'queens', starter:'def queens(n):\n    ',
  tests:[{args:[1],expect:1},{args:[4],expect:2},{args:[6],expect:4},{args:[8],expect:92},{args:[2],expect:0}],
  hints:['Place one queen per row; track used columns and both diagonals in sets.','The diagonals are identified by `row + col` and `row - col`.'],
  solution:'def queens(n):\n    cols, diag, anti = set(), set(), set()\n\n    def place(row):\n        if row == n:\n            return 1\n        total = 0\n        for c in range(n):\n            if c in cols or (row - c) in diag or (row + c) in anti:\n                continue\n            cols.add(c); diag.add(row - c); anti.add(row + c)\n            total += place(row + 1)\n            cols.remove(c); diag.remove(row - c); anti.remove(row + c)\n        return total\n\n    return place(0)'
},
{
  id:'text_justify', title:'Justify text', topic:'strings', rating:2250,
  prompt:'Write `justify(words, width)` laying words out into fully-justified lines of exactly `width` characters. Extra spaces go to the **left** gaps first. The last line is left-justified and padded with spaces on the right.\n\n```\njustify(["This","is","an","example"], 12)\n  ->  ["This  is  an", "example     "]\n```',
  mode:'func', fn:'justify', starter:'def justify(words, width):\n    ',
  tests:[{args:[['This','is','an','example'],12],expect:['This  is  an','example     ']},
         {args:[['a'],3],expect:['a  ']},
         {args:[['a','b','c'],3],expect:['a b','c  ']}],
  hints:['Greedily fill a line while the words plus one space each still fit.','With `k` gaps and `extra` leftover spaces, the first `extra` gaps get one more.'],
  solution:'def justify(words, width):\n    lines, cur, length = [], [], 0\n    for w in words:\n        if cur and length + len(cur) + len(w) > width:\n            lines.append(cur)\n            cur, length = [], 0\n        cur.append(w)\n        length += len(w)\n    if cur:\n        lines.append(cur)\n\n    out = []\n    for i, line in enumerate(lines):\n        if i == len(lines) - 1 or len(line) == 1:\n            s = " ".join(line)\n            out.append(s + " " * (width - len(s)))\n        else:\n            total = width - sum(len(w) for w in line)\n            gaps = len(line) - 1\n            base, extra = divmod(total, gaps)\n            s = ""\n            for j, w in enumerate(line[:-1]):\n                s += w + " " * (base + (1 if j < extra else 0))\n            out.append(s + line[-1])\n    return out'
},
{
  id:'grade_table', title:'Print a report', topic:'strings', rating:1120, mode:'stdout',
  prompt:'Read a number `n`, then `n` lines of `name score`. Print one line per student as `NAME: SCORE (GRADE)` where the grade is `A` for 90+, `B` for 80+, `C` for 70+, else `F`. Then print `Average: X.X` to one decimal place.',
  starter:'n = int(input())\n',
  tests:[{stdin:['2','Ada 95','Bob 71'],expect:'Ada: 95 (A)\nBob: 71 (C)\nAverage: 83.0'},
         {stdin:['1','Cy 60'],expect:'Cy: 60 (F)\nAverage: 60.0'}],
  hints:['`name, score = input().split()` then `int(score)`.','`f"Average: {avg:.1f}"`'],
  solution:'n = int(input())\nscores = []\nfor _ in range(n):\n    name, raw = input().split()\n    score = int(raw)\n    scores.append(score)\n    if score >= 90:\n        g = "A"\n    elif score >= 80:\n        g = "B"\n    elif score >= 70:\n        g = "C"\n    else:\n        g = "F"\n    print(f"{name}: {score} ({g})")\nprint(f"Average: {sum(scores) / len(scores):.1f}")'
},
{
  id:'sum_comprehension', title:'One-line comprehension', topic:'comprehensions', rating:1005,
  prompt:'Write `squares_of_odds(nums)` returning the squares of the odd numbers, in order, using a single list comprehension.',
  mode:'func', fn:'squares_of_odds', starter:'def squares_of_odds(nums):\n    return ',
  tests:[{args:[[1,2,3,4,5]],expect:[1,9,25]},{args:[[2,4]],expect:[]},{args:[[]],expect:[]}],
  hints:['`[n * n for n in nums if n % 2]`'],
  solution:'def squares_of_odds(nums):\n    return [n * n for n in nums if n % 2]'
},
{
  id:'zip_dict', title:'Build a dict from two lists', topic:'dicts', rating:1075,
  prompt:'Write `pair_up(keys, values)` returning a dict pairing them positionally. Extra items on either side are dropped.',
  mode:'func', fn:'pair_up', starter:'def pair_up(keys, values):\n    ',
  tests:[{args:[['a','b'],[1,2]],expect:{a:1,b:2}},{args:[['a'],[1,2,3]],expect:{a:1}},{args:[[],[]],expect:{}}],
  hints:['`dict(zip(keys, values))` — `zip` stops at the shorter one.'],
  solution:'def pair_up(keys, values):\n    return dict(zip(keys, values))'
},
{
  id:'default_args_trap', title:'The mutable default trap', topic:'functions', rating:1265,
  prompt:'`add_item` below is buggy — the list is shared between calls. Fix it so each call with no list starts fresh, then return the result of three separate calls.\n\n```python\ndef add_item(x, bucket=[]):\n    bucket.append(x)\n    return bucket\n```\nWrite `run()` returning `[add_item(1), add_item(2), add_item(3, [0])]`.',
  mode:'func', fn:'run', starter:'def add_item(x, bucket=None):\n    ',
  tests:[{args:[],expect:[[1],[2],[0,3]]}],
  hints:['Default to `None`, then build a new list inside the function.'],
  solution:'def add_item(x, bucket=None):\n    if bucket is None:\n        bucket = []\n    bucket.append(x)\n    return bucket\n\n\ndef run():\n    return [add_item(1), add_item(2), add_item(3, [0])]'
},
{
  id:'unique_pairs', title:'Pairs summing to a target', topic:'sets', rating:1345,
  prompt:'Write `pairs(nums, target)` returning every **distinct** pair `[a, b]` with `a <= b` and `a + b == target`, sorted ascending.\n\n```\npairs([1,2,3,4,3], 6)  ->  [[2,4],[3,3]]\n```',
  mode:'func', fn:'pairs', starter:'def pairs(nums, target):\n    ',
  tests:[{args:[[1,2,3,4,3],6],expect:[[2,4],[3,3]]},{args:[[1,1],2],expect:[[1,1]]},
         {args:[[1],5],expect:[]},{args:[[],0],expect:[]}],
  hints:['Count how many times each value appears — that settles the `a == b` case.','Collect the pairs in a set of tuples to remove duplicates.'],
  solution:'from collections import Counter\n\n\ndef pairs(nums, target):\n    counts = Counter(nums)\n    found = set()\n    for n in counts:\n        m = target - n\n        if m not in counts:\n            continue\n        if n == m and counts[n] < 2:\n            continue\n        found.add((min(n, m), max(n, m)))\n    return sorted([list(p) for p in found])'
},
{
  id:'clean_csv', title:'Clean a data row', topic:'strings', rating:1420,
  prompt:'Write `clean(row)` taking a comma-separated line and returning a list of trimmed values, with empty fields turned into `None` and numeric fields turned into numbers (`int` when whole, `float` otherwise).\n\n```\nclean(" a, 2 ,,3.5 ")  ->  ["a", 2, None, 3.5]\n```',
  mode:'func', fn:'clean', starter:'def clean(row):\n    ',
  tests:[{args:[' a, 2 ,,3.5 '],expect:['a',2,null,3.5]},
         {args:[''],expect:[null]},
         {args:['1,-2,x'],expect:[1,-2,'x']}],
  hints:['`.strip()` each field first.','Try `int(v)`, then `float(v)`, and fall back to the string.'],
  solution:'def clean(row):\n    out = []\n    for raw in row.split(","):\n        v = raw.strip()\n        if not v:\n            out.append(None)\n            continue\n        try:\n            out.append(int(v))\n            continue\n        except ValueError:\n            pass\n        try:\n            out.append(float(v))\n        except ValueError:\n            out.append(v)\n    return out'
},
{
  id:'rolling_avg', title:'Rolling average', topic:'lists', rating:1500,
  prompt:'Write `rolling(nums, k)` returning the average of every window of `k` consecutive values. Return `[]` when the list is shorter than `k`.\n\n```\nrolling([1,2,3,4], 2)  ->  [1.5, 2.5, 3.5]\n```',
  mode:'func', fn:'rolling', starter:'def rolling(nums, k):\n    ',
  tests:[{args:[[1,2,3,4],2],expect:[1.5,2.5,3.5],cmp:'approx'},
         {args:[[1],2],expect:[]},
         {args:[[2,2,2],3],expect:[2.0],cmp:'approx'}],
  hints:['Keep a running total: add the new value, drop the one leaving the window.'],
  solution:'def rolling(nums, k):\n    if k <= 0 or len(nums) < k:\n        return []\n    total = sum(nums[:k])\n    out = [total / k]\n    for i in range(k, len(nums)):\n        total += nums[i] - nums[i - k]\n        out.append(total / k)\n    return out'
},
{
  id:'partition_by', title:'Partition a list', topic:'functions', rating:1170,
  prompt:'Write `partition(nums, limit)` returning `[below, rest]` — two lists, the values strictly below `limit` and the rest, both in original order.',
  mode:'func', fn:'partition', starter:'def partition(nums, limit):\n    ',
  tests:[{args:[[1,5,3,9],4],expect:[[1,3],[5,9]]},{args:[[],0],expect:[[],[]]},{args:[[5],5],expect:[[],[5]]}],
  hints:['One pass, appending to whichever list applies.'],
  solution:'def partition(nums, limit):\n    below, rest = [], []\n    for n in nums:\n        (below if n < limit else rest).append(n)\n    return [below, rest]'
},
);
