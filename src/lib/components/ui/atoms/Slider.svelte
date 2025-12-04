<script>
	/**
	 * Slider - Atomic UI Component
	 *
	 * Range slider input with label and value display.
	 * Used for brush size and other numeric options.
	 *
	 * @component
	 */

	/** @type {string} Slider label */
	export let label = 'Value';

	/** @type {number} Current value */
	export let value = 1;

	/** @type {number} Minimum value */
	export let min = 1;

	/** @type {number} Maximum value */
	export let max = 10;

	/** @type {number} Step increment */
	export let step = 1;

	/** @type {(value: number) => void} Change handler */
	export let onchange = (value) => {};

	/**
	 * Handle input change
	 * @param {Event} event
	 */
	function handleChange(event) {
		const newValue = parseInt(event.target.value, 10);
		onchange(newValue);
	}
</script>

<div class="slider-container">
	<div class="slider-header">
		<label class="slider-label">{label}</label>
		<span class="slider-value">{value}</span>
	</div>
	<input
		type="range"
		class="slider"
		{min}
		{max}
		{step}
		{value}
		on:input={handleChange}
	/>
</div>

<style>
	.slider-container {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.slider-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.slider-label {
		font-size: 12px;
		font-weight: 600;
		color: var(--text-primary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.slider-value {
		font-size: 14px;
		font-weight: 600;
		color: var(--primary);
		font-family: 'Courier New', monospace;
		min-width: 24px;
		text-align: right;
	}

	.slider {
		width: 100%;
		height: 6px;
		border-radius: 3px;
		background: var(--bg-tertiary);
		outline: none;
		-webkit-appearance: none;
		appearance: none;
		cursor: pointer;
	}

	.slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: var(--primary);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.slider::-webkit-slider-thumb:hover {
		transform: scale(1.2);
		box-shadow: 0 0 0 4px rgba(74, 158, 255, 0.2);
	}

	.slider::-moz-range-thumb {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: var(--primary);
		cursor: pointer;
		border: none;
		transition: all 0.15s ease;
	}

	.slider::-moz-range-thumb:hover {
		transform: scale(1.2);
		box-shadow: 0 0 0 4px rgba(74, 158, 255, 0.2);
	}

	.slider::-webkit-slider-runnable-track {
		height: 6px;
		border-radius: 3px;
		background: var(--bg-tertiary);
	}

	.slider::-moz-range-track {
		height: 6px;
		border-radius: 3px;
		background: var(--bg-tertiary);
	}
</style>
