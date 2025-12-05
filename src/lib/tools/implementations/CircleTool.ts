/**
 * Circle Tool Implementation
 *
 * Allows drawing circles and ellipses by click-and-drag. Supports filled and outline modes,
 * with optional perfect circle constraint.
 */

import { BaseTool } from '../base/BaseTool';
import type { ToolConfigExtended } from '../base/ToolMetadata';
import { commonToolOptions } from '../base/ToolOptions';
import type { ToolContext, MouseEventContext } from '../base/ToolContext';

class CircleTool extends BaseTool {
	/** Starting position of the circle */
	private startX: number | null = null;
	private startY: number | null = null;

	/** Preview pixels to clear before drawing new circle */
	private previewPixels: Array<{ x: number; y: number; originalColor: number }> = [];

	public readonly config: ToolConfigExtended = {
		id: 'circle',
		name: 'Circle',
		description: 'Draw circles and ellipses with fill or outline mode',
		iconName: 'Circle',
		category: 'draw',
		shortcut: 'C',
		cursor: 'crosshair',
		supportsDrag: true,
		worksOnLockedLayers: false,
		order: 11,

		// Extended configuration
		version: '1.0.0',
		author: 'inline.px',
		license: 'MIT',
		tags: ['shape', 'circle', 'ellipse', 'drawing', 'geometry'],

		// Tool options
		options: [
			{
				id: 'filled',
				label: 'Filled',
				description: 'Fill the circle with color',
				type: 'boolean',
				defaultValue: true
			},
			{
				id: 'lineWidth',
				label: 'Line Width',
				description: 'Width of the outline in pixels',
				type: 'slider',
				defaultValue: 1,
				min: 1,
				max: 16,
				step: 1
			},
			commonToolOptions.perfectPixels
		],

		// Documentation
		documentation: {
			description: 'Draw circular and elliptical shapes on the canvas with precise control over fill and outline.',
			usage: 'Click and drag to define the circle. Enable "Perfect Pixels" to constrain to a perfect circle instead of an ellipse.',
			tips: [
				'Toggle "Filled" option to switch between solid and outline circles',
				'Adjust line width for thicker outlines',
				'Use "Perfect Pixels" to constrain to perfect circles',
				'Use left-click for primary color and right-click for secondary color'
			],
			relatedTools: ['rectangle', 'line', 'pencil']
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
		this.drawCircle(mouseContext, toolContext, true);

		return true;
	}

	onMouseUp(mouseContext: MouseEventContext, toolContext: ToolContext): boolean {
		if (this.startX === null || this.startY === null) {
			return false;
		}

		// Clear preview
		this.clearPreview(toolContext);

		// Draw final circle
		this.drawCircle(mouseContext, toolContext, false);

		// Reset state
		this.startX = null;
		this.startY = null;
		this.previewPixels = [];

		toolContext.requestRedraw();
		return true;
	}

	/**
	 * Draw circle from start position to current mouse position
	 */
	private drawCircle(
		mouseContext: MouseEventContext,
		toolContext: ToolContext,
		isPreview: boolean
	): void {
		if (this.startX === null || this.startY === null) return;

		const { x, y, button } = mouseContext;
		const { colors, setPixel, getPixel, requestRedraw, canvas, state } = toolContext;

		// Use primary color for left click, secondary for right click
		const colorIndex = button === 2 ? colors.secondaryColorIndex : colors.primaryColorIndex;

		// Get options
		const filled = state.getToolOption<boolean>(this.config.id, 'filled') ?? true;
		const lineWidth = state.getToolOption<number>(this.config.id, 'lineWidth') ?? 1;
		const perfectPixels = state.getToolOption<boolean>(this.config.id, 'perfectPixels') ?? false;

		// Calculate center and radii
		const cx = (this.startX + x) / 2;
		const cy = (this.startY + y) / 2;
		let rx = Math.abs(x - this.startX) / 2;
		let ry = Math.abs(y - this.startY) / 2;

		// Apply perfect circle constraint
		if (perfectPixels) {
			const radius = Math.max(rx, ry);
			rx = radius;
			ry = radius;
		}

		// Draw filled or outline circle
		if (filled) {
			this.drawFilledEllipse(cx, cy, rx, ry, colorIndex, toolContext, isPreview);
		} else {
			this.drawEllipseOutline(cx, cy, rx, ry, lineWidth, colorIndex, toolContext, isPreview);
		}

		requestRedraw();
	}

	/**
	 * Draw a filled ellipse using midpoint algorithm
	 */
	private drawFilledEllipse(
		cx: number,
		cy: number,
		rx: number,
		ry: number,
		colorIndex: number,
		toolContext: ToolContext,
		isPreview: boolean
	): void {
		const { setPixel, getPixel, canvas } = toolContext;

		// Round center coordinates
		const centerX = Math.round(cx);
		const centerY = Math.round(cy);

		// Draw filled ellipse by scanning horizontal lines
		const radiusX = Math.round(rx);
		const radiusY = Math.round(ry);

		for (let dy = -radiusY; dy <= radiusY; dy++) {
			// Calculate width at this height
			const width = Math.sqrt(
				Math.max(0, radiusX * radiusX * (1 - (dy * dy) / (radiusY * radiusY)))
			);

			const x1 = Math.round(centerX - width);
			const x2 = Math.round(centerX + width);
			const py = centerY + dy;

			if (py >= 0 && py < canvas.height) {
				for (let px = x1; px <= x2; px++) {
					if (px >= 0 && px < canvas.width) {
						if (isPreview) {
							this.previewPixels.push({ x: px, y: py, originalColor: getPixel(px, py) });
						}
						setPixel(px, py, colorIndex);
					}
				}
			}
		}
	}

	/**
	 * Draw an ellipse outline using midpoint algorithm
	 */
	private drawEllipseOutline(
		cx: number,
		cy: number,
		rx: number,
		ry: number,
		lineWidth: number,
		colorIndex: number,
		toolContext: ToolContext,
		isPreview: boolean
	): void {
		const { setPixel, getPixel, canvas } = toolContext;

		// Round center coordinates
		const centerX = Math.round(cx);
		const centerY = Math.round(cy);
		const radiusX = Math.round(rx);
		const radiusY = Math.round(ry);

		// Midpoint ellipse algorithm
		let x = 0;
		let y = radiusY;

		// Region 1
		let d1 = radiusY * radiusY - radiusX * radiusX * radiusY + 0.25 * radiusX * radiusX;
		let dx = 2 * radiusY * radiusY * x;
		let dy = 2 * radiusX * radiusX * y;

		while (dx < dy) {
			this.drawEllipsePoint(centerX, centerY, x, y, lineWidth, colorIndex, toolContext, isPreview);

			if (d1 < 0) {
				x++;
				dx += 2 * radiusY * radiusY;
				d1 += dx + radiusY * radiusY;
			} else {
				x++;
				y--;
				dx += 2 * radiusY * radiusY;
				dy -= 2 * radiusX * radiusX;
				d1 += dx - dy + radiusY * radiusY;
			}
		}

		// Region 2
		let d2 =
			radiusY * radiusY * (x + 0.5) * (x + 0.5) +
			radiusX * radiusX * (y - 1) * (y - 1) -
			radiusX * radiusX * radiusY * radiusY;

		while (y >= 0) {
			this.drawEllipsePoint(centerX, centerY, x, y, lineWidth, colorIndex, toolContext, isPreview);

			if (d2 > 0) {
				y--;
				dy -= 2 * radiusX * radiusX;
				d2 += radiusX * radiusX - dy;
			} else {
				y--;
				x++;
				dx += 2 * radiusY * radiusY;
				dy -= 2 * radiusX * radiusX;
				d2 += dx - dy + radiusX * radiusX;
			}
		}
	}

	/**
	 * Draw a single point of the ellipse with line width
	 */
	private drawEllipsePoint(
		cx: number,
		cy: number,
		x: number,
		y: number,
		lineWidth: number,
		colorIndex: number,
		toolContext: ToolContext,
		isPreview: boolean
	): void {
		const { setPixel, getPixel, canvas } = toolContext;

		// Draw 4 symmetric points with line width
		const points = [
			{ x: cx + x, y: cy + y },
			{ x: cx - x, y: cy + y },
			{ x: cx + x, y: cy - y },
			{ x: cx - x, y: cy - y }
		];

		for (const point of points) {
			const radius = Math.floor(lineWidth / 2);
			for (let dy = -radius; dy < lineWidth - radius; dy++) {
				for (let dx = -radius; dx < lineWidth - radius; dx++) {
					const px = point.x + dx;
					const py = point.y + dy;

					if (px >= 0 && px < canvas.width && py >= 0 && py < canvas.height) {
						if (isPreview) {
							this.previewPixels.push({ x: px, y: py, originalColor: getPixel(px, py) });
						}
						setPixel(px, py, colorIndex);
					}
				}
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
export default new CircleTool();
