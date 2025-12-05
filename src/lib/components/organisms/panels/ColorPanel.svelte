<script lang="ts">
	import { onMount } from 'svelte';
	import Panel from '$lib/components/atoms/display/Panel.svelte';
	import ColorSwatch from '$lib/components/atoms/color-swatch/ColorSwatch.svelte';
	import { COLOR_PALETTE } from '$lib/constants/colorPalette';
	import { colorStore } from '$lib/stores/colorStore.svelte';
	import { ArrowLeftRight } from '@lucide/svelte';

	let primaryColor = $derived(COLOR_PALETTE[colorStore.primaryColorIndex]);
	let secondaryColor = $derived(COLOR_PALETTE[colorStore.secondaryColorIndex]);
	let activeColorMode = $state<'primary' | 'secondary'>('primary');

	function selectColor(index: number) {
		if (activeColorMode === 'primary') {
			colorStore.setPrimaryColor(index);
		} else {
			colorStore.setSecondaryColor(index);
		}
	}

	function selectPrimaryColor(index: number) {
		colorStore.setPrimaryColor(index);
	}

	function selectSecondaryColor(index: number) {
		colorStore.setSecondaryColor(index);
	}

	function swapColors() {
		colorStore.swapColors();
	}

	function toggleActiveColor() {
		activeColorMode = activeColorMode === 'primary' ? 'secondary' : 'primary';
	}

	// Keyboard shortcut: X to swap colors
	onMount(() => {
		function handleKeyPress(e: KeyboardEvent) {
			// Only trigger if not in input field
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
				return;
			}

			if (e.key.toLowerCase() === 'x') {
				swapColors();
			}
		}

		window.addEventListener('keydown', handleKeyPress);
		return () => window.removeEventListener('keydown', handleKeyPress);
	});
</script>

<Panel title="Colors">
	<div class="color-section">
		<!-- Primary and Secondary Color Display -->
		<div class="selected-colors">
			<div class="color-display-wrapper">
				<div class="color-display-header">
					<button class="swap-button" onclick={swapColors} title="Swap colors (Press X)">
						<ArrowLeftRight size={16} />
					</button>
				</div>
				<div class="color-display-container">
					<button
						class="color-display primary"
						class:transparent={primaryColor.color === 'transparent'}
						class:active={activeColorMode === 'primary'}
						style="background-color: {primaryColor.color === 'transparent'
							? 'transparent'
							: primaryColor.color}"
						onclick={() => (activeColorMode = 'primary')}
						title="Primary color (click to set active)"
					>
						<span class="color-index">{primaryColor.index}</span>
					</button>
					<button
						class="color-display secondary"
						class:transparent={secondaryColor.color === 'transparent'}
						class:active={activeColorMode === 'secondary'}
						style="background-color: {secondaryColor.color === 'transparent'
							? 'transparent'
							: secondaryColor.color}"
						onclick={() => (activeColorMode = 'secondary')}
						title="Secondary color (click to set active)"
					>
						<span class="color-index">{secondaryColor.index}</span>
					</button>
				</div>
				<div class="color-labels">
					<div class="color-label" class:active={activeColorMode === 'primary'}>
						<span class="label-text">Primary</span>
						<span class="label-name">{primaryColor.name}</span>
					</div>
					<div class="color-label" class:active={activeColorMode === 'secondary'}>
						<span class="label-text">Secondary</span>
						<span class="label-name">{secondaryColor.name}</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Color Palette Grid (64 colors) -->
		<div class="palette-section">
			<div class="section-title">
				Palette (64 colors)
				<span class="active-mode-hint">
					{activeColorMode === 'primary' ? '• Primary' : '• Secondary'}
				</span>
			</div>
			<div class="palette-grid">
				{#each COLOR_PALETTE as paletteColor}
					<ColorSwatch
						color={paletteColor.color}
						index={paletteColor.index}
						active={paletteColor.index ===
							(activeColorMode === 'primary'
								? colorStore.primaryColorIndex
								: colorStore.secondaryColorIndex)}
						onclick={selectColor}
						size="md"
					/>
				{/each}
			</div>
		</div>
	</div>
</Panel>

<style>
	.color-section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
		width: 100%;
		overflow: hidden;
	}

	.selected-colors {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.color-display-wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.color-display-header {
		display: flex;
		justify-content: flex-end;
	}

	.swap-button {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 6px;
		background: var(--color-bg-tertiary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.swap-button:hover {
		background: var(--color-bg-elevated);
		color: var(--color-text-primary);
		border-color: var(--color-accent);
	}

	.color-display-container {
		position: relative;
		width: 100%;
		height: 80px;
		display: flex;
	}

	.color-display {
		position: relative;
		border: 3px solid var(--color-border);
		border-radius: var(--radius-md);
		display: flex;
		align-items: flex-start;
		justify-content: flex-start;
		padding: var(--spacing-xs);
		cursor: pointer;
		transition: all var(--transition-fast);
		background: none;
	}

	.color-display:hover {
		border-color: var(--color-accent);
	}

	.color-display.active {
		border-color: var(--color-accent);
		box-shadow: 0 0 0 2px var(--color-accent);
	}

	.color-display.transparent {
		background: repeating-conic-gradient(#808080 0% 25%, #404040 0% 50%) 50% / 16px 16px !important;
	}

	.color-display.primary {
		width: 60%;
		z-index: 2;
	}

	.color-display.secondary {
		width: 60%;
		margin-left: -20%;
		z-index: 1;
	}

	.color-index {
		font-size: var(--font-size-xs);
		font-weight: 600;
		font-family: var(--font-mono);
		background-color: rgba(0, 0, 0, 0.7);
		color: white;
		padding: 2px 6px;
		border-radius: var(--radius-sm);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
	}

	.color-labels {
		display: flex;
		justify-content: space-between;
		gap: var(--spacing-md);
	}

	.color-label {
		display: flex;
		flex-direction: column;
		gap: 2px;
		flex: 1;
		transition: all var(--transition-fast);
	}

	.color-label.active .label-text {
		color: var(--color-accent);
	}

	.color-label.active .label-name {
		color: var(--color-accent);
		font-weight: 600;
	}

	.label-text {
		font-size: var(--font-size-xs);
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.label-name {
		font-size: var(--font-size-sm);
		color: var(--color-text-primary);
		font-weight: 500;
	}

	.palette-section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.section-title {
		font-size: var(--font-size-xs);
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		font-weight: 600;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.active-mode-hint {
		font-size: var(--font-size-xs);
		color: var(--color-accent);
		text-transform: none;
		font-weight: 500;
	}

	.palette-grid {
		display: grid;
		grid-template-columns: repeat(8, 1fr);
		gap: var(--spacing-xs);
		width: 100%;
		box-sizing: border-box;
	}

	/* Ensure color swatches scale properly */
	.palette-grid :global(.color-swatch) {
		width: 100%;
		aspect-ratio: 1;
	}
</style>
