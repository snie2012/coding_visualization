/**
 * Algorithm information, descriptions, and pseudocode
 */

var AlgoViz = AlgoViz || {};

AlgoViz.algorithmInfo = {
    // Sorting Algorithms
    bubble: {
        name: 'Bubble Sort',
        description: 'A simple comparison-based sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted.',
        complexity: 'Time: O(n²) | Space: O(1)',
        pseudocode: `function bubbleSort(arr):
    n = length(arr)
    for i from 0 to n-1:
        for j from 0 to n-i-1:
            if arr[j] > arr[j+1]:
                swap(arr[j], arr[j+1])
    return arr`
    },

    merge: {
        name: 'Merge Sort',
        description: 'A divide-and-conquer algorithm that divides the input array into two halves, recursively sorts them, and then merges the two sorted halves. It is efficient for large datasets.',
        complexity: 'Time: O(n log n) | Space: O(n)',
        pseudocode: `function mergeSort(arr):
    if length(arr) <= 1:
        return arr

    mid = length(arr) / 2
    left = mergeSort(arr[0..mid])
    right = mergeSort(arr[mid..n])

    return merge(left, right)

function merge(left, right):
    result = []
    while left and right not empty:
        if left[0] <= right[0]:
            result.append(left.pop(0))
        else:
            result.append(right.pop(0))
    return result + left + right`
    },

    quick: {
        name: 'Quick Sort',
        description: 'A divide-and-conquer algorithm that picks an element as pivot and partitions the array around the pivot. Elements smaller than pivot go left, larger go right.',
        complexity: 'Time: O(n log n) avg, O(n²) worst | Space: O(log n)',
        pseudocode: `function quickSort(arr, low, high):
    if low < high:
        pivot = partition(arr, low, high)
        quickSort(arr, low, pivot - 1)
        quickSort(arr, pivot + 1, high)

function partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j from low to high-1:
        if arr[j] < pivot:
            i++
            swap(arr[i], arr[j])
    swap(arr[i+1], arr[high])
    return i + 1`
    },

    insertion: {
        name: 'Insertion Sort',
        description: 'A simple sorting algorithm that builds the final sorted array one item at a time. It is much less efficient on large lists than more advanced algorithms but performs well on small lists.',
        complexity: 'Time: O(n²) | Space: O(1)',
        pseudocode: `function insertionSort(arr):
    for i from 1 to length(arr):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j+1] = arr[j]
            j--
        arr[j+1] = key
    return arr`
    },

    // Pathfinding Algorithms
    bfs: {
        name: 'Breadth-First Search',
        description: 'An algorithm for traversing graphs that explores all vertices at the present depth before moving on to vertices at the next depth level. Guarantees the shortest path in unweighted graphs.',
        complexity: 'Time: O(V + E) | Space: O(V)',
        pseudocode: `function BFS(graph, start, goal):
    queue = [start]
    visited = {start}

    while queue not empty:
        current = queue.dequeue()

        if current == goal:
            return path

        for neighbor in graph[current]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.enqueue(neighbor)

    return null  // no path found`
    },

    dfs: {
        name: 'Depth-First Search',
        description: 'An algorithm for traversing graphs that explores as far as possible along each branch before backtracking. Does not guarantee the shortest path.',
        complexity: 'Time: O(V + E) | Space: O(V)',
        pseudocode: `function DFS(graph, current, goal, visited):
    if current == goal:
        return path

    visited.add(current)

    for neighbor in graph[current]:
        if neighbor not in visited:
            result = DFS(graph, neighbor, goal, visited)
            if result:
                return result

    return null  // no path found`
    },

    astar: {
        name: 'A* Search',
        description: 'A best-first search algorithm that finds the shortest path using heuristics. It combines the actual cost from start (g) with estimated cost to goal (h) to prioritize exploration.',
        complexity: 'Time: O(E) | Space: O(V)',
        pseudocode: `function AStar(graph, start, goal):
    openSet = {start}
    gScore[start] = 0
    fScore[start] = heuristic(start, goal)

    while openSet not empty:
        current = node with lowest fScore

        if current == goal:
            return reconstructPath()

        openSet.remove(current)

        for neighbor in graph[current]:
            tentative_g = gScore[current] + 1
            if tentative_g < gScore[neighbor]:
                gScore[neighbor] = tentative_g
                fScore[neighbor] = g + heuristic(neighbor, goal)
                openSet.add(neighbor)`
    },

    dijkstra: {
        name: "Dijkstra's Algorithm",
        description: "An algorithm for finding the shortest paths between nodes in a graph. Unlike A*, it doesn't use heuristics and explores uniformly in all directions.",
        complexity: 'Time: O((V + E) log V) | Space: O(V)',
        pseudocode: `function Dijkstra(graph, start, goal):
    dist[start] = 0
    queue = [(0, start)]

    while queue not empty:
        (d, current) = queue.extractMin()

        if current == goal:
            return path

        if d > dist[current]:
            continue

        for neighbor in graph[current]:
            newDist = dist[current] + weight(current, neighbor)
            if newDist < dist[neighbor]:
                dist[neighbor] = newDist
                queue.insert((newDist, neighbor))`
    },

    // Tree Algorithms
    bst: {
        name: 'Binary Search Tree',
        description: 'A binary tree data structure where each node has at most two children. For any node, all elements in the left subtree are smaller and all elements in the right subtree are larger.',
        complexity: 'Search/Insert: O(log n) avg, O(n) worst | Space: O(n)',
        pseudocode: `function insert(root, value):
    if root is null:
        return new Node(value)

    if value < root.value:
        root.left = insert(root.left, value)
    else:
        root.right = insert(root.right, value)

    return root

function search(root, value):
    if root is null or root.value == value:
        return root

    if value < root.value:
        return search(root.left, value)
    else:
        return search(root.right, value)`
    },

    'tree-traversal': {
        name: 'Tree Traversals',
        description: 'Methods to visit all nodes in a tree. Inorder (Left-Root-Right) gives sorted order for BST. Preorder (Root-Left-Right) is useful for copying. Postorder (Left-Right-Root) is useful for deletion.',
        complexity: 'Time: O(n) | Space: O(h) where h is height',
        pseudocode: `function inorder(node):
    if node is null: return
    inorder(node.left)
    visit(node)
    inorder(node.right)

function preorder(node):
    if node is null: return
    visit(node)
    preorder(node.left)
    preorder(node.right)

function postorder(node):
    if node is null: return
    postorder(node.left)
    postorder(node.right)
    visit(node)

function levelOrder(root):
    queue = [root]
    while queue not empty:
        node = queue.dequeue()
        visit(node)
        if node.left: queue.enqueue(node.left)
        if node.right: queue.enqueue(node.right)`
    },

    'graph-dfs': {
        name: 'Graph DFS',
        description: 'Depth-First Search on a general graph structure. Explores as deep as possible before backtracking. Useful for detecting cycles, topological sorting, and finding connected components.',
        complexity: 'Time: O(V + E) | Space: O(V)',
        pseudocode: `function graphDFS(graph, start):
    visited = {}
    result = []

    function dfs(node):
        if node in visited:
            return
        visited.add(node)
        result.append(node)

        for neighbor in graph[node]:
            dfs(neighbor)

    dfs(start)
    return result`
    },

    // Dynamic Programming
    fibonacci: {
        name: 'Fibonacci (DP)',
        description: 'Dynamic programming approach to calculate Fibonacci numbers. Uses memoization to avoid recalculating the same subproblems, reducing time complexity from exponential to linear.',
        complexity: 'Time: O(n) | Space: O(n)',
        pseudocode: `function fibonacci(n):
    dp = array of size n+1
    dp[0] = 0
    dp[1] = 1

    for i from 2 to n:
        dp[i] = dp[i-1] + dp[i-2]

    return dp[n]

// Recurrence relation:
// F(n) = F(n-1) + F(n-2)
// F(0) = 0, F(1) = 1`
    },

    knapsack: {
        name: '0/1 Knapsack',
        description: 'A classic dynamic programming problem: given items with weights and values, find the maximum value that can be put in a knapsack of capacity W. Each item can only be taken once.',
        complexity: 'Time: O(nW) | Space: O(nW)',
        pseudocode: `function knapsack(items, W):
    n = length(items)
    dp = 2D array of size (n+1) x (W+1)

    for i from 1 to n:
        for w from 0 to W:
            if items[i-1].weight <= w:
                include = dp[i-1][w - items[i-1].weight]
                         + items[i-1].value
                exclude = dp[i-1][w]
                dp[i][w] = max(include, exclude)
            else:
                dp[i][w] = dp[i-1][w]

    return dp[n][W]`
    }
};
