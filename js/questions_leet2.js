/* Interview-style questions, part 2: linked lists, trees, tries, graphs,
   backtracking and dynamic programming.

   Linked-list and tree questions get their node classes and builders from a
   `setup` preamble that runs before the player's code, so the editor stays
   about the problem rather than about boilerplate. `args_py` builds the
   arguments with those helpers, and `wrap` turns a returned node back into a
   plain list for comparison.                                               */

(function () {

const LIST_SETUP = `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


def linked(values):
    head = None
    for v in reversed(values):
        head = ListNode(v, head)
    return head


def _dump(node, limit=200):
    out = []
    while node is not None and len(out) < limit:
        out.append(node.val)
        node = node.next
    return out
`;

const TREE_SETUP = `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def tree(values):
    """Level-order list, None meaning 'no child here'."""
    if not values:
        return None
    root = TreeNode(values[0])
    queue = [root]
    i = 1
    while queue and i < len(values):
        node = queue.pop(0)
        if i < len(values):
            v = values[i]
            i += 1
            if v is not None:
                node.left = TreeNode(v)
                queue.append(node.left)
        if i < len(values):
            v = values[i]
            i += 1
            if v is not None:
                node.right = TreeNode(v)
                queue.append(node.right)
    return root


def _dump(root):
    """Back to a level-order list, trailing gaps trimmed."""
    if root is None:
        return []
    out = []
    queue = [root]
    while queue:
        node = queue.pop(0)
        if node is None:
            out.append(None)
            continue
        out.append(node.val)
        queue.append(node.left)
        queue.append(node.right)
    while out and out[-1] is None:
        out.pop()
    return out
`;

const LIST_NOTE = '\n\n`ListNode` (with `.val` and `.next`) is already defined for you — do not redefine it.';
const TREE_NOTE = '\n\n`TreeNode` (with `.val`, `.left` and `.right`) is already defined for you — do not redefine it.';

window.QUESTIONS.push(

/* ================= linked lists ================= */
{
  id:'lc_reverse_list', title:'Reverse a linked list', topic:'linked-list', rating:1680, setup:LIST_SETUP,
  prompt:'Write `reverse(head)` reversing a singly linked list and returning the new head.' + LIST_NOTE +
    '\n\n```\n[1,2,3]  ->  [3,2,1]\n```',
  mode:'func', fn:'reverse', wrap:'_dump(_r)', starter:'def reverse(head):\n    ',
  tests:[{args_py:['linked([1,2,3,4,5])'],expect:[5,4,3,2,1]},{args_py:['linked([])'],expect:[]},
         {args_py:['linked([1])'],expect:[1]}],
  hints:['Keep three references: previous, current, next.','Point `current.next` backwards, then step everything forward.'],
  solution:'def reverse(head):\n    prev = None\n    while head:\n        nxt = head.next\n        head.next = prev\n        prev = head\n        head = nxt\n    return prev'
},
{
  id:'lc_merge_two_lists', title:'Merge two sorted linked lists', topic:'linked-list', rating:1700, setup:LIST_SETUP,
  prompt:'Write `merge(a, b)` merging two sorted linked lists into one sorted list and returning its head.' + LIST_NOTE,
  mode:'func', fn:'merge', wrap:'_dump(_r)', starter:'def merge(a, b):\n    ',
  tests:[{args_py:['linked([1,2,4])','linked([1,3,4])'],expect:[1,1,2,3,4,4]},
         {args_py:['linked([])','linked([])'],expect:[]},
         {args_py:['linked([])','linked([0])'],expect:[0]}],
  hints:['A dummy head node saves you from special-casing the first link.','Attach whichever list still has nodes at the end.'],
  solution:'def merge(a, b):\n    dummy = tail = ListNode()\n    while a and b:\n        if a.val <= b.val:\n            tail.next, a = a, a.next\n        else:\n            tail.next, b = b, b.next\n        tail = tail.next\n    tail.next = a or b\n    return dummy.next'
},
{
  id:'lc_list_cycle', title:'Linked list cycle', topic:'linked-list', rating:1790, setup:LIST_SETUP,
  prompt:'Write `has_cycle(head)` returning `True` when the list loops back on itself. O(1) extra space.' + LIST_NOTE +
    '\n\nThe grader builds the list from values, then joins the tail to the node at `pos` (`-1` for no loop) — you get the head.',
  mode:'func', fn:'has_cycle', setup:LIST_SETUP + `

def looped(values, pos):
    head = linked(values)
    if pos < 0 or head is None:
        return head
    tail = head
    while tail.next:
        tail = tail.next
    target = head
    for _ in range(pos):
        target = target.next
    tail.next = target
    return head
`,
  starter:'def has_cycle(head):\n    ',
  tests:[{args_py:['looped([3,2,0,-4], 1)'],expect:true},{args_py:['looped([1,2], 0)'],expect:true},
         {args_py:['looped([1,2], -1)'],expect:false},{args_py:['looped([], -1)'],expect:false}],
  hints:['Floyd\'s tortoise and hare: one pointer moves one step, the other two.','If there is a loop they must eventually land on the same node.'],
  solution:'def has_cycle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n        if slow is fast:\n            return True\n    return False'
},
{
  id:'lc_remove_nth', title:'Remove the nth node from the end', topic:'linked-list', rating:1930, setup:LIST_SETUP,
  prompt:'Write `remove_nth(head, n)` deleting the nth node counting from the end, returning the new head. One pass.' + LIST_NOTE,
  mode:'func', fn:'remove_nth', wrap:'_dump(_r)', starter:'def remove_nth(head, n):\n    ',
  tests:[{args_py:['linked([1,2,3,4,5])','2'],expect:[1,2,3,5]},{args_py:['linked([1])','1'],expect:[]},
         {args_py:['linked([1,2])','2'],expect:[2]}],
  hints:['Send one pointer `n` steps ahead, then move both until it reaches the end.','A dummy node in front makes deleting the head no different from any other node.'],
  solution:'def remove_nth(head, n):\n    dummy = ListNode(0, head)\n    lead = lag = dummy\n    for _ in range(n):\n        lead = lead.next\n    while lead.next:\n        lead = lead.next\n        lag = lag.next\n    lag.next = lag.next.next\n    return dummy.next'
},
{
  id:'lc_add_two_numbers', title:'Add two numbers as lists', topic:'linked-list', rating:1980, setup:LIST_SETUP,
  prompt:'Two numbers are stored as linked lists of digits, least significant first. Write `add(a, b)` returning their sum in the same form.' + LIST_NOTE +
    '\n\n```\n[2,4,3] + [5,6,4]  ->  [7,0,8]   # 342 + 465 = 807\n```',
  mode:'func', fn:'add', wrap:'_dump(_r)', starter:'def add(a, b):\n    ',
  tests:[{args_py:['linked([2,4,3])','linked([5,6,4])'],expect:[7,0,8]},
         {args_py:['linked([9,9])','linked([1])'],expect:[0,0,1]},
         {args_py:['linked([0])','linked([0])'],expect:[0]}],
  hints:['Walk both lists together, carrying as you go.','Keep looping while either list has nodes or a carry is left.'],
  solution:'def add(a, b):\n    dummy = tail = ListNode()\n    carry = 0\n    while a or b or carry:\n        total = carry\n        if a:\n            total += a.val\n            a = a.next\n        if b:\n            total += b.val\n            b = b.next\n        carry, digit = divmod(total, 10)\n        tail.next = ListNode(digit)\n        tail = tail.next\n    return dummy.next'
},
{
  id:'lc_reorder_list', title:'Reorder a linked list', topic:'linked-list', rating:2260, setup:LIST_SETUP,
  prompt:'Write `reorder(head)` rearranging `L0 → L1 → … → Ln` into `L0 → Ln → L1 → Ln-1 → …`, in place, returning the head.' + LIST_NOTE +
    '\n\n```\n[1,2,3,4]  ->  [1,4,2,3]\n```',
  mode:'func', fn:'reorder', wrap:'_dump(_r)', starter:'def reorder(head):\n    ',
  tests:[{args_py:['linked([1,2,3,4])'],expect:[1,4,2,3]},{args_py:['linked([1,2,3,4,5])'],expect:[1,5,2,4,3]},
         {args_py:['linked([1])'],expect:[1]},{args_py:['linked([])'],expect:[]}],
  hints:['Three steps: find the middle, reverse the second half, then weave the halves together.','Slow and fast pointers find the middle.'],
  solution:'def reorder(head):\n    if not head or not head.next:\n        return head\n    slow, fast = head, head.next\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n    second = slow.next\n    slow.next = None\n    prev = None\n    while second:\n        nxt = second.next\n        second.next = prev\n        prev = second\n        second = nxt\n    first, second = head, prev\n    while second:\n        n1, n2 = first.next, second.next\n        first.next = second\n        second.next = n1\n        first, second = n1, n2\n    return head'
},
{
  id:'lc_middle_node', title:'Middle of a linked list', topic:'linked-list', rating:1580, setup:LIST_SETUP,
  prompt:'Write `middle(head)` returning the middle node — the second of the two when the length is even. One pass.' + LIST_NOTE,
  mode:'func', fn:'middle', wrap:'_dump(_r)', starter:'def middle(head):\n    ',
  tests:[{args_py:['linked([1,2,3,4,5])'],expect:[3,4,5]},{args_py:['linked([1,2,3,4,5,6])'],expect:[4,5,6]},
         {args_py:['linked([1])'],expect:[1]},{args_py:['linked([])'],expect:[]}],
  hints:['Slow moves one step, fast moves two.','When fast runs off the end, slow is in the middle.'],
  solution:'def middle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n    return slow'
},
{
  id:'lc_palindrome_list', title:'Palindrome linked list', topic:'linked-list', rating:2050, setup:LIST_SETUP,
  prompt:'Write `is_palindrome(head)` returning `True` when the values read the same in both directions. Aim for O(1) extra space.' + LIST_NOTE,
  mode:'func', fn:'is_palindrome', starter:'def is_palindrome(head):\n    ',
  tests:[{args_py:['linked([1,2,2,1])'],expect:true},{args_py:['linked([1,2])'],expect:false},
         {args_py:['linked([])'],expect:true},{args_py:['linked([1,2,1])'],expect:true}],
  hints:['Find the middle, reverse the second half, then compare the halves.','Or, for the easy version, copy the values into a list first.'],
  solution:'def is_palindrome(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n    prev = None\n    while slow:\n        nxt = slow.next\n        slow.next = prev\n        prev = slow\n        slow = nxt\n    while prev:\n        if prev.val != head.val:\n            return False\n        prev = prev.next\n        head = head.next\n    return True'
},
{
  id:'lc_remove_dups_list', title:'Remove duplicates from a sorted list', topic:'linked-list', rating:1720, setup:LIST_SETUP,
  prompt:'Write `dedupe(head)` deleting duplicate values from a sorted linked list so each value appears once, returning the head.' + LIST_NOTE,
  mode:'func', fn:'dedupe', wrap:'_dump(_r)', starter:'def dedupe(head):\n    ',
  tests:[{args_py:['linked([1,1,2])'],expect:[1,2]},{args_py:['linked([1,1,2,3,3])'],expect:[1,2,3]},
         {args_py:['linked([])'],expect:[]},{args_py:['linked([1])'],expect:[1]}],
  hints:['Walk the list, and whenever the next node repeats the current value, skip over it.','Do not advance while you are still deleting.'],
  solution:'def dedupe(head):\n    node = head\n    while node and node.next:\n        if node.val == node.next.val:\n            node.next = node.next.next\n        else:\n            node = node.next\n    return head'
},
{
  id:'lc_intersection_lists', title:'Intersection of two linked lists', topic:'linked-list', rating:2110,
  setup:LIST_SETUP + `

_pairs = {}


def joined(a_only, b_only, shared):
    """Two lists that really share their tail nodes. Cached, so both
    arguments of one test get the same pair."""
    key = (tuple(a_only), tuple(b_only), tuple(shared))
    if key not in _pairs:
        tail = linked(shared)

        def attach(head):
            if head is None:
                return tail
            node = head
            while node.next:
                node = node.next
            node.next = tail
            return head

        _pairs[key] = [attach(linked(a_only)), attach(linked(b_only))]
    return _pairs[key]
`,
  prompt:'Two linked lists may share a tail. Write `intersection(a, b)` returning the first shared **node** (compare identity, not values), or `None`.' + LIST_NOTE +
    '\n\nThe grader hands you the two heads.',
  mode:'func', fn:'intersection', wrap:'_dump(_r)', starter:'def intersection(a, b):\n    ',
  tests:[{args_py:['joined([4,1],[5,6,1],[8,4,5])[0]','joined([4,1],[5,6,1],[8,4,5])[1]'],expect:[8,4,5]},
         {args_py:['joined([1],[2],[])[0]','joined([1],[2],[])[1]'],expect:[]},
         {args_py:['joined([],[],[9])[0]','joined([],[],[9])[1]'],expect:[9]}],
  hints:['Walk both lists; when one ends, restart it at the other list\'s head.','Both pointers then travel the same total distance and meet at the join.'],
  solution:'def intersection(a, b):\n    if a is None or b is None:\n        return None\n    p, q = a, b\n    while p is not q:\n        p = p.next if p else b\n        q = q.next if q else a\n    return p'
},

/* ================= trees ================= */
{
  id:'lc_tree_inorder', title:'Inorder traversal', topic:'trees', rating:1620, setup:TREE_SETUP,
  prompt:'Write `inorder(root)` returning the values left-subtree, node, right-subtree.' + TREE_NOTE +
    '\n\n```\ntree([1,None,2,3])  ->  [1,3,2]\n```',
  mode:'func', fn:'inorder', starter:'def inorder(root):\n    ',
  tests:[{args_py:['tree([1,None,2,3])'],expect:[1,3,2]},{args_py:['tree([])'],expect:[]},
         {args_py:['tree([1])'],expect:[1]},{args_py:['tree([2,1,3])'],expect:[1,2,3]}],
  hints:['Recurse left, take the value, recurse right.','Concatenating the lists is the shortest way to write it.'],
  solution:'def inorder(root):\n    if root is None:\n        return []\n    return inorder(root.left) + [root.val] + inorder(root.right)'
},
{
  id:'lc_tree_level_order', title:'Level-order traversal', topic:'trees', rating:1810, setup:TREE_SETUP,
  prompt:'Write `levels(root)` returning a list of lists — the values on each level, top to bottom, left to right.' + TREE_NOTE +
    '\n\n```\ntree([3,9,20,None,None,15,7])  ->  [[3],[9,20],[15,7]]\n```',
  mode:'func', fn:'levels', starter:'from collections import deque\n\n\ndef levels(root):\n    ',
  tests:[{args_py:['tree([3,9,20,None,None,15,7])'],expect:[[3],[9,20],[15,7]]},
         {args_py:['tree([])'],expect:[]},{args_py:['tree([1])'],expect:[[1]]}],
  hints:['Breadth-first with a queue.','Take the queue\'s current length at the start of each level, and process exactly that many.'],
  solution:'from collections import deque\n\n\ndef levels(root):\n    if root is None:\n        return []\n    out = []\n    q = deque([root])\n    while q:\n        level = []\n        for _ in range(len(q)):\n            node = q.popleft()\n            level.append(node.val)\n            if node.left:\n                q.append(node.left)\n            if node.right:\n                q.append(node.right)\n        out.append(level)\n    return out'
},
{
  id:'lc_tree_depth', title:'Maximum depth of a tree', topic:'trees', rating:1520, setup:TREE_SETUP,
  prompt:'Write `depth(root)` returning the number of nodes on the longest path from the root down to a leaf.' + TREE_NOTE,
  mode:'func', fn:'depth', starter:'def depth(root):\n    ',
  tests:[{args_py:['tree([3,9,20,None,None,15,7])'],expect:3},{args_py:['tree([])'],expect:0},
         {args_py:['tree([1,None,2])'],expect:2}],
  hints:['An empty tree has depth 0.','Otherwise it is `1 + max(depth(left), depth(right))`.'],
  solution:'def depth(root):\n    if root is None:\n        return 0\n    return 1 + max(depth(root.left), depth(root.right))'
},
{
  id:'lc_tree_invert', title:'Invert a binary tree', topic:'trees', rating:1600, setup:TREE_SETUP,
  prompt:'Write `invert(root)` mirroring the tree left-to-right and returning the root.' + TREE_NOTE +
    '\n\n```\ntree([4,2,7,1,3,6,9])  ->  [4,7,2,9,6,3,1]\n```',
  mode:'func', fn:'invert', wrap:'_dump(_r)', starter:'def invert(root):\n    ',
  tests:[{args_py:['tree([4,2,7,1,3,6,9])'],expect:[4,7,2,9,6,3,1]},{args_py:['tree([])'],expect:[]},
         {args_py:['tree([1,2])'],expect:[1,null,2]}],
  hints:['Swap the two children, then invert each of them.','`root.left, root.right = root.right, root.left`'],
  solution:'def invert(root):\n    if root is None:\n        return None\n    root.left, root.right = invert(root.right), invert(root.left)\n    return root'
},
{
  id:'lc_tree_same', title:'Same tree', topic:'trees', rating:1580, setup:TREE_SETUP,
  prompt:'Write `same(p, q)` returning `True` when two trees have the same shape and the same values.' + TREE_NOTE,
  mode:'func', fn:'same', starter:'def same(p, q):\n    ',
  tests:[{args_py:['tree([1,2,3])','tree([1,2,3])'],expect:true},
         {args_py:['tree([1,2])','tree([1,None,2])'],expect:false},
         {args_py:['tree([])','tree([])'],expect:true}],
  hints:['Both empty -> True; only one empty -> False.','Otherwise compare the values and recurse on both sides.'],
  solution:'def same(p, q):\n    if p is None and q is None:\n        return True\n    if p is None or q is None:\n        return False\n    return p.val == q.val and same(p.left, q.left) and same(p.right, q.right)'
},
{
  id:'lc_tree_balanced', title:'Balanced binary tree', topic:'trees', rating:2040, setup:TREE_SETUP,
  prompt:'Write `balanced(root)` returning `True` when every node\'s two subtrees differ in height by at most 1.' + TREE_NOTE,
  mode:'func', fn:'balanced', starter:'def balanced(root):\n    ',
  tests:[{args_py:['tree([3,9,20,None,None,15,7])'],expect:true},
         {args_py:['tree([1,2,2,3,3,None,None,4,4])'],expect:false},
         {args_py:['tree([])'],expect:true}],
  hints:['Compute the height and the balanced-ness in the same recursion.','Return a sentinel height (like -1) to mean "already unbalanced below here".'],
  solution:'def balanced(root):\n    def height(node):\n        if node is None:\n            return 0\n        left = height(node.left)\n        right = height(node.right)\n        if left < 0 or right < 0 or abs(left - right) > 1:\n            return -1\n        return 1 + max(left, right)\n\n    return height(root) >= 0'
},
{
  id:'lc_tree_diameter', title:'Diameter of a binary tree', topic:'trees', rating:2150, setup:TREE_SETUP,
  prompt:'Write `diameter(root)` returning the number of **edges** on the longest path between any two nodes. The path need not pass through the root.' + TREE_NOTE,
  mode:'func', fn:'diameter', starter:'def diameter(root):\n    ',
  tests:[{args_py:['tree([1,2,3,4,5])'],expect:3},{args_py:['tree([1,2])'],expect:1},
         {args_py:['tree([])'],expect:0},{args_py:['tree([1])'],expect:0}],
  hints:['At each node the best path through it is `height(left) + height(right)`.','Track the best seen while computing heights — one pass.'],
  solution:'def diameter(root):\n    best = 0\n\n    def height(node):\n        nonlocal best\n        if node is None:\n            return 0\n        left = height(node.left)\n        right = height(node.right)\n        best = max(best, left + right)\n        return 1 + max(left, right)\n\n    height(root)\n    return best'
},
{
  id:'lc_tree_path_sum', title:'Path sum', topic:'trees', rating:1830, setup:TREE_SETUP,
  prompt:'Write `has_path(root, target)` returning `True` when some root-to-leaf path\'s values add up to `target`.' + TREE_NOTE,
  mode:'func', fn:'has_path', starter:'def has_path(root, target):\n    ',
  tests:[{args_py:['tree([5,4,8,11,None,13,4,7,2,None,None,None,1])','22'],expect:true},
         {args_py:['tree([1,2,3])','5'],expect:false},
         {args_py:['tree([])','0'],expect:false},
         {args_py:['tree([1])','1'],expect:true}],
  hints:['Subtract the node value and recurse with the smaller target.','A leaf is a node with no children — check for that before deciding.'],
  solution:'def has_path(root, target):\n    if root is None:\n        return False\n    if root.left is None and root.right is None:\n        return root.val == target\n    rest = target - root.val\n    return has_path(root.left, rest) or has_path(root.right, rest)'
},
{
  id:'lc_bst_validate', title:'Validate a binary search tree', topic:'trees', rating:2230, setup:TREE_SETUP,
  prompt:'Write `is_bst(root)` returning `True` when every value in the left subtree is strictly smaller than its node, and every value on the right strictly larger — throughout the whole tree.' + TREE_NOTE,
  mode:'func', fn:'is_bst', starter:'def is_bst(root):\n    ',
  tests:[{args_py:['tree([2,1,3])'],expect:true},{args_py:['tree([5,1,4,None,None,3,6])'],expect:false},
         {args_py:['tree([])'],expect:true},{args_py:['tree([1,1])'],expect:false}],
  hints:['Checking only the immediate children is not enough — a deep node can still break the rule.','Pass a low and high bound down the recursion and narrow them.'],
  solution:'def is_bst(root):\n    def check(node, low, high):\n        if node is None:\n            return True\n        if not (low < node.val < high):\n            return False\n        return check(node.left, low, node.val) and check(node.right, node.val, high)\n\n    return check(root, float("-inf"), float("inf"))'
},
{
  id:'lc_bst_kth', title:'Kth smallest in a BST', topic:'trees', rating:2010, setup:TREE_SETUP,
  prompt:'Write `kth_smallest(root, k)` returning the `k`th smallest value (1-indexed) in a binary search tree.' + TREE_NOTE,
  mode:'func', fn:'kth_smallest', starter:'def kth_smallest(root, k):\n    ',
  tests:[{args_py:['tree([3,1,4,None,2])','1'],expect:1},
         {args_py:['tree([5,3,6,2,4,None,None,1])','3'],expect:3},
         {args_py:['tree([1])','1'],expect:1}],
  hints:['An inorder walk of a BST visits the values in order.','Stop as soon as you have seen `k` of them.'],
  solution:'def kth_smallest(root, k):\n    stack = []\n    node = root\n    while stack or node:\n        while node:\n            stack.append(node)\n            node = node.left\n        node = stack.pop()\n        k -= 1\n        if k == 0:\n            return node.val\n        node = node.right\n    return None'
},
{
  id:'lc_bst_lca', title:'Lowest common ancestor in a BST', topic:'trees', rating:1870, setup:TREE_SETUP,
  prompt:'Write `lca(root, p, q)` returning the **value** of the deepest node that has both values `p` and `q` somewhere beneath it (a node counts as its own descendant). The tree is a BST.' + TREE_NOTE,
  mode:'func', fn:'lca', starter:'def lca(root, p, q):\n    ',
  tests:[{args_py:['tree([6,2,8,0,4,7,9,None,None,3,5])','2','8'],expect:6},
         {args_py:['tree([6,2,8,0,4,7,9,None,None,3,5])','2','4'],expect:2},
         {args_py:['tree([2,1])','1','2'],expect:2}],
  hints:['If both values are smaller than the node, go left; if both bigger, go right.','The first node that splits them is the answer.'],
  solution:'def lca(root, p, q):\n    node = root\n    while node:\n        if p < node.val and q < node.val:\n            node = node.left\n        elif p > node.val and q > node.val:\n            node = node.right\n        else:\n            return node.val\n    return None'
},
{
  id:'lc_tree_right_side', title:'Right side view', topic:'trees', rating:1990, setup:TREE_SETUP,
  prompt:'Write `right_view(root)` returning the values you would see looking at the tree from the right — the last node on each level, top to bottom.' + TREE_NOTE +
    '\n\n```\ntree([1,2,3,None,5,None,4])  ->  [1,3,4]\n```',
  mode:'func', fn:'right_view', starter:'from collections import deque\n\n\ndef right_view(root):\n    ',
  tests:[{args_py:['tree([1,2,3,None,5,None,4])'],expect:[1,3,4]},{args_py:['tree([])'],expect:[]},
         {args_py:['tree([1,2])'],expect:[1,2]}],
  hints:['Level-order, keeping only the last value of each level.'],
  solution:'from collections import deque\n\n\ndef right_view(root):\n    if root is None:\n        return []\n    out = []\n    q = deque([root])\n    while q:\n        size = len(q)\n        for i in range(size):\n            node = q.popleft()\n            if i == size - 1:\n                out.append(node.val)\n            if node.left:\n                q.append(node.left)\n            if node.right:\n                q.append(node.right)\n    return out'
},
{
  id:'lc_tree_good_nodes', title:'Count good nodes', topic:'trees', rating:2000, setup:TREE_SETUP,
  prompt:'A node is **good** when no node on the path from the root to it holds a larger value. Write `good_nodes(root)` counting them (the root always counts).' + TREE_NOTE +
    '\n\n```\ntree([3,1,4,3,None,1,5])  ->  4\n```',
  mode:'func', fn:'good_nodes', starter:'def good_nodes(root):\n    ',
  tests:[{args_py:['tree([3,1,4,3,None,1,5])'],expect:4},{args_py:['tree([3,3,None,4,2])'],expect:3},
         {args_py:['tree([])'],expect:0},{args_py:['tree([1])'],expect:1}],
  hints:['Carry the largest value seen on the way down.','Compare, count, then pass the new maximum to both children.'],
  solution:'def good_nodes(root):\n    def walk(node, best):\n        if node is None:\n            return 0\n        found = 1 if node.val >= best else 0\n        best = max(best, node.val)\n        return found + walk(node.left, best) + walk(node.right, best)\n\n    return walk(root, float("-inf"))'
},
{
  id:'lc_tree_build', title:'Build a tree from preorder and inorder', topic:'trees', rating:2470, setup:TREE_SETUP,
  prompt:'Write `build(preorder, inorder)` reconstructing the binary tree from its preorder and inorder traversals (all values distinct), returning the root.' + TREE_NOTE +
    '\n\n```\nbuild([3,9,20,15,7], [9,3,15,20,7])  ->  [3,9,20,None,None,15,7]\n```',
  mode:'func', fn:'build', wrap:'_dump(_r)', starter:'def build(preorder, inorder):\n    ',
  tests:[{args:[[3,9,20,15,7],[9,3,15,20,7]],expect:[3,9,20,null,null,15,7]},
         {args:[[-1],[-1]],expect:[-1]},{args:[[],[]],expect:[]}],
  hints:['The first preorder value is the root; find it in the inorder list.','Everything left of it in inorder is the left subtree — its size tells you how to split preorder.'],
  solution:'def build(preorder, inorder):\n    if not preorder:\n        return None\n    root_val = preorder[0]\n    cut = inorder.index(root_val)\n    root = TreeNode(root_val)\n    root.left = build(preorder[1:cut + 1], inorder[:cut])\n    root.right = build(preorder[cut + 1:], inorder[cut + 1:])\n    return root'
},
{
  id:'lc_tree_serialize', title:'Serialize and deserialize a tree', topic:'trees', rating:2520, setup:TREE_SETUP,
  prompt:'Write `serialize(root)` turning a binary tree into a string, and `deserialize(s)` rebuilding the identical tree.' + TREE_NOTE +
    '\n\nThe grader calls `round_trip(values)`, which must build the tree from `values`, serialize it, deserialize it, and return the rebuilt tree.',
  mode:'func', fn:'round_trip', wrap:'_dump(_r)', starter:'def serialize(root):\n    ',
  tests:[{args:[[1,2,3,null,null,4,5]],expect:[1,2,3,null,null,4,5]},
         {args:[[]],expect:[]},{args:[[1]],expect:[1]},
         {args:[[5,3,8,1]],expect:[5,3,8,1]}],
  hints:['Preorder with an explicit marker for empty children makes both directions easy.','Deserialize by consuming the tokens in the same order, with an index or an iterator.'],
  solution:'def serialize(root):\n    parts = []\n\n    def walk(node):\n        if node is None:\n            parts.append("#")\n            return\n        parts.append(str(node.val))\n        walk(node.left)\n        walk(node.right)\n\n    walk(root)\n    return ",".join(parts)\n\n\ndef deserialize(s):\n    tokens = iter(s.split(","))\n\n    def build():\n        tok = next(tokens)\n        if tok == "#":\n            return None\n        node = TreeNode(int(tok))\n        node.left = build()\n        node.right = build()\n        return node\n\n    return build()\n\n\ndef round_trip(values):\n    return deserialize(serialize(tree(values)))'
},
{
  id:'lc_tree_max_path', title:'Binary tree maximum path sum', topic:'trees', rating:2580, setup:TREE_SETUP,
  prompt:'Write `max_path(root)` returning the largest sum along any path between two nodes (the path need not touch the root, and values may be negative). Return `0` for an empty tree.' + TREE_NOTE,
  mode:'func', fn:'max_path', starter:'def max_path(root):\n    ',
  tests:[{args_py:['tree([1,2,3])'],expect:6},{args_py:['tree([-10,9,20,None,None,15,7])'],expect:42},
         {args_py:['tree([-3])'],expect:-3},{args_py:['tree([])'],expect:0}],
  hints:['For each node, the best path *through* it is `node + max(0, left) + max(0, right)`.','What you return upwards can only use one side.'],
  solution:'def max_path(root):\n    if root is None:\n        return 0\n    best = float("-inf")\n\n    def gain(node):\n        nonlocal best\n        if node is None:\n            return 0\n        left = max(gain(node.left), 0)\n        right = max(gain(node.right), 0)\n        best = max(best, node.val + left + right)\n        return node.val + max(left, right)\n\n    gain(root)\n    return best'
},
{
  id:'lc_trie', title:'Implement a trie', topic:'design', rating:2300,
  prompt:'Build a prefix tree with `insert(word)`, `search(word)` (exact word) and `starts_with(prefix)`.\n\nThen write `run(ops)` applying each operation and returning the results of every `search` and `starts_with`.\n\n```\nrun([["insert","apple"],["search","apple"],["search","app"],["starts_with","app"]])\n  ->  [True, False, True]\n```',
  mode:'func', fn:'run', starter:'class Trie:\n    def __init__(self):\n        ',
  tests:[{args:[[['insert','apple'],['search','apple'],['search','app'],['starts_with','app']]],expect:[true,false,true]},
         {args:[[['search','x']]],expect:[false]},
         {args:[[['insert','a'],['insert','ab'],['search','ab'],['starts_with','b']]],expect:[true,false]}],
  hints:['A node is just a dict from character to child node, plus an end-of-word flag.','`search` and `starts_with` differ only in whether they check that flag.'],
  solution:'class Trie:\n    def __init__(self):\n        self.children = {}\n        self.is_word = False\n\n    def insert(self, word):\n        node = self\n        for c in word:\n            node = node.children.setdefault(c, Trie())\n        node.is_word = True\n\n    def _find(self, prefix):\n        node = self\n        for c in prefix:\n            if c not in node.children:\n                return None\n            node = node.children[c]\n        return node\n\n    def search(self, word):\n        node = self._find(word)\n        return node is not None and node.is_word\n\n    def starts_with(self, prefix):\n        return self._find(prefix) is not None\n\n\ndef run(ops):\n    trie = Trie()\n    out = []\n    for op in ops:\n        if op[0] == "insert":\n            trie.insert(op[1])\n        else:\n            out.append(getattr(trie, op[0])(op[1]))\n    return out'
},
{
  id:'lc_word_dictionary', title:'Word dictionary with wildcards', topic:'design', rating:2440,
  prompt:'Build a dictionary with `add(word)` and `search(pattern)`, where `.` in the pattern matches any single character.\n\nThen write `run(ops)` applying each operation and returning every `search` result.\n\n```\nrun([["add","bad"],["add","dad"],["search",".ad"],["search","b.."],["search","b"]])\n  ->  [True, True, False]\n```',
  mode:'func', fn:'run', starter:'class WordDictionary:\n    def __init__(self):\n        ',
  tests:[{args:[[['add','bad'],['add','dad'],['search','.ad'],['search','b..'],['search','b']]],expect:[true,true,false]},
         {args:[[['search','.']]],expect:[false]},
         {args:[[['add','a'],['search','.'],['search','a']]],expect:[true,true]}],
  hints:['A trie again — but a `.` means trying every child.','Recurse from a node and a position in the pattern.'],
  solution:'class WordDictionary:\n    def __init__(self):\n        self.children = {}\n        self.is_word = False\n\n    def add(self, word):\n        node = self\n        for c in word:\n            node = node.children.setdefault(c, WordDictionary())\n        node.is_word = True\n\n    def search(self, pattern):\n        def go(node, i):\n            if i == len(pattern):\n                return node.is_word\n            c = pattern[i]\n            if c == ".":\n                return any(go(child, i + 1) for child in node.children.values())\n            child = node.children.get(c)\n            return child is not None and go(child, i + 1)\n\n        return go(self, 0)\n\n\ndef run(ops):\n    wd = WordDictionary()\n    out = []\n    for op in ops:\n        if op[0] == "add":\n            wd.add(op[1])\n        else:\n            out.append(wd.search(op[1]))\n    return out'
},

/* ================= graphs ================= */
{
  id:'lc_num_islands', title:'Number of islands', topic:'graphs', rating:2000,
  prompt:'`grid` holds `"1"` for land and `"0"` for water. Write `islands(grid)` counting the connected groups of land (up/down/left/right only).\n\n```\nislands([["1","1","0"],["0","1","0"],["0","0","1"]])  ->  2\n```',
  mode:'func', fn:'islands', starter:'def islands(grid):\n    ',
  tests:[{args:[[['1','1','0'],['0','1','0'],['0','0','1']]],expect:2},
         {args:[[['0']]],expect:0},{args:[[]],expect:0},
         {args:[[['1','0','1'],['0','0','0'],['1','0','1']]],expect:4}],
  hints:['Scan for unvisited land, then flood-fill everything reachable.','An explicit stack avoids recursion limits on big grids.'],
  solution:'def islands(grid):\n    if not grid:\n        return 0\n    rows, cols = len(grid), len(grid[0])\n    seen = set()\n    count = 0\n    for r in range(rows):\n        for c in range(cols):\n            if grid[r][c] != "1" or (r, c) in seen:\n                continue\n            count += 1\n            stack = [(r, c)]\n            seen.add((r, c))\n            while stack:\n                y, x = stack.pop()\n                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n                    ny, nx = y + dy, x + dx\n                    if 0 <= ny < rows and 0 <= nx < cols and grid[ny][nx] == "1" and (ny, nx) not in seen:\n                        seen.add((ny, nx))\n                        stack.append((ny, nx))\n    return count'
},
{
  id:'lc_max_area_island', title:'Max area of an island', topic:'graphs', rating:2060,
  prompt:'`grid` holds 1 for land and 0 for water. Write `max_area(grid)` returning the size of the largest connected land group, or `0`.',
  mode:'func', fn:'max_area', starter:'def max_area(grid):\n    ',
  tests:[{args:[[[1,1,0],[0,1,0],[0,0,1]]],expect:3},{args:[[[0,0],[0,0]]],expect:0},
         {args:[[]],expect:0},{args:[[[1]]],expect:1}],
  hints:['Same flood fill as counting islands, but count the cells you visit.','Return the size from the fill and keep the best.'],
  solution:'def max_area(grid):\n    if not grid:\n        return 0\n    rows, cols = len(grid), len(grid[0])\n    seen = set()\n    best = 0\n    for r in range(rows):\n        for c in range(cols):\n            if grid[r][c] != 1 or (r, c) in seen:\n                continue\n            size = 0\n            stack = [(r, c)]\n            seen.add((r, c))\n            while stack:\n                y, x = stack.pop()\n                size += 1\n                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n                    ny, nx = y + dy, x + dx\n                    if 0 <= ny < rows and 0 <= nx < cols and grid[ny][nx] == 1 and (ny, nx) not in seen:\n                        seen.add((ny, nx))\n                        stack.append((ny, nx))\n            best = max(best, size)\n    return best'
},
{
  id:'lc_rotting_oranges', title:'Rotting oranges', topic:'graphs', rating:2190,
  prompt:'In `grid`, `0` is empty, `1` a fresh orange, `2` a rotten one. Every minute, rot spreads to the four neighbours. Write `minutes(grid)` returning how long until nothing fresh is left, or `-1` if that never happens.\n\n```\nminutes([[2,1,1],[1,1,0],[0,1,1]])  ->  4\n```',
  mode:'func', fn:'minutes', starter:'from collections import deque\n\n\ndef minutes(grid):\n    ',
  tests:[{args:[[[2,1,1],[1,1,0],[0,1,1]]],expect:4},{args:[[[2,1,1],[0,1,1],[1,0,1]]],expect:-1},
         {args:[[[0,2]]],expect:0},{args:[[]],expect:0}],
  hints:['Breadth-first from every rotten orange at once — that gives the minute count directly.','Count the fresh oranges first so you can tell whether any survive.'],
  solution:'from collections import deque\n\n\ndef minutes(grid):\n    if not grid:\n        return 0\n    rows, cols = len(grid), len(grid[0])\n    q = deque()\n    fresh = 0\n    for r in range(rows):\n        for c in range(cols):\n            if grid[r][c] == 2:\n                q.append((r, c))\n            elif grid[r][c] == 1:\n                fresh += 1\n    elapsed = 0\n    while q and fresh:\n        for _ in range(len(q)):\n            y, x = q.popleft()\n            for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n                ny, nx = y + dy, x + dx\n                if 0 <= ny < rows and 0 <= nx < cols and grid[ny][nx] == 1:\n                    grid[ny][nx] = 2\n                    fresh -= 1\n                    q.append((ny, nx))\n        elapsed += 1\n    return -1 if fresh else elapsed'
},
{
  id:'lc_clone_graph', title:'Clone a graph', topic:'graphs', rating:2210,
  prompt:'A graph is given as an adjacency list: `graph[i]` lists the neighbours of node `i`. Write `clone(graph)` returning a **deep copy** as a new adjacency list — the same shape, but no shared list objects with the input.\n\nThe grader checks both the shape and that nothing is shared.',
  mode:'func', fn:'check', starter:'def clone(graph):\n    ',
  setup:`
def check_clone(clone_fn, graph):
    copy = clone_fn(graph)
    if copy != graph:
        return "wrong shape"
    for a, b in zip(copy, graph):
        if a is b:
            return "shares a list with the input"
    return "ok"
`,
  tests:[{args:[[[1,2],[0],[0]]],expect:'ok'},{args:[[]],expect:'ok'},{args:[[[]]],expect:'ok'}],
  hints:['Build a new list for every neighbour list.','`check` just needs to call your `clone` — the helper does the comparing.'],
  solution:'def clone(graph):\n    return [list(neighbours) for neighbours in graph]\n\n\ndef check(graph):\n    return check_clone(clone, graph)'
},
{
  id:'lc_course_schedule', title:'Course schedule', topic:'graphs', rating:2180,
  prompt:'Courses are `0..n-1`; each `[a, b]` means `b` must come before `a`. Write `can_finish(n, prereqs)` returning `True` when every course can be taken.\n\n```\ncan_finish(2, [[1,0]])        ->  True\ncan_finish(2, [[1,0],[0,1]])  ->  False\n```',
  mode:'func', fn:'can_finish', starter:'def can_finish(n, prereqs):\n    ',
  tests:[{args:[2,[[1,0]]],expect:true},{args:[2,[[1,0],[0,1]]],expect:false},
         {args:[3,[]],expect:true},{args:[3,[[0,1],[1,2],[2,0]]],expect:false}],
  hints:['This is asking whether the graph has a cycle.','Kahn\'s algorithm: strip off nodes with no remaining prerequisites and count them.'],
  solution:'from collections import deque\n\n\ndef can_finish(n, prereqs):\n    indegree = [0] * n\n    adj = [[] for _ in range(n)]\n    for a, b in prereqs:\n        adj[b].append(a)\n        indegree[a] += 1\n    q = deque(i for i in range(n) if indegree[i] == 0)\n    done = 0\n    while q:\n        node = q.popleft()\n        done += 1\n        for nxt in adj[node]:\n            indegree[nxt] -= 1\n            if indegree[nxt] == 0:\n                q.append(nxt)\n    return done == n'
},
{
  id:'lc_course_order', title:'Course schedule II', topic:'graphs', rating:2290,
  prompt:'As before, but write `order(n, prereqs)` returning a valid order to take the courses, choosing the **smallest** available course number whenever there is a choice, or `[]` when it is impossible.',
  mode:'func', fn:'order', starter:'import heapq\n\n\ndef order(n, prereqs):\n    ',
  tests:[{args:[2,[[1,0]]],expect:[0,1]},{args:[4,[[1,0],[2,0],[3,1],[3,2]]],expect:[0,1,2,3]},
         {args:[2,[[1,0],[0,1]]],expect:[]},{args:[3,[]],expect:[0,1,2]}],
  hints:['Kahn\'s algorithm again, but keep the ready set in a min-heap.','If the output is shorter than `n`, there was a cycle.'],
  solution:'import heapq\n\n\ndef order(n, prereqs):\n    indegree = [0] * n\n    adj = [[] for _ in range(n)]\n    for a, b in prereqs:\n        adj[b].append(a)\n        indegree[a] += 1\n    ready = [i for i in range(n) if indegree[i] == 0]\n    heapq.heapify(ready)\n    out = []\n    while ready:\n        node = heapq.heappop(ready)\n        out.append(node)\n        for nxt in adj[node]:\n            indegree[nxt] -= 1\n            if indegree[nxt] == 0:\n                heapq.heappush(ready, nxt)\n    return out if len(out) == n else []'
},
{
  id:'lc_pacific_atlantic', title:'Pacific Atlantic water flow', topic:'graphs', rating:2430,
  prompt:'Water flows from a cell to a neighbour of equal or lower height. The Pacific touches the top and left edges, the Atlantic the bottom and right. Write `both(heights)` returning every `[row, col]` that drains to both oceans, sorted.',
  mode:'func', fn:'both', starter:'def both(heights):\n    ',
  tests:[{args:[[[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]],
          expect:[[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]},
         {args:[[[1]]],expect:[[0,0]]},{args:[[]],expect:[]}],
  hints:['Search *backwards*: start at each ocean edge and climb to cells of equal or greater height.','Two reachable sets; the answer is their intersection.'],
  solution:'def both(heights):\n    if not heights:\n        return []\n    rows, cols = len(heights), len(heights[0])\n\n    def climb(starts):\n        seen = set(starts)\n        stack = list(starts)\n        while stack:\n            y, x = stack.pop()\n            for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n                ny, nx = y + dy, x + dx\n                if (0 <= ny < rows and 0 <= nx < cols and (ny, nx) not in seen\n                        and heights[ny][nx] >= heights[y][x]):\n                    seen.add((ny, nx))\n                    stack.append((ny, nx))\n        return seen\n\n    pacific = climb([(0, c) for c in range(cols)] + [(r, 0) for r in range(rows)])\n    atlantic = climb([(rows - 1, c) for c in range(cols)] + [(r, cols - 1) for r in range(rows)])\n    return sorted([r, c] for r, c in pacific & atlantic)'
},
{
  id:'lc_word_ladder', title:'Word ladder', topic:'graphs', rating:2460,
  prompt:'Write `ladder(begin, end, words)` returning the number of words in the shortest chain from `begin` to `end`, changing one letter at a time, with every intermediate word in `words`. Return `0` when there is no chain; the chain length counts both ends.\n\n```\nladder("hit", "cog", ["hot","dot","dog","lot","log","cog"])  ->  5\n```',
  mode:'func', fn:'ladder', starter:'from collections import deque\n\n\ndef ladder(begin, end, words):\n    ',
  tests:[{args:['hit','cog',['hot','dot','dog','lot','log','cog']],expect:5},
         {args:['hit','cog',['hot','dot','dog','lot','log']],expect:0},
         {args:['a','c',['b','c']],expect:2},{args:['ab','ab',['ab']],expect:1}],
  hints:['Breadth-first search over words — the first time you reach `end` is the shortest chain.','Try every letter at every position; check membership in a set.'],
  solution:'from collections import deque\n\n\ndef ladder(begin, end, words):\n    pool = set(words)\n    if end not in pool and end != begin:\n        return 0\n    q = deque([(begin, 1)])\n    seen = {begin}\n    letters = "abcdefghijklmnopqrstuvwxyz"\n    while q:\n        word, steps = q.popleft()\n        if word == end:\n            return steps\n        for i in range(len(word)):\n            for ch in letters:\n                nxt = word[:i] + ch + word[i + 1:]\n                if nxt in pool and nxt not in seen:\n                    seen.add(nxt)\n                    q.append((nxt, steps + 1))\n    return 0'
},
{
  id:'lc_network_delay', title:'Network delay time', topic:'graphs', rating:2400,
  prompt:'`times` holds `[from, to, delay]` edges over nodes `1..n`. Write `delay(times, n, start)` returning how long until every node has received a signal sent from `start`, or `-1` when some node never does.\n\n```\ndelay([[2,1,1],[2,3,1],[3,4,1]], 4, 2)  ->  2\n```',
  mode:'func', fn:'delay', starter:'import heapq\n\n\ndef delay(times, n, start):\n    ',
  tests:[{args:[[[2,1,1],[2,3,1],[3,4,1]],4,2],expect:2},{args:[[[1,2,1]],2,1],expect:1},
         {args:[[[1,2,1]],2,2],expect:-1},{args:[[],1,1],expect:0}],
  hints:['Dijkstra with a min-heap of `(distance, node)`.','The answer is the largest of the shortest distances.'],
  solution:'import heapq\n\n\ndef delay(times, n, start):\n    adj = {}\n    for a, b, w in times:\n        adj.setdefault(a, []).append((b, w))\n    best = {}\n    heap = [(0, start)]\n    while heap:\n        dist, node = heapq.heappop(heap)\n        if node in best:\n            continue\n        best[node] = dist\n        for nxt, w in adj.get(node, []):\n            if nxt not in best:\n                heapq.heappush(heap, (dist + w, nxt))\n    return max(best.values()) if len(best) == n else -1'
},

/* ================= backtracking ================= */
{
  id:'lc_subsets', title:'Subsets', topic:'backtracking', rating:2010,
  prompt:'Write `subsets(nums)` returning every subset of a list of distinct values. Sort each subset ascending, then sort the whole list of subsets.\n\n```\nsubsets([1,2])  ->  [[],[1],[1,2],[2]]\n```',
  mode:'func', fn:'subsets', starter:'def subsets(nums):\n    ',
  tests:[{args:[[1,2]],expect:[[],[1],[1,2],[2]]},{args:[[]],expect:[[]]},
         {args:[[1,2,3]],expect:[[],[1],[1,2],[1,2,3],[1,3],[2],[2,3],[3]]}],
  hints:['At each value, either take it or skip it.','Sort the input first, then sort the finished list of subsets.'],
  solution:'def subsets(nums):\n    nums = sorted(nums)\n    out = []\n\n    def go(i, chosen):\n        if i == len(nums):\n            out.append(list(chosen))\n            return\n        go(i + 1, chosen)\n        chosen.append(nums[i])\n        go(i + 1, chosen)\n        chosen.pop()\n\n    go(0, [])\n    return sorted(out)'
},
{
  id:'lc_permutations', title:'Permutations', topic:'backtracking', rating:2080,
  prompt:'Write `permutations(nums)` returning every ordering of a list of distinct values, sorted.\n\n```\npermutations([1,2])  ->  [[1,2],[2,1]]\n```',
  mode:'func', fn:'permutations', starter:'def permutations(nums):\n    ',
  tests:[{args:[[1,2]],expect:[[1,2],[2,1]]},{args:[[]],expect:[[]]},
         {args:[[1,2,3]],expect:[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]}],
  hints:['Pick each unused value in turn, recurse, then put it back.','Track which indices you have already used.'],
  solution:'def permutations(nums):\n    out = []\n    used = [False] * len(nums)\n\n    def go(current):\n        if len(current) == len(nums):\n            out.append(list(current))\n            return\n        for i, n in enumerate(nums):\n            if used[i]:\n                continue\n            used[i] = True\n            current.append(n)\n            go(current)\n            current.pop()\n            used[i] = False\n\n    go([])\n    return sorted(out)'
},
{
  id:'lc_combination_sum', title:'Combination sum', topic:'backtracking', rating:2200,
  prompt:'Write `combinations(candidates, target)` returning every combination of the (distinct) candidates that sums to `target`. Values may be reused. Each combination is sorted ascending, and the list of them is sorted too.\n\n```\ncombinations([2,3,6,7], 7)  ->  [[2,2,3],[7]]\n```',
  mode:'func', fn:'combinations', starter:'def combinations(candidates, target):\n    ',
  tests:[{args:[[2,3,6,7],7],expect:[[2,2,3],[7]]},{args:[[2],1],expect:[]},
         {args:[[2,3,5],8],expect:[[2,2,2,2],[2,3,3],[3,5]]},{args:[[],0],expect:[[]]}],
  hints:['Recurse with the remaining target, never going back to an earlier candidate.','Stop when the remainder hits 0 (record it) or goes below (abandon it).'],
  solution:'def combinations(candidates, target):\n    values = sorted(candidates)\n    out = []\n\n    def go(i, remaining, chosen):\n        if remaining == 0:\n            out.append(list(chosen))\n            return\n        if remaining < 0 or i == len(values):\n            return\n        chosen.append(values[i])\n        go(i, remaining - values[i], chosen)\n        chosen.pop()\n        go(i + 1, remaining, chosen)\n\n    go(0, target, [])\n    return sorted(out)'
},
{
  id:'lc_word_search', title:'Word search in a grid', topic:'backtracking', rating:2380,
  prompt:'Write `exists(board, word)` returning `True` when `word` can be spelled by walking neighbouring cells (up/down/left/right), never using a cell twice.\n\n```\nexists([["A","B"],["C","D"]], "ABD")  ->  True\n```',
  mode:'func', fn:'exists', starter:'def exists(board, word):\n    ',
  tests:[{args:[[['A','B'],['C','D']],'ABD'],expect:true},
         {args:[[['A','B'],['C','D']],'ABC'],expect:false},
         {args:[[['A','B','C','E'],['S','F','C','S'],['A','D','E','E']],'ABCCED'],expect:true},
         {args:[[],'A'],expect:false}],
  hints:['Depth-first from every cell that matches the first letter.','Mark a cell as used before recursing, and restore it afterwards.'],
  solution:'def exists(board, word):\n    if not word:\n        return True\n    if not board:\n        return False\n    rows, cols = len(board), len(board[0])\n\n    def go(r, c, i):\n        if i == len(word):\n            return True\n        if not (0 <= r < rows and 0 <= c < cols) or board[r][c] != word[i]:\n            return False\n        saved = board[r][c]\n        board[r][c] = "#"\n        found = (go(r + 1, c, i + 1) or go(r - 1, c, i + 1)\n                 or go(r, c + 1, i + 1) or go(r, c - 1, i + 1))\n        board[r][c] = saved\n        return found\n\n    return any(go(r, c, 0) for r in range(rows) for c in range(cols))'
},
{
  id:'lc_letter_combinations', title:'Phone letter combinations', topic:'backtracking', rating:2050,
  prompt:'On a phone keypad, 2 is `abc`, 3 `def`, 4 `ghi`, 5 `jkl`, 6 `mno`, 7 `pqrs`, 8 `tuv`, 9 `wxyz`. Write `combinations(digits)` returning every string the digits could spell, sorted. An empty input gives `[]`.\n\n```\ncombinations("23")  ->  ["ad","ae","af","bd","be","bf","cd","ce","cf"]\n```',
  mode:'func', fn:'combinations', starter:'def combinations(digits):\n    ',
  tests:[{args:['23'],expect:['ad','ae','af','bd','be','bf','cd','ce','cf']},
         {args:[''],expect:[]},{args:['2'],expect:['a','b','c']}],
  hints:['Build the strings one digit at a time.','`itertools.product(*letter_lists)` also does it.'],
  solution:'def combinations(digits):\n    if not digits:\n        return []\n    pad = {"2": "abc", "3": "def", "4": "ghi", "5": "jkl",\n           "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz"}\n    out = [""]\n    for d in digits:\n        out = [prefix + c for prefix in out for c in pad[d]]\n    return sorted(out)'
},
{
  id:'lc_n_queens', title:'N-Queens count', topic:'backtracking', rating:2490,
  prompt:'Write `queens(n)` counting the ways to place `n` queens on an `n × n` board with none attacking another. `queens(8)` must finish quickly.',
  mode:'func', fn:'queens', starter:'def queens(n):\n    ',
  tests:[{args:[1],expect:1},{args:[4],expect:2},{args:[6],expect:4},{args:[8],expect:92},{args:[0],expect:1}],
  hints:['One queen per row; track the used columns and both diagonals in sets.','The diagonals are identified by `row + col` and `row - col`.'],
  solution:'def queens(n):\n    cols, diag, anti = set(), set(), set()\n\n    def place(row):\n        if row == n:\n            return 1\n        total = 0\n        for c in range(n):\n            if c in cols or (row - c) in diag or (row + c) in anti:\n                continue\n            cols.add(c)\n            diag.add(row - c)\n            anti.add(row + c)\n            total += place(row + 1)\n            cols.remove(c)\n            diag.remove(row - c)\n            anti.remove(row + c)\n        return total\n\n    return place(0)'
},
{
  id:'lc_palindrome_partition', title:'Palindrome partitioning', topic:'backtracking', rating:2350,
  prompt:'Write `partitions(s)` returning every way to cut `s` into pieces that are all palindromes, sorted.\n\n```\npartitions("aab")  ->  [["a","a","b"],["aa","b"]]\n```',
  mode:'func', fn:'partitions', starter:'def partitions(s):\n    ',
  tests:[{args:['aab'],expect:[['a','a','b'],['aa','b']]},{args:[''],expect:[[]]},
         {args:['a'],expect:[['a']]}],
  hints:['Try every prefix; if it is a palindrome, recurse on the rest.','`piece == piece[::-1]` is the test.'],
  solution:'def partitions(s):\n    out = []\n\n    def go(start, chosen):\n        if start == len(s):\n            out.append(list(chosen))\n            return\n        for end in range(start + 1, len(s) + 1):\n            piece = s[start:end]\n            if piece == piece[::-1]:\n                chosen.append(piece)\n                go(end, chosen)\n                chosen.pop()\n\n    go(0, [])\n    return sorted(out)'
},

/* ================= dynamic programming ================= */
{
  id:'lc_climb_stairs', title:'Climbing stairs', topic:'dp', rating:1560,
  prompt:'You climb 1 or 2 steps at a time. Write `ways(n)` returning how many distinct ways there are to reach step `n`. `ways(0)` is `1`.',
  mode:'func', fn:'ways', starter:'def ways(n):\n    ',
  tests:[{args:[2],expect:2},{args:[3],expect:3},{args:[0],expect:1},{args:[45],expect:1836311903}],
  hints:['To reach step `n` you came from `n - 1` or `n - 2`.','That is Fibonacci — two variables, no recursion needed.'],
  solution:'def ways(n):\n    a, b = 1, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return a'
},
{
  id:'lc_house_robber', title:'House robber', topic:'dp', rating:1880,
  prompt:'You cannot rob two neighbouring houses. Write `best(houses)` returning the most you can take.\n\n```\nbest([2,7,9,3,1])  ->  12\n```',
  mode:'func', fn:'best', starter:'def best(houses):\n    ',
  tests:[{args:[[1,2,3,1]],expect:4},{args:[[2,7,9,3,1]],expect:12},{args:[[]],expect:0},{args:[[5]],expect:5}],
  hints:['At each house: skip it, or take it and add the best from two back.','Two rolling variables are enough.'],
  solution:'def best(houses):\n    skip = take = 0\n    for value in houses:\n        skip, take = max(skip, take), skip + value\n    return max(skip, take)'
},
{
  id:'lc_house_robber_circle', title:'House robber II', topic:'dp', rating:2110,
  prompt:'The houses now stand in a circle, so the first and last are neighbours too. Write `best(houses)` returning the most you can take.\n\n```\nbest([2,3,2])  ->  3\n```',
  mode:'func', fn:'best', starter:'def best(houses):\n    ',
  tests:[{args:[[2,3,2]],expect:3},{args:[[1,2,3,1]],expect:4},{args:[[]],expect:0},{args:[[7]],expect:7}],
  hints:['Either the first house is out, or the last one is.','Run the straight-line version twice and take the better answer.'],
  solution:'def best(houses):\n    def line(values):\n        skip = take = 0\n        for v in values:\n            skip, take = max(skip, take), skip + v\n        return max(skip, take)\n\n    if len(houses) <= 1:\n        return sum(houses)\n    return max(line(houses[1:]), line(houses[:-1]))'
},
{
  id:'lc_coin_change', title:'Coin change', topic:'dp', rating:2150,
  prompt:'Write `fewest(coins, amount)` returning the smallest number of coins adding up to `amount`, or `-1` when it is impossible. Coins may be reused.\n\n```\nfewest([1,5,10], 12)  ->  3\n```',
  mode:'func', fn:'fewest', starter:'def fewest(coins, amount):\n    ',
  tests:[{args:[[1,5,10],12],expect:3},{args:[[2],3],expect:-1},{args:[[1],0],expect:0},
         {args:[[1,3,4],6],expect:2}],
  hints:['Bottom-up over every amount from 0 upwards.','`dp[a] = min(dp[a - c] + 1 for each usable coin c)`'],
  solution:'def fewest(coins, amount):\n    INF = float("inf")\n    dp = [0] + [INF] * amount\n    for a in range(1, amount + 1):\n        for c in coins:\n            if c <= a and dp[a - c] + 1 < dp[a]:\n                dp[a] = dp[a - c] + 1\n    return -1 if dp[amount] == INF else dp[amount]'
},
{
  id:'lc_coin_change_2', title:'Coin change II', topic:'dp', rating:2340,
  prompt:'Write `count_ways(coins, amount)` returning how many distinct **combinations** of coins add up to `amount`. Order does not matter, so `1+2` and `2+1` count once.\n\n```\ncount_ways([1,2,5], 5)  ->  4\n```',
  mode:'func', fn:'count_ways', starter:'def count_ways(coins, amount):\n    ',
  tests:[{args:[[1,2,5],5],expect:4},{args:[[2],3],expect:0},{args:[[10],0],expect:1},
         {args:[[1,2],4],expect:3}],
  hints:['Loop over coins **outside** and amounts inside — that is what stops orderings being double counted.','`dp[a] += dp[a - coin]`'],
  solution:'def count_ways(coins, amount):\n    dp = [0] * (amount + 1)\n    dp[0] = 1\n    for coin in coins:\n        for a in range(coin, amount + 1):\n            dp[a] += dp[a - coin]\n    return dp[amount]'
},
{
  id:'lc_lis', title:'Longest increasing subsequence', topic:'dp', rating:2320,
  prompt:'Write `length(nums)` returning the length of the longest strictly increasing subsequence (values need not be adjacent).\n\n```\nlength([10,9,2,5,3,7,101,18])  ->  4\n```',
  mode:'func', fn:'length', starter:'def length(nums):\n    ',
  tests:[{args:[[10,9,2,5,3,7,101,18]],expect:4},{args:[[0,1,0,3,2,3]],expect:4},
         {args:[[7,7,7]],expect:1},{args:[[]],expect:0}],
  hints:['O(n²): `dp[i]` is the best ending at `i`.','O(n log n): keep the smallest possible tail for each length and binary-search it.'],
  solution:'import bisect\n\n\ndef length(nums):\n    tails = []\n    for n in nums:\n        i = bisect.bisect_left(tails, n)\n        if i == len(tails):\n            tails.append(n)\n        else:\n            tails[i] = n\n    return len(tails)'
},
{
  id:'lc_word_break', title:'Word break', topic:'dp', rating:2270,
  prompt:'Write `can_break(s, words)` returning `True` when `s` can be cut into a sequence of words from the list (each may be reused).\n\n```\ncan_break("leetcode", ["leet","code"])  ->  True\n```',
  mode:'func', fn:'can_break', starter:'def can_break(s, words):\n    ',
  tests:[{args:['leetcode',['leet','code']],expect:true},
         {args:['catsandog',['cats','dog','sand','and','cat']],expect:false},
         {args:['',['a']],expect:true},{args:['aaa',['a']],expect:true}],
  hints:['`dp[i]` = can the first `i` characters be broken up?','`dp[i]` is true when some `dp[j]` is true and `s[j:i]` is a word.'],
  solution:'def can_break(s, words):\n    pool = set(words)\n    dp = [False] * (len(s) + 1)\n    dp[0] = True\n    for i in range(1, len(s) + 1):\n        for j in range(i):\n            if dp[j] and s[j:i] in pool:\n                dp[i] = True\n                break\n    return dp[len(s)]'
},
{
  id:'lc_decode_ways', title:'Decode ways', topic:'dp', rating:2380,
  prompt:'`"A"` is `"1"` … `"Z"` is `"26"`. Write `decodings(s)` counting how many ways a digit string can be decoded. A leading zero in a group makes it invalid.\n\n```\ndecodings("226")  ->  3\n```',
  mode:'func', fn:'decodings', starter:'def decodings(s):\n    ',
  tests:[{args:['12'],expect:2},{args:['226'],expect:3},{args:['06'],expect:0},
         {args:[''],expect:0},{args:['10'],expect:1}],
  hints:['Each position can take one digit (1–9) or two (10–26).','Two rolling variables, like Fibonacci with validity checks.'],
  solution:'def decodings(s):\n    if not s:\n        return 0\n    prev2, prev1 = 1, 1 if s[0] != "0" else 0\n    for i in range(1, len(s)):\n        current = 0\n        if s[i] != "0":\n            current += prev1\n        if 10 <= int(s[i - 1:i + 1]) <= 26:\n            current += prev2\n        prev2, prev1 = prev1, current\n    return prev1'
},
{
  id:'lc_unique_paths', title:'Unique paths', topic:'dp', rating:1920,
  prompt:'Write `paths(rows, cols)` counting the routes from the top-left to the bottom-right of a grid, moving only right or down.\n\n```\npaths(3, 7)  ->  28\n```',
  mode:'func', fn:'paths', starter:'def paths(rows, cols):\n    ',
  tests:[{args:[3,7],expect:28},{args:[3,2],expect:3},{args:[1,1],expect:1},{args:[0,5],expect:0}],
  hints:['`dp[r][c] = dp[r-1][c] + dp[r][c-1]`, with the first row and column all 1.','A single row of numbers is enough if you update it in place.'],
  solution:'def paths(rows, cols):\n    if rows <= 0 or cols <= 0:\n        return 0\n    row = [1] * cols\n    for _ in range(rows - 1):\n        for c in range(1, cols):\n            row[c] += row[c - 1]\n    return row[-1]'
},
{
  id:'lc_min_path_sum', title:'Minimum path sum', topic:'dp', rating:2000,
  prompt:'Write `min_path(grid)` returning the smallest total along a route from the top-left to the bottom-right, moving only right or down. Return `0` for an empty grid.\n\n```\nmin_path([[1,3,1],[1,5,1],[4,2,1]])  ->  7\n```',
  mode:'func', fn:'min_path', starter:'def min_path(grid):\n    ',
  tests:[{args:[[[1,3,1],[1,5,1],[4,2,1]]],expect:7},{args:[[[1,2,3],[4,5,6]]],expect:12},
         {args:[[]],expect:0},{args:[[[5]]],expect:5}],
  hints:['Each cell costs itself plus the cheaper of the cell above and the cell to the left.','The first row and column only have one way in.'],
  solution:'def min_path(grid):\n    if not grid or not grid[0]:\n        return 0\n    rows, cols = len(grid), len(grid[0])\n    dp = [[0] * cols for _ in range(rows)]\n    for r in range(rows):\n        for c in range(cols):\n            if r == 0 and c == 0:\n                dp[r][c] = grid[r][c]\n            elif r == 0:\n                dp[r][c] = dp[r][c - 1] + grid[r][c]\n            elif c == 0:\n                dp[r][c] = dp[r - 1][c] + grid[r][c]\n            else:\n                dp[r][c] = min(dp[r - 1][c], dp[r][c - 1]) + grid[r][c]\n    return dp[-1][-1]'
},
{
  id:'lc_edit_distance', title:'Edit distance', topic:'dp', rating:2440,
  prompt:'Write `distance(a, b)` returning the fewest single-character inserts, deletes or replacements turning `a` into `b`.\n\n```\ndistance("horse", "ros")  ->  3\n```',
  mode:'func', fn:'distance', starter:'def distance(a, b):\n    ',
  tests:[{args:['horse','ros'],expect:3},{args:['intention','execution'],expect:5},
         {args:['','abc'],expect:3},{args:['same','same'],expect:0}],
  hints:['`dp[i][j]` = distance between the first `i` of `a` and the first `j` of `b`.','Matching characters cost nothing; otherwise 1 plus the best of the three neighbours.'],
  solution:'def distance(a, b):\n    prev = list(range(len(b) + 1))\n    for i, ca in enumerate(a, 1):\n        cur = [i]\n        for j, cb in enumerate(b, 1):\n            cost = 0 if ca == cb else 1\n            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost))\n        prev = cur\n    return prev[-1]'
},
{
  id:'lc_lcs', title:'Longest common subsequence', topic:'dp', rating:2280,
  prompt:'Write `lcs(a, b)` returning the length of the longest subsequence appearing in both strings (characters in order, not necessarily adjacent).\n\n```\nlcs("abcde", "ace")  ->  3\n```',
  mode:'func', fn:'lcs', starter:'def lcs(a, b):\n    ',
  tests:[{args:['abcde','ace'],expect:3},{args:['abc','abc'],expect:3},
         {args:['abc','def'],expect:0},{args:['',''],expect:0}],
  hints:['A table over the prefixes of both strings.','Match -> `1 + dp[i-1][j-1]`; otherwise the better of dropping one character.'],
  solution:'def lcs(a, b):\n    prev = [0] * (len(b) + 1)\n    for ca in a:\n        cur = [0]\n        for j, cb in enumerate(b, 1):\n            cur.append(prev[j - 1] + 1 if ca == cb else max(prev[j], cur[j - 1]))\n        prev = cur\n    return prev[-1]'
},
{
  id:'lc_max_product_subarray', title:'Maximum product subarray', topic:'dp', rating:2300,
  prompt:'Write `max_product(nums)` returning the largest product of any contiguous non-empty slice. Return `0` for an empty list.\n\n```\nmax_product([2,3,-2,4])  ->  6\n```',
  mode:'func', fn:'max_product', starter:'def max_product(nums):\n    ',
  tests:[{args:[[2,3,-2,4]],expect:6},{args:[[-2,0,-1]],expect:0},{args:[[]],expect:0},
         {args:[[-2,3,-4]],expect:24}],
  hints:['A negative number turns the smallest product into the largest.','Track the running maximum **and** minimum, and swap them on a negative.'],
  solution:'def max_product(nums):\n    if not nums:\n        return 0\n    best = high = low = nums[0]\n    for n in nums[1:]:\n        if n < 0:\n            high, low = low, high\n        high = max(n, high * n)\n        low = min(n, low * n)\n        best = max(best, high)\n    return best'
},
{
  id:'lc_partition_equal', title:'Partition into equal subsets', topic:'dp', rating:2410,
  prompt:'Write `can_split(nums)` returning `True` when the list can be split into two groups with the same sum.\n\n```\ncan_split([1,5,11,5])  ->  True\n```',
  mode:'func', fn:'can_split', starter:'def can_split(nums):\n    ',
  tests:[{args:[[1,5,11,5]],expect:true},{args:[[1,2,3,5]],expect:false},
         {args:[[]],expect:true},{args:[[2,2]],expect:true}],
  hints:['An odd total can never split evenly.','Then it is a subset-sum question: can you hit `total // 2`?'],
  solution:'def can_split(nums):\n    total = sum(nums)\n    if total % 2:\n        return False\n    target = total // 2\n    reachable = {0}\n    for n in nums:\n        reachable |= {r + n for r in reachable if r + n <= target}\n    return target in reachable'
},
{
  id:'lc_target_sum', title:'Target sum', topic:'dp', rating:2360,
  prompt:'Put a `+` or `-` in front of each number. Write `count_ways(nums, target)` returning how many assignments reach `target`.\n\n```\ncount_ways([1,1,1,1,1], 3)  ->  5\n```',
  mode:'func', fn:'count_ways', starter:'def count_ways(nums, target):\n    ',
  tests:[{args:[[1,1,1,1,1],3],expect:5},{args:[[1],1],expect:1},{args:[[1],2],expect:0},
         {args:[[],0],expect:1}],
  hints:['Track how many ways reach each running total.','A dict from total to count, updated once per number.'],
  solution:'def count_ways(nums, target):\n    totals = {0: 1}\n    for n in nums:\n        nxt = {}\n        for total, ways in totals.items():\n            nxt[total + n] = nxt.get(total + n, 0) + ways\n            nxt[total - n] = nxt.get(total - n, 0) + ways\n        totals = nxt\n    return totals.get(target, 0)'
},
{
  id:'lc_regex_match', title:'Regular expression matching', topic:'dp', rating:2620,
  prompt:'Write `matches(s, p)` implementing `.` (any single character) and `*` (zero or more of the character before it). The whole string must match.\n\n```\nmatches("aab", "c*a*b")  ->  True\n```',
  mode:'func', fn:'matches', starter:'def matches(s, p):\n    ',
  tests:[{args:['aa','a'],expect:false},{args:['aa','a*'],expect:true},
         {args:['ab','.*'],expect:true},{args:['aab','c*a*b'],expect:true},
         {args:['','.*'],expect:true},{args:['mississippi','mis*is*p*.'],expect:false}],
  hints:['`dp[i][j]` = does the first `i` of `s` match the first `j` of `p`?','A `*` either matches nothing (skip two pattern characters) or one more character of `s`.'],
  solution:'def matches(s, p):\n    from functools import lru_cache\n\n    @lru_cache(maxsize=None)\n    def go(i, j):\n        if j == len(p):\n            return i == len(s)\n        first = i < len(s) and p[j] in (s[i], ".")\n        if j + 1 < len(p) and p[j + 1] == "*":\n            return go(i, j + 2) or (first and go(i + 1, j))\n        return first and go(i + 1, j + 1)\n\n    return go(0, 0)'
},
);
})();
