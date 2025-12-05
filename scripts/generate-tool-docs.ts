/**
 * Tool Documentation Generator
 *
 * Extracts documentation from tool implementations and generates:
 * - Markdown documentation files
 * - JSON documentation database
 * - Type-safe documentation index
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ToolOption {
	id: string;
	label: string;
	type: 'slider' | 'boolean' | 'number' | 'color' | 'select' | 'string';
	defaultValue: any;
	min?: number;
	max?: number;
	step?: number;
	options?: string[];
}

interface ToolDocumentation {
	description?: string;
	usage?: string;
	tips?: string[];
	relatedTools?: string[];
}

interface ToolInfo {
	id: string;
	name: string;
	description: string;
	category: string;
	shortcut?: string;
	version?: string;
	author?: string;
	tags?: string[];
	options?: ToolOption[];
	documentation?: ToolDocumentation;
}

/**
 * Extract tool information from implementation files
 */
async function extractToolDocs(): Promise<ToolInfo[]> {
	const toolsDir = path.join(__dirname, '../src/lib/tools/implementations');
	const files = fs.readdirSync(toolsDir).filter((f) => f.endsWith('.ts'));

	const tools: ToolInfo[] = [];

	for (const file of files) {
		const content = fs.readFileSync(path.join(toolsDir, file), 'utf-8');

		// Extract config object using regex (simplified approach)
		const configMatch = content.match(/public readonly config.*?=\s*{([\s\S]*?)};/);

		if (!configMatch) continue;

		const configContent = configMatch[1];

		// Extract basic info
		const idMatch = configContent.match(/id:\s*['"](\w+)['"]/);
		const nameMatch = configContent.match(/name:\s*['"]([^'"]+)['"]/);
		const descMatch = configContent.match(/description:\s*['"]([^'"]+)['"]/);
		const categoryMatch = configContent.match(/category:\s*['"](\w+)['"]/);
		const shortcutMatch = configContent.match(/shortcut:\s*['"]([^'"]+)['"]/);
		const versionMatch = configContent.match(/version:\s*['"]([^'"]+)['"]/);
		const authorMatch = configContent.match(/author:\s*['"]([^'"]+)['"]/);

		// Extract tags array
		const tagsMatch = configContent.match(/tags:\s*\[([\s\S]*?)\]/);
		let tags: string[] = [];
		if (tagsMatch) {
			tags = tagsMatch[1]
				.split(',')
				.map((t) => t.trim().replace(/['"]/g, ''))
				.filter(Boolean);
		}

		// Extract documentation object
		let documentation: ToolDocumentation | undefined;
		const docMatch = configContent.match(/documentation:\s*{([\s\S]*?)}/);
		if (docMatch) {
			const docContent = docMatch[1];

			const docDescMatch = docContent.match(/description:\s*['"`]([^'"`]+)['"`]/);
			const usageMatch = docContent.match(/usage:\s*['"`]([^'"`]+)['"`]/);
			const tipsMatch = docContent.match(/tips:\s*\[([\s\S]*?)\]/);
			const relatedMatch = docContent.match(/relatedTools:\s*\[([\s\S]*?)\]/);

			documentation = {
				description: docDescMatch?.[1],
				usage: usageMatch?.[1],
				tips: tipsMatch
					? tipsMatch[1]
							.split(',')
							.map((t) => t.trim().replace(/['"]/g, ''))
							.filter(Boolean)
					: undefined,
				relatedTools: relatedMatch
					? relatedMatch[1]
							.split(',')
							.map((t) => t.trim().replace(/['"]/g, ''))
							.filter(Boolean)
					: undefined
			};
		}

		if (idMatch && nameMatch && descMatch && categoryMatch) {
			tools.push({
				id: idMatch[1],
				name: nameMatch[1],
				description: descMatch[1],
				category: categoryMatch[1],
				shortcut: shortcutMatch?.[1],
				version: versionMatch?.[1],
				author: authorMatch?.[1],
				tags: tags.length > 0 ? tags : undefined,
				documentation
			});
		}
	}

	return tools;
}

/**
 * Generate markdown documentation for a tool
 */
function generateMarkdown(tool: ToolInfo): string {
	let md = `# ${tool.name}`;

	if (tool.shortcut) {
		md += ` (${tool.shortcut})`;
	}

	md += '\n\n';

	md += `${tool.description}\n\n`;

	if (tool.documentation?.description) {
		md += `## Description\n\n${tool.documentation.description}\n\n`;
	}

	if (tool.documentation?.usage) {
		md += `## Usage\n\n${tool.documentation.usage}\n\n`;
	}

	// Basic info
	md += `## Info\n\n`;
	md += `- **Category**: ${tool.category}\n`;
	if (tool.version) md += `- **Version**: ${tool.version}\n`;
	if (tool.author) md += `- **Author**: ${tool.author}\n`;
	if (tool.shortcut) md += `- **Keyboard Shortcut**: ${tool.shortcut}\n`;
	md += '\n';

	// Tags
	if (tool.tags && tool.tags.length > 0) {
		md += `## Tags\n\n`;
		md += tool.tags.map((tag) => `\`${tag}\``).join(', ') + '\n\n';
	}

	// Tips
	if (tool.documentation?.tips && tool.documentation.tips.length > 0) {
		md += `## Tips\n\n`;
		tool.documentation.tips.forEach((tip) => {
			md += `- ${tip}\n`;
		});
		md += '\n';
	}

	// Related tools
	if (tool.documentation?.relatedTools && tool.documentation.relatedTools.length > 0) {
		md += `## Related Tools\n\n`;
		md += tool.documentation.relatedTools.map((t) => `- ${t}`).join('\n') + '\n\n';
	}

	md += `---\n\n`;
	md += `*Documentation auto-generated from tool implementation*\n`;

	return md;
}

/**
 * Generate JSON database
 */
function generateJSON(tools: ToolInfo[]): string {
	return JSON.stringify(tools, null, 2);
}

/**
 * Generate TypeScript types for documentation
 */
function generateTypes(tools: ToolInfo[]): string {
	const toolIds = tools.map((t) => `'${t.id}'`).join(' | ');

	return `/**
 * Auto-generated Tool Documentation Types
 *
 * Generated on ${new Date().toISOString()}
 * Do not edit manually - run 'npm run generate:docs' to regenerate
 */

export type ToolId = ${toolIds};

export interface ToolDocumentation {
	id: ToolId;
	name: string;
	description: string;
	category: string;
	shortcut?: string;
	version?: string;
	author?: string;
	tags?: string[];
	documentation?: {
		description?: string;
		usage?: string;
		tips?: string[];
		relatedTools?: string[];
	};
}

export const toolDocs: Record<ToolId, ToolDocumentation> = ${JSON.stringify(
		Object.fromEntries(tools.map((t) => [t.id, t])),
		null,
		2
	)} as const;
`;
}

/**
 * Main execution
 */
async function main() {
	console.log('🔍 Extracting tool documentation...\n');

	const tools = await extractToolDocs();

	console.log(`Found ${tools.length} tools:\n`);
	tools.forEach((tool) => {
		console.log(`  ✓ ${tool.name} (${tool.id})`);
	});
	console.log('');

	// Create output directories
	const docsDir = path.join(__dirname, '../docs/tools');
	const generatedDir = path.join(__dirname, '../src/lib/tools/docs');

	if (!fs.existsSync(docsDir)) {
		fs.mkdirSync(docsDir, { recursive: true });
	}

	if (!fs.existsSync(generatedDir)) {
		fs.mkdirSync(generatedDir, { recursive: true });
	}

	// Generate markdown files
	console.log('📝 Generating markdown documentation...\n');
	tools.forEach((tool) => {
		const md = generateMarkdown(tool);
		const filename = path.join(docsDir, `${tool.id}.md`);
		fs.writeFileSync(filename, md);
		console.log(`  ✓ Generated ${tool.id}.md`);
	});
	console.log('');

	// Generate JSON database
	console.log('📊 Generating JSON database...\n');
	const json = generateJSON(tools);
	fs.writeFileSync(path.join(generatedDir, 'tool-docs.json'), json);
	console.log('  ✓ Generated tool-docs.json\n');

	// Generate TypeScript types
	console.log('🔧 Generating TypeScript types...\n');
	const types = generateTypes(tools);
	fs.writeFileSync(path.join(generatedDir, 'generated-tool-docs.ts'), types);
	console.log('  ✓ Generated generated-tool-docs.ts\n');

	// Generate index markdown
	console.log('📚 Generating index...\n');
	let indexMd = `# Tool Documentation\n\n`;
	indexMd += `**Auto-generated**: ${new Date().toISOString()}\n\n`;
	indexMd += `Total tools: ${tools.length}\n\n`;

	// Group by category
	const categories = new Set(tools.map((t) => t.category));
	categories.forEach((category) => {
		indexMd += `## ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;
		tools
			.filter((t) => t.category === category)
			.forEach((tool) => {
				indexMd += `- [${tool.name}](./${tool.id}.md)`;
				if (tool.shortcut) indexMd += ` (${tool.shortcut})`;
				indexMd += ` - ${tool.description}\n`;
			});
		indexMd += '\n';
	});

	fs.writeFileSync(path.join(docsDir, 'README.md'), indexMd);
	console.log('  ✓ Generated README.md\n');

	console.log('✅ Documentation generation complete!\n');
	console.log(`📁 Output locations:`);
	console.log(`   - Markdown: ${docsDir}`);
	console.log(`   - JSON: ${generatedDir}/tool-docs.json`);
	console.log(`   - Types: ${generatedDir}/generated-tool-docs.ts\n`);
}

main().catch(console.error);
