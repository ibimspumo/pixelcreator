<script>
	/**
	 * ToolButton - Atomic UI Component
	 *
	 * Single tool button for the toolbox sidebar.
	 * Shows icon, label, shortcut, and active state.
	 *
	 * @component
	 */
	import * as icons from '@lucide/svelte';

	/** @type {string} Tool ID */
	export let id = 'brush';

	/** @type {string} Icon name from @lucide/svelte */
	export let icon = 'Brush';

	/** @type {string} Tool label */
	export let label = 'Brush';

	/** @type {string} Keyboard shortcut */
	export let shortcut = 'B';

	/** @type {boolean} Is this tool active? */
	export let active = false;

	/** @type {() => void} Click handler */
	export let onclick = () => {};

	// Get icon component dynamically
	const IconComponent = icons[icon] || icons.Brush;
</script>

<button class="tool-btn" class:active title="{label} ({shortcut})" on:click={onclick}>
	<span class="tool-icon">
		<svelte:component this={IconComponent} size={20} />
	</span>
	<span class="tool-label">{label}</span>
	<span class="tool-shortcut">{shortcut}</span>
</button>

<style>
	.tool-btn {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 12px;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		color: var(--text-primary);
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s ease;
		width: 100%;
		text-align: left;
	}

	.tool-btn:hover:not(.active) {
		background: var(--bg-tertiary);
		border-color: var(--border-hover);
	}

	.tool-btn.active {
		background: var(--primary);
		border-color: var(--primary);
		color: white;
	}

	.tool-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.tool-label {
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.tool-shortcut {
		font-size: 11px;
		opacity: 0.7;
		background: rgba(0, 0, 0, 0.2);
		padding: 2px 6px;
		border-radius: var(--radius-sm);
		font-family: monospace;
		flex-shrink: 0;
	}

	.tool-btn.active .tool-shortcut {
		background: rgba(255, 255, 255, 0.2);
	}

	.tool-icon :global(svg) {
		flex-shrink: 0;
	}
</style>
