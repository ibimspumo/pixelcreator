/**
 * Performance Monitoring Utilities
 *
 * Tracks and measures tool system performance metrics.
 * Helps identify bottlenecks and optimize user experience.
 */

export interface PerformanceMetric {
	name: string;
	duration: number;
	timestamp: number;
}

export interface PerformanceStats {
	count: number;
	total: number;
	average: number;
	min: number;
	max: number;
	recent: number[]; // Last 10 measurements
}

/**
 * Performance Monitor for tracking tool operations
 */
class PerformanceMonitor {
	private metrics: Map<string, PerformanceMetric[]> = new Map();
	private enabled: boolean = true;
	private maxStoredMetrics: number = 100;

	/**
	 * Enable or disable performance monitoring
	 */
	setEnabled(enabled: boolean): void {
		this.enabled = enabled;
	}

	/**
	 * Check if monitoring is enabled
	 */
	isEnabled(): boolean {
		return this.enabled;
	}

	/**
	 * Measure execution time of a function
	 */
	async measure<T>(name: string, fn: () => T | Promise<T>): Promise<T> {
		if (!this.enabled) {
			return fn();
		}

		const startTime = performance.now();
		try {
			const result = await fn();
			const duration = performance.now() - startTime;
			this.recordMetric(name, duration);
			return result;
		} catch (error) {
			const duration = performance.now() - startTime;
			this.recordMetric(name, duration);
			throw error;
		}
	}

	/**
	 * Measure synchronous function execution
	 */
	measureSync<T>(name: string, fn: () => T): T {
		if (!this.enabled) {
			return fn();
		}

		const startTime = performance.now();
		try {
			const result = fn();
			const duration = performance.now() - startTime;
			this.recordMetric(name, duration);
			return result;
		} catch (error) {
			const duration = performance.now() - startTime;
			this.recordMetric(name, duration);
			throw error;
		}
	}

	/**
	 * Start a manual measurement
	 */
	start(name: string): () => void {
		if (!this.enabled) {
			return () => {};
		}

		const startTime = performance.now();
		return () => {
			const duration = performance.now() - startTime;
			this.recordMetric(name, duration);
		};
	}

	/**
	 * Record a performance metric
	 */
	private recordMetric(name: string, duration: number): void {
		const metrics = this.metrics.get(name) || [];
		metrics.push({
			name,
			duration,
			timestamp: Date.now()
		});

		// Keep only last N metrics
		if (metrics.length > this.maxStoredMetrics) {
			metrics.shift();
		}

		this.metrics.set(name, metrics);

		// Log slow operations (> 50ms)
		if (duration > 50) {
			console.warn(`[Performance] Slow operation: ${name} took ${duration.toFixed(2)}ms`);
		}
	}

	/**
	 * Get statistics for a specific metric
	 */
	getStats(name: string): PerformanceStats | null {
		const metrics = this.metrics.get(name);
		if (!metrics || metrics.length === 0) {
			return null;
		}

		const durations = metrics.map((m) => m.duration);
		const total = durations.reduce((sum, d) => sum + d, 0);
		const average = total / durations.length;
		const min = Math.min(...durations);
		const max = Math.max(...durations);
		const recent = durations.slice(-10);

		return {
			count: durations.length,
			total,
			average,
			min,
			max,
			recent
		};
	}

	/**
	 * Get all tracked metrics
	 */
	getAllStats(): Map<string, PerformanceStats> {
		const stats = new Map<string, PerformanceStats>();
		for (const [name] of this.metrics) {
			const stat = this.getStats(name);
			if (stat) {
				stats.set(name, stat);
			}
		}
		return stats;
	}

	/**
	 * Get performance report
	 */
	getReport(): string {
		const stats = this.getAllStats();
		if (stats.size === 0) {
			return 'No performance metrics collected.';
		}

		let report = '📊 Performance Report\n\n';
		report += '| Metric | Count | Avg | Min | Max | Recent Avg |\n';
		report += '|--------|-------|-----|-----|-----|------------|\n';

		for (const [name, stat] of stats) {
			const recentAvg = stat.recent.reduce((sum, d) => sum + d, 0) / stat.recent.length;
			report += `| ${name} | ${stat.count} | ${stat.average.toFixed(2)}ms | ${stat.min.toFixed(2)}ms | ${stat.max.toFixed(2)}ms | ${recentAvg.toFixed(2)}ms |\n`;
		}

		return report;
	}

	/**
	 * Log performance report to console
	 */
	logReport(): void {
		console.log(this.getReport());
	}

	/**
	 * Clear all metrics
	 */
	clear(): void {
		this.metrics.clear();
	}

	/**
	 * Clear metrics for a specific operation
	 */
	clearMetric(name: string): void {
		this.metrics.delete(name);
	}
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Performance decorator for class methods
 */
export function measured(name?: string) {
	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const originalMethod = descriptor.value;
		const metricName = name || `${target.constructor.name}.${propertyKey}`;

		descriptor.value = function (...args: any[]) {
			return performanceMonitor.measureSync(metricName, () => originalMethod.apply(this, args));
		};

		return descriptor;
	};
}

/**
 * Common performance metrics to track
 */
export const PERFORMANCE_METRICS = {
	TOOL_ACTIVATION: 'tool:activation',
	TOOL_MOUSE_DOWN: 'tool:mouseDown',
	TOOL_MOUSE_MOVE: 'tool:mouseMove',
	TOOL_MOUSE_UP: 'tool:mouseUp',
	TOOL_OPTION_CHANGE: 'tool:optionChange',
	STATE_SAVE: 'state:save',
	STATE_LOAD: 'state:load',
	RENDERER_DRAW: 'renderer:draw',
	RENDERER_COMPOSITE: 'renderer:composite'
} as const;
