<!--
  @component +layout (Root Layout)

  Root layout component that wraps all pages in the application. Sets the favicon
  and imports global CSS. Uses Svelte 5's new Snippet API for children rendering.

  @remarks
  - Applies global CSS from app.css (CSS custom properties, reset, base styles)
  - Sets favicon using svelte:head
  - Uses Svelte 5's children Snippet for page content rendering
  - Minimal layout with no additional structure or styling
  - All pages inherit this layout automatically
-->
<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
