/**
 * Binary Search Tree and Tree Traversal visualizer
 */

var AlgoViz = AlgoViz || {};

AlgoViz.TreeNode = class {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.x = 0;
        this.y = 0;
        this.state = 'default'; // default, current, visited, found
    }
};

AlgoViz.TreeVisualizer = class {
    constructor(engine) {
        this.engine = engine;
        this.root = null;
        this.nodeRadius = 25;
        this.verticalGap = 70;
        this.traversalOrder = [];
    }

    generateTree(size = 10) {
        this.root = null;
        this.traversalOrder = [];

        // Generate random values
        const values = new Set();
        while (values.size < size) {
            values.add(Math.floor(Math.random() * 99) + 1);
        }

        // Insert values to create BST
        for (const value of values) {
            this.insert(value);
        }

        this.calculatePositions();
        this.draw();
    }

    insert(value) {
        const newNode = new AlgoViz.TreeNode(value);

        if (!this.root) {
            this.root = newNode;
            return;
        }

        let current = this.root;
        while (true) {
            if (value < current.value) {
                if (!current.left) {
                    current.left = newNode;
                    return;
                }
                current = current.left;
            } else {
                if (!current.right) {
                    current.right = newNode;
                    return;
                }
                current = current.right;
            }
        }
    }

    calculatePositions() {
        if (!this.root) return;

        const width = this.engine.canvas.width;
        const startY = 60;

        const assignPositions = (node, x, y, spread) => {
            if (!node) return;

            node.x = x;
            node.y = y;

            assignPositions(node.left, x - spread, y + this.verticalGap, spread / 2);
            assignPositions(node.right, x + spread, y + this.verticalGap, spread / 2);
        };

        assignPositions(this.root, width / 2, startY, width / 4);
    }

    resetStates() {
        const reset = (node) => {
            if (!node) return;
            node.state = 'default';
            reset(node.left);
            reset(node.right);
        };
        reset(this.root);
    }

    draw() {
        this.engine.clear();

        if (!this.root) {
            this.engine.drawText('Generate a tree to begin',
                this.engine.canvas.width / 2,
                this.engine.canvas.height / 2,
                { fontSize: 18, color: '#64748b' }
            );
            return;
        }

        // Draw edges first
        this.drawEdges(this.root);

        // Then draw nodes
        this.drawNodes(this.root);

        // Draw traversal order if available
        if (this.traversalOrder.length > 0) {
            this.drawTraversalOrder();
        }
    }

    drawEdges(node) {
        if (!node) return;

        if (node.left) {
            this.engine.drawLine(node.x, node.y, node.left.x, node.left.y, '#475569', 2);
            this.drawEdges(node.left);
        }

        if (node.right) {
            this.engine.drawLine(node.x, node.y, node.right.x, node.right.y, '#475569', 2);
            this.drawEdges(node.right);
        }
    }

    drawNodes(node) {
        if (!node) return;

        let color;
        switch (node.state) {
            case 'current':
                color = this.engine.colors.comparing;
                break;
            case 'visited':
                color = this.engine.colors.visited;
                break;
            case 'found':
                color = this.engine.colors.success;
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

        // Draw value
        this.engine.drawText(node.value.toString(), node.x, node.y, {
            fontSize: 14,
            color: '#ffffff'
        });

        this.drawNodes(node.left);
        this.drawNodes(node.right);
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
            x += 40;
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

    // BST Search visualization
    async search(value) {
        this.engine.resetStats();
        this.resetStates();
        this.traversalOrder = [];

        let current = this.root;

        while (current && this.engine.isRunning) {
            this.engine.incrementComparisons();
            current.state = 'current';
            this.draw();
            await this.engine.sleep();

            if (value === current.value) {
                current.state = 'found';
                this.draw();
                return current;
            }

            current.state = 'visited';

            if (value < current.value) {
                current = current.left;
            } else {
                current = current.right;
            }
        }

        this.draw();
        return null;
    }

    // BST Insert visualization
    async insertAnimated(value) {
        this.engine.resetStats();
        this.resetStates();

        if (!this.root) {
            this.root = new TreeNode(value);
            this.calculatePositions();
            this.root.state = 'found';
            this.draw();
            return;
        }

        let current = this.root;

        while (this.engine.isRunning) {
            this.engine.incrementComparisons();
            current.state = 'current';
            this.draw();
            await this.engine.sleep();

            if (value < current.value) {
                current.state = 'visited';
                if (!current.left) {
                    current.left = new TreeNode(value);
                    this.engine.incrementSwaps();
                    this.calculatePositions();
                    current.left.state = 'found';
                    this.draw();
                    return;
                }
                current = current.left;
            } else {
                current.state = 'visited';
                if (!current.right) {
                    current.right = new TreeNode(value);
                    this.engine.incrementSwaps();
                    this.calculatePositions();
                    current.right.state = 'found';
                    this.draw();
                    return;
                }
                current = current.right;
            }
        }
    }

    // Inorder Traversal (Left, Root, Right)
    async inorderTraversal() {
        this.engine.resetStats();
        this.resetStates();
        this.traversalOrder = [];

        await this.inorderHelper(this.root);
        this.draw();
    }

    async inorderHelper(node) {
        if (!node || !this.engine.isRunning) return;

        await this.inorderHelper(node.left);

        this.engine.incrementComparisons();
        node.state = 'current';
        this.draw();
        await this.engine.sleep();

        this.traversalOrder.push(node.value);
        node.state = 'visited';
        this.draw();

        await this.inorderHelper(node.right);
    }

    // Preorder Traversal (Root, Left, Right)
    async preorderTraversal() {
        this.engine.resetStats();
        this.resetStates();
        this.traversalOrder = [];

        await this.preorderHelper(this.root);
        this.draw();
    }

    async preorderHelper(node) {
        if (!node || !this.engine.isRunning) return;

        this.engine.incrementComparisons();
        node.state = 'current';
        this.draw();
        await this.engine.sleep();

        this.traversalOrder.push(node.value);
        node.state = 'visited';
        this.draw();

        await this.preorderHelper(node.left);
        await this.preorderHelper(node.right);
    }

    // Postorder Traversal (Left, Right, Root)
    async postorderTraversal() {
        this.engine.resetStats();
        this.resetStates();
        this.traversalOrder = [];

        await this.postorderHelper(this.root);
        this.draw();
    }

    async postorderHelper(node) {
        if (!node || !this.engine.isRunning) return;

        await this.postorderHelper(node.left);
        await this.postorderHelper(node.right);

        this.engine.incrementComparisons();
        node.state = 'current';
        this.draw();
        await this.engine.sleep();

        this.traversalOrder.push(node.value);
        node.state = 'visited';
        this.draw();
    }

    // Level Order Traversal (BFS)
    async levelOrderTraversal() {
        this.engine.resetStats();
        this.resetStates();
        this.traversalOrder = [];

        if (!this.root) return;

        const queue = [this.root];

        while (queue.length > 0 && this.engine.isRunning) {
            const node = queue.shift();

            this.engine.incrementComparisons();
            node.state = 'current';
            this.draw();
            await this.engine.sleep();

            this.traversalOrder.push(node.value);
            node.state = 'visited';
            this.draw();

            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
    }
};
