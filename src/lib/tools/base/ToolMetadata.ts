/**
 * Extended Tool Metadata
 *
 * Additional metadata for professional tool system.
 * Extends base ToolConfig with version, documentation, and extensibility.
 */

import type { ToolConfig } from './ToolConfig';
import type { ToolOption } from './ToolOptions';

/**
 * Tool example for documentation
 */
export interface ToolExample {
	/** Example title */
	title: string;
	/** Example description */
	description: string;
	/** Step-by-step instructions */
	steps: string[];
	/** Expected result description */
	expectedResult: string;
	/** Difficulty level */
	difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * Tool documentation
 */
export interface ToolDocumentation {
	/** Detailed description */
	description: string;
	/** Usage instructions */
	usage: string;
	/** Usage examples */
	examples?: ToolExample[];
	/** Tips and tricks */
	tips?: string[];
	/** Related tool IDs */
	relatedTools?: string[];
	/** Video tutorial URL */
	videoUrl?: string;
}

/**
 * Extended tool configuration
 *
 * Backward compatible with ToolConfig - all new fields are optional
 */
export interface ToolConfigExtended extends ToolConfig {
	/** Tool version (semver format) */
	version?: string;

	/** Tool author */
	author?: string;

	/** License (e.g., 'MIT', 'GPL-3.0') */
	license?: string;

	/** Tags for search/filtering */
	tags?: string[];

	/** Tool dependencies (other tool IDs) */
	dependencies?: string[];

	/** Configurable options */
	options?: ToolOption[];

	/** Custom metadata (escape hatch for future extensions) */
	metadata?: Record<string, any>;

	/** Tool documentation */
	documentation?: ToolDocumentation;
}
