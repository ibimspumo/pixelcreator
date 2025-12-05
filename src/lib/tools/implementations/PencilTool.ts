/**
 * Pencil Tool Implementation
 *
 * Allows freehand drawing with primary (left-click) or secondary (right-click) color.
 * Supports click-and-drag for continuous drawing with configurable brush size.
 */

import { BaseTool } from '../base/BaseTool';
import type { ToolConfigExtended } from '../base/ToolMetadata';
import { commonToolOptions } from '../base/ToolOptions';
import type { ToolContext, MouseEventContext } from '../base/ToolContext';

class PencilTool extends BaseTool {
	public readonly config: ToolConfigExtended = {
		id: 'pencil',
		name: 'Pencil',
		description: 'Draw freehand with primary or secondary color',
		iconName: 'Pencil',
		category: 'draw',
		shortcut: 'B',
		cursor: 'crosshair',
		supportsDrag: true,
		worksOnLockedLayers: false,
		order: 1,

		// Extended configuration
		version: '1.1.0',
		author: 'inline.px',
		license: 'MIT',
		tags: ['drawing', 'basic', 'pixel', 'freehand'],

		// Tool options
		options: [commonToolOptions.brushSize],

		// Documentation
		documentation: {
			description:
				'The Pencil tool allows you to draw individual pixels on the canvas with precise control.',
			usage: 'Click to draw a single pixel, or click and drag to draw continuously. Use left-click for primary color and right-click for secondary color.',
			tips: [
				'Hold Shift while dragging to draw straight lines (coming soon)',
				'Use right-click to draw with secondary color',
				'Adjust brush size in tool options for larger strokes'
			],
			relatedTools: ['eraser', 'bucket']
		}
	};

	onMouseDown(mouseContext: MouseEventContext, toolContext: ToolContext): boolean {
		return this.drawPixel(mouseContext, toolContext);
	}

	onMouseMove(mouseContext: MouseEventContext, toolContext: ToolContext): boolean {
		return this.drawPixel(mouseContext, toolContext);
	}

	/**
	 * Draw pixels at the mouse position
	 * Respects brush size option for multi-pixel drawing
	 */
	private drawPixel(mouseContext: MouseEventContext, toolContext: ToolContext): boolean {
		const { x, y, button } = mouseContext;
		const { colors, setPixel, requestRedraw, canvas, state } = toolContext;

		// Use primary color for left click, secondary for right click
		const colorIndex = button === 2 ? colors.secondaryColorIndex : colors.primaryColorIndex;

		// Get brush size from tool state (defaults to 1)
		const brushSize = state.getToolOption<number>(this.config.id, 'brushSize') ?? 1;

		// Calculate brush radius (brush size 1 = single pixel, size 2 = 2x2, etc.)
		const radius = Math.floor(brushSize / 2);

		// Draw pixels in brush area
		for (let dy = -radius; dy < brushSize - radius; dy++) {
			for (let dx = -radius; dx < brushSize - radius; dx++) {
				const px = x + dx;
				const py = y + dy;

				// Check bounds
				if (px >= 0 && px < canvas.width && py >= 0 && py < canvas.height) {
					setPixel(px, py, colorIndex);
				}
			}
		}

		requestRedraw();
		return true;
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
export default new PencilTool();
