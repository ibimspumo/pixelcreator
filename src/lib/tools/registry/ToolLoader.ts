/**
 * Tool Loader - Automatic tool loading system
 *
 * Automatically imports and registers all tools from the implementations directory.
 * This ensures that new tools are automatically available once created.
 */

import { toolRegistry } from './ToolRegistry';
import type { BaseTool } from '../base/BaseTool';

/**
 * Load all tools and register them
 * This function should be called once at application startup
 */
export async function loadAllTools(): Promise<void> {
	console.log('🔧 Loading tools...');

	// Dynamically import all tool implementations
	// Note: Vite will bundle these automatically
	const toolModules = import.meta.glob('../implementations/*.ts');

	const tools: BaseTool[] = [];

	for (const path in toolModules) {
		try {
			const module = await toolModules[path]() as { default: BaseTool };

			if (module.default) {
				tools.push(module.default);
			} else {
				console.warn(`Tool module at ${path} does not export a default tool instance`);
			}
		} catch (error) {
			console.error(`Failed to load tool from ${path}:`, error);
		}
	}

	// Register all loaded tools
	toolRegistry.registerMany(tools);

	console.log(`✓ Loaded ${tools.length} tools`);
}

/**
 * Load tools synchronously (for tools that don't require async imports)
 * Useful for testing or when tools are pre-imported
 */
export function loadToolsSync(tools: BaseTool[]): void {
	console.log(`🔧 Loading ${tools.length} tools synchronously...`);
	toolRegistry.registerMany(tools);
	console.log(`✓ Loaded ${tools.length} tools`);
}
