<script>
	/**
	 * Modal - Atomic UI Component
	 *
	 * Modal dialog overlay with backdrop.
	 * Used as base for all dialog types.
	 *
	 * @component
	 */
	import { onMount } from 'svelte';
	import * as icons from '@lucide/svelte';

	/** @type {string} Modal title */
	export let title = 'Dialog';

	/** @type {boolean} Is modal open? */
	export let open = false;

	/** @type {() => void} Close handler */
	export let onclose = () => {};

	/**
	 * Handle escape key
	 * @param {KeyboardEvent} event
	 */
	function handleKeydown(event) {
		if (event.key === 'Escape' && open) {
			onclose();
		}
	}

	/**
	 * Handle backdrop click
	 * @param {MouseEvent} event
	 */
	function handleBackdropClick(event) {
		if (event.target === event.currentTarget) {
			onclose();
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});
</script>

{#if open}
	<div class="modal-backdrop" on:click={handleBackdropClick}>
		<div class="modal">
			<div class="modal-header">
				<h2 class="modal-title">{title}</h2>
				<button class="modal-close" on:click={onclose} title="Close (Esc)">
					<svelte:component this={icons.X} size={20} />
				</button>
			</div>

			<div class="modal-content">
				<slot />
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		backdrop-filter: blur(4px);
	}

	.modal {
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
		max-width: 500px;
		width: 90%;
		max-height: 80vh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px 24px;
		border-bottom: 1px solid var(--border);
	}

	.modal-title {
		font-size: 18px;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0;
	}

	.modal-close {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 6px;
		background: transparent;
		border: none;
		border-radius: var(--radius-sm);
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.modal-close:hover {
		background: var(--bg-tertiary);
		color: var(--text-primary);
	}

	.modal-content {
		padding: 24px;
		overflow-y: auto;
	}
</style>
