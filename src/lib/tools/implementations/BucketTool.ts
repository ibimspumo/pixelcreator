/**
 * Bucket/Fill Tool Implementation
 *
 * Flood fills a contiguous area with the selected color.
 * Uses stack-based flood fill algorithm for performance.
 */

import { BaseTool } from '../base/BaseTool';
import type { ToolConfigExtended } from '../base/ToolMetadata';
import { commonToolOptions } from '../base/ToolOptions';
import type { ToolContext, MouseEventContext } from '../base/ToolContext';

class BucketTool extends BaseTool {
	public readonly config: ToolConfigExtended = {
		id: 'bucket',
		name: 'Paint Bucket',
		description: 'Fill contiguous area with color',
		iconName: 'PaintBucket',
		category: 'draw',
		shortcut: 'G',
		cursor: 'crosshair',
		supportsDrag: false,
		worksOnLockedLayers: false,
		order: 3,
		version: '1.1.0',
		author: 'inline.px',
		license: 'MIT',
		tags: ['fill', 'paint', 'flood-fill'],
		options: [commonToolOptions.tolerance, commonToolOptions.contiguous]
	};

	onClick(mouseContext: MouseEventContext, toolContext: ToolContext): boolean {
		const { x, y, button } = mouseContext;
		const { canvas, colors, setPixel, getPixel, requestRedraw, state } = toolContext;

		// Get tool options
		const tolerance = state.getToolOption<number>(this.config.id, 'tolerance') ?? 0;
		const contiguous = state.getToolOption<boolean>(this.config.id, 'contiguous') ?? true;

		// Use primary color for left click, secondary for right click
		const fillColorIndex = button === 2 ? colors.secondaryColorIndex : colors.primaryColorIndex;

		// Get the target color at click position
		const targetColorIndex = getPixel(x, y);

		// If the fill color is the same as the target color, no need to fill
		if (targetColorIndex === fillColorIndex) {
			return false;
		}

		// Perform flood fill
		if (contiguous) {
			this.floodFill(x, y, targetColorIndex, fillColorIndex, tolerance, canvas, setPixel, getPixel);
		} else {
			this.globalFill(targetColorIndex, fillColorIndex, tolerance, canvas, setPixel, getPixel);
		}
		requestRedraw();

		return true;
	}

	/**
	 * Flood fill algorithm using stack-based approach (contiguous fill)
	 */
	private floodFill(
		startX: number,
		startY: number,
		targetColor: number,
		fillColor: number,
		tolerance: number,
		canvas: { width: number; height: number },
		setPixel: (x: number, y: number, colorIndex: number) => void,
		getPixel: (x: number, y: number) => number
	): void {
		const { width, height } = canvas;
		const stack: { x: number; y: number }[] = [{ x: startX, y: startY }];
		const visited = new Set<string>();

		while (stack.length > 0) {
			const { x, y } = stack.pop()!;

			// Skip if out of bounds
			if (x < 0 || x >= width || y < 0 || y >= height) continue;

			// Skip if already visited
			const key = `${x},${y}`;
			if (visited.has(key)) continue;
			visited.add(key);

			// Check if this pixel matches the target color (with tolerance)
			const currentColor = getPixel(x, y);
			if (!this.colorMatches(currentColor, targetColor, tolerance)) continue;

			// Fill this pixel
			setPixel(x, y, fillColor);

			// Add neighbors to stack (4-way connectivity)
			stack.push({ x: x + 1, y });
			stack.push({ x: x - 1, y });
			stack.push({ x, y: y + 1 });
			stack.push({ x, y: y - 1 });
		}
	}

	/**
	 * Global fill - fills all matching pixels regardless of connectivity
	 */
	private globalFill(
		targetColor: number,
		fillColor: number,
		tolerance: number,
		canvas: { width: number; height: number },
		setPixel: (x: number, y: number, colorIndex: number) => void,
		getPixel: (x: number, y: number) => number
	): void {
		const { width, height } = canvas;

		// Iterate through all pixels and fill matching ones
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const currentColor = getPixel(x, y);
				if (this.colorMatches(currentColor, targetColor, tolerance)) {
					setPixel(x, y, fillColor);
				}
			}
		}
	}

	/**
	 * Check if two color indices match within tolerance
	 * For indexed colors, tolerance is a simple numeric difference
	 */
	private colorMatches(color1: number, color2: number, tolerance: number): boolean {
		// For now, with indexed colors, we use simple index difference
		// In the future, this could be enhanced to compare actual RGB values
		return Math.abs(color1 - color2) <= tolerance / 10;
	}

	canUse(toolContext: ToolContext): { valid: boolean; reason?: string } {
		const { canvas } = toolContext;
		const activeLayer = canvas.layers.find(l => l.id === canvas.activeLayerId);

		if (!activeLayer) {
			return { valid: false, reason: 'No active layer' };
		}

		if (activeLayer.locked) {
			return { valid: false, reason: 'Layer is locked' };
		}

		return { valid: true };
	}
}

// Export singleton instance
export default new BucketTool();
