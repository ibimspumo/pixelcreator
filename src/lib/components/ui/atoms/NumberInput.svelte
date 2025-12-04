<script>
	/**
	 * NumberInput - Atomic UI Component
	 *
	 * Number input field with label and validation.
	 * Used for canvas dimensions, layer properties, etc.
	 *
	 * @component
	 */

	/** @type {string} Input label */
	export let label = 'Value';

	/** @type {number} Current value */
	export let value = 0;

	/** @type {number} Minimum value */
	export let min = 0;

	/** @type {number} Maximum value */
	export let max = 100;

	/** @type {number} Step increment */
	export let step = 1;

	/** @type {(value: number) => void} Change handler */
	export let onchange = (value) => {};

	/**
	 * Handle input change
	 * @param {Event} event
	 */
	function handleChange(event) {
		let newValue = parseInt(event.target.value, 10);

		// Validate bounds
		if (isNaN(newValue)) newValue = min;
		if (newValue < min) newValue = min;
		if (newValue > max) newValue = max;

		onchange(newValue);
	}

	/**
	 * Handle input keydown
	 * @param {KeyboardEvent} event
	 */
	function handleKeydown(event) {
		// Arrow up/down
		if (event.key === 'ArrowUp') {
			event.preventDefault();
			const newValue = Math.min(max, value + step);
			onchange(newValue);
		} else if (event.key === 'ArrowDown') {
			event.preventDefault();
			const newValue = Math.max(min, value - step);
			onchange(newValue);
		}
	}
</script>

<div class="number-input-container">
	<label class="number-input-label" for={`input-${label}`}>{label}</label>
	<input
		id={`input-${label}`}
		type="number"
		class="number-input"
		{min}
		{max}
		{step}
		{value}
		on:input={handleChange}
		on:keydown={handleKeydown}
	/>
</div>

<style>
	.number-input-container {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.number-input-label {
		font-size: 12px;
		font-weight: 600;
		color: var(--text-primary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.number-input {
		padding: 8px 12px;
		background: var(--bg-tertiary);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		color: var(--text-primary);
		font-size: 14px;
		font-family: 'Courier New', monospace;
		font-weight: 500;
		outline: none;
		transition: all 0.15s ease;
	}

	.number-input:hover {
		border-color: var(--border-hover);
	}

	.number-input:focus {
		border-color: var(--primary);
		box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.2);
	}

	/* Remove number input spinners */
	.number-input::-webkit-inner-spin-button,
	.number-input::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.number-input[type='number'] {
		-moz-appearance: textfield;
	}
</style>
