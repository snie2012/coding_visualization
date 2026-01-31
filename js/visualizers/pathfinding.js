/**
 * Pathfinding algorithm visualizer (BFS, DFS, A*, Dijkstra)
 */

var AlgoViz = AlgoViz || {};

AlgoViz.PathfindingVisualizer = class {
    constructor(engine) {
        this.engine = engine;
        this.grid = [];
        this.rows = 20;
        this.cols = 35;
        this.start = { row: 10, col: 5 };
        this.end = { row: 10, col: 29 };
        this.isDrawingWalls = false;
        this.isErasingWalls = false;

        // Cell states
        this.EMPTY = 0;
        this.WALL = 1;
        this.START = 2;
        this.END = 3;
        this.VISITED = 4;
        this.PATH = 5;
        this.CURRENT = 6;
        this.FRONTIER = 7;

        this.setupMouseEvents();
    }

    setupMouseEvents() {
        this.engine.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.engine.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.engine.canvas.addEventListener('mouseup', () => this.handleMouseUp());
        this.engine.canvas.addEventListener('mouseleave', () => this.handleMouseUp());
    }

    getCellFromMouse(e) {
        const rect = this.engine.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const cellWidth = this.engine.canvas.width / this.cols;
        const cellHeight = this.engine.canvas.height / this.rows;

        const col = Math.floor(x / cellWidth);
        const row = Math.floor(y / cellHeight);

        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            return { row, col };
        }
        return null;
    }

    handleMouseDown(e) {
        const cell = this.getCellFromMouse(e);
        if (!cell) return;

        if (this.grid[cell.row][cell.col] === this.WALL) {
            this.isErasingWalls = true;
            this.grid[cell.row][cell.col] = this.EMPTY;
        } else if (this.grid[cell.row][cell.col] === this.EMPTY) {
            this.isDrawingWalls = true;
            this.grid[cell.row][cell.col] = this.WALL;
        }
        this.draw();
    }

    handleMouseMove(e) {
        if (!this.isDrawingWalls && !this.isErasingWalls) return;

        const cell = this.getCellFromMouse(e);
        if (!cell) return;

        if (cell.row === this.start.row && cell.col === this.start.col) return;
        if (cell.row === this.end.row && cell.col === this.end.col) return;

        if (this.isDrawingWalls && this.grid[cell.row][cell.col] === this.EMPTY) {
            this.grid[cell.row][cell.col] = this.WALL;
            this.draw();
        } else if (this.isErasingWalls && this.grid[cell.row][cell.col] === this.WALL) {
            this.grid[cell.row][cell.col] = this.EMPTY;
            this.draw();
        }
    }

    handleMouseUp() {
        this.isDrawingWalls = false;
        this.isErasingWalls = false;
    }

    generateGrid() {
        this.grid = [];

        for (let row = 0; row < this.rows; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.cols; col++) {
                // Random walls (about 25%)
                if (Math.random() < 0.25) {
                    this.grid[row][col] = this.WALL;
                } else {
                    this.grid[row][col] = this.EMPTY;
                }
            }
        }

        // Clear start and end positions
        this.grid[this.start.row][this.start.col] = this.START;
        this.grid[this.end.row][this.end.col] = this.END;

        // Clear area around start and end
        this.clearAroundPoint(this.start);
        this.clearAroundPoint(this.end);

        this.draw();
    }

    clearAroundPoint(point) {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const r = point.row + dr;
                const c = point.col + dc;
                if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
                    if (this.grid[r][c] === this.WALL) {
                        this.grid[r][c] = this.EMPTY;
                    }
                }
            }
        }
    }

    resetVisualization() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.grid[row][col];
                if (cell === this.VISITED || cell === this.PATH || cell === this.CURRENT || cell === this.FRONTIER) {
                    this.grid[row][col] = this.EMPTY;
                }
            }
        }
        this.grid[this.start.row][this.start.col] = this.START;
        this.grid[this.end.row][this.end.col] = this.END;
        this.draw();
    }

    draw() {
        this.engine.clear();

        const cellWidth = this.engine.canvas.width / this.cols;
        const cellHeight = this.engine.canvas.height / this.rows;

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const x = col * cellWidth;
                const y = row * cellHeight;
                const state = this.grid[row][col];

                let color;
                switch (state) {
                    case this.WALL:
                        color = this.engine.colors.wall;
                        break;
                    case this.START:
                        color = this.engine.colors.start;
                        break;
                    case this.END:
                        color = this.engine.colors.end;
                        break;
                    case this.VISITED:
                        color = this.engine.colors.visited;
                        break;
                    case this.PATH:
                        color = this.engine.colors.path;
                        break;
                    case this.CURRENT:
                        color = this.engine.colors.comparing;
                        break;
                    case this.FRONTIER:
                        color = this.engine.colors.current;
                        break;
                    default:
                        color = '#252540';
                }

                this.engine.ctx.fillStyle = color;
                this.engine.drawRoundedRect(x + 1, y + 1, cellWidth - 2, cellHeight - 2, 3);

                // Draw grid lines
                this.engine.ctx.strokeStyle = '#1a1a2e';
                this.engine.ctx.lineWidth = 1;
                this.engine.ctx.strokeRect(x, y, cellWidth, cellHeight);
            }
        }

        // Draw start/end labels
        const startX = this.start.col * cellWidth + cellWidth / 2;
        const startY = this.start.row * cellHeight + cellHeight / 2;
        this.engine.drawText('S', startX, startY, { fontSize: 14, color: '#fff' });

        const endX = this.end.col * cellWidth + cellWidth / 2;
        const endY = this.end.row * cellHeight + cellHeight / 2;
        this.engine.drawText('E', endX, endY, { fontSize: 14, color: '#fff' });
    }

    getNeighbors(row, col) {
        const neighbors = [];
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // Up, Down, Left, Right

        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;

            if (newRow >= 0 && newRow < this.rows &&
                newCol >= 0 && newCol < this.cols &&
                this.grid[newRow][newCol] !== this.WALL) {
                neighbors.push({ row: newRow, col: newCol });
            }
        }

        return neighbors;
    }

    // Breadth-First Search
    async bfs() {
        this.engine.resetStats();
        this.resetVisualization();

        const queue = [{ ...this.start, path: [this.start] }];
        const visited = new Set();
        visited.add(`${this.start.row},${this.start.col}`);

        while (queue.length > 0 && this.engine.isRunning) {
            const { row, col, path } = queue.shift();

            this.engine.incrementComparisons();

            if (row === this.end.row && col === this.end.col) {
                await this.animatePath(path);
                return;
            }

            this.grid[row][col] = this.CURRENT;
            this.draw();
            await this.engine.sleep();
            this.grid[row][col] = this.VISITED;

            for (const neighbor of this.getNeighbors(row, col)) {
                const key = `${neighbor.row},${neighbor.col}`;
                if (!visited.has(key)) {
                    visited.add(key);
                    queue.push({
                        row: neighbor.row,
                        col: neighbor.col,
                        path: [...path, neighbor]
                    });

                    if (this.grid[neighbor.row][neighbor.col] !== this.END) {
                        this.grid[neighbor.row][neighbor.col] = this.FRONTIER;
                    }
                }
            }

            this.draw();
        }

        // Restore start marker
        this.grid[this.start.row][this.start.col] = this.START;
        this.draw();
    }

    // Depth-First Search
    async dfs() {
        this.engine.resetStats();
        this.resetVisualization();

        const visited = new Set();
        const path = await this.dfsHelper(this.start.row, this.start.col, visited, []);

        if (path) {
            await this.animatePath(path);
        }

        this.grid[this.start.row][this.start.col] = this.START;
        this.draw();
    }

    async dfsHelper(row, col, visited, path) {
        if (!this.engine.isRunning) return null;

        const key = `${row},${col}`;
        if (visited.has(key)) return null;
        if (this.grid[row][col] === this.WALL) return null;

        visited.add(key);
        path.push({ row, col });
        this.engine.incrementComparisons();

        if (row === this.end.row && col === this.end.col) {
            return path;
        }

        this.grid[row][col] = this.CURRENT;
        this.draw();
        await this.engine.sleep();
        this.grid[row][col] = this.VISITED;

        for (const neighbor of this.getNeighbors(row, col)) {
            const result = await this.dfsHelper(neighbor.row, neighbor.col, visited, [...path]);
            if (result) return result;
        }

        return null;
    }

    // A* Search
    async astar() {
        this.engine.resetStats();
        this.resetVisualization();

        const heuristic = (row, col) => {
            return Math.abs(row - this.end.row) + Math.abs(col - this.end.col);
        };

        const openSet = [{ row: this.start.row, col: this.start.col, g: 0, f: heuristic(this.start.row, this.start.col) }];
        const cameFrom = new Map();
        const gScore = new Map();
        gScore.set(`${this.start.row},${this.start.col}`, 0);

        while (openSet.length > 0 && this.engine.isRunning) {
            // Find node with lowest f score
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift();

            this.engine.incrementComparisons();

            if (current.row === this.end.row && current.col === this.end.col) {
                const path = this.reconstructPath(cameFrom, current);
                await this.animatePath(path);
                return;
            }

            this.grid[current.row][current.col] = this.CURRENT;
            this.draw();
            await this.engine.sleep();
            this.grid[current.row][current.col] = this.VISITED;

            for (const neighbor of this.getNeighbors(current.row, current.col)) {
                const neighborKey = `${neighbor.row},${neighbor.col}`;
                const tentativeG = gScore.get(`${current.row},${current.col}`) + 1;

                if (!gScore.has(neighborKey) || tentativeG < gScore.get(neighborKey)) {
                    cameFrom.set(neighborKey, current);
                    gScore.set(neighborKey, tentativeG);
                    const f = tentativeG + heuristic(neighbor.row, neighbor.col);

                    const existingIndex = openSet.findIndex(n => n.row === neighbor.row && n.col === neighbor.col);
                    if (existingIndex === -1) {
                        openSet.push({ row: neighbor.row, col: neighbor.col, g: tentativeG, f });
                        if (this.grid[neighbor.row][neighbor.col] !== this.END) {
                            this.grid[neighbor.row][neighbor.col] = this.FRONTIER;
                        }
                    } else {
                        openSet[existingIndex] = { row: neighbor.row, col: neighbor.col, g: tentativeG, f };
                    }
                }
            }

            this.draw();
        }

        this.grid[this.start.row][this.start.col] = this.START;
        this.draw();
    }

    // Dijkstra's Algorithm
    async dijkstra() {
        this.engine.resetStats();
        this.resetVisualization();

        const distances = new Map();
        const cameFrom = new Map();
        const unvisited = [];

        // Initialize
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const key = `${row},${col}`;
                distances.set(key, Infinity);
            }
        }

        distances.set(`${this.start.row},${this.start.col}`, 0);
        unvisited.push({ row: this.start.row, col: this.start.col, dist: 0 });

        while (unvisited.length > 0 && this.engine.isRunning) {
            unvisited.sort((a, b) => a.dist - b.dist);
            const current = unvisited.shift();
            const currentKey = `${current.row},${current.col}`;

            if (distances.get(currentKey) < current.dist) continue;

            this.engine.incrementComparisons();

            if (current.row === this.end.row && current.col === this.end.col) {
                const path = this.reconstructPath(cameFrom, current);
                await this.animatePath(path);
                return;
            }

            this.grid[current.row][current.col] = this.CURRENT;
            this.draw();
            await this.engine.sleep();
            this.grid[current.row][current.col] = this.VISITED;

            for (const neighbor of this.getNeighbors(current.row, current.col)) {
                const neighborKey = `${neighbor.row},${neighbor.col}`;
                const newDist = distances.get(currentKey) + 1;

                if (newDist < distances.get(neighborKey)) {
                    distances.set(neighborKey, newDist);
                    cameFrom.set(neighborKey, current);
                    unvisited.push({ row: neighbor.row, col: neighbor.col, dist: newDist });

                    if (this.grid[neighbor.row][neighbor.col] !== this.END) {
                        this.grid[neighbor.row][neighbor.col] = this.FRONTIER;
                    }
                }
            }

            this.draw();
        }

        this.grid[this.start.row][this.start.col] = this.START;
        this.draw();
    }

    reconstructPath(cameFrom, current) {
        const path = [{ row: current.row, col: current.col }];
        let currentKey = `${current.row},${current.col}`;

        while (cameFrom.has(currentKey)) {
            const prev = cameFrom.get(currentKey);
            path.unshift({ row: prev.row, col: prev.col });
            currentKey = `${prev.row},${prev.col}`;
        }

        return path;
    }

    async animatePath(path) {
        for (const cell of path) {
            if (!this.engine.isRunning) return;

            if (!(cell.row === this.start.row && cell.col === this.start.col) &&
                !(cell.row === this.end.row && cell.col === this.end.col)) {
                this.grid[cell.row][cell.col] = this.PATH;
                this.engine.incrementSwaps(); // Using swaps to count path length
            }
            this.draw();
            await this.engine.sleep(50);
        }

        // Restore start and end markers
        this.grid[this.start.row][this.start.col] = this.START;
        this.grid[this.end.row][this.end.col] = this.END;
        this.draw();
    }
};
