/**
 * Eyedropper Tool Implementation
 *
 * Samples color from the canvas and sets it as the primary color.
 * Click to sample, right-click to set as secondary color.
 */

import { BaseTool } from '../base/BaseTool';
import type { ToolConfig } from '../base/ToolConfig';
import type { ToolContext, MouseEventContext } from '../base/ToolContext';

class EyedropperTool extends BaseTool {
	public readonly config: ToolConfig = {
		id: 'eyedropper',
		name: 'Eyedropper',
		description: 'Sample color from canvas',
		iconName: 'Pipette',
		category: 'draw',
		shortcut: 'I',
		cursor: 'crosshair',
		supportsDrag: false,
		worksOnLockedLayers: true, // Can sample from locked layers
		order: 4
	};

	onClick(mouseContext: MouseEventContext, toolContext: ToolContext): boolean {
		const { x, y, button } = mouseContext;
		const { getPixel, setPrimaryColor, setSecondaryColor } = toolContext;

		// Get color at clicked position
		const colorIndex = getPixel(x, y);

		// Set as primary or secondary color based on mouse button
		if (button === 0) {
			// Left click: set primary color
			setPrimaryColor(colorIndex);
		} else if (button === 2) {
			// Right click: set secondary color
			setSecondaryColor(colorIndex);
		}

		return true;
	}

	canUse(): { valid: boolean; reason?: string } {
		// Eyedropper can always be used
		return { valid: true };
	}
}

// Export singleton instance
export default new EyedropperTool();
