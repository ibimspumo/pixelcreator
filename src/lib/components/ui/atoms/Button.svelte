<script>
	/**
	 * Button - Atomic UI Component
	 *
	 * Standard button for actions in modals and forms.
	 * Supports primary, secondary, and danger variants.
	 *
	 * @component
	 */

	/** @type {string} Button label */
	export let label = 'Button';

	/** @type {string} Button variant */
	export let variant = 'primary'; // 'primary' | 'secondary' | 'danger'

	/** @type {boolean} Is button disabled? */
	export let disabled = false;

	/** @type {() => void} Click handler */
	export let onclick = () => {};

	$: buttonClass = `btn btn-${variant}`;
</script>

<button class={buttonClass} {disabled} on:click={onclick}>
	{label}
</button>

<style>
	.btn {
		padding: 10px 20px;
		border: 1px solid transparent;
		border-radius: var(--radius-sm);
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s ease;
		text-transform: capitalize;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-primary {
		background: var(--primary);
		color: white;
		border-color: var(--primary);
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--primary-hover);
		border-color: var(--primary-hover);
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(74, 158, 255, 0.3);
	}

	.btn-primary:active:not(:disabled) {
		transform: translateY(0);
	}

	.btn-secondary {
		background: var(--bg-secondary);
		color: var(--text-primary);
		border-color: var(--border);
	}

	.btn-secondary:hover:not(:disabled) {
		background: var(--bg-tertiary);
		border-color: var(--border-hover);
	}

	.btn-danger {
		background: var(--danger-bg);
		color: var(--danger-text);
		border-color: var(--danger-border);
	}

	.btn-danger:hover:not(:disabled) {
		background: rgba(255, 74, 74, 0.2);
		border-color: var(--danger-border-hover);
	}
</style>
