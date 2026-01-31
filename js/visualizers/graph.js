/**
 * Graph visualizer for graph algorithms
 */

var AlgoViz = AlgoViz || {};

AlgoViz.GraphNode = class {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.state = 'default'; // default, current, visited, inStack
        this.neighbors = [];
    }
};

AlgoViz.GraphVisualizer = class {
    constructor(engine) {
        this.engine = engine;
        this.nodes = [];
        this.edges = [];
        this.nodeRadius = 25;
        this.traversalOrder = [];
    }

    generateGraph(nodeCount = 8) {
        this.nodes = [];
        this.edges = [];
        this.traversalOrder = [];

        const padding = 80;
        const width = this.engine.canvas.width - padding * 2;
        const height = this.engine.canvas.height - padding * 2;

        // Create nodes in a circular layout
        const centerX = this.engine.canvas.width / 2;
        const centerY = this.engine.canvas.height / 2;
        const radius = Math.min(width, height) / 2.5;

        for (let i = 0; i < nodeCount; i++) {
            const angle = (2 * Math.PI * i) / nodeCount - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            this.nodes.push(new AlgoViz.GraphNode(i, x, y));
        }

        // Create random edges (ensuring connectivity)
        // First, create a spanning tree to ensure connectivity
        for (let i = 1; i < nodeCount; i++) {
            const parent = Math.floor(Math.random() * i);
            this.addEdge(parent, i);
        }

        // Add some extra random edges
        const extraEdges = Math.floor(nodeCount * 0.5);
        for (let i = 0; i < extraEdges; i++) {
            const from = Math.floor(Math.random() * nodeCount);
            const to = Math.floor(Math.random() * nodeCount);
            if (from !== to && !this.hasEdge(from, to)) {
                this.addEdge(from, to);
            }
        }

        this.draw();
    }

    addEdge(from, to) {
        if (!this.hasEdge(from, to)) {
            this.edges.push({ from, to });
            this.nodes[from].neighbors.push(to);
            this.nodes[to].neighbors.push(from);
        }
    }

    hasEdge(from, to) {
        return this.edges.some(e =>
            (e.from === from && e.to === to) ||
            (e.from === to && e.to === from)
        );
    }

    resetStates() {
        for (const node of this.nodes) {
            node.state = 'default';
        }
        this.traversalOrder = [];
    }

    draw() {
        this.engine.clear();

        // Draw edges
        for (const edge of this.edges) {
            const fromNode = this.nodes[edge.from];
            const toNode = this.nodes[edge.to];

            let edgeColor = '#475569';
            if (fromNode.state === 'visited' && toNode.state === 'visited') {
                edgeColor = this.engine.colors.visited;
            }

            this.engine.drawLine(fromNode.x, fromNode.y, toNode.x, toNode.y, edgeColor, 2);
        }

        // Draw nodes
        for (const node of this.nodes) {
            let color;
            switch (node.state) {
                case 'current':
                    color = this.engine.colors.comparing;
                    break;
                case 'visited':
                    color = this.engine.colors.visited;
                    break;
                case 'inStack':
                    color = this.engine.colors.current;
                    break;
                default:
                    color = this.engine.colors.default;
            }

            // Draw node circle with gradient
            const gradient = this.engine.ctx.createRadialGradient(
                node.x - 5, node.y - 5, 0,
                node.x, node.y, this.nodeRadius
            );
            gradient.addColorStop(0, this.adjustBrightness(color, 20));
            gradient.addColorStop(1, color);

            this.engine.ctx.fillStyle = gradient;
            this.engine.ctx.beginPath();
            this.engine.ctx.arc(node.x, node.y, this.nodeRadius, 0, Math.PI * 2);
            this.engine.ctx.fill();

            // Draw border
            this.engine.ctx.strokeStyle = this.adjustBrightness(color, -20);
            this.engine.ctx.lineWidth = 2;
            this.engine.ctx.stroke();

            // Draw node ID
            this.engine.drawText(node.id.toString(), node.x, node.y, {
                fontSize: 16,
                color: '#ffffff'
            });
        }

        // Draw traversal order
        if (this.traversalOrder.length > 0) {
            this.drawTraversalOrder();
        }
    }

    drawTraversalOrder() {
        const startX = 20;
        const y = this.engine.canvas.height - 30;

        this.engine.drawText('Traversal Order: ', startX, y, {
            fontSize: 12,
            color: '#64748b',
            align: 'left'
        });

        let x = startX + 100;
        for (let i = 0; i < this.traversalOrder.length; i++) {
            this.engine.drawText(
                this.traversalOrder[i].toString() + (i < this.traversalOrder.length - 1 ? ' → ' : ''),
                x, y,
                { fontSize: 12, color: this.engine.colors.accent, align: 'left' }
            );
            x += 35;
        }
    }

    adjustBrightness(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, Math.min(255, (num >> 16) + amt));
        const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt));
        const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
        return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
    }

    // Depth-First Search
    async dfs(startNode = 0) {
        this.engine.resetStats();
        this.resetStates();

        const visited = new Set();
        await this.dfsHelper(startNode, visited);

        this.draw();
    }

    async dfsHelper(nodeId, visited) {
        if (!this.engine.isRunning) return;
        if (visited.has(nodeId)) return;

        visited.add(nodeId);
        this.engine.incrementComparisons();

        const node = this.nodes[nodeId];
        node.state = 'current';
        this.draw();
        await this.engine.sleep();

        this.traversalOrder.push(nodeId);
        node.state = 'visited';
        this.draw();

        for (const neighborId of node.neighbors) {
            if (!visited.has(neighborId)) {
                this.nodes[neighborId].state = 'inStack';
                this.draw();
                await this.engine.sleep();
                await this.dfsHelper(neighborId, visited);
            }
        }
    }

    // Breadth-First Search
    async bfs(startNode = 0) {
        this.engine.resetStats();
        this.resetStates();

        const visited = new Set();
        const queue = [startNode];
        visited.add(startNode);

        while (queue.length > 0 && this.engine.isRunning) {
            const nodeId = queue.shift();
            this.engine.incrementComparisons();

            const node = this.nodes[nodeId];
            node.state = 'current';
            this.draw();
            await this.engine.sleep();

            this.traversalOrder.push(nodeId);
            node.state = 'visited';
            this.draw();

            for (const neighborId of node.neighbors) {
                if (!visited.has(neighborId)) {
                    visited.add(neighborId);
                    queue.push(neighborId);
                    this.nodes[neighborId].state = 'inStack';
                }
            }
            this.draw();
            await this.engine.sleep();
        }
    }
};
