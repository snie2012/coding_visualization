# AlgoViz - Algorithm Visualizer

An interactive web-based tool for visualizing common algorithms and data structures. Built with vanilla JavaScript and HTML5 Canvas for smooth, performant animations.

## Features

### Sorting Algorithms
- **Bubble Sort** - Simple comparison-based sorting
- **Merge Sort** - Efficient divide-and-conquer sorting
- **Quick Sort** - Fast in-place sorting with pivot selection
- **Insertion Sort** - Builds sorted array one item at a time

### Pathfinding Algorithms
- **Breadth-First Search (BFS)** - Explores level by level, guarantees shortest path
- **Depth-First Search (DFS)** - Explores as deep as possible before backtracking
- **A* Search** - Uses heuristics for optimal pathfinding
- **Dijkstra's Algorithm** - Finds shortest paths in weighted graphs

### Tree Data Structures
- **Binary Search Tree** - Visualize BST insertions and searches
- **Tree Traversals** - Inorder, Preorder, Postorder, Level-order

### Graph Algorithms
- **Graph DFS** - Depth-first traversal on general graphs

### Dynamic Programming
- **Fibonacci Sequence** - Visualize memoization with DP table
- **0/1 Knapsack** - Classic DP problem with backtracking

## How to Use

1. Open `index.html` in a modern web browser
2. Select an algorithm from the sidebar
3. Use the controls:
   - **Play** - Start the visualization
   - **Pause** - Pause/Resume the animation
   - **Step** - Run at slowest speed for step-by-step viewing
   - **Reset** - Reset to initial state
   - **Generate New** - Create new random data

4. Adjust visualization settings:
   - **Speed** - Control animation speed (1-100)
   - **Size** - Adjust data size (for sorting algorithms)

5. For pathfinding:
   - Click and drag on the grid to draw/erase walls
   - S marks the start, E marks the end

## Project Structure

```
coding_visualization/
├── index.html              # Main HTML entry point
├── css/
│   └── styles.css          # Modern dark theme styling
├── js/
│   ├── main.js             # Application entry point
│   ├── engine.js           # Core visualization engine
│   ├── algorithms/
│   │   └── info.js         # Algorithm descriptions & pseudocode
│   └── visualizers/
│       ├── sorting.js      # Sorting algorithm visualizations
│       ├── pathfinding.js  # Pathfinding visualizations
│       ├── tree.js         # Tree/BST visualizations
│       ├── graph.js        # Graph algorithm visualizations
│       └── dp.js           # Dynamic programming visualizations
└── README.md
```

## Technical Details

- **No external dependencies** - Pure vanilla JavaScript
- **ES6 Modules** - Clean, modular code organization
- **HTML5 Canvas** - Smooth, hardware-accelerated rendering
- **Responsive design** - Works on various screen sizes
- **Dark theme** - Easy on the eyes for extended use

## Browser Support

Works in all modern browsers that support:
- ES6 Modules
- HTML5 Canvas
- CSS Grid/Flexbox

## Future Enhancements

Ideas for future development:
- More sorting algorithms (Heap Sort, Radix Sort, etc.)
- Graph algorithms (Kruskal's, Prim's MST)
- String algorithms (KMP, Rabin-Karp)
- Step-by-step code highlighting
- Custom input support
- Export animations as GIF/video
