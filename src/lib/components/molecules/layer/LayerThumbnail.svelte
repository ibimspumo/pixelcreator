<!--
  @component LayerThumbnail

  Displays a small thumbnail preview of a layer's pixel content. Uses the $derived rune
  to reactively generate a data URL when the layer or its pixels change. The thumbnail
  shows a checkerboard pattern for transparent pixels.

  @example
  ```svelte
  <LayerThumbnail
    layer={layer}
    width={canvasWidth}
    height={canvasHeight}
    size={40}
  />
  ```

  @remarks
  - Uses $derived rune for automatic reactivity when layer pixels change
  - Delegates PNG generation to pngExport utility functions
  - Checkerboard background shows transparent areas
  - Pixelated image rendering for crisp edges
  - Fixed size with configurable dimensions
-->
<script lang="ts">
	import { getLayerAsDataURL } from '$lib/utils/pngExport';
	import type { Layer } from '$lib/types/canvas.types';

	/**
	 * Props interface for LayerThumbnail component
	 */
	interface Props {
		/** Layer object containing pixel data */
		layer: Layer;
		/** Canvas width in pixels */
		width: number;
		/** Canvas height in pixels */
		height: number;
		/** Thumbnail display size in pixels */
		size?: number;
	}

	let { layer, width, height, size = 32 }: Props = $props();

	/**
	 * Reactively generates a data URL for the layer thumbnail.
	 * Automatically updates when layer pixels change.
	 */
	let thumbnailURL = $derived(
		getLayerAsDataURL(layer, width, height, {
			scale: 1,
			showCheckerboard: true
		})
	);
</script>

<img
	src={thumbnailURL}
	alt="{layer.name} thumbnail"
	class="layer-thumbnail"
	style="width: {size}px; height: {size}px;"
/>

<style>
	.layer-thumbnail {
		display: block;
		border-radius: var(--radius-sm);
		image-rendering: pixelated;
		image-rendering: -moz-crisp-edges;
		image-rendering: crisp-edges;
		border: 1px solid var(--color-border);
	}
</style>
