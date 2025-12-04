<script>
	/**
	 * ColorSwatch - Atomic UI Component
	 *
	 * Single color swatch for the palette.
	 * Shows color, handles selection state, and click events.
	 *
	 * @component
	 */

	/** @type {number} Color index (0-63) */
	export let index = 0;

	/** @type {string} Hex color code */
	export let color = '#000000';

	/** @type {string} Color name */
	export let name = 'Color';

	/** @type {boolean} Is this color selected? */
	export let selected = false;

	/** @type {(index: number) => void} Click handler */
	export let onclick = () => {};

	// Handle transparent color display
	$: isTransparent = color === 'transparent';
	$: displayColor = isTransparent ? '#ffffff' : color;
</script>

<button
	class="color-swatch"
	class:selected
	class:transparent={isTransparent}
	style="--swatch-color: {displayColor}"
	title="{name} ({index})"
	on:click={() => onclick(index)}
>
	{#if selected}
		<span class="selection-ring"></span>
	{/if}
</button>

<style>
	.color-swatch {
		width: 32px;
		height: 32px;
		border: 2px solid var(--border);
		border-radius: var(--radius-sm);
		background-color: var(--swatch-color);
		cursor: pointer;
		position: relative;
		transition: all 0.15s ease;
		padding: 0;
	}

	.color-swatch:hover {
		transform: scale(1.1);
		border-color: var(--border-hover);
		z-index: 10;
	}

	.color-swatch.selected {
		border-color: var(--primary);
		border-width: 3px;
		transform: scale(1.15);
		box-shadow: 0 0 0 2px var(--bg-secondary), 0 0 0 4px var(--primary);
	}

	.color-swatch.transparent {
		background-image: linear-gradient(
				45deg,
				#ccc 25%,
				transparent 25%,
				transparent 75%,
				#ccc 75%,
				#ccc
			),
			linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc);
		background-size: 8px 8px;
		background-position:
			0 0,
			4px 4px;
		background-color: #fff;
	}

	.selection-ring {
		position: absolute;
		inset: -2px;
		border: 2px solid white;
		border-radius: var(--radius-sm);
		pointer-events: none;
	}
</style>
