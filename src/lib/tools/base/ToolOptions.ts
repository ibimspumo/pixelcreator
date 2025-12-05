/**
 * Tool Option Schema
 *
 * Defines configurable options for tools (e.g., brush size, opacity).
 * Options are dynamically rendered in the UI based on their type.
 */

import type { ToolContext } from './ToolContext';

export type OptionType = 'number' | 'boolean' | 'string' | 'color' | 'select' | 'slider';

/**
 * Tool option interface
 *
 * @template T - The value type for this option
 */
export interface ToolOption<T = any> {
	/** Unique option identifier */
	id: string;

	/** Display label */
	label: string;

	/** Option description/tooltip */
	description?: string;

	/** Option type determines UI control */
	type: OptionType;

	/** Default value */
	defaultValue: T;

	/** For number/slider: minimum value */
	min?: number;

	/** For number/slider: maximum value */
	max?: number;

	/** For number/slider: step increment */
	step?: number;

	/** For select: available options */
	options?: Array<{ value: T; label: string }>;

	/** Validation function */
	validation?: (value: T) => boolean | string;

	/** Whether option is visible in UI */
	visible?: boolean | ((context: ToolContext) => boolean);
}

/**
 * Common tool options that can be reused across tools
 */
export const commonToolOptions = {
	/**
	 * Brush size option (1-64 pixels)
	 */
	brushSize: {
		id: 'brushSize',
		label: 'Brush Size',
		description: 'Size of the brush in pixels',
		type: 'slider' as const,
		defaultValue: 1,
		min: 1,
		max: 64,
		step: 1
	},

	/**
	 * Opacity option (0-100%)
	 */
	opacity: {
		id: 'opacity',
		label: 'Opacity',
		description: 'Brush opacity (0-100%)',
		type: 'slider' as const,
		defaultValue: 100,
		min: 0,
		max: 100,
		step: 1
	},

	/**
	 * Anti-aliasing option
	 */
	antiAlias: {
		id: 'antiAlias',
		label: 'Anti-Aliasing',
		description: 'Smooth edges',
		type: 'boolean' as const,
		defaultValue: false
	},

	/**
	 * Tolerance option for flood fill
	 */
	tolerance: {
		id: 'tolerance',
		label: 'Tolerance',
		description: 'Color matching tolerance (0-100)',
		type: 'slider' as const,
		defaultValue: 0,
		min: 0,
		max: 100,
		step: 1
	},

	/**
	 * Contiguous fill option
	 */
	contiguous: {
		id: 'contiguous',
		label: 'Contiguous',
		description: 'Only fill connected pixels',
		type: 'boolean' as const,
		defaultValue: true
	}
};
