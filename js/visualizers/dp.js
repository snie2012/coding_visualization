/**
 * Dynamic Programming visualizer (Fibonacci, Knapsack)
 */

var AlgoViz = AlgoViz || {};

AlgoViz.DPVisualizer = class {
    constructor(engine) {
        this.engine = engine;
        this.cells = [];
        this.highlights = {};
    }

    // Fibonacci Visualization
    async fibonacci(n = 15) {
        this.engine.resetStats();
        this.cells = new Array(n + 1).fill(null);
        this.highlights = {};

        // Calculate cell dimensions
        const padding = 40;
        const maxCellsPerRow = Math.min(n + 1, 10);
        const cellWidth = Math.min(80, (this.engine.canvas.width - padding * 2) / maxCellsPerRow);
        const cellHeight = 60;

        this.drawFibonacci(n, cellWidth, cellHeight, padding);

        // Base cases
        this.cells[0] = 0;
        this.cells[1] = 1;
        this.highlights[0] = 'computed';
        this.highlights[1] = 'computed';
        this.drawFibonacci(n, cellWidth, cellHeight, padding);
        await this.engine.sleep();

        // Compute rest
        for (let i = 2; i <= n; i++) {
            if (!this.engine.isRunning) return;

            // Highlight cells being used
            this.highlights[i - 1] = 'using';
            this.highlights[i - 2] = 'using';
            this.highlights[i] = 'computing';
            this.drawFibonacci(n, cellWidth, cellHeight, padding);
            this.engine.incrementComparisons();
            await this.engine.sleep();

            // Compute value
            this.cells[i] = this.cells[i - 1] + this.cells[i - 2];
            this.engine.incrementSwaps();

            // Mark as computed
            this.highlights[i - 1] = 'computed';
            this.highlights[i - 2] = 'computed';
            this.highlights[i] = 'computed';
            this.drawFibonacci(n, cellWidth, cellHeight, padding);
            await this.engine.sleep();
        }

        // Final highlight
        this.highlights[n] = 'result';
        this.drawFibonacci(n, cellWidth, cellHeight, padding);
    }

    drawFibonacci(n, cellWidth, cellHeight, padding) {
        this.engine.clear();

        const maxCellsPerRow = Math.floor((this.engine.canvas.width - padding * 2) / cellWidth);
        const totalRows = Math.ceil((n + 1) / maxCellsPerRow);
        const startY = (this.engine.canvas.height - totalRows * (cellHeight + 10)) / 2;

        // Draw title
        this.engine.drawText('Fibonacci Sequence - Dynamic Programming',
            this.engine.canvas.width / 2, 25,
            { fontSize: 16, color: this.engine.colors.text }
        );

        // Draw formula
        this.engine.drawText('F(n) = F(n-1) + F(n-2)',
            this.engine.canvas.width / 2, 50,
            { fontSize: 12, color: '#64748b' }
        );

        for (let i = 0; i <= n; i++) {
            const row = Math.floor(i / maxCellsPerRow);
            const col = i % maxCellsPerRow;
            const rowCells = Math.min(maxCellsPerRow, n + 1 - row * maxCellsPerRow);
            const rowWidth = rowCells * cellWidth;
            const startX = (this.engine.canvas.width - rowWidth) / 2;

            const x = startX + col * cellWidth;
            const y = startY + row * (cellHeight + 20);

            // Determine color
            let color = '#252540';
            if (this.highlights[i] === 'computing') {
                color = this.engine.colors.comparing;
            } else if (this.highlights[i] === 'using') {
                color = this.engine.colors.current;
            } else if (this.highlights[i] === 'computed') {
                color = this.engine.colors.visited;
            } else if (this.highlights[i] === 'result') {
                color = this.engine.colors.success;
            }

            // Draw cell
            this.engine.ctx.fillStyle = color;
            this.engine.drawRoundedRect(x + 2, y, cellWidth - 4, cellHeight, 8);

            // Draw index
            this.engine.drawText(`F(${i})`, x + cellWidth / 2, y + 15, {
                fontSize: 10,
                color: '#94a3b8'
            });

            // Draw value
            const value = this.cells[i] !== null ? this.cells[i].toString() : '?';
            this.engine.drawText(value, x + cellWidth / 2, y + cellHeight / 2 + 5, {
                fontSize: 16,
                color: this.engine.colors.text
            });
        }
    }

    // Knapsack Problem Visualization
    async knapsack(customItems = null) {
        this.engine.resetStats();

        // Default items if not provided
        const items = customItems || [
            { weight: 2, value: 3 },
            { weight: 3, value: 4 },
            { weight: 4, value: 5 },
            { weight: 5, value: 8 }
        ];
        const capacity = 7;
        const n = items.length;

        // Create DP table
        const dp = Array(n + 1).fill(null).map(() => Array(capacity + 1).fill(0));
        this.drawKnapsack(dp, items, capacity, -1, -1);
        await this.engine.sleep();

        // Fill the DP table
        for (let i = 1; i <= n; i++) {
            for (let w = 0; w <= capacity; w++) {
                if (!this.engine.isRunning) return;

                const item = items[i - 1];
                this.engine.incrementComparisons();

                if (item.weight <= w) {
                    // Can include this item
                    const includeValue = dp[i - 1][w - item.weight] + item.value;
                    const excludeValue = dp[i - 1][w];
                    dp[i][w] = Math.max(includeValue, excludeValue);
                } else {
                    // Cannot include this item
                    dp[i][w] = dp[i - 1][w];
                }

                this.engine.incrementSwaps();
                this.drawKnapsack(dp, items, capacity, i, w);
                await this.engine.sleep();
            }
        }

        // Backtrack to find selected items
        await this.backtrackKnapsack(dp, items, capacity);
    }

    async backtrackKnapsack(dp, items, capacity) {
        const selected = [];
        let w = capacity;

        for (let i = items.length; i > 0 && w > 0; i--) {
            if (!this.engine.isRunning) return;

            if (dp[i][w] !== dp[i - 1][w]) {
                selected.push(i - 1);
                w -= items[i - 1].weight;
            }

            this.drawKnapsack(dp, items, capacity, i, w, selected);
            await this.engine.sleep();
        }

        this.drawKnapsack(dp, items, capacity, -1, -1, selected, true);
    }

    drawKnapsack(dp, items, capacity, currentI, currentW, selected = [], done = false) {
        this.engine.clear();

        const n = items.length;
        const cellWidth = Math.min(50, (this.engine.canvas.width - 200) / (capacity + 2));
        const cellHeight = 35;
        const startX = 100;
        const startY = 100;

        // Draw title
        this.engine.drawText('0/1 Knapsack Problem - Dynamic Programming',
            this.engine.canvas.width / 2, 25,
            { fontSize: 16, color: this.engine.colors.text }
        );

        // Draw items info
        this.engine.drawText('Items:', 30, 60, {
            fontSize: 12, color: '#64748b', align: 'left'
        });

        let itemX = 80;
        for (let i = 0; i < items.length; i++) {
            const isSelected = selected.includes(i);
            const color = isSelected ? this.engine.colors.success : '#64748b';
            this.engine.drawText(
                `Item ${i + 1}: w=${items[i].weight}, v=${items[i].value}`,
                itemX, 60,
                { fontSize: 11, color, align: 'left' }
            );
            itemX += 130;
        }

        // Draw capacity label
        this.engine.drawText('Capacity →', startX - 50, startY + cellHeight / 2 - cellHeight, {
            fontSize: 11, color: '#64748b'
        });

        // Draw column headers (capacity)
        for (let w = 0; w <= capacity; w++) {
            const x = startX + w * cellWidth;
            this.engine.drawText(w.toString(), x + cellWidth / 2, startY - 15, {
                fontSize: 11, color: '#64748b'
            });
        }

        // Draw row labels and cells
        for (let i = 0; i <= n; i++) {
            const y = startY + i * cellHeight;

            // Row label
            if (i === 0) {
                this.engine.drawText('∅', startX - 30, y + cellHeight / 2, {
                    fontSize: 12, color: '#64748b'
                });
            } else {
                this.engine.drawText(`{1..${i}}`, startX - 35, y + cellHeight / 2, {
                    fontSize: 10, color: '#64748b'
                });
            }

            // Cells
            for (let w = 0; w <= capacity; w++) {
                const x = startX + w * cellWidth;

                // Determine color
                let color = '#252540';
                if (i === currentI && w === currentW) {
                    color = this.engine.colors.comparing;
                } else if (done && i === n && w === capacity) {
                    color = this.engine.colors.success;
                } else if (dp[i][w] > 0) {
                    color = this.engine.colors.visited;
                }

                // Draw cell
                this.engine.ctx.fillStyle = color;
                this.engine.drawRoundedRect(x + 1, y + 1, cellWidth - 2, cellHeight - 2, 4);

                // Draw value
                this.engine.drawText(dp[i][w].toString(), x + cellWidth / 2, y + cellHeight / 2, {
                    fontSize: 12,
                    color: this.engine.colors.text
                });
            }
        }

        // Draw result
        if (done) {
            const totalValue = dp[n][capacity];
            const selectedItems = selected.map(i => `Item ${i + 1}`).join(', ');
            this.engine.drawText(
                `Maximum Value: ${totalValue} | Selected: ${selectedItems || 'None'}`,
                this.engine.canvas.width / 2,
                this.engine.canvas.height - 30,
                { fontSize: 14, color: this.engine.colors.success }
            );
        }
    }
};
