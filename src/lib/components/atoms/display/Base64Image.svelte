<!--
  @component Base64Image

  A component that renders Base64-encoded pixel art to a canvas element.
  Accepts the inline.px Base64 format (WIDTHxHEIGHT:BASE64DATA) and displays it
  as crisp pixel art with configurable rendering options.

  @example
  ```svelte
  <Base64Image
    encoded="8x8:AAABBBCCCDDD..."
    scale={4}
    showCheckerboard={true}
    pixelBorders={true}
  />
  ```

  @remarks
  - Uses Svelte 5's $effect rune for reactive rendering
  - Automatically re-renders when props change
  - Delegates rendering to base64ToPng utility functions
  - Supports checkerboard background for transparency visualization
  - Applies pixelated image-rendering for crisp edges
  - Error handling for invalid Base64 strings
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { renderBase64ToCanvas, type Base64ToPngConfig } from '$lib/utils/base64ToPng';

	/**
	 * Props interface for Base64Image component
	 */
	interface Props {
		/** Base64 string in format: WIDTHxHEIGHT:BASE64DATA */
		encoded: string;
		/** Scale multiplier for rendering (1 = original size) */
		scale?: number;
		/** Whether to show checkerboard pattern for transparent pixels */
		showCheckerboard?: boolean;
		/** Optional background color (overrides checkerboard) */
		backgroundColor?: string;
		/** Whether to draw borders around non-transparent pixels */
		pixelBorders?: boolean;
		/** Alt text for accessibility */
		alt?: string;
		/** Additional CSS classes */
		class?: string;
	}

	let {
		encoded,
		scale = 1,
		showCheckerboard = true,
		backgroundColor,
		pixelBorders = false,
		alt = 'Pixel art',
		class: className = ''
	}: Props = $props();

	let canvasElement: HTMLCanvasElement;

	/**
	 * Reactive effect that re-renders the canvas when props change.
	 * Runs whenever encoded, scale, showCheckerboard, backgroundColor, or pixelBorders change.
	 */
	$effect(() => {
		if (canvasElement && encoded) {
			try {
				const config: Partial<Base64ToPngConfig> = {
					scale,
					showCheckerboard,
					backgroundColor,
					pixelBorders
				};
				renderBase64ToCanvas(canvasElement, encoded, config);
			} catch (error) {
				console.error('Failed to render Base64 image:', error);
			}
		}
	});
</script>

<canvas bind:this={canvasElement} class="base64-image {className}" aria-label={alt}></canvas>

<style>
	.base64-image {
		display: block;
		image-rendering: pixelated;
		image-rendering: -moz-crisp-edges;
		image-rendering: crisp-edges;
	}
</style>
