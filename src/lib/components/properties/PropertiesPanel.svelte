<script>
	/**
	 * PropertiesPanel - Organism Component
	 *
	 * Properties panel showing tool-specific options.
	 * Displays brush size slider and shape mode toggle.
	 * Options visibility depends on current tool capabilities.
	 *
	 * @component
	 */
	import Slider from '../ui/atoms/Slider.svelte';
	import ToggleGroup from '../ui/atoms/ToggleGroup.svelte';
	import { editor } from '$lib/stores/editor-simple.svelte.js';

	const toolStore = editor.tool;
	let brushSize;
	let shapeMode;
	let currentToolId;

	// Subscribe to tool store
	toolStore.subscribe((value) => {
		brushSize = value.brushSize;
		shapeMode = value.shapeMode;
		currentToolId = value.currentToolId;
	});

	// Shape mode options
	const shapeModeOptions = [
		{ value: 'fill', label: 'Fill' },
		{ value: 'stroke', label: 'Stroke' }
	];

	// Tools that support brush size
	const toolsWithSize = ['brush', 'eraser', 'pencil'];

	// Tools that support shape mode
	const toolsWithShapeMode = ['rectangle', 'ellipse'];

	/**
	 * Check if current tool supports brush size
	 */
	$: showBrushSize = toolsWithSize.includes(currentToolId);

	/**
	 * Check if current tool supports shape mode
	 */
	$: showShapeMode = toolsWithShapeMode.includes(currentToolId);

	/**
	 * Handle brush size change
	 * @param {number} value
	 */
	function handleBrushSizeChange(value) {
		editor.tool.setBrushSize(value);
		console.log('Brush size changed to:', value);
	}

	/**
	 * Handle shape mode change
	 * @param {string} value
	 */
	function handleShapeModeChange(value) {
		editor.tool.setShapeMode(value);
		console.log('Shape mode changed to:', value);
	}
</script>

<div class="properties-panel">
	<div class="properties-header">
		<h3 class="properties-title">Properties</h3>
	</div>

	<div class="properties-content">
		{#if showBrushSize}
			<Slider
				label="Brush Size"
				value={brushSize}
				min={1}
				max={10}
				step={1}
				onchange={handleBrushSizeChange}
			/>
		{/if}

		{#if showShapeMode}
			<ToggleGroup
				label="Shape Mode"
				options={shapeModeOptions}
				value={shapeMode}
				onchange={handleShapeModeChange}
			/>
		{/if}

		{#if !showBrushSize && !showShapeMode}
			<div class="empty-state">
				<p class="empty-text">No options for this tool</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.properties-panel {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 16px;
		background: var(--bg-secondary);
		border-radius: var(--radius-md);
	}

	.properties-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-bottom: 8px;
		border-bottom: 1px solid var(--border);
	}

	.properties-title {
		font-size: 14px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: var(--text-primary);
		margin: 0;
	}

	.properties-content {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.empty-state {
		padding: 24px 16px;
		text-align: center;
	}

	.empty-text {
		font-size: 12px;
		color: var(--text-secondary);
		margin: 0;
		opacity: 0.7;
	}
</style>
