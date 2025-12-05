/**
 * Eraser Tool Implementation
 *
 * Erases pixels by setting them to transparent (color index 0).
 * Supports click-and-drag for continuous erasing.
 */

import { BaseTool } from '../base/BaseTool';
import type { ToolConfigExtended } from '../base/ToolMetadata';
import { commonToolOptions } from '../base/ToolOptions';
import type { ToolContext, MouseEventContext } from '../base/ToolContext';

class EraserTool extends BaseTool {
	public readonly config: ToolConfigExtended = {
		id: 'eraser',
		name: 'Eraser',
		description: 'Erase pixels to transparent',
		iconName: 'Eraser',
		category: 'draw',
		shortcut: 'E',
		cursor: 'crosshair',
		supportsDrag: true,
		worksOnLockedLayers: false,
		order: 2,
		version: '1.1.0',
		author: 'inline.px',
		license: 'MIT',
		tags: ['drawing', 'erase', 'transparent'],
		options: [commonToolOptions.brushSize]
	};

	onMouseDown(mouseContext: MouseEventContext, toolContext: ToolContext): boolean {
		return this.erasePixel(mouseContext, toolContext);
	}

	onMouseMove(mouseContext: MouseEventContext, toolContext: ToolContext): boolean {
		return this.erasePixel(mouseContext, toolContext);
	}

	/**
	 * Erase pixels at the mouse position
	 * Respects brush size option for erasing multiple pixels
	 */
	private erasePixel(mouseContext: MouseEventContext, toolContext: ToolContext): boolean {
		const { x, y } = mouseContext;
		const { setPixel, requestRedraw, canvas, state } = toolContext;

		// Get brush size from tool state (defaults to 1)
		const brushSize = state.getToolOption<number>(this.config.id, 'brushSize') ?? 1;

		// Calculate brush radius (brush size 1 = single pixel, size 2 = 2x2, etc.)
		const radius = Math.floor(brushSize / 2);

		// Erase pixels in brush area
		for (let dy = -radius; dy < brushSize - radius; dy++) {
			for (let dx = -radius; dx < brushSize - radius; dx++) {
				const px = x + dx;
				const py = y + dy;

				// Check bounds
				if (px >= 0 && px < canvas.width && py >= 0 && py < canvas.height) {
					setPixel(px, py, 0); // Set to transparent (index 0)
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
export default new EraserTool();
