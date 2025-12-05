/**
 * Line Tool Implementation
 *
 * Allows drawing straight lines by click-and-drag. Supports configurable line width
 * and optional perfect 45-degree angle constraint.
 */

import { BaseTool } from '../base/BaseTool';
import type { ToolConfigExtended } from '../base/ToolMetadata';
import type { ToolContext, MouseEventContext } from '../base/ToolContext';

class LineTool extends BaseTool {
	/** Starting position of the line */
	private startX: number | null = null;
	private startY: number | null = null;

	/** Preview pixels to clear before drawing new line */
	private previewPixels: Array<{ x: number; y: number; originalColor: number }> = [];

	public readonly config: ToolConfigExtended = {
		id: 'line',
		name: 'Line',
		description: 'Draw straight lines with configurable width',
		iconName: 'Minus',
		category: 'draw',
		shortcut: 'L',
		cursor: 'crosshair',
		supportsDrag: true,
		worksOnLockedLayers: false,
		order: 12,

		// Extended configuration
		version: '1.0.0',
		author: 'inline.px',
		license: 'MIT',
		tags: ['shape', 'line', 'drawing', 'geometry'],

		// Tool options
		options: [
			{
				id: 'lineWidth',
				label: 'Line Width',
				description: 'Width of the line in pixels',
				type: 'slider',
				defaultValue: 1,
				min: 1,
				max: 32,
				step: 1
			},
			{
				id: 'perfectAngles',
				label: 'Perfect Angles',
				description: 'Constrain line to 45-degree angles',
				type: 'boolean',
				defaultValue: false
			}
		],

		// Documentation
		documentation: {
			description: 'Draw perfectly straight lines on the canvas with configurable width.',
			usage: 'Click and drag to define the line. Enable "Perfect Angles" to snap to 45-degree increments.',
			tips: [
				'Adjust line width for thicker lines',
				'Use "Perfect Angles" to draw horizontal, vertical, or diagonal lines',
				'Use left-click for primary color and right-click for secondary color'
			],
			relatedTools: ['rectangle', 'circle', 'pencil']
		}
	};

	onMouseDown(mouseContext: MouseEventContext, toolContext: ToolContext): boolean {
		const { x, y } = mouseContext;

		// Store starting position
		this.startX = x;
		this.startY = y;

		// Clear preview
		this.previewPixels = [];

		return true;
	}

	onMouseMove(mouseContext: MouseEventContext, toolContext: ToolContext): boolean {
		if (this.startX === null || this.startY === null) {
			return false;
		}

		// Clear previous preview
		this.clearPreview(toolContext);

		// Draw new preview
		this.drawLine(mouseContext, toolContext, true);

		return true;
	}

	onMouseUp(mouseContext: MouseEventContext, toolContext: ToolContext): boolean {
		if (this.startX === null || this.startY === null) {
			return false;
		}

		// Clear preview
		this.clearPreview(toolContext);

		// Draw final line
		this.drawLine(mouseContext, toolContext, false);

		// Reset state
		this.startX = null;
		this.startY = null;
		this.previewPixels = [];

		toolContext.requestRedraw();
		return true;
	}

	/**
	 * Draw line from start position to current mouse position
	 */
	private drawLine(
		mouseContext: MouseEventContext,
		toolContext: ToolContext,
		isPreview: boolean
	): void {
		if (this.startX === null || this.startY === null) return;

		let { x, y, button } = mouseContext;
		const { colors, setPixel, getPixel, requestRedraw, canvas, state } = toolContext;

		// Use primary color for left click, secondary for right click
		const colorIndex = button === 2 ? colors.secondaryColorIndex : colors.primaryColorIndex;

		// Get options
		const lineWidth = state.getToolOption<number>(this.config.id, 'lineWidth') ?? 1;
		const perfectAngles = state.getToolOption<boolean>(this.config.id, 'perfectAngles') ?? false;

		// Apply perfect angles constraint
		if (perfectAngles) {
			const dx = x - this.startX;
			const dy = y - this.startY;
			const angle = Math.atan2(dy, dx);

			// Snap to nearest 45-degree angle
			const snappedAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
			const distance = Math.sqrt(dx * dx + dy * dy);

			x = Math.round(this.startX + Math.cos(snappedAngle) * distance);
			y = Math.round(this.startY + Math.sin(snappedAngle) * distance);
		}

		// Draw line using Bresenham's algorithm
		this.drawThickLine(this.startX, this.startY, x, y, lineWidth, colorIndex, toolContext, isPreview);

		requestRedraw();
	}

	/**
	 * Draw a line with specified width using Bresenham's algorithm
	 */
	private drawThickLine(
		x1: number,
		y1: number,
		x2: number,
		y2: number,
		width: number,
		colorIndex: number,
		toolContext: ToolContext,
		isPreview: boolean
	): void {
		const { setPixel, getPixel, canvas } = toolContext;

		// Bresenham's line algorithm
		const dx = Math.abs(x2 - x1);
		const dy = Math.abs(y2 - y1);
		const sx = x1 < x2 ? 1 : -1;
		const sy = y1 < y2 ? 1 : -1;
		let err = dx - dy;

		let x = x1;
		let y = y1;

		while (true) {
			// Draw pixel with width (circular brush)
			const radius = Math.floor(width / 2);
			for (let dy = -radius; dy < width - radius; dy++) {
				for (let dx = -radius; dx < width - radius; dx++) {
					const px = x + dx;
					const py = y + dy;

					if (px >= 0 && px < canvas.width && py >= 0 && py < canvas.height) {
						if (isPreview) {
							// Store original color for preview
							this.previewPixels.push({ x: px, y: py, originalColor: getPixel(px, py) });
						}
						setPixel(px, py, colorIndex);
					}
				}
			}

			if (x === x2 && y === y2) break;

			const e2 = 2 * err;
			if (e2 > -dy) {
				err -= dy;
				x += sx;
			}
			if (e2 < dx) {
				err += dx;
				y += sy;
			}
		}
	}

	/**
	 * Clear preview by restoring original pixels
	 */
	private clearPreview(toolContext: ToolContext): void {
		const { setPixel, requestRedraw } = toolContext;

		for (const pixel of this.previewPixels) {
			setPixel(pixel.x, pixel.y, pixel.originalColor);
		}

		this.previewPixels = [];
		requestRedraw();
	}

	canUse(toolContext: ToolContext): { valid: boolean; reason?: string } {
		const { canvas } = toolContext;
		const activeLayer = canvas.layers.find((l) => l.id === canvas.activeLayerId);

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
export default new LineTool();
