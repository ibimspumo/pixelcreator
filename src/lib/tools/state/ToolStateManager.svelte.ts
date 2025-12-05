/**
 * Tool State Manager
 *
 * Manages persistent state for all tools using Svelte 5 runes.
 * Automatically persists to localStorage with reactive updates.
 */

import { toolRegistry } from '../registry/ToolRegistry';

/**
 * Tool state interface
 */
export interface ToolState {
	/** Tool ID */
	toolId: string;

	/** Tool option values (keyed by option ID) */
	options: Record<string, any>;

	/** Last time tool was used */
	lastUsed?: Date;

	/** Number of times tool has been used */
	useCount?: number;

	/** Custom state (tool-specific data) */
	custom?: Record<string, any>;
}

/**
 * Tool State Manager Class
 *
 * Manages state for all tools with automatic persistence to localStorage
 */
export class ToolStateManager {
	private states = $state(new Map<string, ToolState>());
	private storageKey = 'inline-px:tool-states';
	private isInitialized = false;

	/**
	 * Initialize the state manager (call once on app startup)
	 */
	initialize(): void {
		if (this.isInitialized) return;
		this.loadFromStorage();
		this.isInitialized = true;
	}

	/**
	 * Get state for a tool
	 */
	getToolState(toolId: string): ToolState {
		if (!this.states.has(toolId)) {
			// Initialize with defaults from tool config
			const tool = toolRegistry.getTool(toolId);
			const defaultOptions: Record<string, any> = {};

			// Get extended config if available
			const extendedConfig = tool?.config as any;
			extendedConfig?.options?.forEach((option: any) => {
				defaultOptions[option.id] = option.defaultValue;
			});

			const newState: ToolState = {
				toolId,
				options: defaultOptions,
				useCount: 0
			};

			this.states.set(toolId, newState);
		}

		return this.states.get(toolId)!;
	}

	/**
	 * Set state for a tool
	 */
	setToolState(toolId: string, updates: Partial<ToolState>): void {
		const current = this.getToolState(toolId);
		const updated = { ...current, ...updates };
		this.states.set(toolId, updated);
		this.persistToStorage();
	}

	/**
	 * Update a specific option value
	 */
	setToolOption(toolId: string, optionId: string, value: any): void {
		const state = this.getToolState(toolId);
		state.options[optionId] = value;
		this.setToolState(toolId, state);
	}

	/**
	 * Get a specific option value
	 */
	getToolOption<T = any>(toolId: string, optionId: string): T | undefined {
		const state = this.getToolState(toolId);
		return state.options[optionId] as T;
	}

	/**
	 * Reset tool state to defaults
	 */
	resetToolState(toolId: string): void {
		this.states.delete(toolId);
		this.persistToStorage();
	}

	/**
	 * Reset all tool states
	 */
	resetAllStates(): void {
		this.states.clear();
		this.persistToStorage();
	}

	/**
	 * Increment use count and update last used timestamp
	 */
	recordToolUsage(toolId: string): void {
		const state = this.getToolState(toolId);
		state.useCount = (state.useCount || 0) + 1;
		state.lastUsed = new Date();
		this.setToolState(toolId, state);
	}

	/**
	 * Get all tool states (read-only)
	 */
	getAllStates(): Map<string, ToolState> {
		return new Map(this.states);
	}

	/**
	 * Persist states to localStorage
	 */
	private persistToStorage(): void {
		try {
			const serialized: Record<string, any> = {};

			this.states.forEach((state, toolId) => {
				serialized[toolId] = {
					...state,
					lastUsed: state.lastUsed?.toISOString()
				};
			});

			localStorage.setItem(this.storageKey, JSON.stringify(serialized));
		} catch (error) {
			console.error('Failed to persist tool states:', error);
		}
	}

	/**
	 * Load states from localStorage
	 */
	private loadFromStorage(): void {
		try {
			const stored = localStorage.getItem(this.storageKey);
			if (!stored) return;

			const parsed = JSON.parse(stored);

			Object.entries(parsed).forEach(([toolId, state]: [string, any]) => {
				this.states.set(toolId, {
					...state,
					lastUsed: state.lastUsed ? new Date(state.lastUsed) : undefined
				});
			});
		} catch (error) {
			console.error('Failed to load tool states:', error);
		}
	}

	/**
	 * Export all states as JSON
	 */
	exportStates(): string {
		const serialized: Record<string, any> = {};
		this.states.forEach((state, toolId) => {
			serialized[toolId] = {
				...state,
				lastUsed: state.lastUsed?.toISOString()
			};
		});
		return JSON.stringify(serialized, null, 2);
	}

	/**
	 * Import states from JSON
	 */
	importStates(json: string): void {
		try {
			const parsed = JSON.parse(json);
			this.states.clear();

			Object.entries(parsed).forEach(([toolId, state]: [string, any]) => {
				this.states.set(toolId, {
					...state,
					lastUsed: state.lastUsed ? new Date(state.lastUsed) : undefined
				} as ToolState);
			});

			this.persistToStorage();
		} catch (error) {
			console.error('Failed to import tool states:', error);
			throw error;
		}
	}

	/**
	 * Clear all data from storage
	 */
	clearStorage(): void {
		try {
			localStorage.removeItem(this.storageKey);
			this.states.clear();
		} catch (error) {
			console.error('Failed to clear tool state storage:', error);
		}
	}
}

// Export singleton instance
export const toolStateManager = new ToolStateManager();
