<!--
  @component HelpPanel

  In-app help system displaying tool documentation with search functionality.

  @example
  ```svelte
  <HelpPanel
    isOpen={showHelp}
    activeTool={currentTool}
    onclose={() => showHelp = false}
  />
  ```

  @remarks
  - Shows documentation for active tool by default
  - Supports full-text search across all tools
  - Keyboard shortcuts: F1 to open, Escape to close
  - Displays tool options, usage tips, and related tools
  - Auto-scrolls to active tool documentation
-->
<script lang="ts">
	import { X, Search, BookOpen } from '@lucide/svelte';
	import { toolDocs } from '$lib/tools/docs/generated-tool-docs';
	import type { Tool } from '$lib/types/canvas.types';

	/**
	 * Props interface for HelpPanel component
	 */
	interface Props {
		/** Whether the help panel is visible */
		isOpen: boolean;
		/** Currently active tool ID */
		activeTool?: Tool;
		/** Callback when panel is closed */
		onclose?: () => void;
	}

	let { isOpen = false, activeTool, onclose }: Props = $props();

	// Local state
	let searchQuery = $state('');
	let selectedToolId = $state<string | null>(null);

	/**
	 * Filter tools based on search query
	 */
	let filteredTools = $derived(() => {
		if (!searchQuery.trim()) {
			return Object.values(toolDocs);
		}

		const query = searchQuery.toLowerCase();
		return Object.values(toolDocs).filter((tool) => {
			const searchText = [
				tool.name,
				tool.description,
				tool.category,
				...(tool.tags || []),
				tool.documentation?.description,
				tool.documentation?.usage,
				...(tool.documentation?.tips || [])
			]
				.filter(Boolean)
				.join(' ')
				.toLowerCase();

			return searchText.includes(query);
		});
	});

	/**
	 * Get the currently displayed tool documentation
	 */
	let currentDoc = $derived(() => {
		const toolId = selectedToolId || activeTool || null;
		if (!toolId) return null;

		return toolDocs[toolId as keyof typeof toolDocs] || null;
	});

	/**
	 * Handle tool selection from list
	 */
	function selectTool(toolId: string) {
		selectedToolId = toolId;
		searchQuery = '';
	}

	/**
	 * Handle close button click
	 */
	function handleClose() {
		onclose?.();
		selectedToolId = null;
		searchQuery = '';
	}

	/**
	 * Reset to show active tool
	 */
	function showActiveTool() {
		selectedToolId = null;
		searchQuery = '';
	}
</script>

