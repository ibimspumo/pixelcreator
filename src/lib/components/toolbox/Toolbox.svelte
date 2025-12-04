<script>
	/**
	 * Toolbox - Organism Component
	 *
	 * Complete toolbox sidebar with all available tools.
	 * Dynamically generates tool buttons from registered tools.
	 * Manages tool selection state and emits tool change events.
	 *
	 * @component
	 */
	import ToolButton from '../ui/atoms/ToolButton.svelte';
	import { editor } from '$lib/stores/editor-simple.svelte.js';

	const toolStore = editor.tool;
	let currentToolId;

	// Subscribe to tool store for active tool
	toolStore.subscribe((value) => {
		currentToolId = value.currentToolId;
	});

	/**
	 * Tool configurations
	 * These match the tool IDs from ToolRegistry
	 */
	const tools = [
		{
			id: 'brush',
			icon: 'Brush',
			label: 'Brush',
			shortcut: 'B'
		},
		{
			id: 'pencil',
			icon: 'Pencil',
			label: 'Pencil',
			shortcut: 'P'
		},
		{
			id: 'eraser',
			icon: 'Eraser',
			label: 'Eraser',
			shortcut: 'E'
		},
		{
			id: 'line',
			icon: 'Minus',
			label: 'Line',
			shortcut: 'L'
		},
		{
			id: 'rectangle',
			icon: 'Square',
			label: 'Rectangle',
			shortcut: 'R'
		},
		{
			id: 'ellipse',
			icon: 'Circle',
			label: 'Ellipse',
			shortcut: 'O'
		},
		{
			id: 'fill',
			icon: 'PaintBucket',
			label: 'Fill',
			shortcut: 'F'
		},
		{
			id: 'select',
			icon: 'RectangleSelect',
			label: 'Select',
			shortcut: 'S'
		},
		{
			id: 'magic-wand',
			icon: 'Wand2',
			label: 'Magic Wand',
			shortcut: 'W'
		},
		{
			id: 'move',
			icon: 'Move',
			label: 'Move',
			shortcut: 'M'
		},
		{
			id: 'hand',
			icon: 'Hand',
			label: 'Hand',
			shortcut: 'H'
		}
	];

	/**
	 * Handle tool selection
	 * @param {string} toolId
	 */
	function handleToolSelect(toolId) {
		editor.tool.setTool(toolId);
		console.log('Tool selected:', toolId);
	}
</script>

<div class="toolbox">
	<div class="toolbox-header">
		<h3 class="toolbox-title">Tools</h3>
	</div>

	<div class="toolbox-content">
		{#each tools as tool (tool.id)}
			<ToolButton
				id={tool.id}
				icon={tool.icon}
				label={tool.label}
				shortcut={tool.shortcut}
				active={currentToolId === tool.id}
				onclick={() => handleToolSelect(tool.id)}
			/>
		{/each}
	</div>
</div>

<style>
	.toolbox {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 16px;
		background: var(--bg-secondary);
		border-radius: var(--radius-md);
		height: 100%;
		overflow-y: auto;
	}

	.toolbox-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-bottom: 8px;
		border-bottom: 1px solid var(--border);
	}

	.toolbox-title {
		font-size: 14px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: var(--text-primary);
		margin: 0;
	}

	.toolbox-content {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	/* Scrollbar styling */
	.toolbox::-webkit-scrollbar {
		width: 8px;
	}

	.toolbox::-webkit-scrollbar-track {
		background: var(--bg-primary);
		border-radius: 4px;
	}

	.toolbox::-webkit-scrollbar-thumb {
		background: var(--border);
		border-radius: 4px;
	}

	.toolbox::-webkit-scrollbar-thumb:hover {
		background: var(--border-hover);
	}
</style>
