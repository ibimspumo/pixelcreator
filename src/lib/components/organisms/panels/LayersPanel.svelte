<!--
  @component LayersPanel

  Layer management panel displaying all canvas layers in a list with controls
  for adding and deleting layers. Layers are shown from top to bottom (reversed
  from internal storage order). Supports drag & drop reordering.

  @example
  ```svelte
  <LayersPanel />
  ```

  @remarks
  - Layers displayed top-to-bottom (reversed from storage order)
  - Each layer shows: thumbnail, name, visibility, lock, duplicate, reorder
  - Add layer button creates new layer with auto-incremented name
  - Delete button removes active layer (disabled when only one layer exists)
  - Drag & drop reordering with visual feedback
  - Integrates with canvasStore for all layer operations
  - Uses $derived rune for reactive display layer array
  - Scrollable layer list with fixed action buttons at bottom
-->
<script lang="ts">
	import Panel from '$lib/components/atoms/display/Panel.svelte';
	import IconButton from '$lib/components/atoms/buttons/IconButton.svelte';
	import LayerItem from '$lib/components/molecules/layer/LayerItem.svelte';
	import { Plus, Trash2 } from '@lucide/svelte';
	import { canvasStore } from '$lib/stores/canvasStore.svelte';

	/**
	 * Adds a new layer with auto-incremented name
	 */
	function addNewLayer() {
		canvasStore.addLayer(`Layer ${canvasStore.layers.length + 1}`);
	}

	/**
	 * Deletes a layer by ID
	 */
	function deleteLayer(layerId: string) {
		canvasStore.removeLayer(layerId);
	}

	// Layers are rendered from top to bottom in UI, but stored bottom to top
	// So we need to reverse the array for display
	let displayLayers = $derived([...canvasStore.layers].reverse());

	// Drag & Drop state
	let draggedLayerId = $state<string | null>(null);
	let dragOverLayerId = $state<string | null>(null);

	/**
	 * Returns drag start handler for a specific layer
	 */
	function handleDragStart(layerId: string) {
		return (e: DragEvent) => {
			draggedLayerId = layerId;
			if (e.dataTransfer) {
				e.dataTransfer.effectAllowed = 'move';
				e.dataTransfer.setData('text/plain', layerId);
			}
		};
	}

	/**
	 * Returns drag over handler for a specific layer
	 */
	function handleDragOver(layerId: string) {
		return (e: DragEvent) => {
			e.preventDefault();
			if (draggedLayerId && draggedLayerId !== layerId) {
				dragOverLayerId = layerId;
			}
		};
	}

	/**
	 * Returns drop handler for a specific layer to handle reordering
	 */
	function handleDrop(targetLayerId: string) {
		return (e: DragEvent) => {
			e.preventDefault();
			if (!draggedLayerId || draggedLayerId === targetLayerId) return;

			// Get indices in the actual store array
			const draggedIndex = canvasStore.layers.findIndex((l) => l.id === draggedLayerId);
			const targetIndex = canvasStore.layers.findIndex((l) => l.id === targetLayerId);

			if (draggedIndex === -1 || targetIndex === -1) return;

			// Reorder layers in store
			const newLayers = [...canvasStore.layers];
			const [removed] = newLayers.splice(draggedIndex, 1);
			newLayers.splice(targetIndex, 0, removed);

			// Update store with reordered layers
			canvasStore.reorderLayers(newLayers);

			draggedLayerId = null;
			dragOverLayerId = null;
		};
	}

	/**
	 * Resets drag state when drag operation ends
	 */
	function handleDragEnd() {
		draggedLayerId = null;
		dragOverLayerId = null;
	}
</script>

<Panel title="Layers">
	<div class="layers-panel">
		<div class="layers-list">
			{#each displayLayers as layer, index (layer.id)}
				{@const reversedIndex = canvasStore.layers.length - 1 - index}
				<LayerItem
					{layer}
					canvasWidth={canvasStore.width}
					canvasHeight={canvasStore.height}
					isActive={layer.id === canvasStore.activeLayerId}
					canMoveUp={index > 0}
					canMoveDown={index < displayLayers.length - 1}
					onSelect={() => canvasStore.setActiveLayer(layer.id)}
					onToggleVisibility={() => canvasStore.toggleLayerVisibility(layer.id)}
					onToggleLock={() => canvasStore.toggleLayerLock(layer.id)}
					onDuplicate={() => canvasStore.duplicateLayer(layer.id)}
					onMoveUp={() => canvasStore.moveLayerUp(layer.id)}
					onMoveDown={() => canvasStore.moveLayerDown(layer.id)}
					onRename={(newName) => canvasStore.renameLayer(layer.id, newName)}
					onDragStart={handleDragStart(layer.id)}
					onDragOver={handleDragOver(layer.id)}
					onDrop={handleDrop(layer.id)}
					onDragEnd={handleDragEnd}
				/>
			{/each}
		</div>

		<div class="layers-actions">
			<IconButton icon={Plus} title="New Layer" size="sm" onclick={addNewLayer} />
			<IconButton
				icon={Trash2}
				title="Delete Layer"
				size="sm"
				onclick={() => canvasStore.activeLayerId && deleteLayer(canvasStore.activeLayerId)}
				disabled={canvasStore.layers.length <= 1}
			/>
		</div>
	</div>
</Panel>

<style>
	.layers-panel {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
		height: 100%;
	}

	.layers-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
		flex: 1;
		overflow-y: auto;
		padding: 2px;
	}

	.layers-actions {
		display: flex;
		gap: var(--spacing-xs);
		padding-top: var(--spacing-sm);
		border-top: 1px solid var(--color-border);
	}
</style>
