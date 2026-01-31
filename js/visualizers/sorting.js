/**
 * Sorting algorithm visualizer
 */

export class SortingVisualizer {
    constructor(engine) {
        this.engine = engine;
        this.array = [];
        this.highlights = {};
        this.size = 30;
    }

    generateArray(size = this.size) {
        this.size = size;
        this.array = [];
        this.highlights = {};

        for (let i = 0; i < size; i++) {
            this.array.push(Math.floor(Math.random() * 95) + 5);
        }

        this.draw();
    }

    draw() {
        this.engine.clear();

        const padding = 40;
        const width = this.engine.canvas.width - padding * 2;
        const height = this.engine.canvas.height - padding * 2;
        const barWidth = width / this.array.length;
        const maxValue = Math.max(...this.array);

        for (let i = 0; i < this.array.length; i++) {
            const barHeight = (this.array[i] / maxValue) * height;
            const x = padding + i * barWidth;
            const y = this.engine.canvas.height - padding - barHeight;

            // Determine color based on state
            let color = this.engine.colors.default;
            if (this.highlights[i] === 'comparing') {
                color = this.engine.colors.comparing;
            } else if (this.highlights[i] === 'swapping') {
                color = this.engine.colors.swapping;
            } else if (this.highlights[i] === 'sorted') {
                color = this.engine.colors.sorted;
            } else if (this.highlights[i] === 'current') {
                color = this.engine.colors.current;
            }

            // Draw bar with gradient
            const gradient = this.engine.ctx.createLinearGradient(x, y, x, y + barHeight);
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, this.adjustBrightness(color, -30));

            this.engine.ctx.fillStyle = gradient;
            this.engine.drawRoundedRect(
                x + 1,
                y,
                barWidth - 2,
                barHeight,
                Math.min(4, barWidth / 4)
            );

            // Draw value on top if bars are wide enough
            if (barWidth > 25) {
                this.engine.drawText(
                    this.array[i].toString(),
                    x + barWidth / 2,
                    y - 10,
                    { fontSize: Math.min(12, barWidth - 4) }
                );
            }
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

    setHighlight(indices, state) {
        for (const i of indices) {
            this.highlights[i] = state;
        }
    }

    clearHighlights() {
        this.highlights = {};
    }

    swap(i, j) {
        [this.array[i], this.array[j]] = [this.array[j], this.array[i]];
        this.engine.incrementSwaps();
    }

    // Bubble Sort
    async bubbleSort() {
        this.engine.resetStats();
        const n = this.array.length;

        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                if (!this.engine.isRunning) return;

                this.setHighlight([j, j + 1], 'comparing');
                this.draw();
                this.engine.incrementComparisons();
                await this.engine.sleep();

                if (this.array[j] > this.array[j + 1]) {
                    this.setHighlight([j, j + 1], 'swapping');
                    this.draw();
                    await this.engine.sleep();

                    this.swap(j, j + 1);
                }

                this.clearHighlights();
            }
            this.setHighlight([n - 1 - i], 'sorted');
        }

        // Mark all as sorted
        for (let i = 0; i < n; i++) {
            this.setHighlight([i], 'sorted');
        }
        this.draw();
    }

    // Insertion Sort
    async insertionSort() {
        this.engine.resetStats();
        const n = this.array.length;

        for (let i = 1; i < n; i++) {
            if (!this.engine.isRunning) return;

            let key = this.array[i];
            let j = i - 1;

            this.setHighlight([i], 'current');
            this.draw();
            await this.engine.sleep();

            while (j >= 0 && this.array[j] > key) {
                if (!this.engine.isRunning) return;

                this.engine.incrementComparisons();
                this.setHighlight([j, j + 1], 'swapping');
                this.draw();
                await this.engine.sleep();

                this.array[j + 1] = this.array[j];
                this.engine.incrementSwaps();
                j--;
            }

            this.array[j + 1] = key;
            this.clearHighlights();

            for (let k = 0; k <= i; k++) {
                this.setHighlight([k], 'sorted');
            }
            this.draw();
        }
    }

    // Merge Sort
    async mergeSort() {
        this.engine.resetStats();
        await this.mergeSortHelper(0, this.array.length - 1);

        // Mark all as sorted
        for (let i = 0; i < this.array.length; i++) {
            this.setHighlight([i], 'sorted');
        }
        this.draw();
    }

    async mergeSortHelper(left, right) {
        if (!this.engine.isRunning) return;
        if (left >= right) return;

        const mid = Math.floor((left + right) / 2);

        await this.mergeSortHelper(left, mid);
        await this.mergeSortHelper(mid + 1, right);
        await this.merge(left, mid, right);
    }

    async merge(left, mid, right) {
        const leftArr = this.array.slice(left, mid + 1);
        const rightArr = this.array.slice(mid + 1, right + 1);

        let i = 0, j = 0, k = left;

        while (i < leftArr.length && j < rightArr.length) {
            if (!this.engine.isRunning) return;

            this.engine.incrementComparisons();
            this.setHighlight([left + i, mid + 1 + j], 'comparing');
            this.draw();
            await this.engine.sleep();

            if (leftArr[i] <= rightArr[j]) {
                this.array[k] = leftArr[i];
                i++;
            } else {
                this.array[k] = rightArr[j];
                j++;
            }

            this.setHighlight([k], 'sorted');
            this.engine.incrementSwaps();
            k++;
            this.draw();
            await this.engine.sleep();
        }

        while (i < leftArr.length) {
            if (!this.engine.isRunning) return;
            this.array[k] = leftArr[i];
            this.setHighlight([k], 'sorted');
            this.draw();
            await this.engine.sleep();
            i++;
            k++;
        }

        while (j < rightArr.length) {
            if (!this.engine.isRunning) return;
            this.array[k] = rightArr[j];
            this.setHighlight([k], 'sorted');
            this.draw();
            await this.engine.sleep();
            j++;
            k++;
        }

        this.clearHighlights();
    }

    // Quick Sort
    async quickSort() {
        this.engine.resetStats();
        await this.quickSortHelper(0, this.array.length - 1);

        // Mark all as sorted
        for (let i = 0; i < this.array.length; i++) {
            this.setHighlight([i], 'sorted');
        }
        this.draw();
    }

    async quickSortHelper(low, high) {
        if (!this.engine.isRunning) return;
        if (low < high) {
            const pivotIndex = await this.partition(low, high);
            await this.quickSortHelper(low, pivotIndex - 1);
            await this.quickSortHelper(pivotIndex + 1, high);
        }
    }

    async partition(low, high) {
        const pivot = this.array[high];
        this.setHighlight([high], 'current');

        let i = low - 1;

        for (let j = low; j < high; j++) {
            if (!this.engine.isRunning) return i + 1;

            this.engine.incrementComparisons();
            this.setHighlight([j], 'comparing');
            this.draw();
            await this.engine.sleep();

            if (this.array[j] < pivot) {
                i++;
                this.setHighlight([i, j], 'swapping');
                this.draw();
                await this.engine.sleep();

                this.swap(i, j);
            }

            this.clearHighlights();
            this.setHighlight([high], 'current');
        }

        this.setHighlight([i + 1, high], 'swapping');
        this.draw();
        await this.engine.sleep();

        this.swap(i + 1, high);
        this.setHighlight([i + 1], 'sorted');
        this.draw();

        return i + 1;
    }
}

export default SortingVisualizer;
