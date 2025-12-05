<!--
  @component LayerItem

  A complex layer management component that displays a layer's thumbnail, name, and controls.
  Supports inline name editing, drag & drop reordering, and various layer operations.
  Used within the LayersPanel to represent individual layers in the canvas.

  @example
  ```svelte
  <LayerItem
    {layer}
    {canvasWidth}
    {canvasHeight}
    isActive={activeLayerId === layer.id}
    canMoveUp={index < layers.length - 1}
    canMoveDown={index > 0}
    onSelect={() => selectLayer(layer.id)}
    onToggleVisibility={() => toggleVisibility(layer.id)}
    onToggleLock={() => toggleLock(layer.id)}
    onDuplicate={() => duplicateLayer(layer.id)}
    onMoveUp={() => moveLayerUp(layer.id)}
    onMoveDown={() => moveLayerDown(layer.id)}
    onRename={(newName) => renameLayer(layer.id, newName)}
    onDragStart={handleDragStart}
    onDrop={handleDrop}
  />
  ```

  @remarks
  - Double-click layer name to enter inline editing mode
  - Enter confirms, Escape cancels name editing
  - Drag handle allows layer reordering with visual feedback
  - Active layer displays with accent border and shadow
  - Visibility, lock, and duplicate actions available
  - Up/Down buttons for layer reordering (disabled at boundaries)
  - Status badges show hidden/locked state
  - Displays layer dimensions and thumbnail preview
-->
<script lang="ts">
	import LayerThumbnail from './LayerThumbnail.svelte';
	import IconButton from '$lib/components/atoms/buttons/IconButton.svelte';
	import { Eye, EyeOff, Lock, Unlock, Copy, ChevronUp, ChevronDown, GripVertical } from '@lucide/svelte';
	import type { Layer } from '$lib/types/canvas.types';

	/**
	 * Props interface for LayerItem component
	 */
	interface Props {
		/** Layer data object */
		layer: Layer;
		/** Canvas width for dimension display */
		canvasWidth: number;
		/** Canvas height for dimension display */
		canvasHeight: number;
		/** Whether this layer is currently active/selected */
		isActive: boolean;
		/** Whether the layer can be moved up in the stack */
		canMoveUp: boolean;
		/** Whether the layer can be moved down in the stack */
		canMoveDown: boolean;
		/** Callback when layer is selected */
		onSelect: () => void;
		/** Callback to toggle layer visibility */
		onToggleVisibility: () => void;
		/** Callback to toggle layer lock status */
		onToggleLock: () => void;
		/** Callback to duplicate this layer */
		onDuplicate: () => void;
		/** Callback to move layer up in stack */
		onMoveUp: () => void;
		/** Callback to move layer down in stack */
		onMoveDown: () => void;
		/** Callback when layer is renamed */
		onRename: (newName: string) => void;
		/** Drag and drop event handlers */
		onDragStart?: (e: DragEvent) => void;
		onDragOver?: (e: DragEvent) => void;
		onDrop?: (e: DragEvent) => void;
		onDragEnd?: (e: DragEvent) => void;
	}

	let {
		layer,
		canvasWidth,
		canvasHeight,
		isActive,
		canMoveUp,
		canMoveDown,
		onSelect,
		onToggleVisibility,
		onToggleLock,
		onDuplicate,
		onMoveUp,
		onMoveDown,
		onRename,
		onDragStart,
		onDragOver,
		onDrop,
		onDragEnd
	}: Props = $props();

	// Local state for editing and dragging
	let isEditing = $state(false);
	let editName = $state(layer.name);
	let isDragging = $state(false);

	/**
	 * Enters inline name editing mode
	 */
	function startEditing() {
		isEditing = true;
		editName = layer.name;
	}

	/**
	 * Finishes editing and saves the new name if changed
	 */
	function finishEditing() {
		if (editName.trim() && editName !== layer.name) {
			onRename(editName.trim());
		}
		isEditing = false;
	}

	/**
	 * Handles keyboard shortcuts during name editing
	 * @param e - Keyboard event
	 */
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			finishEditing();
		} else if (e.key === 'Escape') {
			editName = layer.name;
			isEditing = false;
		}
	}

	/**
	 * Handles drag start for layer reordering
	 */
	function handleDragStart(e: DragEvent) {
		isDragging = true;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
		}
		onDragStart?.(e);
	}

	/**
	 * Handles drag end to reset visual state
	 */
	function handleDragEnd(e: DragEvent) {
		isDragging = false;
		onDragEnd?.(e);
	}

	/**
	 * Handles drag over to allow dropping
	 */
	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'move';
		}
		onDragOver?.(e);
	}

	/**
	 * Handles drop event for layer reordering
	 */
	function handleDrop(e: DragEvent) {
		e.preventDefault();
		onDrop?.(e);
	}
</script>

<div
	class="layer-item"
	class:active={isActive}
	class:dragging={isDragging}
	onclick={onSelect}
	draggable="true"
	ondragstart={handleDragStart}
	ondragend={handleDragEnd}
	ondragover={handleDragOver}
	ondrop={handleDrop}
