/* Interview-style questions, part 1: arrays, hashing, two pointers, sliding
   windows, stacks, binary search, intervals, greedy and bit tricks.

   These are hand-written and each one is a distinct problem — this is the
   part of the bank that looks like a coding-interview set.                 */

window.QUESTIONS.push(
{
  id:'lc_contains_duplicate', title:'Contains duplicate', topic:'hashing', rating:1240,
  prompt:'Write `has_duplicate(nums)` returning `True` when any value appears more than once.',
  mode:'func', fn:'has_duplicate', starter:'def has_duplicate(nums):\n    ',
  tests:[{args:[[1,2,3,1]],expect:true},{args:[[1,2,3]],expect:false},{args:[[]],expect:false},{args:[[7,7]],expect:true}],
  hints:['A `set` drops duplicates — compare its size with the list\'s.'],
  solution:'def has_duplicate(nums):\n    return len(set(nums)) != len(nums)'
},
{
  id:'lc_valid_anagram', title:'Valid anagram', topic:'hashing', rating:1300,
  prompt:'Write `is_anagram(s, t)` returning `True` when `t` is a rearrangement of `s`. Exact characters, case-sensitive.',
  mode:'func', fn:'is_anagram', starter:'def is_anagram(s, t):\n    ',
  tests:[{args:['anagram','nagaram'],expect:true},{args:['rat','car'],expect:false},
         {args:['','' ],expect:true},{args:['a','ab'],expect:false}],
  hints:['Different lengths can never match.','`collections.Counter(s) == Counter(t)`'],
  solution:'from collections import Counter\n\n\ndef is_anagram(s, t):\n    return Counter(s) == Counter(t)'
},
{
  id:'lc_group_anagrams', title:'Group anagrams', topic:'hashing', rating:1650,
  prompt:'Write `group_anagrams(words)` grouping words that are anagrams of each other. Sort each group, then sort the list of groups.\n\n```\ngroup_anagrams(["eat","tea","tan","ate","nat","bat"])\n  ->  [["ate","eat","tea"],["bat"],["nat","tan"]]\n```',
  mode:'func', fn:'group_anagrams', starter:'def group_anagrams(words):\n    ',
  tests:[{args:[['eat','tea','tan','ate','nat','bat']],expect:[['ate','eat','tea'],['bat'],['nat','tan']]},
         {args:[[]],expect:[]},{args:[['a']],expect:[['a']]}],
  hints:['The sorted letters of a word make a good dict key.','`"".join(sorted(word))`'],
  solution:'def group_anagrams(words):\n    buckets = {}\n    for w in words:\n        buckets.setdefault("".join(sorted(w)), []).append(w)\n    return sorted(sorted(g) for g in buckets.values())'
},
{
  id:'lc_top_k_frequent', title:'Top K frequent elements', topic:'hashing', rating:1620,
  prompt:'Write `top_k(nums, k)` returning the `k` most frequent values, most frequent first, ties broken by the smaller value first.\n\n```\ntop_k([1,1,1,2,2,3], 2)  ->  [1, 2]\n```',
  mode:'func', fn:'top_k', starter:'def top_k(nums, k):\n    ',
  tests:[{args:[[1,1,1,2,2,3],2],expect:[1,2]},{args:[[1],1],expect:[1]},
         {args:[[],3],expect:[]},{args:[[4,4,5,5,6],2],expect:[4,5]}],
  hints:['`Counter(nums).items()` gives value/count pairs.','`sorted(..., key=lambda kv: (-kv[1], kv[0]))` then slice.'],
  solution:'from collections import Counter\n\n\ndef top_k(nums, k):\n    counts = Counter(nums)\n    ordered = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))\n    return [v for v, _ in ordered[:k]]'
},
{
  id:'lc_product_except_self', title:'Product of array except self', topic:'arrays', rating:1830,
  prompt:'Write `products(nums)` where `products(nums)[i]` is the product of every value **except** `nums[i]`. Do it without division, in O(n).\n\n```\nproducts([1,2,3,4])  ->  [24,12,8,6]\n```',
  mode:'func', fn:'products', starter:'def products(nums):\n    ',
  tests:[{args:[[1,2,3,4]],expect:[24,12,8,6]},{args:[[-1,1,0,-3,3]],expect:[0,0,9,0,0]},
         {args:[[2,3]],expect:[3,2]},{args:[[]],expect:[]}],
  hints:['Two passes: everything to the left, then everything to the right.','Carry a running product in each direction.'],
  solution:'def products(nums):\n    n = len(nums)\n    out = [1] * n\n    left = 1\n    for i in range(n):\n        out[i] = left\n        left *= nums[i]\n    right = 1\n    for i in range(n - 1, -1, -1):\n        out[i] *= right\n        right *= nums[i]\n    return out'
},
{
  id:'lc_longest_consecutive', title:'Longest consecutive sequence', topic:'hashing', rating:1950,
  prompt:'Write `longest_run(nums)` returning the length of the longest run of consecutive integers (in any order). Must be O(n) — sorting is too slow for the intent.\n\n```\nlongest_run([100,4,200,1,3,2])  ->  4\n```',
  mode:'func', fn:'longest_run', starter:'def longest_run(nums):\n    ',
  tests:[{args:[[100,4,200,1,3,2]],expect:4},{args:[[0,3,7,2,5,8,4,6,0,1]],expect:9},
         {args:[[]],expect:0},{args:[[5,5,5]],expect:1}],
  hints:['Put everything in a set for O(1) membership tests.','Only start counting at a value whose predecessor is missing.'],
  solution:'def longest_run(nums):\n    pool = set(nums)\n    best = 0\n    for n in pool:\n        if n - 1 in pool:\n            continue\n        length = 1\n        while n + length in pool:\n            length += 1\n        best = max(best, length)\n    return best'
},
{
  id:'lc_two_sum_sorted', title:'Two sum on a sorted array', topic:'two-pointers', rating:1520,
  prompt:'`nums` is sorted ascending. Write `two_sum(nums, target)` returning the **1-indexed** positions `[i, j]` of the two values summing to `target`, or `[]` if there are none. Use O(1) extra space.\n\n```\ntwo_sum([2,7,11,15], 9)  ->  [1, 2]\n```',
  mode:'func', fn:'two_sum', starter:'def two_sum(nums, target):\n    ',
  tests:[{args:[[2,7,11,15],9],expect:[1,2]},{args:[[2,3,4],6],expect:[1,3]},
         {args:[[-1,0],-1],expect:[1,2]},{args:[[1,2],7],expect:[]}],
  hints:['One pointer at each end.','Sum too small -> move the left pointer right; too big -> move the right pointer left.'],
  solution:'def two_sum(nums, target):\n    lo, hi = 0, len(nums) - 1\n    while lo < hi:\n        total = nums[lo] + nums[hi]\n        if total == target:\n            return [lo + 1, hi + 1]\n        if total < target:\n            lo += 1\n        else:\n            hi -= 1\n    return []'
},
{
  id:'lc_three_sum', title:'3Sum', topic:'two-pointers', rating:2050,
  prompt:'Write `three_sum(nums)` returning every distinct triple `[a, b, c]` with `a + b + c == 0`. Each triple is sorted ascending, and the list of triples is sorted too.\n\n```\nthree_sum([-1,0,1,2,-1,-4])  ->  [[-1,-1,2],[-1,0,1]]\n```',
  mode:'func', fn:'three_sum', starter:'def three_sum(nums):\n    ',
  tests:[{args:[[-1,0,1,2,-1,-4]],expect:[[-1,-1,2],[-1,0,1]]},{args:[[0,1,1]],expect:[]},
         {args:[[0,0,0,0]],expect:[[0,0,0]]},{args:[[]],expect:[]}],
  hints:['Sort first, then fix one value and two-pointer the rest.','Skip a value equal to the previous one to avoid duplicate triples.'],
  solution:'def three_sum(nums):\n    nums = sorted(nums)\n    out = []\n    for i in range(len(nums) - 2):\n        if i and nums[i] == nums[i - 1]:\n            continue\n        lo, hi = i + 1, len(nums) - 1\n        while lo < hi:\n            total = nums[i] + nums[lo] + nums[hi]\n            if total < 0:\n                lo += 1\n            elif total > 0:\n                hi -= 1\n            else:\n                out.append([nums[i], nums[lo], nums[hi]])\n                lo += 1\n                while lo < hi and nums[lo] == nums[lo - 1]:\n                    lo += 1\n                hi -= 1\n    return out'
},
{
  id:'lc_container_water', title:'Container with most water', topic:'two-pointers', rating:1900,
  prompt:'Each value in `heights` is the height of a vertical line at that index. Write `most_water(heights)` returning the largest area of water two lines can hold between them.\n\n```\nmost_water([1,8,6,2,5,4,8,3,7])  ->  49\n```',
  mode:'func', fn:'most_water', starter:'def most_water(heights):\n    ',
  tests:[{args:[[1,8,6,2,5,4,8,3,7]],expect:49},{args:[[1,1]],expect:1},
         {args:[[]],expect:0},{args:[[4,3,2,1,4]],expect:16}],
  hints:['Two pointers, one at each end — the width only shrinks.','Move whichever side is shorter; the taller one can never help you by moving.'],
  solution:'def most_water(heights):\n    lo, hi = 0, len(heights) - 1\n    best = 0\n    while lo < hi:\n        best = max(best, (hi - lo) * min(heights[lo], heights[hi]))\n        if heights[lo] < heights[hi]:\n            lo += 1\n        else:\n            hi -= 1\n    return best'
},
{
  id:'lc_trapping_rain', title:'Trapping rain water', topic:'two-pointers', rating:2200,
  prompt:'Write `trapped(heights)` returning how much rain water is held between the bars of a histogram. O(n) time, O(1) extra space.\n\n```\ntrapped([0,1,0,2,1,0,1,3,2,1,2,1])  ->  6\n```',
  mode:'func', fn:'trapped', starter:'def trapped(heights):\n    ',
  tests:[{args:[[0,1,0,2,1,0,1,3,2,1,2,1]],expect:6},{args:[[4,2,0,3,2,5]],expect:9},
         {args:[[]],expect:0},{args:[[1,2,3]],expect:0}],
  hints:['Water over a bar is `min(tallest left, tallest right) - height`.','Two pointers moving inwards, each tracking its own running maximum.'],
  solution:'def trapped(heights):\n    if not heights:\n        return 0\n    lo, hi = 0, len(heights) - 1\n    left_max = right_max = total = 0\n    while lo < hi:\n        if heights[lo] < heights[hi]:\n            left_max = max(left_max, heights[lo])\n            total += left_max - heights[lo]\n            lo += 1\n        else:\n            right_max = max(right_max, heights[hi])\n            total += right_max - heights[hi]\n            hi -= 1\n    return total'
},
{
  id:'lc_longest_no_repeat', title:'Longest substring without repeats', topic:'sliding-window', rating:1780,
  prompt:'Write `longest(s)` returning the length of the longest substring with no repeated character.\n\n```\nlongest("abcabcbb")  ->  3\n```',
  mode:'func', fn:'longest', starter:'def longest(s):\n    ',
  tests:[{args:['abcabcbb'],expect:3},{args:['bbbbb'],expect:1},{args:['pwwkew'],expect:3},{args:[''],expect:0}],
  hints:['Slide a window and remember the last index of each character.','On a repeat inside the window, jump the start past its previous position.'],
  solution:'def longest(s):\n    last = {}\n    start = best = 0\n    for i, c in enumerate(s):\n        if c in last and last[c] >= start:\n            start = last[c] + 1\n        last[c] = i\n        best = max(best, i - start + 1)\n    return best'
},
{
  id:'lc_char_replacement', title:'Longest repeating character replacement', topic:'sliding-window', rating:2130,
  prompt:'Write `longest(s, k)` returning the length of the longest substring you can make all-one-character by replacing at most `k` characters.\n\n```\nlongest("AABABBA", 1)  ->  4\n```',
  mode:'func', fn:'longest', starter:'def longest(s, k):\n    ',
  tests:[{args:['ABAB',2],expect:4},{args:['AABABBA',1],expect:4},{args:['',2],expect:0},{args:['AAAA',0],expect:4}],
  hints:['A window is valid when `window length - count of its most common character <= k`.','Grow the window; shrink it from the left only when it becomes invalid.'],
  solution:'from collections import Counter\n\n\ndef longest(s, k):\n    counts = Counter()\n    start = best = 0\n    for i, c in enumerate(s):\n        counts[c] += 1\n        while (i - start + 1) - max(counts.values()) > k:\n            counts[s[start]] -= 1\n            start += 1\n        best = max(best, i - start + 1)\n    return best'
},
{
  id:'lc_min_window', title:'Minimum window substring', topic:'sliding-window', rating:2450,
  prompt:'Write `min_window(s, t)` returning the shortest substring of `s` containing every character of `t` (counting repeats), or `""` when there is none. Ties go to the earliest window.\n\n```\nmin_window("ADOBECODEBANC", "ABC")  ->  "BANC"\n```',
  mode:'func', fn:'min_window', starter:'def min_window(s, t):\n    ',
  tests:[{args:['ADOBECODEBANC','ABC'],expect:'BANC'},{args:['a','a'],expect:'a'},
         {args:['a','aa'],expect:''},{args:['',''],expect:''}],
  hints:['Count what `t` needs, then slide a window keeping a "how many still missing" number.','Once the window is valid, shrink from the left while it stays valid.'],
  solution:'from collections import Counter\n\n\ndef min_window(s, t):\n    if not t or not s:\n        return ""\n    need = Counter(t)\n    missing = len(t)\n    best = ""\n    start = 0\n    for i, c in enumerate(s):\n        if need[c] > 0:\n            missing -= 1\n        need[c] -= 1\n        while missing == 0:\n            if not best or i - start + 1 < len(best):\n                best = s[start:i + 1]\n            need[s[start]] += 1\n            if need[s[start]] > 0:\n                missing += 1\n            start += 1\n    return best'
},
{
  id:'lc_sliding_max', title:'Sliding window maximum', topic:'sliding-window', rating:2350,
  prompt:'Write `window_max(nums, k)` returning the maximum of every window of `k` consecutive values. Must be O(n) — re-scanning each window is too slow.\n\n```\nwindow_max([1,3,-1,-3,5,3,6,7], 3)  ->  [3,3,5,5,6,7]\n```',
  mode:'func', fn:'window_max', starter:'from collections import deque\n\n\ndef window_max(nums, k):\n    ',
  tests:[{args:[[1,3,-1,-3,5,3,6,7],3],expect:[3,3,5,5,6,7]},{args:[[1],1],expect:[1]},
         {args:[[],3],expect:[]},{args:[[9,8,7],2],expect:[9,8]}],
  hints:['Keep a deque of indices whose values are decreasing.','Pop from the back anything smaller than the incoming value; pop from the front anything that has left the window.'],
  solution:'from collections import deque\n\n\ndef window_max(nums, k):\n    if not nums or k <= 0:\n        return []\n    dq = deque()\n    out = []\n    for i, n in enumerate(nums):\n        while dq and nums[dq[-1]] <= n:\n            dq.pop()\n        dq.append(i)\n        if dq[0] <= i - k:\n            dq.popleft()\n        if i >= k - 1:\n            out.append(nums[dq[0]])\n    return out'
},
{
  id:'lc_valid_parentheses', title:'Valid parentheses', topic:'stack', rating:1420,
  prompt:'Write `valid(s)` returning `True` when every `()`, `[]` and `{}` in the string is correctly opened, nested and closed. The string holds nothing else.',
  mode:'func', fn:'valid', starter:'def valid(s):\n    ',
  tests:[{args:['()[]{}'],expect:true},{args:['(]'],expect:false},{args:['([)]'],expect:false},
         {args:[''],expect:true},{args:['('],expect:false}],
  hints:['Push openers onto a stack; on a closer, check the top matches.','The stack must be empty at the end.'],
  solution:'def valid(s):\n    pairs = {")": "(", "]": "[", "}": "{"}\n    stack = []\n    for c in s:\n        if c in "([{":\n            stack.append(c)\n        else:\n            if not stack or stack.pop() != pairs[c]:\n                return False\n    return not stack'
},
{
  id:'lc_min_stack', title:'Min stack', topic:'design', rating:1880,
  prompt:'Build a stack with `push(x)`, `pop()`, `top()` and `get_min()` — all O(1). `pop`/`top`/`get_min` on an empty stack return `None`.\n\nThen write `run(ops)` applying each operation and returning the results of every `pop`, `top` and `get_min`, in order.\n\n```\nrun([["push",-2],["push",0],["push",-3],["get_min"],["pop"],["top"],["get_min"]])\n  ->  [-3, -3, 0, -2]\n```',
  mode:'func', fn:'run', starter:'class MinStack:\n    def __init__(self):\n        ',
  tests:[{args:[[['push',-2],['push',0],['push',-3],['get_min'],['pop'],['top'],['get_min']]],expect:[-3,-3,0,-2]},
         {args:[[['get_min']]],expect:[null]},
         {args:[[['push',1],['push',1],['pop'],['get_min']]],expect:[1,1]}],
  hints:['Keep a second stack holding the minimum so far at each depth.','Push onto it every time, so popping stays in step.'],
  solution:'class MinStack:\n    def __init__(self):\n        self.items = []\n        self.mins = []\n\n    def push(self, x):\n        self.items.append(x)\n        self.mins.append(x if not self.mins else min(x, self.mins[-1]))\n\n    def pop(self):\n        if not self.items:\n            return None\n        self.mins.pop()\n        return self.items.pop()\n\n    def top(self):\n        return self.items[-1] if self.items else None\n\n    def get_min(self):\n        return self.mins[-1] if self.mins else None\n\n\ndef run(ops):\n    st = MinStack()\n    out = []\n    for op in ops:\n        if op[0] == "push":\n            st.push(op[1])\n        else:\n            out.append(getattr(st, op[0])())\n    return out'
},
{
  id:'lc_rpn', title:'Evaluate reverse Polish notation', topic:'stack', rating:1760,
  prompt:'Write `evaluate(tokens)` for an expression in reverse Polish notation. Operators are `+ - * /`; division truncates toward zero.\n\n```\nevaluate(["2","1","+","3","*"])  ->  9\n```',
  mode:'func', fn:'evaluate', starter:'def evaluate(tokens):\n    ',
  tests:[{args:[['2','1','+','3','*']],expect:9},{args:[['4','13','5','/','+']],expect:6},
         {args:[['5']],expect:5},{args:[['7','-3','/']],expect:-2}],
  hints:['A stack: numbers get pushed, an operator pops two and pushes the result.','`int(a / b)` truncates toward zero; `//` does not.'],
  solution:'def evaluate(tokens):\n    stack = []\n    for tok in tokens:\n        if tok in ("+", "-", "*", "/"):\n            b = stack.pop()\n            a = stack.pop()\n            if tok == "+":\n                stack.append(a + b)\n            elif tok == "-":\n                stack.append(a - b)\n            elif tok == "*":\n                stack.append(a * b)\n            else:\n                stack.append(int(a / b))\n        else:\n            stack.append(int(tok))\n    return stack[-1]'
},
{
  id:'lc_daily_temperatures', title:'Daily temperatures', topic:'stack', rating:1920,
  prompt:'Write `warmer(temps)` where entry `i` is how many days you wait after day `i` for a warmer temperature, or `0` if none ever comes.\n\n```\nwarmer([73,74,75,71,69,72,76,73])  ->  [1,1,4,2,1,1,0,0]\n```',
  mode:'func', fn:'warmer', starter:'def warmer(temps):\n    ',
  tests:[{args:[[73,74,75,71,69,72,76,73]],expect:[1,1,4,2,1,1,0,0]},{args:[[30,40,50,60]],expect:[1,1,1,0]},
         {args:[[]],expect:[]},{args:[[5,5]],expect:[0,0]}],
  hints:['A monotonic stack of indices whose answers are still unknown.','When today beats the top of the stack, you have just answered that day.'],
  solution:'def warmer(temps):\n    out = [0] * len(temps)\n    stack = []\n    for i, t in enumerate(temps):\n        while stack and temps[stack[-1]] < t:\n            j = stack.pop()\n            out[j] = i - j\n        stack.append(i)\n    return out'
},
{
  id:'lc_largest_rectangle', title:'Largest rectangle in a histogram', topic:'stack', rating:2500,
  prompt:'Write `largest(heights)` returning the area of the biggest rectangle that fits inside the histogram.\n\n```\nlargest([2,1,5,6,2,3])  ->  10\n```',
  mode:'func', fn:'largest', starter:'def largest(heights):\n    ',
  tests:[{args:[[2,1,5,6,2,3]],expect:10},{args:[[2,4]],expect:4},{args:[[]],expect:0},{args:[[5]],expect:5}],
  hints:['A stack of increasing bar heights, storing the index each bar could extend back to.','When a shorter bar arrives, pop and settle the rectangles that just ended.'],
  solution:'def largest(heights):\n    stack = []\n    best = 0\n    for i, h in enumerate(heights + [0]):\n        start = i\n        while stack and stack[-1][1] > h:\n            idx, height = stack.pop()\n            best = max(best, height * (i - idx))\n            start = idx\n        stack.append((start, h))\n    return best'
},
{
  id:'lc_car_fleet', title:'Car fleet', topic:'stack', rating:2280,
  prompt:'Cars start at `positions` on a one-lane road, each moving at its own `speed` toward a finish at `target`. A faster car catching a slower one joins its fleet and matches its speed. Write `fleets(target, positions, speeds)` returning how many fleets arrive.\n\n```\nfleets(12, [10,8,0,5,3], [2,4,1,1,3])  ->  3\n```',
  mode:'func', fn:'fleets', starter:'def fleets(target, positions, speeds):\n    ',
  tests:[{args:[12,[10,8,0,5,3],[2,4,1,1,3]],expect:3},{args:[10,[3],[3]],expect:1},
         {args:[100,[0,2,4],[4,2,1]],expect:1},{args:[10,[],[]],expect:0}],
  hints:['Sort the cars from the one closest to the target backwards.','A car joins the fleet ahead when its arrival time is not later than that fleet\'s.'],
  solution:'def fleets(target, positions, speeds):\n    cars = sorted(zip(positions, speeds), reverse=True)\n    times = []\n    for pos, speed in cars:\n        t = (target - pos) / speed\n        if not times or t > times[-1]:\n            times.append(t)\n    return len(times)'
},
{
  id:'lc_search_rotated', title:'Search in a rotated sorted array', topic:'binary-search', rating:2080,
  prompt:'`nums` was sorted ascending with distinct values, then rotated at some pivot. Write `search(nums, target)` returning its index or `-1`, in O(log n).\n\n```\nsearch([4,5,6,7,0,1,2], 0)  ->  4\n```',
  mode:'func', fn:'search', starter:'def search(nums, target):\n    ',
  tests:[{args:[[4,5,6,7,0,1,2],0],expect:4},{args:[[4,5,6,7,0,1,2],3],expect:-1},
         {args:[[1],1],expect:0},{args:[[],5],expect:-1}],
  hints:['At every step one half is properly sorted — work out which.','If the target lies inside that sorted half, search it; otherwise search the other.'],
  solution:'def search(nums, target):\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[lo] <= nums[mid]:\n            if nums[lo] <= target < nums[mid]:\n                hi = mid - 1\n            else:\n                lo = mid + 1\n        else:\n            if nums[mid] < target <= nums[hi]:\n                lo = mid + 1\n            else:\n                hi = mid - 1\n    return -1'
},
{
  id:'lc_min_rotated', title:'Minimum in a rotated sorted array', topic:'binary-search', rating:1980,
  prompt:'Write `find_min(nums)` returning the smallest value of a rotated sorted array of distinct values, in O(log n). Return `None` when empty.',
  mode:'func', fn:'find_min', starter:'def find_min(nums):\n    ',
  tests:[{args:[[3,4,5,1,2]],expect:1},{args:[[4,5,6,7,0,1,2]],expect:0},
         {args:[[11,13,15,17]],expect:11},{args:[[]],expect:null}],
  hints:['Compare the middle with the right-hand end.','`nums[mid] > nums[hi]` means the smallest value is to the right of `mid`.'],
  solution:'def find_min(nums):\n    if not nums:\n        return None\n    lo, hi = 0, len(nums) - 1\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if nums[mid] > nums[hi]:\n            lo = mid + 1\n        else:\n            hi = mid\n    return nums[lo]'
},
{
  id:'lc_koko', title:'Koko eating bananas', topic:'binary-search', rating:2170,
  prompt:'Piles of bananas must all be eaten within `hours` hours. At speed `k` per hour, a pile of `p` takes `ceil(p / k)` hours. Write `min_speed(piles, hours)` returning the smallest whole `k` that works.\n\n```\nmin_speed([3,6,7,11], 8)  ->  4\n```',
  mode:'func', fn:'min_speed', starter:'def min_speed(piles, hours):\n    ',
  tests:[{args:[[3,6,7,11],8],expect:4},{args:[[30,11,23,4,20],5],expect:30},
         {args:[[30,11,23,4,20],6],expect:23},{args:[[1],1],expect:1}],
  hints:['Binary search the *answer*: speeds from 1 to the largest pile.','For a candidate speed, add up `math.ceil(p / k)` and compare with `hours`.'],
  solution:'import math\n\n\ndef min_speed(piles, hours):\n    lo, hi = 1, max(piles)\n    while lo < hi:\n        mid = (lo + hi) // 2\n        need = sum(math.ceil(p / mid) for p in piles)\n        if need <= hours:\n            hi = mid\n        else:\n            lo = mid + 1\n    return lo'
},
{
  id:'lc_median_two_sorted', title:'Median of two sorted arrays', topic:'binary-search', rating:2600,
  prompt:'Write `median(a, b)` returning the median of two sorted arrays combined, as a float. Aim for O(log(min(n, m))).\n\n```\nmedian([1,3], [2])  ->  2.0\n```',
  mode:'func', fn:'median', starter:'def median(a, b):\n    ',
  tests:[{args:[[1,3],[2]],expect:2.0,cmp:'approx'},{args:[[1,2],[3,4]],expect:2.5,cmp:'approx'},
         {args:[[],[1]],expect:1.0,cmp:'approx'},{args:[[2],[]],expect:2.0,cmp:'approx'}],
  hints:['Binary search a split point in the shorter array.','A split is right when every value left of it is <= every value right of the other split.'],
  solution:'def median(a, b):\n    if len(a) > len(b):\n        a, b = b, a\n    n, m = len(a), len(b)\n    half = (n + m + 1) // 2\n    lo, hi = 0, n\n    while lo <= hi:\n        i = (lo + hi) // 2\n        j = half - i\n        left_a = a[i - 1] if i else float("-inf")\n        right_a = a[i] if i < n else float("inf")\n        left_b = b[j - 1] if j else float("-inf")\n        right_b = b[j] if j < m else float("inf")\n        if left_a <= right_b and left_b <= right_a:\n            if (n + m) % 2:\n                return float(max(left_a, left_b))\n            return (max(left_a, left_b) + min(right_a, right_b)) / 2\n        if left_a > right_b:\n            hi = i - 1\n        else:\n            lo = i + 1\n    return 0.0'
},
{
  id:'lc_time_map', title:'Time-based key-value store', topic:'design', rating:2200,
  prompt:'Build `TimeMap` with `set(key, value, timestamp)` and `get(key, timestamp)` returning the value stored at the largest timestamp **not after** the one asked for, or `""`. Timestamps arrive in increasing order per key.\n\nThen write `run(ops)` applying each operation and returning every `get` result.\n\n```\nrun([["set","a","x",1],["get","a",1],["get","a",3],["get","b",1]])\n  ->  ["x", "x", ""]\n```',
  mode:'func', fn:'run', starter:'import bisect\n\n\nclass TimeMap:\n    def __init__(self):\n        ',
  tests:[{args:[[['set','a','x',1],['get','a',1],['get','a',3],['get','b',1]]],expect:['x','x','']},
         {args:[[['get','z',5]]],expect:['']},
         {args:[[['set','k','v1',1],['set','k','v2',4],['get','k',3],['get','k',4]]],expect:['v1','v2']}],
  hints:['Store a list of `(timestamp, value)` per key — already sorted.','`bisect.bisect_right` finds the first entry after the timestamp; step back one.'],
  solution:'import bisect\n\n\nclass TimeMap:\n    def __init__(self):\n        self.data = {}\n\n    def set(self, key, value, timestamp):\n        self.data.setdefault(key, []).append((timestamp, value))\n\n    def get(self, key, timestamp):\n        entries = self.data.get(key, [])\n        i = bisect.bisect_right(entries, (timestamp, chr(0x10FFFF)))\n        return entries[i - 1][1] if i else ""\n\n\ndef run(ops):\n    tm = TimeMap()\n    out = []\n    for op in ops:\n        if op[0] == "set":\n            tm.set(op[1], op[2], op[3])\n        else:\n            out.append(tm.get(op[1], op[2]))\n    return out'
},
{
  id:'lc_merge_intervals', title:'Merge intervals', topic:'intervals', rating:1800,
  prompt:'Write `merge(intervals)` combining every overlapping or touching `[start, end]`, output sorted by start.\n\n```\nmerge([[1,3],[2,6],[8,10],[15,18]])  ->  [[1,6],[8,10],[15,18]]\n```',
  mode:'func', fn:'merge', starter:'def merge(intervals):\n    ',
  tests:[{args:[[[1,3],[2,6],[8,10],[15,18]]],expect:[[1,6],[8,10],[15,18]]},
         {args:[[[1,4],[4,5]]],expect:[[1,5]]},{args:[[]],expect:[]},{args:[[[5,6],[1,2]]],expect:[[1,2],[5,6]]}],
  hints:['Sort by start — then you only ever compare with the last kept interval.','They overlap when `start <= last_end`.'],
  solution:'def merge(intervals):\n    out = []\n    for start, end in sorted(intervals):\n        if out and start <= out[-1][1]:\n            out[-1][1] = max(out[-1][1], end)\n        else:\n            out.append([start, end])\n    return out'
},
{
  id:'lc_insert_interval', title:'Insert interval', topic:'intervals', rating:1960,
  prompt:'`intervals` is sorted and non-overlapping. Write `insert(intervals, new)` adding `new` and merging anything it overlaps.\n\n```\ninsert([[1,3],[6,9]], [2,5])  ->  [[1,5],[6,9]]\n```',
  mode:'func', fn:'insert', starter:'def insert(intervals, new):\n    ',
  tests:[{args:[[[1,3],[6,9]],[2,5]],expect:[[1,5],[6,9]]},
         {args:[[[1,2],[3,5],[6,7],[8,10],[12,16]],[4,8]],expect:[[1,2],[3,10],[12,16]]},
         {args:[[],[5,7]],expect:[[5,7]]},{args:[[[1,5]],[6,8]],expect:[[1,5],[6,8]]}],
  hints:['Three phases: everything entirely before, the overlapping run, everything entirely after.','While merging, widen `new` to cover what it touches.'],
  solution:'def insert(intervals, new):\n    out = []\n    start, end = new\n    i = 0\n    while i < len(intervals) and intervals[i][1] < start:\n        out.append(intervals[i])\n        i += 1\n    while i < len(intervals) and intervals[i][0] <= end:\n        start = min(start, intervals[i][0])\n        end = max(end, intervals[i][1])\n        i += 1\n    out.append([start, end])\n    out.extend(intervals[i:])\n    return out'
},
{
  id:'lc_non_overlapping', title:'Non-overlapping intervals', topic:'intervals', rating:2120,
  prompt:'Write `min_removals(intervals)` returning the fewest intervals you must delete so none of the rest overlap. Touching at an endpoint is fine.\n\n```\nmin_removals([[1,2],[2,3],[3,4],[1,3]])  ->  1\n```',
  mode:'func', fn:'min_removals', starter:'def min_removals(intervals):\n    ',
  tests:[{args:[[[1,2],[2,3],[3,4],[1,3]]],expect:1},{args:[[[1,2],[1,2],[1,2]]],expect:2},
         {args:[[[1,2],[2,3]]],expect:0},{args:[[]],expect:0}],
  hints:['Greedy: sort by **end**, then always keep the interval that finishes earliest.','Count the ones whose start is before the end you last kept.'],
  solution:'def min_removals(intervals):\n    removed = 0\n    last_end = float("-inf")\n    for start, end in sorted(intervals, key=lambda iv: iv[1]):\n        if start < last_end:\n            removed += 1\n        else:\n            last_end = end\n    return removed'
},
{
  id:'lc_meeting_rooms', title:'Meeting rooms needed', topic:'intervals', rating:2090,
  prompt:'Write `rooms(meetings)` returning the fewest rooms needed to hold every `[start, end]` meeting. A meeting ending exactly when another starts can share a room.\n\n```\nrooms([[0,30],[5,10],[15,20]])  ->  2\n```',
  mode:'func', fn:'rooms', starter:'def rooms(meetings):\n    ',
  tests:[{args:[[[0,30],[5,10],[15,20]]],expect:2},{args:[[[7,10],[2,4]]],expect:1},
         {args:[[]],expect:0},{args:[[[1,5],[2,6],[3,7]]],expect:3}],
  hints:['Sort the starts and the ends separately and sweep through them.','Or use a min-heap of end times: pop everything that has already finished.'],
  solution:'import heapq\n\n\ndef rooms(meetings):\n    ends = []\n    for start, end in sorted(meetings):\n        if ends and ends[0] <= start:\n            heapq.heappop(ends)\n        heapq.heappush(ends, end)\n    return len(ends)'
},
{
  id:'lc_jump_game', title:'Jump game', topic:'greedy', rating:1870,
  prompt:'Each value is the furthest you may jump from that index. Write `can_finish(nums)` returning `True` when the last index is reachable from index 0.\n\n```\ncan_finish([2,3,1,1,4])  ->  True\ncan_finish([3,2,1,0,4])  ->  False\n```',
  mode:'func', fn:'can_finish', starter:'def can_finish(nums):\n    ',
  tests:[{args:[[2,3,1,1,4]],expect:true},{args:[[3,2,1,0,4]],expect:false},
         {args:[[0]],expect:true},{args:[[]],expect:true}],
  hints:['Track the furthest index reached so far.','If you reach an index beyond that, you can never get there.'],
  solution:'def can_finish(nums):\n    reach = 0\n    for i, n in enumerate(nums):\n        if i > reach:\n            return False\n        reach = max(reach, i + n)\n    return True'
},
{
  id:'lc_jump_game_2', title:'Jump game II', topic:'greedy', rating:2160,
  prompt:'Write `min_jumps(nums)` returning the fewest jumps needed to reach the last index (the input always allows it).\n\n```\nmin_jumps([2,3,1,1,4])  ->  2\n```',
  mode:'func', fn:'min_jumps', starter:'def min_jumps(nums):\n    ',
  tests:[{args:[[2,3,1,1,4]],expect:2},{args:[[2,3,0,1,4]],expect:2},{args:[[0]],expect:0},{args:[[1,2]],expect:1}],
  hints:['Think in levels, like a breadth-first search over indices.','Keep the end of the current jump\'s range and the furthest you could reach from inside it.'],
  solution:'def min_jumps(nums):\n    jumps = current_end = furthest = 0\n    for i in range(len(nums) - 1):\n        furthest = max(furthest, i + nums[i])\n        if i == current_end:\n            jumps += 1\n            current_end = furthest\n    return jumps'
},
{
  id:'lc_gas_station', title:'Gas station', topic:'greedy', rating:2140,
  prompt:'Stations sit in a circle. `gas[i]` is the fuel there, `cost[i]` the fuel to reach the next one. Write `start_station(gas, cost)` returning the index you can start from and get all the way round, or `-1`. There is at most one answer.\n\n```\nstart_station([1,2,3,4,5], [3,4,5,1,2])  ->  3\n```',
  mode:'func', fn:'start_station', starter:'def start_station(gas, cost):\n    ',
  tests:[{args:[[1,2,3,4,5],[3,4,5,1,2]],expect:3},{args:[[2,3,4],[3,4,3]],expect:-1},
         {args:[[5],[4]],expect:0},{args:[[],[]],expect:-1}],
  hints:['If the total fuel is less than the total cost, no start works.','Whenever the running tank goes negative, no station up to here can be the start — restart from the next one.'],
  solution:'def start_station(gas, cost):\n    if sum(gas) < sum(cost):\n        return -1\n    start = tank = 0\n    for i in range(len(gas)):\n        tank += gas[i] - cost[i]\n        if tank < 0:\n            start = i + 1\n            tank = 0\n    return start if start < len(gas) else -1'
},
{
  id:'lc_task_scheduler', title:'Task scheduler', topic:'greedy', rating:2330,
  prompt:'Tasks are single letters; two identical tasks must be at least `cooldown` slots apart, and idle slots may be inserted. Write `total_time(tasks, cooldown)` returning the shortest schedule length.\n\n```\ntotal_time(["A","A","A","B","B","B"], 2)  ->  8\n```',
  mode:'func', fn:'total_time', starter:'def total_time(tasks, cooldown):\n    ',
  tests:[{args:[['A','A','A','B','B','B'],2],expect:8},{args:[['A','A','A','B','B','B'],0],expect:6},
         {args:[[],2],expect:0},{args:[['A'],5],expect:1}],
  hints:['The most frequent task lays out the frame: `(maxcount - 1) * (cooldown + 1)`.','Add one slot per task tied for that maximum — then never go below the raw task count.'],
  solution:'from collections import Counter\n\n\ndef total_time(tasks, cooldown):\n    if not tasks:\n        return 0\n    counts = Counter(tasks)\n    top = max(counts.values())\n    ties = sum(1 for c in counts.values() if c == top)\n    frame = (top - 1) * (cooldown + 1) + ties\n    return max(frame, len(tasks))'
},
{
  id:'lc_hand_of_straights', title:'Hand of straights', topic:'greedy', rating:2260,
  prompt:'Write `can_split(hand, size)` returning `True` when the cards can be split into groups of `size` consecutive values.\n\n```\ncan_split([1,2,3,6,2,3,4,7,8], 3)  ->  True\n```',
  mode:'func', fn:'can_split', starter:'def can_split(hand, size):\n    ',
  tests:[{args:[[1,2,3,6,2,3,4,7,8],3],expect:true},{args:[[1,2,3,4,5],4],expect:false},
         {args:[[],3],expect:true},{args:[[1,1,2,2,3,3],3],expect:true}],
  hints:['Count the cards, then always start a group at the smallest value left.','If any of the next `size - 1` values is missing, it cannot be done.'],
  solution:'from collections import Counter\n\n\ndef can_split(hand, size):\n    if len(hand) % size:\n        return False\n    counts = Counter(hand)\n    for value in sorted(counts):\n        need = counts[value]\n        if need <= 0:\n            continue\n        for v in range(value, value + size):\n            if counts[v] < need:\n                return False\n            counts[v] -= need\n    return True'
},
{
  id:'lc_valid_sudoku', title:'Valid Sudoku board', topic:'hashing', rating:2010,
  prompt:'Write `valid(board)` for a 9×9 grid where `"."` is an empty cell. It is valid when no row, column or 3×3 box repeats a digit. Empty cells never clash.',
  mode:'func', fn:'valid', starter:'def valid(board):\n    ',
  tests:[
    {args:[[['5','3','.','.','7','.','.','.','.'],['6','.','.','1','9','5','.','.','.'],['.','9','8','.','.','.','.','6','.'],['8','.','.','.','6','.','.','.','3'],['4','.','.','8','.','3','.','.','1'],['7','.','.','.','2','.','.','.','6'],['.','6','.','.','.','.','2','8','.'],['.','.','.','4','1','9','.','.','5'],['.','.','.','.','8','.','.','7','9']]],expect:true},
    {args:[[['8','3','.','.','7','.','.','.','.'],['6','.','.','1','9','5','.','.','.'],['.','9','8','.','.','.','.','6','.'],['8','.','.','.','6','.','.','.','3'],['4','.','.','8','.','3','.','.','1'],['7','.','.','.','2','.','.','.','6'],['.','6','.','.','.','.','2','8','.'],['.','.','.','4','1','9','.','.','5'],['.','.','.','.','8','.','.','7','9']]],expect:false}],
  hints:['One set per row, per column and per box.','The box index is `(row // 3, col // 3)`.'],
  solution:'def valid(board):\n    rows = [set() for _ in range(9)]\n    cols = [set() for _ in range(9)]\n    boxes = [set() for _ in range(9)]\n    for r in range(9):\n        for c in range(9):\n            v = board[r][c]\n            if v == ".":\n                continue\n            b = (r // 3) * 3 + c // 3\n            if v in rows[r] or v in cols[c] or v in boxes[b]:\n                return False\n            rows[r].add(v)\n            cols[c].add(v)\n            boxes[b].add(v)\n    return True'
},
{
  id:'lc_rotate_image', title:'Rotate an image in place', topic:'matrix', rating:1940,
  prompt:'Write `rotate(m)` turning an `n × n` grid 90° clockwise **in place**, then returning it.\n\n```\nrotate([[1,2],[3,4]])  ->  [[3,1],[4,2]]\n```',
  mode:'func', fn:'rotate', starter:'def rotate(m):\n    ',
  tests:[{args:[[[1,2],[3,4]]],expect:[[3,1],[4,2]]},
         {args:[[[1,2,3],[4,5,6],[7,8,9]]],expect:[[7,4,1],[8,5,2],[9,6,3]]},
         {args:[[[1]]],expect:[[1]]},{args:[[]],expect:[]}],
  hints:['Transpose the grid, then reverse each row.','Swap `m[i][j]` with `m[j][i]` for `j > i` to transpose without a copy.'],
  solution:'def rotate(m):\n    n = len(m)\n    for i in range(n):\n        for j in range(i + 1, n):\n            m[i][j], m[j][i] = m[j][i], m[i][j]\n    for row in m:\n        row.reverse()\n    return m'
},
{
  id:'lc_set_matrix_zeroes', title:'Set matrix zeroes', topic:'matrix', rating:1990,
  prompt:'Write `zero_out(m)` where any row and column containing a `0` becomes all zeroes. Change the grid in place and return it. Work out every position first — do not let new zeroes trigger more.\n\n```\nzero_out([[1,1,1],[1,0,1],[1,1,1]])  ->  [[1,0,1],[0,0,0],[1,0,1]]\n```',
  mode:'func', fn:'zero_out', starter:'def zero_out(m):\n    ',
  tests:[{args:[[[1,1,1],[1,0,1],[1,1,1]]],expect:[[1,0,1],[0,0,0],[1,0,1]]},
         {args:[[[0,1],[1,1]]],expect:[[0,0],[0,1]]},{args:[[[1]]],expect:[[1]]},{args:[[]],expect:[]}],
  hints:['Collect the rows and columns to blank in two sets first.','Then walk the grid once more and write the zeroes.'],
  solution:'def zero_out(m):\n    rows = {r for r, row in enumerate(m) for v in row if v == 0}\n    cols = {c for row in m for c, v in enumerate(row) if v == 0}\n    for r, row in enumerate(m):\n        for c in range(len(row)):\n            if r in rows or c in cols:\n                row[c] = 0\n    return m'
},
{
  id:'lc_spiral_matrix', title:'Spiral matrix', topic:'matrix', rating:1850,
  prompt:'Write `spiral(m)` reading a rectangular grid clockwise from the top-left.\n\n```\nspiral([[1,2,3],[4,5,6],[7,8,9]])  ->  [1,2,3,6,9,8,7,4,5]\n```',
  mode:'func', fn:'spiral', starter:'def spiral(m):\n    ',
  tests:[{args:[[[1,2,3],[4,5,6],[7,8,9]]],expect:[1,2,3,6,9,8,7,4,5]},
         {args:[[[1,2,3,4],[5,6,7,8]]],expect:[1,2,3,4,8,7,6,5]},
         {args:[[]],expect:[]},{args:[[[1]]],expect:[1]}],
  hints:['Four bounds — top, bottom, left, right — shrinking as you go.','Re-check the bounds between the horizontal and vertical passes.'],
  solution:'def spiral(m):\n    if not m:\n        return []\n    out = []\n    top, bot = 0, len(m) - 1\n    left, right = 0, len(m[0]) - 1\n    while top <= bot and left <= right:\n        for c in range(left, right + 1):\n            out.append(m[top][c])\n        top += 1\n        for r in range(top, bot + 1):\n            out.append(m[r][right])\n        right -= 1\n        if top <= bot:\n            for c in range(right, left - 1, -1):\n                out.append(m[bot][c])\n            bot -= 1\n        if left <= right:\n            for r in range(bot, top - 1, -1):\n                out.append(m[r][left])\n            left += 1\n    return out'
},
{
  id:'lc_single_number', title:'Single number', topic:'bits', rating:1600,
  prompt:'Every value appears twice except one. Write `single(nums)` returning the odd one out, in O(n) time and O(1) space.',
  mode:'func', fn:'single', starter:'def single(nums):\n    ',
  tests:[{args:[[2,2,1]],expect:1},{args:[[4,1,2,1,2]],expect:4},{args:[[7]],expect:7}],
  hints:['XOR is its own inverse: `x ^ x == 0`.','XOR the whole list together.'],
  solution:'def single(nums):\n    out = 0\n    for n in nums:\n        out ^= n\n    return out'
},
{
  id:'lc_missing_number', title:'Missing number', topic:'bits', rating:1520,
  prompt:'`nums` holds `n` distinct values from `0..n`. Write `missing(nums)` returning the one that is absent.\n\n```\nmissing([3,0,1])  ->  2\n```',
  mode:'func', fn:'missing', starter:'def missing(nums):\n    ',
  tests:[{args:[[3,0,1]],expect:2},{args:[[0,1]],expect:2},{args:[[1]],expect:0},{args:[[]],expect:0}],
  hints:['The sum of `0..n` is `n * (n + 1) // 2`.','Subtract what you actually have.'],
  solution:'def missing(nums):\n    n = len(nums)\n    return n * (n + 1) // 2 - sum(nums)'
},
{
  id:'lc_counting_bits', title:'Counting bits', topic:'bits', rating:1830,
  prompt:'Write `counts(n)` returning a list where entry `i` is the number of 1 bits in `i`, for `0..n`.\n\n```\ncounts(5)  ->  [0,1,1,2,1,2]\n```',
  mode:'func', fn:'counts', starter:'def counts(n):\n    ',
  tests:[{args:[5],expect:[0,1,1,2,1,2]},{args:[0],expect:[0]},{args:[2],expect:[0,1,1]},
         {args:[8],expect:[0,1,1,2,1,2,2,3,1]}],
  hints:['`i` has the same bits as `i >> 1`, plus its own last bit.','`dp[i] = dp[i >> 1] + (i & 1)`'],
  solution:'def counts(n):\n    dp = [0] * (n + 1)\n    for i in range(1, n + 1):\n        dp[i] = dp[i >> 1] + (i & 1)\n    return dp'
},
{
  id:'lc_reverse_bits', title:'Reverse bits', topic:'bits', rating:1900,
  prompt:'Write `reverse_bits(n)` reversing the order of the 32 bits of an unsigned integer.\n\n```\nreverse_bits(1)  ->  2147483648\n```',
  mode:'func', fn:'reverse_bits', starter:'def reverse_bits(n):\n    ',
  tests:[{args:[1],expect:2147483648},{args:[0],expect:0},{args:[4294967295],expect:4294967295},
         {args:[43261596],expect:964176192}],
  hints:['Take the lowest bit of `n` and push it onto the top of the answer, 32 times.','`out = (out << 1) | (n & 1)`'],
  solution:'def reverse_bits(n):\n    out = 0\n    for _ in range(32):\n        out = (out << 1) | (n & 1)\n        n >>= 1\n    return out'
},
{
  id:'lc_add_binary', title:'Add binary strings', topic:'bits', rating:1720,
  prompt:'Write `add_binary(a, b)` adding two binary strings and returning the sum as a binary string. Do not convert to int in one step.\n\n```\nadd_binary("11", "1")  ->  "100"\n```',
  mode:'func', fn:'add_binary', starter:'def add_binary(a, b):\n    ',
  tests:[{args:['11','1'],expect:'100'},{args:['1010','1011'],expect:'10101'},
         {args:['0','0'],expect:'0'},{args:['1','1'],expect:'10'}],
  hints:['Walk both strings from the right, carrying as you go.','`divmod(total, 2)` gives the carry and the digit.'],
  solution:'def add_binary(a, b):\n    i, j = len(a) - 1, len(b) - 1\n    carry = 0\n    out = []\n    while i >= 0 or j >= 0 or carry:\n        total = carry\n        if i >= 0:\n            total += int(a[i])\n            i -= 1\n        if j >= 0:\n            total += int(b[j])\n            j -= 1\n        carry, digit = divmod(total, 2)\n        out.append(str(digit))\n    return "".join(reversed(out))'
},
{
  id:'lc_pow', title:'Fast exponentiation', topic:'math', rating:2030,
  prompt:'Write `power(x, n)` computing `x ** n` for an integer `n` (which may be negative), without `**` or `pow`. Must be O(log n).\n\n```\npower(2.0, 10)  ->  1024.0\n```',
  mode:'func', fn:'power', starter:'def power(x, n):\n    ',
  tests:[{args:[2.0,10],expect:1024.0,cmp:'approx'},{args:[2.0,-2],expect:0.25,cmp:'approx'},
         {args:[5.0,0],expect:1.0,cmp:'approx'},{args:[3.0,3],expect:27.0,cmp:'approx'}],
  hints:['`x ** n == (x * x) ** (n // 2)` when `n` is even.','A negative exponent is `1 / power(x, -n)`.'],
  solution:'def power(x, n):\n    if n < 0:\n        return 1 / power(x, -n)\n    result = 1.0\n    base = x\n    while n:\n        if n & 1:\n            result *= base\n        base *= base\n        n >>= 1\n    return result'
},
{
  id:'lc_sqrt', title:'Integer square root', topic:'binary-search', rating:1740,
  prompt:'Write `int_sqrt(n)` returning the largest integer whose square is not greater than `n`. No `**0.5`, no `math.sqrt`.\n\n```\nint_sqrt(8)  ->  2\n```',
  mode:'func', fn:'int_sqrt', starter:'def int_sqrt(n):\n    ',
  tests:[{args:[8],expect:2},{args:[16],expect:4},{args:[0],expect:0},{args:[1],expect:1},{args:[99],expect:9}],
  hints:['Binary search the answer between 0 and `n`.','Keep the largest `mid` whose square still fits.'],
  solution:'def int_sqrt(n):\n    lo, hi = 0, n\n    best = 0\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if mid * mid <= n:\n            best = mid\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return best'
},
{
  id:'lc_happy_number', title:'Happy number', topic:'hashing', rating:1660,
  prompt:'Replace a number by the sum of the squares of its digits, repeatedly. It is happy if this reaches 1. Write `is_happy(n)` — unhappy numbers loop forever, so you must detect that.\n\n```\nis_happy(19)  ->  True\n```',
  mode:'func', fn:'is_happy', starter:'def is_happy(n):\n    ',
  tests:[{args:[19],expect:true},{args:[2],expect:false},{args:[1],expect:true},{args:[7],expect:true}],
  hints:['Remember the numbers you have already visited in a set.','Seeing one twice means you are in a loop.'],
  solution:'def is_happy(n):\n    seen = set()\n    while n != 1 and n not in seen:\n        seen.add(n)\n        n = sum(int(c) ** 2 for c in str(n))\n    return n == 1'
},
{
  id:'lc_plus_one', title:'Plus one', topic:'arrays', rating:1560,
  prompt:'A number is stored as a list of digits, most significant first. Write `plus_one(digits)` returning the digits of the number plus one.\n\n```\nplus_one([1,2,9])  ->  [1,3,0]\nplus_one([9,9])    ->  [1,0,0]\n```',
  mode:'func', fn:'plus_one', starter:'def plus_one(digits):\n    ',
  tests:[{args:[[1,2,9]],expect:[1,3,0]},{args:[[9,9]],expect:[1,0,0]},
         {args:[[0]],expect:[1]},{args:[[4,3,2,1]],expect:[4,3,2,2]}],
  hints:['Walk from the right, carrying while you see a 9.','If everything carried, the answer is `[1] + zeros`.'],
  solution:'def plus_one(digits):\n    out = list(digits)\n    for i in range(len(out) - 1, -1, -1):\n        if out[i] < 9:\n            out[i] += 1\n            return out\n        out[i] = 0\n    return [1] + out'
},
{
  id:'lc_multiply_strings', title:'Multiply strings', topic:'math', rating:2410,
  prompt:'Write `multiply(a, b)` multiplying two non-negative integers given as strings, returning the product as a string. No `int()` on the whole string.\n\n```\nmultiply("123", "456")  ->  "56088"\n```',
  mode:'func', fn:'multiply', starter:'def multiply(a, b):\n    ',
  tests:[{args:['123','456'],expect:'56088'},{args:['2','3'],expect:'6'},
         {args:['0','999'],expect:'0'},{args:['9','9'],expect:'81'}],
  hints:['Digit `i` of `a` times digit `j` of `b` lands at positions `i + j` and `i + j + 1`.','Do all the multiplying first, then carry through the whole array.'],
  solution:'def multiply(a, b):\n    if a == "0" or b == "0":\n        return "0"\n    n, m = len(a), len(b)\n    slots = [0] * (n + m)\n    for i in range(n - 1, -1, -1):\n        for j in range(m - 1, -1, -1):\n            slots[i + j + 1] += int(a[i]) * int(b[j])\n    for k in range(len(slots) - 1, 0, -1):\n        slots[k - 1] += slots[k] // 10\n        slots[k] %= 10\n    digits = "".join(str(d) for d in slots).lstrip("0")\n    return digits or "0"'
},
{
  id:'lc_longest_palindrome_sub', title:'Longest palindromic substring', topic:'strings', rating:2240,
  prompt:'Write `longest(s)` returning the longest palindromic substring. On a tie, return the earliest one.\n\n```\nlongest("babad")  ->  "bab"\n```',
  mode:'func', fn:'longest', starter:'def longest(s):\n    ',
  tests:[{args:['babad'],expect:'bab'},{args:['cbbd'],expect:'bb'},{args:[''],expect:''},{args:['a'],expect:'a'}],
  hints:['Expand outwards from every centre — there are `2n - 1` of them.','Odd-length palindromes centre on a character, even-length ones between two.'],
  solution:'def longest(s):\n    best = ""\n\n    def expand(lo, hi):\n        while lo >= 0 and hi < len(s) and s[lo] == s[hi]:\n            lo -= 1\n            hi += 1\n        return s[lo + 1:hi]\n\n    for i in range(len(s)):\n        for candidate in (expand(i, i), expand(i, i + 1)):\n            if len(candidate) > len(best):\n                best = candidate\n    return best'
},
{
  id:'lc_palindrome_count', title:'Count palindromic substrings', topic:'strings', rating:2150,
  prompt:'Write `count(s)` returning how many substrings of `s` are palindromes. Single characters count, and equal substrings at different positions count separately.\n\n```\ncount("aaa")  ->  6\n```',
  mode:'func', fn:'count', starter:'def count(s):\n    ',
  tests:[{args:['aaa'],expect:6},{args:['abc'],expect:3},{args:[''],expect:0},{args:['aba'],expect:4}],
  hints:['Expand from each of the `2n - 1` centres.','Every successful expansion is one more palindrome.'],
  solution:'def count(s):\n    total = 0\n\n    def expand(lo, hi):\n        found = 0\n        while lo >= 0 and hi < len(s) and s[lo] == s[hi]:\n            found += 1\n            lo -= 1\n            hi += 1\n        return found\n\n    for i in range(len(s)):\n        total += expand(i, i) + expand(i, i + 1)\n    return total'
},
{
  id:'lc_encode_decode', title:'Encode and decode strings', topic:'design', rating:2050,
  prompt:'Write `encode(items)` joining a list of strings into one string, and `decode(s)` recovering the exact list. The strings may contain any characters, including your separator.\n\nThe grader calls `round_trip(items)` which must return `decode(encode(items))`.',
  mode:'func', fn:'round_trip', starter:'def encode(items):\n    ',
  tests:[{args:[['hello','world']],expect:['hello','world']},
         {args:[['a#b','#','']],expect:['a#b','#','']},
         {args:[[]],expect:[]},{args:[['']],expect:['']}],
  hints:['Length-prefix each string: `"5#hello"`.','When decoding, read digits up to the `#`, then take exactly that many characters.'],
  solution:'def encode(items):\n    return "".join(f"{len(item)}#{item}" for item in items)\n\n\ndef decode(s):\n    out = []\n    i = 0\n    while i < len(s):\n        j = s.index("#", i)\n        length = int(s[i:j])\n        out.append(s[j + 1:j + 1 + length])\n        i = j + 1 + length\n    return out\n\n\ndef round_trip(items):\n    return decode(encode(items))'
},
{
  id:'lc_string_compress', title:'String compression in place', topic:'strings', rating:2190,
  prompt:'Write `compress(chars)` rewriting the list so each run becomes the character followed by its count (counts above 9 take several slots, and a run of 1 gets no number). Return the new length; the first that many entries must hold the answer.\n\n```\ncompress(["a","a","b","b","c","c","c"])  ->  6   # list starts a2b2c3\n```',
  mode:'func', fn:'compress', starter:'def compress(chars):\n    ',
  tests:[{args:[['a','a','b','b','c','c','c']],expect:6},
         {args:[['a']],expect:1},
         {args:[['a','b','b','b','b','b','b','b','b','b','b','b','b']],expect:4},
         {args:[[]],expect:0}],
  hints:['Two indices: where you are reading, and where you are writing.','Write the digits of the count one character at a time.'],
  solution:'def compress(chars):\n    write = read = 0\n    while read < len(chars):\n        c = chars[read]\n        run = 0\n        while read < len(chars) and chars[read] == c:\n            read += 1\n            run += 1\n        chars[write] = c\n        write += 1\n        if run > 1:\n            for digit in str(run):\n                chars[write] = digit\n                write += 1\n    return write'
},
{
  id:'lc_kth_largest_stream', title:'Kth largest in a stream', topic:'design', rating:2120,
  prompt:'Build `KthLargest(k, nums)` whose `add(value)` returns the `k`th largest value seen so far (counting duplicates).\n\nThen write `run(k, nums, values)` creating one and returning the result of adding each value in turn.\n\n```\nrun(3, [4,5,8,2], [3,5,10,9,4])  ->  [4,5,5,8,8]\n```',
  mode:'func', fn:'run', starter:'import heapq\n\n\nclass KthLargest:\n    def __init__(self, k, nums):\n        ',
  tests:[{args:[3,[4,5,8,2],[3,5,10,9,4]],expect:[4,5,5,8,8]},
         {args:[1,[],[5,2,9]],expect:[5,5,9]},
         {args:[2,[1],[2]],expect:[1]}],
  hints:['A min-heap of exactly the `k` largest values seen so far.','Its smallest element — `heap[0]` — is the answer.'],
  solution:'import heapq\n\n\nclass KthLargest:\n    def __init__(self, k, nums):\n        self.k = k\n        self.heap = list(nums)\n        heapq.heapify(self.heap)\n        while len(self.heap) > k:\n            heapq.heappop(self.heap)\n\n    def add(self, value):\n        heapq.heappush(self.heap, value)\n        if len(self.heap) > self.k:\n            heapq.heappop(self.heap)\n        return self.heap[0]\n\n\ndef run(k, nums, values):\n    obj = KthLargest(k, nums)\n    return [obj.add(v) for v in values]'
},
{
  id:'lc_last_stone', title:'Last stone weight', topic:'heap', rating:1810,
  prompt:'Repeatedly smash the two heaviest stones together: equal weights destroy both, otherwise the difference goes back in. Write `last_stone(stones)` returning the final stone\'s weight, or `0` if none remain.\n\n```\nlast_stone([2,7,4,1,8,1])  ->  1\n```',
  mode:'func', fn:'last_stone', starter:'import heapq\n\n\ndef last_stone(stones):\n    ',
  tests:[{args:[[2,7,4,1,8,1]],expect:1},{args:[[1,1]],expect:0},{args:[[]],expect:0},{args:[[5]],expect:5}],
  hints:['Python only has min-heaps — negate the weights for a max-heap.','Pop two, push the difference back if it is not zero.'],
  solution:'import heapq\n\n\ndef last_stone(stones):\n    heap = [-s for s in stones]\n    heapq.heapify(heap)\n    while len(heap) > 1:\n        a = -heapq.heappop(heap)\n        b = -heapq.heappop(heap)\n        if a != b:\n            heapq.heappush(heap, -(a - b))\n    return -heap[0] if heap else 0'
},
{
  id:'lc_k_closest', title:'K closest points to the origin', topic:'heap', rating:1960,
  prompt:'Write `closest(points, k)` returning the `k` points nearest `[0, 0]`, sorted by distance then by x then by y.\n\n```\nclosest([[1,3],[-2,2]], 1)  ->  [[-2,2]]\n```',
  mode:'func', fn:'closest', starter:'def closest(points, k):\n    ',
  tests:[{args:[[[1,3],[-2,2]],1],expect:[[-2,2]]},
         {args:[[[3,3],[5,-1],[-2,4]],2],expect:[[3,3],[-2,4]]},
         {args:[[],2],expect:[]},{args:[[[1,1],[1,1]],2],expect:[[1,1],[1,1]]}],
  hints:['You never need the square root — compare `x*x + y*y`.','`sorted(points, key=...)` with a tuple key handles the tie-breaks.'],
  solution:'def closest(points, k):\n    return [list(p) for p in sorted(points, key=lambda p: (p[0] ** 2 + p[1] ** 2, p[0], p[1]))[:k]]'
},
{
  id:'lc_merge_k_lists', title:'Merge k sorted lists', topic:'heap', rating:2280,
  prompt:'Write `merge_all(lists)` merging any number of already-sorted lists into one sorted list, efficiently.\n\n```\nmerge_all([[1,4,5],[1,3,4],[2,6]])  ->  [1,1,2,3,4,4,5,6]\n```',
  mode:'func', fn:'merge_all', starter:'import heapq\n\n\ndef merge_all(lists):\n    ',
  tests:[{args:[[[1,4,5],[1,3,4],[2,6]]],expect:[1,1,2,3,4,4,5,6]},
         {args:[[]],expect:[]},{args:[[[]]],expect:[]},{args:[[[1]]],expect:[1]}],
  hints:['A heap holding the current head of each list.','Push `(value, list_index, position)` so ties never compare the lists themselves.'],
  solution:'import heapq\n\n\ndef merge_all(lists):\n    heap = []\n    for i, lst in enumerate(lists):\n        if lst:\n            heapq.heappush(heap, (lst[0], i, 0))\n    out = []\n    while heap:\n        value, i, j = heapq.heappop(heap)\n        out.append(value)\n        if j + 1 < len(lists[i]):\n            heapq.heappush(heap, (lists[i][j + 1], i, j + 1))\n    return out'
},
{
  id:'lc_find_median_stream', title:'Find median from a data stream', topic:'heap', rating:2420,
  prompt:'Build `MedianFinder` with `add(n)` and `median()` returning the median of everything added so far, as a float.\n\nThen write `run(values)` adding each value and returning the median after each one.\n\n```\nrun([1,2,3])  ->  [1.0, 1.5, 2.0]\n```',
  mode:'func', fn:'run', starter:'import heapq\n\n\nclass MedianFinder:\n    def __init__(self):\n        ',
  tests:[{args:[[1,2,3]],expect:[1.0,1.5,2.0],cmp:'approx'},
         {args:[[5,15,1,3]],expect:[5.0,10.0,5.0,4.0],cmp:'approx'},
         {args:[[]],expect:[]}],
  hints:['Two heaps: a max-heap of the lower half, a min-heap of the upper half.','Keep their sizes within one of each other after every insert.'],
  solution:'import heapq\n\n\nclass MedianFinder:\n    def __init__(self):\n        self.low = []   # max-heap, values negated\n        self.high = []  # min-heap\n\n    def add(self, n):\n        heapq.heappush(self.low, -n)\n        heapq.heappush(self.high, -heapq.heappop(self.low))\n        if len(self.high) > len(self.low):\n            heapq.heappush(self.low, -heapq.heappop(self.high))\n\n    def median(self):\n        if len(self.low) > len(self.high):\n            return float(-self.low[0])\n        return (-self.low[0] + self.high[0]) / 2\n\n\ndef run(values):\n    mf = MedianFinder()\n    out = []\n    for v in values:\n        mf.add(v)\n        out.append(mf.median())\n    return out'
},
{
  id:'lc_sort_colors', title:'Sort colours', topic:'two-pointers', rating:1880,
  prompt:'`nums` holds only 0, 1 and 2. Write `sort_colors(nums)` sorting it in place in one pass with O(1) space, then returning it. No `sorted`, no counting pass followed by an overwrite.\n\n```\nsort_colors([2,0,2,1,1,0])  ->  [0,0,1,1,2,2]\n```',
  mode:'func', fn:'sort_colors', starter:'def sort_colors(nums):\n    ',
  tests:[{args:[[2,0,2,1,1,0]],expect:[0,0,1,1,2,2]},{args:[[2,0,1]],expect:[0,1,2]},
         {args:[[]],expect:[]},{args:[[1,1]],expect:[1,1]}],
  hints:['Three pointers: where the 0s end, where you are, where the 2s begin.','After swapping a 2 into place, do not advance — you have not looked at what came back.'],
  solution:'def sort_colors(nums):\n    low, i, high = 0, 0, len(nums) - 1\n    while i <= high:\n        if nums[i] == 0:\n            nums[i], nums[low] = nums[low], nums[i]\n            low += 1\n            i += 1\n        elif nums[i] == 2:\n            nums[i], nums[high] = nums[high], nums[i]\n            high -= 1\n        else:\n            i += 1\n    return nums'
},
{
  id:'lc_remove_duplicates_sorted', title:'Remove duplicates from a sorted array', topic:'two-pointers', rating:1620,
  prompt:'Write `dedupe(nums)` removing duplicates from a sorted list **in place**, returning the new length. The first that many entries must hold the distinct values in order.\n\n```\ndedupe([1,1,2])  ->  2   # list starts 1, 2\n```',
  mode:'func', fn:'dedupe', starter:'def dedupe(nums):\n    ',
  tests:[{args:[[1,1,2]],expect:2},{args:[[0,0,1,1,1,2,2,3,3,4]],expect:5},
         {args:[[]],expect:0},{args:[[1]],expect:1}],
  hints:['One pointer reads, one writes.','Only write when the value differs from the last one written.'],
  solution:'def dedupe(nums):\n    if not nums:\n        return 0\n    write = 1\n    for read in range(1, len(nums)):\n        if nums[read] != nums[write - 1]:\n            nums[write] = nums[read]\n            write += 1\n    return write'
},
{
  id:'lc_majority_element', title:'Majority element', topic:'arrays', rating:1700,
  prompt:'One value appears more than half the time. Write `majority(nums)` returning it, in O(n) time and O(1) space.\n\n```\nmajority([2,2,1,1,1,2,2])  ->  2\n```',
  mode:'func', fn:'majority', starter:'def majority(nums):\n    ',
  tests:[{args:[[3,2,3]],expect:3},{args:[[2,2,1,1,1,2,2]],expect:2},{args:[[1]],expect:1}],
  hints:['Boyer–Moore voting: hold a candidate and a count.','A different value cancels one vote; a count of zero picks a new candidate.'],
  solution:'def majority(nums):\n    candidate = None\n    count = 0\n    for n in nums:\n        if count == 0:\n            candidate = n\n        count += 1 if n == candidate else -1\n    return candidate'
},
{
  id:'lc_rotate_array', title:'Rotate an array in place', topic:'arrays', rating:1840,
  prompt:'Write `rotate(nums, k)` moving every value `k` places right, **in place**, then returning the list. `k` may exceed the length. O(1) extra space.\n\n```\nrotate([1,2,3,4,5,6,7], 3)  ->  [5,6,7,1,2,3,4]\n```',
  mode:'func', fn:'rotate', starter:'def rotate(nums, k):\n    ',
  tests:[{args:[[1,2,3,4,5,6,7],3],expect:[5,6,7,1,2,3,4]},{args:[[-1,-100,3,99],2],expect:[3,99,-1,-100]},
         {args:[[],3],expect:[]},{args:[[1,2],5],expect:[2,1]}],
  hints:['Reverse the whole list, then reverse each of the two parts.','Take `k % len(nums)` first.'],
  solution:'def rotate(nums, k):\n    n = len(nums)\n    if n == 0:\n        return nums\n    k %= n\n\n    def flip(lo, hi):\n        while lo < hi:\n            nums[lo], nums[hi] = nums[hi], nums[lo]\n            lo += 1\n            hi -= 1\n\n    flip(0, n - 1)\n    flip(0, k - 1)\n    flip(k, n - 1)\n    return nums'
},
{
  id:'lc_first_missing_positive', title:'First missing positive', topic:'arrays', rating:2540,
  prompt:'Write `first_missing(nums)` returning the smallest positive integer absent from the list, in O(n) time and O(1) extra space.\n\n```\nfirst_missing([3,4,-1,1])  ->  2\n```',
  mode:'func', fn:'first_missing', starter:'def first_missing(nums):\n    ',
  tests:[{args:[[1,2,0]],expect:3},{args:[[3,4,-1,1]],expect:2},{args:[[7,8,9,11,12]],expect:1},{args:[[]],expect:1}],
  hints:['The answer is always between 1 and `len(nums) + 1`.','Put each value `v` in slot `v - 1` by swapping, then scan for the first slot that is wrong.'],
  solution:'def first_missing(nums):\n    n = len(nums)\n    for i in range(n):\n        while 1 <= nums[i] <= n and nums[nums[i] - 1] != nums[i]:\n            target = nums[i] - 1\n            nums[i], nums[target] = nums[target], nums[i]\n    for i in range(n):\n        if nums[i] != i + 1:\n            return i + 1\n    return n + 1'
},
{
  id:'lc_subarray_sum_k', title:'Subarrays summing to k', topic:'hashing', rating:2270,
  prompt:'Write `count_subarrays(nums, k)` returning how many contiguous slices sum to `k`. Values may be negative. O(n).\n\n```\ncount_subarrays([1,1,1], 2)  ->  2\n```',
  mode:'func', fn:'count_subarrays', starter:'def count_subarrays(nums, k):\n    ',
  tests:[{args:[[1,1,1],2],expect:2},{args:[[1,2,3],3],expect:2},
         {args:[[],0],expect:0},{args:[[1,-1,0],0],expect:3}],
  hints:['Running prefix sums: a slice sums to `k` when `prefix_now - prefix_then == k`.','Count how many times each prefix sum has been seen, starting with `{0: 1}`.'],
  solution:'def count_subarrays(nums, k):\n    seen = {0: 1}\n    running = total = 0\n    for n in nums:\n        running += n\n        total += seen.get(running - k, 0)\n        seen[running] = seen.get(running, 0) + 1\n    return total'
},
);
