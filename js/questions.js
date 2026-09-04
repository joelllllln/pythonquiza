/* Question bank, part 1 — foundations through intermediate.

   Shape of a question:
     id       unique slug
     title    short name
     topic    grouping used by the stats page
     rating   Elo-style difficulty (700 beginner … 2250 hard)
     prompt   tiny-markdown body (```blocks```, `code`, **bold**, - lists)
     mode     'func'   -> call fn(*args) and compare the return value
              'stdout' -> run the whole file and compare printed text
     fn       function the player must define (func mode)
     starter  code pre-loaded into the editor
     tests    [{args, expect, cmp?, hidden?}] or [{stdin, expect}]
     cmp      '' exact | 'set' | 'sorted' | 'approx' | 'text'
     hints    revealed one at a time (each costs a little rating)
     solution shown after a solve or a give-up                              */

window.QUESTIONS = [
{
  id:'add', title:'Add two numbers', topic:'basics', rating:680,
  prompt:'Write `add(a, b)` that returns their sum.\n\n```\nadd(2, 3)  ->  5\n```',
  mode:'func', fn:'add', starter:'def add(a, b):\n    ',
  tests:[{args:[2,3],expect:5},{args:[-4,4],expect:0},{args:[10,0.5],expect:10.5}],
  hints:['`return a + b`'],
  solution:'def add(a, b):\n    return a + b'
},
{
  id:'greet', title:'Greeting', topic:'strings', rating:700,
  prompt:'Write `greet(name)` returning `"Hello, NAME!"`.\n\n```\ngreet("Ada")  ->  "Hello, Ada!"\n```',
  mode:'func', fn:'greet', starter:'def greet(name):\n    ',
  tests:[{args:['Ada'],expect:'Hello, Ada!'},{args:['Bo'],expect:'Hello, Bo!'},{args:[''],expect:'Hello, !'}],
  hints:['f-strings: `f"Hello, {name}!"`'],
  solution:'def greet(name):\n    return f"Hello, {name}!"'
},
{
  id:'is_even', title:'Even or odd', topic:'basics', rating:715,
  prompt:'Write `is_even(n)` returning `True` when `n` is even.',
  mode:'func', fn:'is_even', starter:'def is_even(n):\n    ',
  tests:[{args:[4],expect:true},{args:[7],expect:false},{args:[0],expect:true},{args:[-3],expect:false}],
  hints:['The remainder operator is `%`.','`n % 2 == 0`'],
  solution:'def is_even(n):\n    return n % 2 == 0'
},
{
  id:'biggest', title:'Largest of three', topic:'basics', rating:730,
  prompt:'Write `biggest(a, b, c)` returning the largest of the three.',
  mode:'func', fn:'biggest', starter:'def biggest(a, b, c):\n    ',
  tests:[{args:[1,2,3],expect:3},{args:[9,2,3],expect:9},{args:[-1,-5,-3],expect:-1},{args:[5,5,5],expect:5}],
  hints:['`max` takes several arguments.'],
  solution:'def biggest(a, b, c):\n    return max(a, b, c)'
},
{
  id:'list_sum', title:'Sum a list', topic:'lists', rating:745,
  prompt:'Write `total(nums)` returning the sum of the list. An empty list sums to `0`.',
  mode:'func', fn:'total', starter:'def total(nums):\n    ',
  tests:[{args:[[1,2,3]],expect:6},{args:[[]],expect:0},{args:[[-2,2,10]],expect:10}],
  hints:['`sum(nums)`'],
  solution:'def total(nums):\n    return sum(nums)'
},
{
  id:'reverse_str', title:'Reverse a string', topic:'strings', rating:760,
  prompt:'Write `reverse(s)` returning `s` backwards.\n\n```\nreverse("abc")  ->  "cba"\n```',
  mode:'func', fn:'reverse', starter:'def reverse(s):\n    ',
  tests:[{args:['abc'],expect:'cba'},{args:[''],expect:''},{args:['racecar'],expect:'racecar'}],
  hints:['Slicing with a negative step: `s[::-1]`'],
  solution:'def reverse(s):\n    return s[::-1]'
},
{
  id:'count_vowels', title:'Count vowels', topic:'strings', rating:780,
  prompt:'Write `count_vowels(s)` returning how many of `a e i o u` are in `s`. Ignore case.',
  mode:'func', fn:'count_vowels', starter:'def count_vowels(s):\n    ',
  tests:[{args:['hello'],expect:2},{args:['XYZ'],expect:0},{args:['AEIOUae'],expect:7}],
  hints:['Lowercase the string first.','Loop and check `ch in "aeiou"`.'],
  solution:'def count_vowels(s):\n    return sum(1 for ch in s.lower() if ch in "aeiou")'
},
{
  id:'fizz_one', title:'FizzBuzz for one number', topic:'basics', rating:795,
  prompt:'Write `fizz(n)`:\n- divisible by 3 and 5 -> `"FizzBuzz"`\n- by 3 -> `"Fizz"`\n- by 5 -> `"Buzz"`\n- otherwise the number as a string',
  mode:'func', fn:'fizz', starter:'def fizz(n):\n    ',
  tests:[{args:[3],expect:'Fizz'},{args:[5],expect:'Buzz'},{args:[15],expect:'FizzBuzz'},{args:[7],expect:'7'}],
  hints:['Check the 15 case first.'],
  solution:'def fizz(n):\n    if n % 15 == 0:\n        return "FizzBuzz"\n    if n % 3 == 0:\n        return "Fizz"\n    if n % 5 == 0:\n        return "Buzz"\n    return str(n)'
},
{
  id:'avg', title:'Average', topic:'lists', rating:810,
  prompt:'Write `average(nums)` returning the mean. Return `0` for an empty list.',
  mode:'func', fn:'average', starter:'def average(nums):\n    ',
  tests:[{args:[[1,2,3,4]],expect:2.5},{args:[[]],expect:0},{args:[[5]],expect:5.0}],
  hints:['Guard the empty list before dividing.'],
  solution:'def average(nums):\n    if not nums:\n        return 0\n    return sum(nums) / len(nums)'
},
{
  id:'count_down', title:'Countdown', topic:'loops', rating:830, mode:'stdout',
  prompt:'Read one number `n` with `input()`, then print every number from `n` down to `1`, one per line, then print `Liftoff!`.',
  starter:'n = int(input())\n',
  tests:[
    {stdin:['3'],expect:'3\n2\n1\nLiftoff!'},
    {stdin:['1'],expect:'1\nLiftoff!'},
    {stdin:['5'],expect:'5\n4\n3\n2\n1\nLiftoff!'}],
  hints:['`range(n, 0, -1)` counts downwards.'],
  solution:'n = int(input())\nfor i in range(n, 0, -1):\n    print(i)\nprint("Liftoff!")'
},
{
  id:'evens_only', title:'Keep the evens', topic:'lists', rating:845,
  prompt:'Write `evens(nums)` returning a new list with only the even numbers, order kept.',
  mode:'func', fn:'evens', starter:'def evens(nums):\n    ',
  tests:[{args:[[1,2,3,4]],expect:[2,4]},{args:[[1,3]],expect:[]},{args:[[-2,0,7]],expect:[-2,0]}],
  hints:['A list comprehension with an `if`.'],
  solution:'def evens(nums):\n    return [n for n in nums if n % 2 == 0]'
},
{
  id:'title_case', title:'Capitalise words', topic:'strings', rating:860,
  prompt:'Write `titleize(s)` capitalising the first letter of each word, the rest lowercase.\n\n```\ntitleize("hELLO big world")  ->  "Hello Big World"\n```',
  mode:'func', fn:'titleize', starter:'def titleize(s):\n    ',
  tests:[{args:['hELLO big world'],expect:'Hello Big World'},{args:['a'],expect:'A'},{args:[''],expect:''}],
  hints:['`s.split()` then `word.capitalize()`.','Rejoin with `" ".join(...)`.'],
  solution:'def titleize(s):\n    return " ".join(w.capitalize() for w in s.split())'
},
{
  id:'factorial', title:'Factorial', topic:'loops', rating:880,
  prompt:'Write `factorial(n)` for `n >= 0`. `factorial(0)` is `1`.',
  mode:'func', fn:'factorial', starter:'def factorial(n):\n    ',
  tests:[{args:[0],expect:1},{args:[5],expect:120},{args:[10],expect:3628800},{args:[1],expect:1}],
  hints:['Start at 1 and multiply up to n.'],
  solution:'def factorial(n):\n    out = 1\n    for i in range(2, n + 1):\n        out *= i\n    return out'
},
{
  id:'is_palindrome', title:'Palindrome check', topic:'strings', rating:900,
  prompt:'Write `is_palindrome(s)`. Ignore case, spaces and punctuation — only letters and digits count.\n\n```\nis_palindrome("A man, a plan, a canal: Panama")  ->  True\n```',
  mode:'func', fn:'is_palindrome', starter:'def is_palindrome(s):\n    ',
  tests:[{args:['A man, a plan, a canal: Panama'],expect:true},{args:['hello'],expect:false},{args:[''],expect:true},{args:['ab_a'],expect:true}],
  hints:['`ch.isalnum()` filters the characters you want.','Compare the cleaned string to its reverse.'],
  solution:'def is_palindrome(s):\n    clean = [c.lower() for c in s if c.isalnum()]\n    return clean == clean[::-1]'
},
{
  id:'word_count', title:'Count words', topic:'strings', rating:915,
  prompt:'Write `word_count(s)` returning how many whitespace-separated words `s` has.',
  mode:'func', fn:'word_count', starter:'def word_count(s):\n    ',
  tests:[{args:['one two  three'],expect:3},{args:['   '],expect:0},{args:['solo'],expect:1}],
  hints:['`s.split()` already collapses runs of spaces.'],
  solution:'def word_count(s):\n    return len(s.split())'
},
{
  id:'min_max', title:'Min and max', topic:'lists', rating:930,
  prompt:'Write `min_max(nums)` returning the list `[smallest, largest]`. Return `[]` for an empty list.',
  mode:'func', fn:'min_max', starter:'def min_max(nums):\n    ',
  tests:[{args:[[3,1,4]],expect:[1,4]},{args:[[]],expect:[]},{args:[[7]],expect:[7,7]}],
  hints:['Handle the empty case first.'],
  solution:'def min_max(nums):\n    if not nums:\n        return []\n    return [min(nums), max(nums)]'
},
{
  id:'char_freq', title:'Character frequency', topic:'dicts', rating:950,
  prompt:'Write `freq(s)` returning a dict mapping each character to how often it appears.\n\n```\nfreq("aab")  ->  {"a": 2, "b": 1}\n```',
  mode:'func', fn:'freq', starter:'def freq(s):\n    ',
  tests:[{args:['aab'],expect:{a:2,b:1}},{args:[''],expect:{}},{args:['xx'],expect:{x:2}}],
  hints:['`d[c] = d.get(c, 0) + 1`'],
  solution:'def freq(s):\n    d = {}\n    for c in s:\n        d[c] = d.get(c, 0) + 1\n    return d'
},
{
  id:'fib_list', title:'Fibonacci list', topic:'loops', rating:970,
  prompt:'Write `fib(n)` returning the first `n` Fibonacci numbers starting `0, 1`.\n\n```\nfib(5)  ->  [0, 1, 1, 2, 3]\n```',
  mode:'func', fn:'fib', starter:'def fib(n):\n    ',
  tests:[{args:[5],expect:[0,1,1,2,3]},{args:[0],expect:[]},{args:[1],expect:[0]},{args:[8],expect:[0,1,1,2,3,5,8,13]}],
  hints:['Keep two variables and swap: `a, b = b, a + b`.'],
  solution:'def fib(n):\n    out = []\n    a, b = 0, 1\n    for _ in range(n):\n        out.append(a)\n        a, b = b, a + b\n    return out'
},
{
  id:'dedupe', title:'Remove duplicates', topic:'lists', rating:985,
  prompt:'Write `dedupe(items)` removing duplicates while keeping the first occurrence order.',
  mode:'func', fn:'dedupe', starter:'def dedupe(items):\n    ',
  tests:[{args:[[1,2,1,3,2]],expect:[1,2,3]},{args:[[]],expect:[]},{args:[['a','a','a']],expect:['a']}],
  hints:['A `set` remembers what you have already seen.','`set()` alone loses the order — track it yourself.'],
  solution:'def dedupe(items):\n    seen = set()\n    out = []\n    for x in items:\n        if x not in seen:\n            seen.add(x)\n            out.append(x)\n    return out'
},
{
  id:'second_largest', title:'Second largest', topic:'lists', rating:1000,
  prompt:'Write `second_largest(nums)` returning the second largest **distinct** value, or `None` if there is not one.',
  mode:'func', fn:'second_largest', starter:'def second_largest(nums):\n    ',
  tests:[{args:[[1,5,3]],expect:3},{args:[[2,2,2]],expect:null},{args:[[]],expect:null},{args:[[9,9,4]],expect:4}],
  hints:['Drop duplicates first.','Sort the distinct values and take `[-2]`.'],
  solution:'def second_largest(nums):\n    vals = sorted(set(nums))\n    return vals[-2] if len(vals) >= 2 else None'
},
{
  id:'anagram', title:'Anagram check', topic:'strings', rating:1020,
  prompt:'Write `is_anagram(a, b)` — `True` when the two strings use exactly the same letters. Ignore case and spaces.',
  mode:'func', fn:'is_anagram', starter:'def is_anagram(a, b):\n    ',
  tests:[{args:['listen','silent'],expect:true},{args:['Dormitory','dirty room'],expect:true},{args:['abc','abd'],expect:false}],
  hints:['Strip spaces, lowercase, then compare sorted characters.'],
  solution:'def is_anagram(a, b):\n    clean = lambda s: sorted(s.lower().replace(" ", ""))\n    return clean(a) == clean(b)'
},
{
  id:'fizzbuzz_list', title:'FizzBuzz list', topic:'loops', rating:1040,
  prompt:'Write `fizzbuzz(n)` returning the FizzBuzz results for `1..n` as a list of strings.',
  mode:'func', fn:'fizzbuzz', starter:'def fizzbuzz(n):\n    ',
  tests:[{args:[5],expect:['1','2','Fizz','4','Buzz']},{args:[0],expect:[]},
         {args:[15],expect:['1','2','Fizz','4','Buzz','Fizz','7','8','Fizz','Buzz','11','Fizz','13','14','FizzBuzz']}],
  hints:['`range(1, n + 1)`'],
  solution:'def fizzbuzz(n):\n    out = []\n    for i in range(1, n + 1):\n        if i % 15 == 0:\n            out.append("FizzBuzz")\n        elif i % 3 == 0:\n            out.append("Fizz")\n        elif i % 5 == 0:\n            out.append("Buzz")\n        else:\n            out.append(str(i))\n    return out'
},
{
  id:'is_prime', title:'Prime check', topic:'math', rating:1055,
  prompt:'Write `is_prime(n)`. Numbers below 2 are not prime.',
  mode:'func', fn:'is_prime', starter:'def is_prime(n):\n    ',
  tests:[{args:[2],expect:true},{args:[1],expect:false},{args:[97],expect:true},{args:[91],expect:false},{args:[-7],expect:false}],
  hints:['You only need to test divisors up to the square root.'],
  solution:'def is_prime(n):\n    if n < 2:\n        return False\n    i = 2\n    while i * i <= n:\n        if n % i == 0:\n            return False\n        i += 1\n    return True'
},
{
  id:'flatten1', title:'Flatten one level', topic:'lists', rating:1070,
  prompt:'Write `flatten(rows)` turning a list of lists into a single list.\n\n```\nflatten([[1, 2], [3]])  ->  [1, 2, 3]\n```',
  mode:'func', fn:'flatten', starter:'def flatten(rows):\n    ',
  tests:[{args:[[[1,2],[3]]],expect:[1,2,3]},{args:[[]],expect:[]},{args:[[[],[1]]],expect:[1]}],
  hints:['A comprehension can take two `for` clauses.'],
  solution:'def flatten(rows):\n    return [x for row in rows for x in row]'
},
{
  id:'sort_by_len', title:'Sort by length', topic:'sorting', rating:1090,
  prompt:'Write `by_length(words)` sorting shortest first. Words of equal length keep their original order.',
  mode:'func', fn:'by_length', starter:'def by_length(words):\n    ',
  tests:[{args:[['ccc','a','bb']],expect:['a','bb','ccc']},{args:[['aa','bb']],expect:['aa','bb']},{args:[[]],expect:[]}],
  hints:['`sorted(words, key=len)` — Python\'s sort is stable.'],
  solution:'def by_length(words):\n    return sorted(words, key=len)'
},
{
  id:'sum_digits', title:'Sum of digits', topic:'math', rating:1110,
  prompt:'Write `digit_sum(n)` returning the sum of the digits of a non-negative integer.',
  mode:'func', fn:'digit_sum', starter:'def digit_sum(n):\n    ',
  tests:[{args:[123],expect:6},{args:[0],expect:0},{args:[999],expect:27}],
  hints:['`str(n)` gives you the digits, or use `% 10` and `// 10`.'],
  solution:'def digit_sum(n):\n    return sum(int(c) for c in str(n))'
},
{
  id:'common', title:'Shared items', topic:'sets', rating:1125,
  prompt:'Write `common(a, b)` returning the values in both lists, sorted ascending, no duplicates.',
  mode:'func', fn:'common', starter:'def common(a, b):\n    ',
  tests:[{args:[[1,2,3],[2,3,4]],expect:[2,3]},{args:[[1],[2]],expect:[]},{args:[[1,1,2],[1]],expect:[1]}],
  hints:['Sets support `&` for intersection.'],
  solution:'def common(a, b):\n    return sorted(set(a) & set(b))'
},
{
  id:'group_by_first', title:'Group by first letter', topic:'dicts', rating:1140,
  prompt:'Write `group(words)` returning a dict from first letter to the list of words starting with it, in input order.\n\n```\ngroup(["ant","ape","bee"])  ->  {"a": ["ant","ape"], "b": ["bee"]}\n```',
  mode:'func', fn:'group', starter:'def group(words):\n    ',
  tests:[{args:[['ant','ape','bee']],expect:{a:['ant','ape'],b:['bee']}},{args:[[]],expect:{}}],
  hints:['`d.setdefault(k, []).append(w)`'],
  solution:'def group(words):\n    d = {}\n    for w in words:\n        d.setdefault(w[0], []).append(w)\n    return d'
},
{
  id:'two_sum', title:'Two sum', topic:'algorithms', rating:1160,
  prompt:'Write `two_sum(nums, target)` returning the **indices** `[i, j]` (i < j) of two values summing to `target`, or `[]` if none. Exactly one answer exists when there is one.',
  mode:'func', fn:'two_sum', starter:'def two_sum(nums, target):\n    ',
  tests:[{args:[[2,7,11,15],9],expect:[0,1]},{args:[[3,2,4],6],expect:[1,2]},{args:[[1,2],9],expect:[]},{args:[[3,3],6],expect:[0,1]}],
  hints:['A dict of value -> index lets you do it in one pass.','For each `n`, look for `target - n` among the values seen so far.'],
  solution:'def two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i\n    return []'
},
{
  id:'rotate', title:'Rotate a list', topic:'lists', rating:1180,
  prompt:'Write `rotate(items, k)` moving each element `k` places to the right. `k` may be bigger than the list or negative.\n\n```\nrotate([1,2,3,4], 1)  ->  [4,1,2,3]\n```',
  mode:'func', fn:'rotate', starter:'def rotate(items, k):\n    ',
  tests:[{args:[[1,2,3,4],1],expect:[4,1,2,3]},{args:[[1,2,3],5],expect:[2,3,1]},{args:[[],3],expect:[]},{args:[[1,2,3],-1],expect:[2,3,1]}],
  hints:['`k % len(items)` normalises the shift.','`items[-k:] + items[:-k]`'],
  solution:'def rotate(items, k):\n    if not items:\n        return []\n    k %= len(items)\n    return items[-k:] + items[:-k]'
},
{
  id:'run_length', title:'Run-length encode', topic:'strings', rating:1195,
  prompt:'Write `encode(s)` compressing runs of the same character.\n\n```\nencode("aaabbc")  ->  "a3b2c1"\n```',
  mode:'func', fn:'encode', starter:'def encode(s):\n    ',
  tests:[{args:['aaabbc'],expect:'a3b2c1'},{args:[''],expect:''},{args:['a'],expect:'a1'},{args:['abab'],expect:'a1b1a1b1'}],
  hints:['Walk the string, tracking the current character and its count.','Remember to flush the final run after the loop.'],
  solution:'def encode(s):\n    if not s:\n        return ""\n    out = []\n    cur, n = s[0], 1\n    for c in s[1:]:\n        if c == cur:\n            n += 1\n        else:\n            out.append(cur + str(n))\n            cur, n = c, 1\n    out.append(cur + str(n))\n    return "".join(out)'
},
{
  id:'binary_search', title:'Binary search', topic:'algorithms', rating:1210,
  prompt:'Write `search(sorted_nums, target)` returning the index of `target`, or `-1`. Must run in O(log n).',
  mode:'func', fn:'search', starter:'def search(sorted_nums, target):\n    ',
  tests:[{args:[[1,3,5,7,9],7],expect:3},{args:[[1,3,5],4],expect:-1},{args:[[],1],expect:-1},{args:[[2],2],expect:0}],
  hints:['Keep `lo` and `hi` bounds and halve the range each step.','`mid = (lo + hi) // 2`'],
  solution:'def search(sorted_nums, target):\n    lo, hi = 0, len(sorted_nums) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if sorted_nums[mid] == target:\n            return mid\n        if sorted_nums[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1'
},
{
  id:'most_common', title:'Most common word', topic:'dicts', rating:1230,
  prompt:'Write `top_word(text)` returning the most frequent lowercase word. On a tie return the one that appears first in the text. Words are whitespace-separated; ignore case.',
  mode:'func', fn:'top_word', starter:'def top_word(text):\n    ',
  tests:[{args:['a b a'],expect:'a'},{args:['X y Y'],expect:'y'},{args:['one'],expect:'one'}],
  hints:['Count first, then scan the words in order and keep the best.','Iterating the dict in insertion order breaks ties correctly.'],
  solution:'def top_word(text):\n    counts = {}\n    for w in text.lower().split():\n        counts[w] = counts.get(w, 0) + 1\n    best = None\n    for w, c in counts.items():\n        if best is None or c > counts[best]:\n            best = w\n    return best'
},
{
  id:'matrix_transpose', title:'Transpose a matrix', topic:'lists', rating:1250,
  prompt:'Write `transpose(m)` swapping rows and columns of a rectangular list of lists.\n\n```\ntranspose([[1,2,3],[4,5,6]])  ->  [[1,4],[2,5],[3,6]]\n```',
  mode:'func', fn:'transpose', starter:'def transpose(m):\n    ',
  tests:[{args:[[[1,2,3],[4,5,6]]],expect:[[1,4],[2,5],[3,6]]},{args:[[]],expect:[]},{args:[[[1]]],expect:[[1]]}],
  hints:['`zip(*m)` pairs the columns up.','`zip` yields tuples — convert them to lists.'],
  solution:'def transpose(m):\n    return [list(col) for col in zip(*m)]'
},
{
  id:'chunk', title:'Chunk a list', topic:'lists', rating:1270,
  prompt:'Write `chunk(items, size)` splitting into consecutive groups of `size`. The last group may be shorter.\n\n```\nchunk([1,2,3,4,5], 2)  ->  [[1,2],[3,4],[5]]\n```',
  mode:'func', fn:'chunk', starter:'def chunk(items, size):\n    ',
  tests:[{args:[[1,2,3,4,5],2],expect:[[1,2],[3,4],[5]]},{args:[[],3],expect:[]},{args:[[1,2],5],expect:[[1,2]]}],
  hints:['Step through with `range(0, len(items), size)`.'],
  solution:'def chunk(items, size):\n    return [items[i:i + size] for i in range(0, len(items), size)]'
},
{
  id:'merge_sorted', title:'Merge two sorted lists', topic:'algorithms', rating:1290,
  prompt:'Write `merge(a, b)` combining two already-sorted lists into one sorted list, in O(n + m). Do not call `sorted`.',
  mode:'func', fn:'merge', starter:'def merge(a, b):\n    ',
  tests:[{args:[[1,3,5],[2,4]],expect:[1,2,3,4,5]},{args:[[],[1]],expect:[1]},{args:[[1,1],[1]],expect:[1,1,1]},{args:[[],[]],expect:[]}],
  hints:['Two index pointers, always take the smaller head.','Append whatever is left over at the end.'],
  solution:'def merge(a, b):\n    out = []\n    i = j = 0\n    while i < len(a) and j < len(b):\n        if a[i] <= b[j]:\n            out.append(a[i]); i += 1\n        else:\n            out.append(b[j]); j += 1\n    out.extend(a[i:])\n    out.extend(b[j:])\n    return out'
},
{
  id:'caesar', title:'Caesar cipher', topic:'strings', rating:1310,
  prompt:'Write `shift(s, k)` moving every **letter** `k` places along the alphabet, wrapping round. Case is preserved; anything that is not a letter is left alone.\n\n```\nshift("abz", 1)  ->  "bca"\n```',
  mode:'func', fn:'shift', starter:'def shift(s, k):\n    ',
  tests:[{args:['abz',1],expect:'bca'},{args:['Hello, World!',3],expect:'Khoor, Zruog!'},{args:['abc',0],expect:'abc'},{args:['a',-1],expect:'z'}],
  hints:['`ord("a")` and `chr()` convert between letters and numbers.','`(ord(c) - base + k) % 26 + base`'],
  solution:'def shift(s, k):\n    out = []\n    for c in s:\n        if c.isalpha():\n            base = ord("a") if c.islower() else ord("A")\n            out.append(chr((ord(c) - base + k) % 26 + base))\n        else:\n            out.append(c)\n    return "".join(out)'
},
{
  id:'balanced', title:'Balanced brackets', topic:'algorithms', rating:1330,
  prompt:'Write `balanced(s)` returning `True` when every `()`, `[]` and `{}` is correctly nested and closed.',
  mode:'func', fn:'balanced', starter:'def balanced(s):\n    ',
  tests:[{args:['(a[b]{c})'],expect:true},{args:['(]'],expect:false},{args:[''],expect:true},{args:['('],expect:false},{args:[')('],expect:false}],
  hints:['A stack: push openers, pop on closers.','Non-bracket characters are simply ignored.'],
  solution:'def balanced(s):\n    pairs = {")": "(", "]": "[", "}": "{"}\n    stack = []\n    for c in s:\n        if c in "([{":\n            stack.append(c)\n        elif c in pairs:\n            if not stack or stack.pop() != pairs[c]:\n                return False\n    return not stack'
},
{
  id:'gcd', title:'Greatest common divisor', topic:'math', rating:1350,
  prompt:'Write `gcd(a, b)` for two positive integers, using Euclid\'s algorithm. Do not import `math`.',
  mode:'func', fn:'gcd', starter:'def gcd(a, b):\n    ',
  tests:[{args:[12,18],expect:6},{args:[7,13],expect:1},{args:[100,10],expect:10},{args:[1,1],expect:1}],
  hints:['`gcd(a, b) == gcd(b, a % b)`, stopping when `b` is 0.'],
  solution:'def gcd(a, b):\n    while b:\n        a, b = b, a % b\n    return a'
},
{
  id:'primes_upto', title:'Primes below n', topic:'math', rating:1370,
  prompt:'Write `primes(n)` returning every prime **strictly below** `n`, ascending. Should handle `n = 100000` quickly.',
  mode:'func', fn:'primes', starter:'def primes(n):\n    ',
  tests:[{args:[10],expect:[2,3,5,7]},{args:[2],expect:[]},{args:[0],expect:[]},{args:[30],expect:[2,3,5,7,11,13,17,19,23,29]}],
  hints:['Sieve of Eratosthenes: a boolean list, cross off multiples.','Start crossing off at `i * i`.'],
  solution:'def primes(n):\n    if n < 3:\n        return []\n    sieve = [True] * n\n    sieve[0] = sieve[1] = False\n    i = 2\n    while i * i < n:\n        if sieve[i]:\n            for j in range(i * i, n, i):\n                sieve[j] = False\n        i += 1\n    return [i for i, ok in enumerate(sieve) if ok]'
},
{
  id:'roman_to_int', title:'Roman numerals to int', topic:'strings', rating:1390,
  prompt:'Write `roman(s)` converting a valid Roman numeral to an integer.\n\n```\nroman("MCMXCIV")  ->  1994\n```',
  mode:'func', fn:'roman', starter:'def roman(s):\n    ',
  tests:[{args:['III'],expect:3},{args:['IX'],expect:9},{args:['MCMXCIV'],expect:1994},{args:['LVIII'],expect:58}],
  hints:['Map each letter to its value.','If a value is smaller than the next one, subtract it instead of adding.'],
  solution:'def roman(s):\n    vals = {"I":1,"V":5,"X":10,"L":50,"C":100,"D":500,"M":1000}\n    total = 0\n    for i, c in enumerate(s):\n        v = vals[c]\n        if i + 1 < len(s) and v < vals[s[i + 1]]:\n            total -= v\n        else:\n            total += v\n    return total'
},
{
  id:'flatten_deep', title:'Flatten any depth', topic:'recursion', rating:1410,
  prompt:'Write `flatten(x)` turning arbitrarily nested lists into one flat list, order preserved.\n\n```\nflatten([1, [2, [3, [4]]], 5])  ->  [1, 2, 3, 4, 5]\n```',
  mode:'func', fn:'flatten', starter:'def flatten(x):\n    ',
  tests:[{args:[[1,[2,[3,[4]]],5]],expect:[1,2,3,4,5]},{args:[[]],expect:[]},{args:[[[[[]]]]],expect:[]},{args:[[[1],[2]]],expect:[1,2]}],
  hints:['Recurse when an element is itself a list.','`isinstance(item, list)`'],
  solution:'def flatten(x):\n    out = []\n    for item in x:\n        if isinstance(item, list):\n            out.extend(flatten(item))\n        else:\n            out.append(item)\n    return out'
},
{
  id:'sort_dict_by_value', title:'Sort a dict by value', topic:'sorting', rating:1430,
  prompt:'Write `ranked(counts)` returning `[key, value]` pairs sorted by value descending, then by key ascending.\n\n```\nranked({"b": 2, "a": 2, "c": 5})  ->  [["c",5],["a",2],["b",2]]\n```',
  mode:'func', fn:'ranked', starter:'def ranked(counts):\n    ',
  tests:[{args:[{b:2,a:2,c:5}],expect:[['c',5],['a',2],['b',2]]},{args:[{}],expect:[]},{args:[{x:1}],expect:[['x',1]]}],
  hints:['A tuple key sorts by several fields: `key=lambda kv: (-kv[1], kv[0])`.'],
  solution:'def ranked(counts):\n    pairs = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))\n    return [[k, v] for k, v in pairs]'
},
{
  id:'longest_unique', title:'Longest run of unique characters', topic:'algorithms', rating:1450,
  prompt:'Write `longest_unique(s)` returning the length of the longest substring with no repeated character.\n\n```\nlongest_unique("abcabcbb")  ->  3\n```',
  mode:'func', fn:'longest_unique', starter:'def longest_unique(s):\n    ',
  tests:[{args:['abcabcbb'],expect:3},{args:['bbbbb'],expect:1},{args:[''],expect:0},{args:['pwwkew'],expect:3},{args:['abcdef'],expect:6}],
  hints:['A sliding window with a "last seen index" dict.','When you meet a repeat, jump the window start past its previous position.'],
  solution:'def longest_unique(s):\n    last = {}\n    start = best = 0\n    for i, c in enumerate(s):\n        if c in last and last[c] >= start:\n            start = last[c] + 1\n        last[c] = i\n        best = max(best, i - start + 1)\n    return best'
},
{
  id:'stack_class', title:'A Stack class', topic:'classes', rating:1470,
  prompt:'Write `run(ops)`. Build a class with `push(x)`, `pop()`, `peek()` and `size()`, then apply the operation list and return the list of results from `pop`/`peek`/`size` in order. `pop`/`peek` on an empty stack return `None`.\n\n```\nrun([["push",1],["push",2],["pop"],["size"]])  ->  [2, 1]\n```',
  mode:'func', fn:'run', starter:'class Stack:\n    def __init__(self):\n        self.items = []\n\n\ndef run(ops):\n    ',
  tests:[{args:[[['push',1],['push',2],['pop'],['size']]],expect:[2,1]},
         {args:[[['pop']]],expect:[null]},
         {args:[[['push',5],['peek'],['peek'],['size']]],expect:[5,5,1]}],
  hints:['A Python list already does all four jobs.','Only push produces no output.'],
  solution:'class Stack:\n    def __init__(self):\n        self.items = []\n\n    def push(self, x):\n        self.items.append(x)\n\n    def pop(self):\n        return self.items.pop() if self.items else None\n\n    def peek(self):\n        return self.items[-1] if self.items else None\n\n    def size(self):\n        return len(self.items)\n\n\ndef run(ops):\n    s = Stack()\n    out = []\n    for op in ops:\n        if op[0] == "push":\n            s.push(op[1])\n        else:\n            out.append(getattr(s, op[0])())\n    return out'
},
{
  id:'safe_div', title:'Handle the error', topic:'errors', rating:1490,
  prompt:'Write `safe_div(a, b)` returning `a / b`, but `None` when `b` is zero and the string `"bad input"` when the arguments are not numbers. Use `try` / `except`.',
  mode:'func', fn:'safe_div', starter:'def safe_div(a, b):\n    ',
  tests:[{args:[6,3],expect:2.0},{args:[1,0],expect:null},{args:['x',2],expect:'bad input'},{args:[1,'y'],expect:'bad input'}],
  hints:['`ZeroDivisionError` and `TypeError` are the two to catch.','Order matters — catch the specific ones, not bare `except`.'],
  solution:'def safe_div(a, b):\n    try:\n        return a / b\n    except ZeroDivisionError:\n        return None\n    except TypeError:\n        return "bad input"'
},
{
  id:'move_zeros', title:'Move zeros to the end', topic:'lists', rating:1510,
  prompt:'Write `move_zeros(nums)` returning a list with every `0` moved to the end, other values keeping their relative order.\n\n```\nmove_zeros([0,1,0,3,12])  ->  [1,3,12,0,0]\n```',
  mode:'func', fn:'move_zeros', starter:'def move_zeros(nums):\n    ',
  tests:[{args:[[0,1,0,3,12]],expect:[1,3,12,0,0]},{args:[[0,0]],expect:[0,0]},{args:[[]],expect:[]},{args:[[1,2]],expect:[1,2]}],
  hints:['Collect the non-zeros, then pad with zeros.'],
  solution:'def move_zeros(nums):\n    keep = [n for n in nums if n != 0]\n    return keep + [0] * (len(nums) - len(keep))'
},
{
  id:'word_freq_top_n', title:'Top N words', topic:'dicts', rating:1530,
  prompt:'Write `top_n(text, n)` returning the `n` most common words as `[word, count]` pairs, most frequent first, ties broken alphabetically. Lowercase; split on whitespace.',
  mode:'func', fn:'top_n', starter:'def top_n(text, n):\n    ',
  tests:[{args:['a b a c b a',2],expect:[['a',3],['b',2]]},{args:['x',5],expect:[['x',1]]},{args:['',3],expect:[]}],
  hints:['`collections.Counter` counts in one line.','Sort with `key=lambda kv: (-kv[1], kv[0])`, then slice.'],
  solution:'from collections import Counter\n\n\ndef top_n(text, n):\n    c = Counter(text.lower().split())\n    pairs = sorted(c.items(), key=lambda kv: (-kv[1], kv[0]))\n    return [[w, k] for w, k in pairs[:n]]'
},
];
