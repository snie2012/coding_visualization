/**
 * Main entry point - Algorithm Visualizer
 */

import { VisualizationEngine } from './engine.js';
import { SortingVisualizer } from './visualizers/sorting.js';
import { PathfindingVisualizer } from './visualizers/pathfinding.js';
import { TreeVisualizer } from './visualizers/tree.js';
import { GraphVisualizer } from './visualizers/graph.js';
import { DPVisualizer } from './visualizers/dp.js';
import { algorithmInfo } from './algorithms/info.js';

class AlgorithmVisualizerApp {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.engine = new VisualizationEngine(this.canvas);

        // Initialize visualizers
        this.sorting = new SortingVisualizer(this.engine);
        this.pathfinding = new PathfindingVisualizer(this.engine);
        this.tree = new TreeVisualizer(this.engine);
        this.graph = new GraphVisualizer(this.engine);
        this.dp = new DPVisualizer(this.engine);

        this.currentAlgo = null;
        this.currentVisualizer = null;
        this.currentCategory = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showWelcome();
    }

    setupEventListeners() {
        // Algorithm selection
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const algo = e.target.dataset.algo;
                this.selectAlgorithm(algo);

                // Update active state
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Control buttons
        document.getElementById('btn-play').addEventListener('click', () => this.play());
        document.getElementById('btn-pause').addEventListener('click', () => this.pause());
        document.getElementById('btn-step').addEventListener('click', () => this.step());
        document.getElementById('btn-reset').addEventListener('click', () => this.reset());
        document.getElementById('btn-generate').addEventListener('click', () => this.generate());

        // Speed control
        const speedSlider = document.getElementById('speed');
        speedSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            document.getElementById('speed-value').textContent = value;
            this.engine.setSpeed(parseInt(value));
        });

        // Size control
        const sizeSlider = document.getElementById('size');
        sizeSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            document.getElementById('size-value').textContent = value;
            if (this.currentCategory === 'sorting') {
                this.sorting.generateArray(parseInt(value));
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.engine.resizeCanvas();
            if (this.currentVisualizer) {
                this.generate();
            }
        });
    }

    showWelcome() {
        this.engine.clear();
        const ctx = this.engine.ctx;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // Draw welcome message
        ctx.fillStyle = '#7c3aed';
        ctx.font = 'bold 32px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Welcome to AlgoViz', centerX, centerY - 40);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '16px "Segoe UI", system-ui, sans-serif';
        ctx.fillText('Select an algorithm from the sidebar to begin', centerX, centerY + 10);

        ctx.fillStyle = '#64748b';
        ctx.font = '14px "Segoe UI", system-ui, sans-serif';
        ctx.fillText('Visualize sorting, pathfinding, trees, graphs, and dynamic programming', centerX, centerY + 40);

        // Draw decorative elements
        this.drawDecorativeElements(centerX, centerY);
    }

    drawDecorativeElements(centerX, centerY) {
        const ctx = this.engine.ctx;

        // Draw some bars
        const barCount = 7;
        const barWidth = 20;
        const maxHeight = 80;
        const startX = centerX - (barCount * barWidth) / 2 - 150;

        for (let i = 0; i < barCount; i++) {
            const height = 30 + Math.random() * (maxHeight - 30);
            const x = startX + i * (barWidth + 5);
            const y = centerY + 100 - height;

            ctx.fillStyle = `rgba(124, 58, 237, ${0.3 + i * 0.1})`;
            ctx.fillRect(x, y, barWidth, height);
        }

        // Draw a mini grid
        const gridStartX = centerX + 100;
        const gridStartY = centerY + 40;
        const cellSize = 15;
        const gridSize = 5;

        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                const x = gridStartX + c * cellSize;
                const y = gridStartY + r * cellSize;
                ctx.fillStyle = Math.random() > 0.7 ? '#1e293b' : 'rgba(124, 58, 237, 0.3)';
                ctx.fillRect(x, y, cellSize - 2, cellSize - 2);
            }
        }
    }

    selectAlgorithm(algo) {
        this.currentAlgo = algo;
        this.engine.stop();

        // Determine category
        if (['bubble', 'merge', 'quick', 'insertion'].includes(algo)) {
            this.currentCategory = 'sorting';
            this.currentVisualizer = this.sorting;
            document.querySelector('.size-control').style.display = 'flex';
        } else if (['bfs', 'dfs', 'astar', 'dijkstra'].includes(algo)) {
            this.currentCategory = 'pathfinding';
            this.currentVisualizer = this.pathfinding;
            document.querySelector('.size-control').style.display = 'none';
        } else if (['bst', 'tree-traversal'].includes(algo)) {
            this.currentCategory = 'tree';
            this.currentVisualizer = this.tree;
            document.querySelector('.size-control').style.display = 'none';
        } else if (['graph-dfs'].includes(algo)) {
            this.currentCategory = 'graph';
            this.currentVisualizer = this.graph;
            document.querySelector('.size-control').style.display = 'none';
        } else if (['fibonacci', 'knapsack'].includes(algo)) {
            this.currentCategory = 'dp';
            this.currentVisualizer = this.dp;
            document.querySelector('.size-control').style.display = 'none';
        }

        // Update info panel
        this.updateInfoPanel(algo);

        // Generate initial state
        this.generate();
    }

    updateInfoPanel(algo) {
        const info = algorithmInfo[algo];
        if (info) {
            document.getElementById('algo-name').textContent = info.name;
            document.getElementById('algo-description').innerHTML =
                `${info.description}<br><br><strong>${info.complexity}</strong>`;
            document.getElementById('pseudocode').textContent = info.pseudocode;
        }
    }

    generate() {
        this.engine.stop();

        switch (this.currentCategory) {
            case 'sorting':
                const size = parseInt(document.getElementById('size').value);
                this.sorting.generateArray(size);
                break;
            case 'pathfinding':
                this.pathfinding.generateGrid();
                break;
            case 'tree':
                this.tree.generateTree(10);
                break;
            case 'graph':
                this.graph.generateGraph(8);
                break;
            case 'dp':
                // DP visualizations generate during play
                this.engine.clear();
                this.engine.drawText(
                    'Click Play to start the visualization',
                    this.canvas.width / 2,
                    this.canvas.height / 2,
                    { fontSize: 16, color: '#64748b' }
                );
                break;
        }

        // Reset stats
        document.getElementById('stat-comparisons').textContent = '0';
        document.getElementById('stat-swaps').textContent = '0';
        document.getElementById('stat-time').textContent = '0ms';
    }

    async play() {
        if (!this.currentAlgo) {
            alert('Please select an algorithm first');
            return;
        }

        this.engine.play();
        document.getElementById('btn-play').disabled = true;
        document.getElementById('btn-pause').disabled = false;

        try {
            switch (this.currentAlgo) {
                // Sorting
                case 'bubble':
                    await this.sorting.bubbleSort();
                    break;
                case 'merge':
                    await this.sorting.mergeSort();
                    break;
                case 'quick':
                    await this.sorting.quickSort();
                    break;
                case 'insertion':
                    await this.sorting.insertionSort();
                    break;

                // Pathfinding
                case 'bfs':
                    await this.pathfinding.bfs();
                    break;
                case 'dfs':
                    await this.pathfinding.dfs();
                    break;
                case 'astar':
                    await this.pathfinding.astar();
                    break;
                case 'dijkstra':
                    await this.pathfinding.dijkstra();
                    break;

                // Trees
                case 'bst':
                    // Demo: insert a random value
                    const value = Math.floor(Math.random() * 99) + 1;
                    await this.tree.insertAnimated(value);
                    break;
                case 'tree-traversal':
                    // Run all traversals
                    await this.tree.inorderTraversal();
                    break;

                // Graph
                case 'graph-dfs':
                    await this.graph.dfs(0);
                    break;

                // Dynamic Programming
                case 'fibonacci':
                    await this.dp.fibonacci(15);
                    break;
                case 'knapsack':
                    await this.dp.knapsack();
                    break;
            }
        } finally {
            this.engine.stop();
            document.getElementById('btn-play').disabled = false;
            document.getElementById('btn-pause').disabled = true;
        }
    }

    pause() {
        if (this.engine.isPaused) {
            this.engine.resume();
            document.getElementById('btn-pause').innerHTML = '<span class="icon">⏸</span> Pause';
        } else {
            this.engine.pause();
            document.getElementById('btn-pause').innerHTML = '<span class="icon">▶</span> Resume';
        }
    }

    step() {
        // For step-by-step, we'd need to refactor algorithms to be generators
        // For now, just play with very slow speed
        this.engine.setSpeed(1);
        document.getElementById('speed').value = 1;
        document.getElementById('speed-value').textContent = '1';
        this.play();
    }

    reset() {
        this.engine.stop();
        if (this.currentCategory === 'pathfinding') {
            this.pathfinding.resetVisualization();
        } else if (this.currentCategory === 'tree') {
            this.tree.resetStates();
            this.tree.draw();
        } else if (this.currentCategory === 'graph') {
            this.graph.resetStates();
            this.graph.draw();
        } else {
            this.generate();
        }

        document.getElementById('btn-play').disabled = false;
        document.getElementById('btn-pause').disabled = true;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AlgorithmVisualizerApp();
});
