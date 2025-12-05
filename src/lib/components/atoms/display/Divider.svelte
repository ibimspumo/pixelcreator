<!--
  @component Divider

  A simple visual separator component that can be oriented horizontally or vertically.
  Used to create visual separation between UI sections, toolbar groups, or panel content.

  @example
  ```svelte
  <Divider orientation="horizontal" />
  <Divider orientation="vertical" />
  ```

  @remarks
  - Horizontal: 1px height, full width, vertical margins
  - Vertical: 1px width, full height, horizontal margins
  - Uses CSS custom properties for color theming
  - Defaults to horizontal orientation
-->
<script lang="ts">
	/**
	 * Props interface for Divider component
	 */
	interface Props {
		/** Orientation of the divider line */
		orientation?: 'horizontal' | 'vertical';
	}

	let { orientation = 'horizontal' }: Props = $props();
</script>

<div class="divider" class:horizontal={orientation === 'horizontal'} class:vertical={orientation === 'vertical'}></div>

<style>
	.divider {
		background-color: var(--color-border);
	}

	.horizontal {
		width: 100%;
		height: 1px;
		margin: var(--spacing-sm) 0;
	}

	.vertical {
		width: 1px;
		height: 100%;
		margin: 0 var(--spacing-sm);
	}
</style>
