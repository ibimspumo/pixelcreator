<script>
	/**
	 * ColorPalette - Organism Component
	 *
	 * Complete color palette with all 64 colors.
	 * Manages color selection state and emits color change events.
	 *
	 * @component
	 */
	import ColorSwatch from '../ui/atoms/ColorSwatch.svelte';
	import ColorConfig from '../../../../config/colors.js';
	import { editor } from '$lib/stores/editor-simple.svelte.js';

	const toolStore = editor.tool;
	let selectedColor;

	// Subscribe to tool store for selected color
	toolStore.subscribe((value) => {
		selectedColor = value.selectedColor;
	});

	/**
	 * Handle color selection
	 * @param {number} index
	 */
	function handleColorSelect(index) {
		editor.tool.setColor(index);
		console.log('Color selected:', index, ColorConfig.palette[index].name);
	}
</script>

<div class="color-palette">
	<div class="palette-header">
		<h3 class="palette-title">Color Palette</h3>
		<div class="palette-info">
			<span class="current-color-name">
				{ColorConfig.palette[selectedColor]?.name || 'Black'}
			</span>
		</div>
	</div>

	<div class="palette-grid">
		{#each ColorConfig.palette as colorData (colorData.index)}
			<ColorSwatch
				index={colorData.index}
				color={colorData.color}
				name={colorData.name}
				selected={selectedColor === colorData.index}
				onclick={handleColorSelect}
			/>
		{/each}
	</div>
</div>

<style>
	.color-palette {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 16px;
		background: var(--bg-secondary);
		border-radius: var(--radius-md);
	}

	.palette-header {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.palette-title {
		font-size: 14px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: var(--text-primary);
		margin: 0;
	}

	.palette-info {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.current-color-name {
		font-size: 12px;
		color: var(--text-secondary);
		font-weight: 500;
	}

	.palette-grid {
		display: grid;
		grid-template-columns: repeat(8, 32px);
		gap: 6px;
		justify-content: center;
	}

	@media (max-width: 768px) {
		.palette-grid {
			grid-template-columns: repeat(4, 32px);
		}
	}
</style>