>
	<!-- Drag Handle -->
	<div class="drag-handle" title="Drag to reorder">
		<GripVertical size={16} />
	</div>

	<!-- Thumbnail -->
	<div class="layer-thumbnail-wrapper">
		<LayerThumbnail {layer} width={canvasWidth} height={canvasHeight} size={40} />
	</div>

	<!-- Layer Info -->
	<div class="layer-info">
		{#if isEditing}
			<input
				type="text"
				class="layer-name-input"
				bind:value={editName}
				onblur={finishEditing}
				onkeydown={handleKeydown}
				onclick={(e) => e.stopPropagation()}
				autofocus
			/>
		{:else}
			<span class="layer-name" ondblclick={(e) => {
				e.stopPropagation();
				startEditing();
			}}>
				{layer.name}
			</span>
		{/if}
		<div class="layer-meta">
			<span class="layer-size">{canvasWidth}×{canvasHeight}</span>
			{#if !layer.visible}
				<span class="layer-status">Hidden</span>
			{/if}
			{#if layer.locked}
				<span class="layer-status">Locked</span>
			{/if}
		</div>
	</div>

	<!-- Actions -->
	<div class="layer-actions" onclick={(e) => e.stopPropagation()}>
		<!-- Reorder buttons -->
		<div class="layer-reorder">
			<button
				class="reorder-btn"
				onclick={onMoveUp}
				disabled={!canMoveUp}
				title="Move layer up"
			>
				<ChevronUp size={14} />
			</button>
			<button
				class="reorder-btn"
				onclick={onMoveDown}
				disabled={!canMoveDown}
				title="Move layer down"
			>
				<ChevronDown size={14} />
			</button>
		</div>

		<!-- Toggle buttons -->
		<button
			class="action-btn"
			onclick={onToggleVisibility}
			title={layer.visible ? 'Hide layer' : 'Show layer'}
		>
			{#if layer.visible}
				<Eye size={16} />
			{:else}
				<EyeOff size={16} />
			{/if}
		</button>

		<button
			class="action-btn"
			onclick={onToggleLock}
			title={layer.locked ? 'Unlock layer' : 'Lock layer'}
		>
			{#if layer.locked}
				<Lock size={16} />
			{:else}
				<Unlock size={16} />
			{/if}
		</button>

		<button class="action-btn" onclick={onDuplicate} title="Duplicate layer">
			<Copy size={16} />
		</button>
	</div>
</div>

<style>
	.layer-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-sm);
		background-color: var(--color-bg-tertiary);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-md);
		cursor: grab;
		transition: all var(--transition-fast);
		width: 100%;
	}

	.layer-item:hover {
		background-color: var(--color-bg-elevated);
		border-color: var(--color-border-hover, var(--color-border));
	}

	.layer-item.active {
		border-color: var(--color-accent);
		background-color: var(--color-bg-elevated);
		box-shadow: 0 0 0 1px var(--color-accent);
	}

	.layer-item.dragging {
		opacity: 0.5;
		cursor: grabbing;
	}

	.drag-handle {
		display: flex;
		align-items: center;
		color: var(--color-text-secondary);
		cursor: grab;
		padding: 2px;
		flex-shrink: 0;
	}

	.drag-handle:hover {
		color: var(--color-text-primary);
	}

	.layer-item.dragging .drag-handle {
		cursor: grabbing;
	}

	.layer-thumbnail-wrapper {
		flex-shrink: 0;
	}

	.layer-info {
		display: flex;
		flex-direction: column;
		gap: 4px;
		flex: 1;
		min-width: 0;
	}

	.layer-name {
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--color-text-primary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.layer-name-input {
		font-size: var(--font-size-sm);
		font-weight: 500;
		padding: 2px 4px;
		background: var(--color-bg-primary);
		border: 1px solid var(--color-accent);
		border-radius: var(--radius-sm);
		color: var(--color-text-primary);
		width: 100%;
	}

	.layer-name-input:focus {
		outline: none;
		border-color: var(--color-accent);
	}

	.layer-meta {
		display: flex;
		gap: var(--spacing-xs);
		font-size: var(--font-size-xs);
		color: var(--color-text-secondary);
	}

	.layer-size {
		font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
	}

	.layer-status {
		padding: 0 4px;
		background: var(--color-bg-tertiary);
		border-radius: var(--radius-sm);
	}

	.layer-actions {
		display: flex;
		align-items: center;
		gap: 4px;
		flex-shrink: 0;
	}

	.layer-reorder {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.reorder-btn,
	.action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		color: var(--color-text-secondary);
		cursor: pointer;
		padding: 2px;
		border-radius: var(--radius-sm);
		transition: all var(--transition-fast);
	}

	.reorder-btn {
		width: 20px;
		height: 12px;
	}

	.action-btn {
		width: 24px;
		height: 24px;
	}

	.reorder-btn:hover:not(:disabled),
	.action-btn:hover {
		background: var(--color-bg-tertiary);
		color: var(--color-text-primary);
	}

	.reorder-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.action-btn:active {
		transform: scale(0.95);
	}
</style>