{#if isOpen}
	<div class="help-overlay" onclick={handleClose}>
		<div class="help-panel" onclick={(e) => e.stopPropagation()}>
			<!-- Header -->
			<div class="help-header">
				<div class="help-title">
					<BookOpen size={24} />
					<h2>Tool Documentation</h2>
				</div>
				<button class="close-button" onclick={handleClose} title="Close (Esc)">
					<X size={20} />
				</button>
			</div>

			<!-- Content -->
			<div class="help-content">
				<!-- Sidebar with tool list -->
				<div class="help-sidebar">
					<!-- Search -->
					<div class="search-box">
						<Search size={16} />
						<input
							type="text"
							placeholder="Search tools..."
							bind:value={searchQuery}
							class="search-input"
						/>
					</div>

					<!-- Tool list -->
					<div class="tool-list">
						{#each filteredTools() as tool (tool.id)}
							<button
								class="tool-item"
								class:active={currentDoc()?.id === tool.id}
								onclick={() => selectTool(tool.id)}
							>
								<div class="tool-item-name">{tool.name}</div>
								{#if tool.shortcut}
									<div class="tool-item-shortcut">{tool.shortcut}</div>
								{/if}
							</button>
						{/each}

						{#if filteredTools().length === 0}
							<div class="no-results">No tools found</div>
						{/if}
					</div>
				</div>

				<!-- Main documentation area -->
				<div class="help-main">
					{#if currentDoc()}
						{@const doc = currentDoc()!}

						<!-- Tool header -->
						<div class="doc-header">
							<h1 class="doc-title">
								{doc.name}
								{#if doc.shortcut}
									<span class="doc-shortcut">({doc.shortcut})</span>
								{/if}
							</h1>
							<p class="doc-description">{doc.description}</p>
						</div>

						<!-- Info -->
						<div class="doc-section">
							<h3>Info</h3>
							<ul class="doc-info">
								<li><strong>Category:</strong> {doc.category}</li>
								{#if doc.version}
									<li><strong>Version:</strong> {doc.version}</li>
								{/if}
								{#if doc.author}
									<li><strong>Author:</strong> {doc.author}</li>
								{/if}
							</ul>
						</div>

						<!-- Tags -->
						{#if doc.tags && doc.tags.length > 0}
							<div class="doc-section">
								<h3>Tags</h3>
								<div class="doc-tags">
									{#each doc.tags as tag}
										<span class="tag">{tag}</span>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Extended documentation -->
						{#if doc.documentation}
							{#if doc.documentation.description}
								<div class="doc-section">
									<h3>Description</h3>
									<p>{doc.documentation.description}</p>
								</div>
							{/if}

							{#if doc.documentation.usage}
								<div class="doc-section">
									<h3>Usage</h3>
									<p>{doc.documentation.usage}</p>
								</div>
							{/if}

							{#if doc.documentation.tips && doc.documentation.tips.length > 0}
								<div class="doc-section">
									<h3>Tips</h3>
									<ul class="doc-tips">
										{#each doc.documentation.tips as tip}
											<li>{tip}</li>
										{/each}
									</ul>
								</div>
							{/if}

							{#if doc.documentation.relatedTools && doc.documentation.relatedTools.length > 0}
								<div class="doc-section">
									<h3>Related Tools</h3>
									<div class="doc-related">
										{#each doc.documentation.relatedTools as relatedId}
											<button
												class="related-tool"
												onclick={() => selectTool(relatedId)}
											>
												{toolDocs[relatedId as keyof typeof toolDocs]?.name || relatedId}
											</button>
										{/each}
									</div>
								</div>
							{/if}
						{/if}

						<!-- Back to active tool -->
						{#if activeTool && selectedToolId && selectedToolId !== activeTool}
							<div class="doc-section">
								<button class="btn-secondary" onclick={showActiveTool}>
									Back to {toolDocs[activeTool]?.name || 'Active Tool'}
								</button>
							</div>
						{/if}
					{:else}
						<div class="doc-empty">
							<BookOpen size={64} />
							<h2>No Tool Selected</h2>
							<p>Select a tool from the list to view its documentation</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.help-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px;
	}

	.help-panel {
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		width: 100%;
		max-width: 900px;
		height: 80vh;
		max-height: 700px;
		display: flex;
		flex-direction: column;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
	}

	.help-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 20px;
		border-bottom: 1px solid var(--color-border);
	}

	.help-title {
		display: flex;
		align-items: center;
		gap: 12px;
		color: var(--color-text-primary);
	}

	.help-title h2 {
		margin: 0;
		font-size: 18px;
		font-weight: 600;
	}

	.close-button {
		background: none;
		border: none;
		padding: 8px;
		cursor: pointer;
		border-radius: 4px;
		color: var(--color-text-secondary);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}

	.close-button:hover {
		background: var(--color-bg-hover);
		color: var(--color-text-primary);
	}

	.help-content {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.help-sidebar {
		width: 280px;
		border-right: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
		background: var(--color-bg-secondary);
	}

	.search-box {
		padding: 16px;
		display: flex;
		align-items: center;
		gap: 8px;
		border-bottom: 1px solid var(--color-border);
		color: var(--color-text-secondary);
	}

	.search-input {
		flex: 1;
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		padding: 6px 10px;
		color: var(--color-text-primary);
		font-size: 14px;
	}

	.search-input::placeholder {
		color: var(--color-text-tertiary);
	}

	.search-input:focus {
		outline: none;
		border-color: var(--color-accent);
	}

	.tool-list {
		flex: 1;
		overflow-y: auto;
		padding: 8px;
	}

	.tool-item {
		width: 100%;
		background: transparent;
		border: none;
		padding: 10px 12px;
		cursor: pointer;
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		transition: all 0.2s;
		color: var(--color-text-primary);
		text-align: left;
	}

	.tool-item:hover {
		background: var(--color-bg-hover);
	}

	.tool-item.active {
		background: var(--color-accent);
		color: white;
	}

	.tool-item-name {
		font-size: 14px;
	}

	.tool-item-shortcut {
		font-size: 12px;
		opacity: 0.7;
		font-weight: 600;
	}

	.no-results {
		padding: 20px;
		text-align: center;
		color: var(--color-text-tertiary);
		font-size: 14px;
	}

	.help-main {
		flex: 1;
		overflow-y: auto;
		padding: 24px;
	}

	.doc-header {
		margin-bottom: 32px;
	}

	.doc-title {
		margin: 0 0 8px 0;
		font-size: 28px;
		font-weight: 700;
		color: var(--color-text-primary);
		display: flex;
		align-items: baseline;
		gap: 12px;
	}

	.doc-shortcut {
		font-size: 16px;
		color: var(--color-text-secondary);
		font-weight: 400;
	}

	.doc-description {
		margin: 0;
		font-size: 16px;
		color: var(--color-text-secondary);
	}

	.doc-section {
		margin-bottom: 24px;
	}

	.doc-section h3 {
		margin: 0 0 12px 0;
		font-size: 16px;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.doc-section p {
		margin: 0;
		line-height: 1.6;
		color: var(--color-text-primary);
	}

	.doc-info {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.doc-info li {
		padding: 6px 0;
		color: var(--color-text-primary);
	}

	.doc-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.tag {
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		padding: 4px 10px;
		border-radius: 4px;
		font-size: 12px;
		font-family: monospace;
		color: var(--color-text-primary);
	}

	.doc-tips {
		list-style: disc;
		padding-left: 24px;
		margin: 0;
	}

	.doc-tips li {
		padding: 4px 0;
		color: var(--color-text-primary);
		line-height: 1.5;
	}

	.doc-related {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.related-tool {
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		padding: 8px 14px;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s;
		color: var(--color-text-primary);
		font-size: 14px;
	}

	.related-tool:hover {
		background: var(--color-accent);
		color: white;
		border-color: var(--color-accent);
	}

	.btn-secondary {
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		padding: 10px 16px;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s;
		color: var(--color-text-primary);
		font-size: 14px;
	}

	.btn-secondary:hover {
		background: var(--color-bg-hover);
	}

	.doc-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: var(--color-text-tertiary);
		text-align: center;
		gap: 16px;
	}

	.doc-empty h2 {
		margin: 0;
		font-size: 20px;
		color: var(--color-text-secondary);
	}

	.doc-empty p {
		margin: 0;
		font-size: 14px;
	}
</style>
