<!--
  @component ToolOptionsPanel

  Displays and manages configurable options for the active tool.
  Dynamically generates UI controls based on tool option schemas with full state persistence.

  @example
  ```svelte
  <ToolOptionsPanel />
  ```

  @remarks
  - Automatically shows options for active tool from canvasStore
  - Supports multiple option types: slider, boolean, number, string, color, select
  - Options are defined in tool configuration (ToolConfigExtended)
  - Dynamic visibility based on option.visible property
  - Full state persistence with localStorage (Phase 1.2 complete)
  - Reactive updates when tool or options change
-->
<script lang="ts">
	import { canvasStore } from '$lib/stores/canvasStore.svelte';
	import { toolRegistry } from '$lib/tools';
	import { toolStateManager } from '$lib/tools/state/ToolStateManager.svelte';
	import type { ToolConfigExtended } from '$lib/tools/base/ToolMetadata';
	import type { ToolOption } from '$lib/tools/base/ToolOptions';

	// Get active tool reactively
	let activeTool = $derived(toolRegistry.getTool(canvasStore.activeTool));

	// Get extended config if available
	let extendedConfig = $derived(activeTool?.config as ToolConfigExtended | undefined);

	// Get options from config
	let options = $derived(extendedConfig?.options || []);

	// Check if tool has any options
	let hasOptions = $derived(options.length > 0);

	/**
	 * Get current value for an option from state manager
	 */
	function getOptionValue(option: ToolOption): any {
		if (!activeTool) return option.defaultValue;
		const toolId = activeTool.config.id;
		const storedValue = toolStateManager.getToolOption(toolId, option.id);
		return storedValue !== undefined ? storedValue : option.defaultValue;
	}

	/**
	 * Update option value in state manager
	 */
	function setOptionValue(option: ToolOption, value: any): void {
		if (!activeTool) return;
		const toolId = activeTool.config.id;
		toolStateManager.setToolOption(toolId, option.id, value);
	}

	/**
	 * Check if an option should be visible
	 */
	function isOptionVisible(option: ToolOption): boolean {
		if (typeof option.visible === 'function') {
			// For now, show all dynamic visibility options
			// TODO: Pass actual ToolContext when needed
			return true;
		}
		return option.visible !== false;
	}
</script>

<div class="tool-options-panel">
	{#if activeTool}
		<div class="panel-header">
			<h3>{activeTool.config.name} Options</h3>
		</div>

		<div class="panel-content">
			{#if hasOptions}
				<div class="options-list">
					{#each options as option}
						{#if isOptionVisible(option)}
							<div class="option-item">
								<div class="option-header">
									<label for={option.id} class="option-label">
										{option.label}
									</label>
									{#if option.description}
										<span class="option-description" title={option.description}>?</span>
									{/if}
								</div>

								<div class="option-control">
									{#if option.type === 'slider'}
										{@const currentValue = getOptionValue(option)}
										<div class="slider-control">
											<input
												type="range"
												id={option.id}
												min={option.min}
												max={option.max}
												step={option.step}
												value={currentValue}
												oninput={(e) => setOptionValue(option, Number(e.currentTarget.value))}
											/>
											<span class="value-display">{currentValue}</span>
										</div>
									{:else if option.type === 'boolean'}
										{@const currentValue = getOptionValue(option)}
										<input
											type="checkbox"
											id={option.id}
											checked={currentValue}
											onchange={(e) => setOptionValue(option, e.currentTarget.checked)}
										/>
									{:else if option.type === 'number'}
										{@const currentValue = getOptionValue(option)}
										<input
											type="number"
											id={option.id}
											min={option.min}
											max={option.max}
											step={option.step}
											value={currentValue}
											oninput={(e) => setOptionValue(option, Number(e.currentTarget.value))}
										/>
									{:else if option.type === 'color'}
										{@const currentValue = getOptionValue(option)}
										<input
											type="color"
											id={option.id}
											value={currentValue}
											oninput={(e) => setOptionValue(option, e.currentTarget.value)}
										/>
									{:else if option.type === 'select' && option.options}
										{@const currentValue = getOptionValue(option)}
										<select
											id={option.id}
											onchange={(e) => setOptionValue(option, e.currentTarget.value)}
										>
											{#each option.options as selectOption}
												<option value={selectOption.value} selected={selectOption.value === currentValue}>
													{selectOption.label}
												</option>
											{/each}
										</select>
									{:else if option.type === 'string'}
										{@const currentValue = getOptionValue(option)}
										<input
											type="text"
											id={option.id}
											value={currentValue}
											oninput={(e) => setOptionValue(option, e.currentTarget.value)}
										/>
									{/if}
								</div>
							</div>
						{/if}
					{/each}
				</div>
			{:else}
				<p class="no-options">This tool has no configurable options.</p>
			{/if}
		</div>
	{:else}
		<p class="no-tool">No tool selected</p>
	{/if}
</div>

<style>
	.tool-options-panel {
		display: flex;
		flex-direction: column;
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.panel-header {
		padding: var(--spacing-md);
		background: var(--color-bg-tertiary);
		border-bottom: 1px solid var(--color-border);
	}

	.panel-header h3 {
		margin: 0;
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.panel-content {
		padding: var(--spacing-md);
	}

	.options-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.option-item {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.option-header {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
	}

	.option-label {
		font-size: var(--text-xs);
		font-weight: 500;
		color: var(--color-text-secondary);
		cursor: pointer;
	}

	.option-description {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 14px;
		height: 14px;
		font-size: 10px;
		font-weight: bold;
		color: var(--color-text-tertiary);
		background: var(--color-bg-tertiary);
		border-radius: 50%;
		cursor: help;
	}

	.option-control {
		width: 100%;
	}

	.slider-control {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.slider-control input[type='range'] {
		flex: 1;
	}

	.value-display {
		min-width: 32px;
		font-size: var(--text-xs);
		font-weight: 500;
		color: var(--color-text-primary);
		text-align: right;
	}

	input[type='range'],
	input[type='number'],
	input[type='text'],
	input[type='color'],
	select {
		width: 100%;
		padding: var(--spacing-xs);
		font-size: var(--text-xs);
		color: var(--color-text-primary);
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
	}

	input[type='range'] {
		padding: 0;
		width: 100%;
	}

	input[type='checkbox'] {
		width: 16px;
		height: 16px;
		cursor: pointer;
	}

	input:disabled,
	select:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.no-options,
	.no-tool {
		font-size: var(--text-xs);
		color: var(--color-text-tertiary);
		font-style: italic;
		text-align: center;
		padding: var(--spacing-lg);
	}
</style>
