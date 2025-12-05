<!--
  @component PixelGrid

  The core interactive canvas component for pixel art drawing. Manages the HTML canvas element,
  initializes the CanvasRenderer, and handles all mouse interactions for drawing pixels.
  Integrates with canvasStore and colorStore for state management.

  @example
  ```svelte
  <PixelGrid />
  ```

  @remarks
  - Initializes CanvasRenderer with 32px pixel size and grid display
  - Uses Svelte 5's $effect rune for reactive rendering when canvas state changes
  - Left-click draws with primary color, right-click draws with secondary color
  - Prevents context menu on right-click for seamless drawing
  - Automatic cleanup on component destroy
  - Drawing state managed with $state rune for click-and-drag functionality
  - Crosshair cursor for precise pixel placement
  - Checkerboard background for transparency visualization
-->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { canvasStore } from '$lib/stores/canvasStore.svelte';
	import { colorStore } from '$lib/stores/colorStore.svelte';
	import { CanvasRenderer } from '$lib/utils/renderPipeline';

	let canvasElement: HTMLCanvasElement;
	let renderer: CanvasRenderer | null = null;
	let isDrawing = $state(false);

	onMount(() => {
		// Initialize renderer with configuration
		renderer = new CanvasRenderer(canvasElement, {
			pixelSize: 32,
			showGrid: true,
			showPixelBorders: true
		});

		// Perform initial render
		renderCanvas();

		// Set up reactive rendering using $effect rune
		$effect(() => {
			// This effect runs whenever canvas state changes
			const { width, height, layers } = canvasStore;
			if (renderer) {
				renderer.requestRedraw();
				renderer.render(width, height, layers);
			}
		});
	});

	onDestroy(() => {
		// Clean up renderer resources
		renderer?.destroy();
	});

	/**
	 * Renders the current canvas state to the HTML canvas element
	 */
	function renderCanvas() {
		if (!renderer) return;
		renderer.render(canvasStore.width, canvasStore.height, canvasStore.layers);
	}

	/**
	 * Handles mouse down event to start drawing
	 */
	function handleMouseDown(event: MouseEvent) {
		isDrawing = true;
		drawPixel(event);
	}

	/**
	 * Handles mouse move event to continue drawing when mouse is down
	 */
	function handleMouseMove(event: MouseEvent) {
		if (!isDrawing) return;
		drawPixel(event);
	}

	/**
	 * Handles mouse up event to stop drawing
	 */
	function handleMouseUp() {
		isDrawing = false;
	}

	/**
	 * Handles mouse leave event to stop drawing when cursor leaves canvas
	 */
	function handleMouseLeave() {
		isDrawing = false;
	}

	/**
	 * Draws a pixel at the mouse position with the appropriate color
	 * @param event - Mouse event containing cursor position
	 */
	function drawPixel(event: MouseEvent) {
		if (!renderer || !canvasElement) return;

		const rect = canvasElement.getBoundingClientRect();
		const coords = renderer.getPixelCoordinates(event.clientX, event.clientY, rect);

		if (!coords) return;

		const { x, y } = coords;

		// Use primary color for left click, secondary for right click
		const colorIndex = event.button === 2 ? colorStore.secondaryColorIndex : colorStore.primaryColorIndex;

		canvasStore.setPixel(x, y, colorIndex);
		renderCanvas();
	}

	/**
	 * Prevents default context menu on right-click for seamless drawing
	 */
	function handleContextMenu(event: MouseEvent) {
		event.preventDefault();
		return false;
	}
</script>

<canvas
	bind:this={canvasElement}
	class="pixel-canvas"
	onmousedown={handleMouseDown}
	onmousemove={handleMouseMove}
	onmouseup={handleMouseUp}
	onmouseleave={handleMouseLeave}
	oncontextmenu={handleContextMenu}
></canvas>

<style>
	.pixel-canvas {
		display: block;
		image-rendering: pixelated;
		image-rendering: crisp-edges;
		cursor: crosshair;
		box-shadow: var(--shadow-lg);
		border: 2px solid var(--color-border);
		background: repeating-conic-gradient(#2a2a2a 0% 25%, #1a1a1a 0% 50%) 50% / 16px 16px;
	}

	.pixel-canvas:active {
		cursor: crosshair;
	}
</style>
