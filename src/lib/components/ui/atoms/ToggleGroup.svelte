<script>
	/**
	 * ToggleGroup - Atomic UI Component
	 *
	 * Group of toggle buttons for selecting one option from multiple.
	 * Used for shape mode (fill/stroke) and other enum options.
	 *
	 * @component
	 */

	/** @type {string} Group label */
	export let label = 'Options';

	/** @type {Array<{value: string, label: string}>} Available options */
	export let options = [];

	/** @type {string} Currently selected value */
	export let value = '';

	/** @type {(value: string) => void} Change handler */
	export let onchange = (value) => {};

	/**
	 * Handle option selection
	 * @param {string} newValue
	 */
	function handleSelect(newValue) {
		onchange(newValue);
	}
</script>

<div class="toggle-group">
	<label class="toggle-label">{label}</label>
	<div class="toggle-buttons">
		{#each options as option (option.value)}
			<button
				class="toggle-btn"
				class:active={value === option.value}
				on:click={() => handleSelect(option.value)}
			>
				{option.label}
			</button>
		{/each}
	</div>
</div>

<style>
	.toggle-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.toggle-label {
		font-size: 12px;
		font-weight: 600;
		color: var(--text-primary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.toggle-buttons {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 6px;
	}

	.toggle-btn {
		padding: 8px 12px;
		background: var(--bg-tertiary);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		color: var(--text-secondary);
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s ease;
		text-transform: capitalize;
	}

	.toggle-btn:hover:not(.active) {
		background: var(--bg-secondary);
		border-color: var(--border-hover);
		color: var(--text-primary);
	}

	.toggle-btn.active {
		background: var(--primary);
		border-color: var(--primary);
		color: white;
		font-weight: 600;
	}
</style>
