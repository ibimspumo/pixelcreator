<script>
	/**
	 * ZoomControls - Molecule Component
	 *
	 * Zoom control buttons for canvas view.
	 * Integrates with existing viewport.js module.
	 *
	 * @component
	 */
	import IconButton from '../atoms/IconButton.svelte';
	import Viewport from '../../../../../js/viewport.js';
	import { onMount } from 'svelte';

	let currentZoom = 100;

	/**
	 * Handle zoom in
	 */
	function handleZoomIn() {
		Viewport.zoomIn();
		updateZoomDisplay();
		console.log('Zoom in');
	}

	/**
	 * Handle zoom out
	 */
	function handleZoomOut() {
		Viewport.zoomOut();
		updateZoomDisplay();
		console.log('Zoom out');
	}

	/**
	 * Handle zoom reset
	 */
	function handleZoomReset() {
		Viewport.resetView();
		updateZoomDisplay();
		console.log('Zoom reset');
	}

	/**
	 * Update zoom display
	 */
	function updateZoomDisplay() {
		const state = Viewport.getState();
		currentZoom = Math.round(state.zoom * 100);
	}

	onMount(() => {
		updateZoomDisplay();
		console.log('ZoomControls mounted');
	});
</script>

<div class="zoom-controls">
	<IconButton icon="ZoomOut" title="Zoom Out" onclick={handleZoomOut} />
	<div class="zoom-display">{currentZoom}%</div>
	<IconButton icon="ZoomIn" title="Zoom In" onclick={handleZoomIn} />
	<IconButton icon="RotateCcw" title="Reset Zoom" onclick={handleZoomReset} />
</div>

<style>
	.zoom-controls {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.zoom-display {
		min-width: 48px;
		text-align: center;
		font-size: 12px;
		font-weight: 600;
		font-family: 'Courier New', monospace;
		color: var(--text-secondary);
		padding: 0 4px;
	}
</style>
