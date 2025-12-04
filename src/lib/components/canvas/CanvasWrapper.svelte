<script>
	/**
	 * CanvasWrapper - Svelte Canvas Integration
	 *
	 * Wraps the existing PixelCanvas.js logic and makes it reactive.
	 * Bridges imperative Canvas API with Svelte's reactive state.
	 *
	 * @component
	 */
	import { onMount, onDestroy } from 'svelte';
	import { editor } from '$lib/stores/editor-simple.svelte.js';
	import PixelCanvas from '../../../../js/canvas/PixelCanvas.js';
	import ToolRegistry from '../../../../js/tools/ToolRegistry.js';

	// Make ToolRegistry globally available for PixelCanvas
	if (typeof window !== 'undefined') {
		window.ToolRegistry = ToolRegistry;
	}

	let canvasContainer;
	let initialized = false;
	let canvasState;
	let toolState;

	// Subscribe to stores
	const unsubscribeCanvas = editor.canvas.subscribe((value) => {
		canvasState = value;
	});

	const unsubscribeTool = editor.tool.subscribe((value) => {
		toolState = value;
	});

	/**
	 * Initialize PixelCanvas when component mounts
	 */
	onMount(async () => {
		try {
			console.log('CanvasWrapper: Initializing with dimensions', canvasState.width, canvasState.height);

			// Initialize PixelCanvas
			await PixelCanvas.init('pixel-canvas', canvasState.width, canvasState.height, handleCanvasChange);

			// Initialize ToolRegistry
			await initializeToolRegistry();

			initialized = true;
			console.log('CanvasWrapper: Initialization complete');
		} catch (error) {
			console.error('CanvasWrapper: Failed to initialize', error);
		}
	});

	/**
	 * Initialize ToolRegistry with tools
	 */
	async function initializeToolRegistry() {
		// Import tool implementations dynamically
		const { default: BrushTool } = await import('../../../../js/tools/implementations/BrushTool.js');
		const { default: PencilTool } = await import(
			'../../../../js/tools/implementations/PencilTool.js'
		);
		const { default: EraserTool } = await import(
			'../../../../js/tools/implementations/EraserTool.js'
		);
		const { default: FillTool } = await import('../../../../js/tools/implementations/FillTool.js');

		// Load config
		const { default: configLoader } = await import('../../../../js/core/ConfigLoader.js');
		const constants = await configLoader.loadConstants();

		// Initialize ToolRegistry
		ToolRegistry.init({
			onToolChange: handleToolChange,
			onToolOptionChange: handleToolOptionChange,
			sharedOptions: {
				brushSize: toolState.brushSize,
				shapeMode: toolState.shapeMode,
				colorCode: toolState.selectedColor
			}
		});

		// Register tools
		const tools = [BrushTool, PencilTool, EraserTool, FillTool];
		ToolRegistry.registerTools(tools);

		// Set initial tool
		ToolRegistry.setCurrentTool(toolState.currentToolId);

		console.log('ToolRegistry initialized with', tools.length, 'tools');
	}

	/**
	 * Handle canvas changes from PixelCanvas.js
	 */
	function handleCanvasChange() {
		if (!initialized) return;

		// Mark file as dirty
		editor.file.markDirty();

		console.log('Canvas changed');
	}

	/**
	 * Handle tool changes from ToolRegistry
	 */
	function handleToolChange(toolId, toolConfig) {
		console.log('Tool changed to:', toolId);
		editor.tool.setTool(toolId);
	}

	/**
	 * Handle tool option changes
	 */
	function handleToolOptionChange(key, value) {
		console.log('Tool option changed:', key, '=', value);

		if (key === 'brushSize') {
			editor.tool.setBrushSize(value);
		} else if (key === 'shapeMode') {
			editor.tool.setShapeMode(value);
		} else if (key === 'colorCode') {
			editor.tool.setColor(value);
		}
	}

	/**
	 * Cleanup on component destroy
	 */
	onDestroy(() => {
		if (initialized) {
			PixelCanvas.destroy();
			initialized = false;
		}

		unsubscribeCanvas();
		unsubscribeTool();
	});
</script>

<div class="canvas-wrapper" bind:this={canvasContainer}>
	<canvas id="pixel-canvas"></canvas>
</div>

<style>
	.canvas-wrapper {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--canvas-bg, #0a0a0a);
		position: relative;
		overflow: hidden;
	}

	canvas {
		image-rendering: pixelated;
		image-rendering: crisp-edges;
		image-rendering: -moz-crisp-edges;
		border: 1px solid var(--border);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		cursor: crosshair;
	}
</style>
