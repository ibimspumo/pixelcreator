<!--
  @component Panel

  A container component that provides a styled panel with an optional header.
  Used as a wrapper for sidebar panels like Colors, Layers, and Tool Properties.
  Features scrollable content area and consistent spacing.

  @example
  ```svelte
  <Panel title="Layers">
    <div>Panel content goes here</div>
  </Panel>
  ```

  @remarks
  - Optional title displays in uppercase header with background
  - Content area is scrollable and fills available space
  - Uses Svelte 5's Snippet API for content slot
  - Consistent styling with CSS custom properties
  - Full height with flex layout
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * Props interface for Panel component
	 */
	interface Props {
		/** Optional panel title displayed in header */
		title?: string;
		/** Content to render inside the panel body */
		children: Snippet;
	}

	let { title, children }: Props = $props();
</script>

<div class="panel">
	{#if title}
		<div class="panel-header">
			<span class="panel-title">{title}</span>
		</div>
	{/if}
	<div class="panel-content">
		{@render children()}
	</div>
</div>

<style>
	.panel {
		display: flex;
		flex-direction: column;
		background-color: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		overflow: hidden;
		height: 100%;
	}

	.panel-header {
		display: flex;
		align-items: center;
		padding: var(--spacing-sm) var(--spacing-md);
		background-color: var(--color-bg-tertiary);
		border-bottom: 1px solid var(--color-border);
		min-height: 32px;
	}

	.panel-title {
		font-size: var(--font-size-sm);
		font-weight: 600;
		color: var(--color-text-primary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.panel-content {
		flex: 1;
		overflow: auto;
		padding: var(--spacing-md);
		box-sizing: border-box;
		width: 100%;
	}
</style>
