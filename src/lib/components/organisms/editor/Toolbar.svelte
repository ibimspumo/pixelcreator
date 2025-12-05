<!--
  @component Toolbar

  Vertical toolbar displaying all available pixel art tools organized into groups.
  Each tool has a keyboard shortcut hint in its tooltip. The toolbar maintains
  local state for the active tool (not yet connected to global tool state).

  @example
  ```svelte
  <Toolbar />
  ```

  @remarks
  - Fixed width: 52px for compact layout
  - Tool groups separated by horizontal dividers
  - Groups: Move/Hand | Pencil/Eraser/Bucket/Eyedropper | Rectangle/Ellipse | Zoom
  - Local $state for activeTool (future: connect to global tool state)
  - Keyboard shortcuts shown in tooltips (V, H, B, E, G, I, U, Z)
  - Active tool displays with accent background
  - TODO: Most tools not yet implemented, only visual UI
-->
<script lang="ts">
	import IconButton from '$lib/components/atoms/buttons/IconButton.svelte';
	import Divider from '$lib/components/atoms/display/Divider.svelte';
	import {
		Pencil,
		Eraser,
		PaintBucket,
		Pipette,
		Hand,
		ZoomIn,
		Square,
		Circle,
		Move
	} from '@lucide/svelte';

	// Local tool state (not yet connected to global state)
	let activeTool = $state('pencil');
</script>

<div class="toolbar">
	<div class="toolbar-section">
		<IconButton
			icon={Move}
			title="Move Tool (V)"
			active={activeTool === 'move'}
			onclick={() => (activeTool = 'move')}
		/>
		<IconButton
			icon={Hand}
			title="Hand Tool (H)"
			active={activeTool === 'hand'}
			onclick={() => (activeTool = 'hand')}
		/>
	</div>

	<Divider orientation="horizontal" />

	<div class="toolbar-section">
		<IconButton
			icon={Pencil}
			title="Pencil Tool (B)"
			active={activeTool === 'pencil'}
			onclick={() => (activeTool = 'pencil')}
		/>
		<IconButton
			icon={Eraser}
			title="Eraser Tool (E)"
			active={activeTool === 'eraser'}
			onclick={() => (activeTool = 'eraser')}
		/>
		<IconButton
			icon={PaintBucket}
			title="Paint Bucket Tool (G)"
			active={activeTool === 'bucket'}
			onclick={() => (activeTool = 'bucket')}
		/>
		<IconButton
			icon={Pipette}
			title="Eyedropper Tool (I)"
			active={activeTool === 'eyedropper'}
			onclick={() => (activeTool = 'eyedropper')}
		/>
	</div>

	<Divider orientation="horizontal" />

	<div class="toolbar-section">
		<IconButton
			icon={Square}
			title="Rectangle Tool (U)"
			active={activeTool === 'rectangle'}
			onclick={() => (activeTool = 'rectangle')}
		/>
		<IconButton
			icon={Circle}
			title="Ellipse Tool (U)"
			active={activeTool === 'ellipse'}
			onclick={() => (activeTool = 'ellipse')}
		/>
	</div>

	<Divider orientation="horizontal" />

	<div class="toolbar-section">
		<IconButton icon={ZoomIn} title="Zoom Tool (Z)" active={activeTool === 'zoom'} onclick={() => (activeTool = 'zoom')} />
	</div>
</div>

<style>
	.toolbar {
		display: flex;
		flex-direction: column;
		width: 52px;
		background-color: var(--color-bg-secondary);
		border-right: 1px solid var(--color-border);
		padding: var(--spacing-sm);
		gap: var(--spacing-xs);
		user-select: none;
	}

	.toolbar-section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}
</style>
