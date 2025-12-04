<script>
	/**
	 * CanvasSizeDialog - Molecule Component
	 *
	 * Dialog for resizing canvas dimensions.
	 * Validates input and applies changes to canvas.
	 *
	 * @component
	 */
	import Modal from '../atoms/Modal.svelte';
	import NumberInput from '../atoms/NumberInput.svelte';
	import Button from '../atoms/Button.svelte';
	import { editor } from '$lib/stores/editor-simple.svelte.js';
	import PixelCanvas from '../../../../../js/canvas/PixelCanvas.js';

	/** @type {boolean} Is dialog open? */
	export let open = false;

	/** @type {() => void} Close handler */
	export let onclose = () => {};

	const canvasStore = editor.canvas;
	let newWidth = 16;
	let newHeight = 16;

	// Update values when dialog opens
	$: if (open) {
		const state = $canvasStore;
		newWidth = state.width;
		newHeight = state.height;
	}

	/**
	 * Handle width change
	 */
	function handleWidthChange(value) {
		newWidth = value;
	}

	/**
	 * Handle height change
	 */
	function handleHeightChange(value) {
		newHeight = value;
	}

	/**
	 * Handle resize
	 */
	function handleResize() {
		// Validate
		if (newWidth < 2 || newWidth > 128 || newHeight < 2 || newHeight > 128) {
			alert('Canvas size must be between 2×2 and 128×128 pixels');
			return;
		}

		// Apply resize
		editor.canvas.resize(newWidth, newHeight);

		// Update PixelCanvas
		PixelCanvas.resize(newWidth, newHeight);

		console.log(`Canvas resized to ${newWidth}×${newHeight}`);

		// Close dialog
		onclose();
	}

	/**
	 * Handle cancel
	 */
	function handleCancel() {
		onclose();
	}
</script>

<Modal {open} title="Resize Canvas" {onclose}>
	<div class="dialog-content">
		<p class="dialog-description">
			Change the canvas dimensions. Content will be preserved where possible.
		</p>

		<div class="input-grid">
			<NumberInput label="Width" value={newWidth} min={2} max={128} onchange={handleWidthChange} />
			<NumberInput
				label="Height"
				value={newHeight}
				min={2}
				max={128}
				onchange={handleHeightChange}
			/>
		</div>

		<div class="current-size">
			<span class="size-label">Current:</span>
			<span class="size-value">{$canvasStore.width}×{$canvasStore.height}</span>
			<span class="size-arrow">→</span>
			<span class="size-value new">{newWidth}×{newHeight}</span>
		</div>

		<div class="dialog-actions">
			<Button label="Cancel" variant="secondary" onclick={handleCancel} />
			<Button label="Resize" variant="primary" onclick={handleResize} />
		</div>
	</div>
</Modal>

<style>
	.dialog-content {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.dialog-description {
		margin: 0;
		font-size: 14px;
		color: var(--text-secondary);
		line-height: 1.5;
	}

	.input-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}

	.current-size {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		background: var(--bg-tertiary);
		border-radius: var(--radius-sm);
		font-family: 'Courier New', monospace;
	}

	.size-label {
		font-size: 12px;
		color: var(--text-secondary);
		font-weight: 600;
	}

	.size-value {
		font-size: 14px;
		color: var(--text-primary);
		font-weight: 600;
	}

	.size-value.new {
		color: var(--primary);
	}

	.size-arrow {
		color: var(--text-secondary);
		font-size: 16px;
	}

	.dialog-actions {
		display: flex;
		gap: 12px;
		justify-content: flex-end;
		margin-top: 8px;
	}
</style>
