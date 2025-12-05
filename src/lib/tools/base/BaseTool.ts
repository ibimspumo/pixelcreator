/**
 * Base Tool Abstract Class
 *
 * All tools must extend this class and implement the required methods.
 * Provides a consistent interface for tool behavior and lifecycle.
 */

import type { ToolConfig } from './ToolConfig';
import type { ToolConfigExtended } from './ToolMetadata';
import type { ToolContext, MouseEventContext } from './ToolContext';

/**
 * Abstract base class for all drawing/editing tools
 */
export abstract class BaseTool {
	/** Tool configuration (supports both basic and extended configs) */
	public abstract readonly config: ToolConfig | ToolConfigExtended;

	/**
	 * Called when the tool is activated/selected
	 * Use this for initialization, cursor changes, etc.
	 */
	onActivate?(context: ToolContext): void;

	/**
	 * Called when the tool is deactivated/unselected
	 * Use this for cleanup
	 */
	onDeactivate?(context: ToolContext): void;

	/**
	 * Called on mouse down event
	 * @returns true if event was handled, false otherwise
	 */
	onMouseDown?(mouseContext: MouseEventContext, toolContext: ToolContext): boolean;

	/**
	 * Called on mouse move event (when mouse is down and tool supports drag)
	 * @returns true if event was handled, false otherwise
	 */
	onMouseMove?(mouseContext: MouseEventContext, toolContext: ToolContext): boolean;

	/**
	 * Called on mouse up event
	 * @returns true if event was handled, false otherwise
	 */
	onMouseUp?(mouseContext: MouseEventContext, toolContext: ToolContext): boolean;

	/**
	 * Called on mouse click event (for tools that don't support drag)
	 * @returns true if event was handled, false otherwise
	 */
	onClick?(mouseContext: MouseEventContext, toolContext: ToolContext): boolean;

	/**
	 * Called when keyboard shortcut is pressed
	 * @returns true if the tool should be activated
	 */
	onShortcut?(event: KeyboardEvent, toolContext: ToolContext): boolean;

	/**
	 * Validate if tool can be used in current context
	 * @returns true if tool can be used, false with optional reason
	 */
	canUse?(toolContext: ToolContext): { valid: boolean; reason?: string };

	/**
	 * Get default value for a tool option
	 *
	 * @param optionId - The option identifier
	 * @returns The default value for the option, or undefined if not found
	 */
	getOption<T = any>(optionId: string): T | undefined {
		const extendedConfig = this.config as ToolConfigExtended;
		const option = extendedConfig.options?.find((opt) => opt.id === optionId);
		return option?.defaultValue as T | undefined;
	}
}
