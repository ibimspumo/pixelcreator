<!--
  @component +page (Root Route)

  Root page component that conditionally renders either the WelcomeScreen or
  EditorLayout based on whether a project is currently loaded. Acts as the main
  entry point for the application.

  @remarks
  - Reactive conditional rendering based on projectStore.isProjectLoaded
  - WelcomeScreen: Shown when no project is loaded (initial state)
  - EditorLayout: Shown when a project is active
  - No props or local state, purely presentational routing logic
  - Automatically switches when projectStore state changes
-->
<script lang="ts">
	import EditorLayout from '$lib/components/templates/EditorLayout.svelte';
	import WelcomeScreen from '$lib/components/organisms/WelcomeScreen.svelte';
	import { projectStore } from '$lib/stores/projectStore.svelte';
</script>

{#if projectStore.isProjectLoaded}
	<EditorLayout />
{:else}
	<WelcomeScreen />
{/if}
