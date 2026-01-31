/**
 * Core visualization engine for algorithm animations
 */

// Global namespace
var AlgoViz = AlgoViz || {};

AlgoViz.VisualizationEngine = class {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isRunning = false;
        this.isPaused = false;
        this.speed = 50;
        this.animationQueue = [];
        this.currentFrame = 0;
        this.stats = {
            comparisons: 0,
            swaps: 0,
            startTime: 0
        };

        // Color scheme
        this.colors = {
            default: '#bf5af2',
            comparing: '#ffd60a',
            swapping: '#ff453a',
            sorted: '#30d158',
            current: '#0a84ff',
            visited: '#5e5ce6',
            path: '#30d158',
            wall: '#3a3a3c',
            start: '#30d158',
            end: '#ff453a',
            background: '#141415',
            text: '#ececf1'
        };

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        const padding = 48;
        this.canvas.width = container.clientWidth - padding;
        this.canvas.height = container.clientHeight - padding;
    }

    clear() {
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    resetStats() {
        this.stats = {
            comparisons: 0,
            swaps: 0,
            startTime: Date.now()
        };
        this.updateStatsDisplay();
    }

    updateStatsDisplay() {
        document.getElementById('stat-comparisons').textContent = this.stats.comparisons;
        document.getElementById('stat-swaps').textContent = this.stats.swaps;
        const elapsed = Date.now() - this.stats.startTime;
        document.getElementById('stat-time').textContent = `${elapsed}ms`;
    }

    incrementComparisons() {
        this.stats.comparisons++;
        this.updateStatsDisplay();
    }

    incrementSwaps() {
        this.stats.swaps++;
        this.updateStatsDisplay();
    }

    setSpeed(speed) {
        this.speed = speed;
    }

    getDelay() {
        // Convert speed (1-100) to delay (500ms - 5ms)
        return Math.max(5, 505 - this.speed * 5);
    }

    async sleep(ms = null) {
        const delay = ms !== null ? ms : this.getDelay();
        return new Promise(resolve => {
            const check = () => {
                if (this.isPaused) {
                    requestAnimationFrame(check);
                } else {
                    setTimeout(resolve, delay);
                }
            };
            check();
        });
    }

    play() {
        this.isRunning = true;
        this.isPaused = false;
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    stop() {
        this.isRunning = false;
        this.isPaused = false;
    }

    // Drawing utilities
    drawRoundedRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawText(text, x, y, options = {}) {
        const {
            fontSize = 12,
            color = this.colors.text,
            align = 'center',
            baseline = 'middle'
        } = options;

        this.ctx.fillStyle = color;
        this.ctx.font = `${fontSize}px 'Segoe UI', system-ui, sans-serif`;
        this.ctx.textAlign = align;
        this.ctx.textBaseline = baseline;
        this.ctx.fillText(text, x, y);
    }

    drawCircle(x, y, radius, color) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
    }

    drawLine(x1, y1, x2, y2, color, width = 2) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;
        this.ctx.stroke();
    }

    drawArrow(fromX, fromY, toX, toY, color, width = 2) {
        const headLength = 10;
        const angle = Math.atan2(toY - fromY, toX - fromX);

        this.ctx.beginPath();
        this.ctx.moveTo(fromX, fromY);
        this.ctx.lineTo(toX, toY);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;
        this.ctx.stroke();

        // Draw arrowhead
        this.ctx.beginPath();
        this.ctx.moveTo(toX, toY);
        this.ctx.lineTo(
            toX - headLength * Math.cos(angle - Math.PI / 6),
            toY - headLength * Math.sin(angle - Math.PI / 6)
        );
        this.ctx.lineTo(
            toX - headLength * Math.cos(angle + Math.PI / 6),
            toY - headLength * Math.sin(angle + Math.PI / 6)
        );
        this.ctx.closePath();
        this.ctx.fillStyle = color;
        this.ctx.fill();
    }

    // Gradient helpers
    createGradient(x1, y1, x2, y2, color1, color2) {
        const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        return gradient;
    }

    // Animation helpers
    lerp(start, end, t) {
        return start + (end - start) * t;
    }

    easeInOut(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
};
